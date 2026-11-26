import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,23}$/
const authEmail = (username: string) => `${username}@users.yuwo.invalid`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required.' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser(authorization.slice(7))
    if (authError || !caller) return json({ error: 'Your session is invalid. Please sign in again.' }, 401)

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: callerProfile, error: callerProfileError } = await admin
      .from('profiles').select('role').eq('id', caller.id).maybeSingle()
    if (callerProfileError || callerProfile?.role !== 'owner') {
      return json({ error: 'Only the Super Admin can manage CMS users.' }, 403)
    }

    const body = await req.json()
    const action = String(body.action || '')
    const fullName = String(body.full_name || '').trim()
    const username = String(body.username || '').trim().toLowerCase()
    const password = String(body.password || '')
    const role = String(body.role || '')

    if (action === 'create') {
      if (!USERNAME_PATTERN.test(username)) return json({ error: 'Username must be 3–24 characters and use only letters, numbers, dots, underscores or hyphens.' }, 400)
      if (!fullName) return json({ error: 'Full name is required.' }, 400)
      if (password.length < 12) return json({ error: 'Password must be at least 12 characters.' }, 400)
      if (!['admin', 'editor'].includes(role)) return json({ error: 'New accounts can only be Admin or Editor.' }, 400)

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: authEmail(username),
        password,
        email_confirm: true,
        user_metadata: { username, full_name: fullName },
      })
      if (createError) return json({ error: createError.message }, 400)
      if (!created.user) return json({ error: 'The account could not be created.' }, 500)

      const { error: insertError } = await admin.from('profiles').upsert({
        id: created.user.id,
        username,
        email: authEmail(username),
        full_name: fullName,
        role,
      }, { onConflict: 'id' })
      if (insertError) {
        await admin.auth.admin.deleteUser(created.user.id)
        return json({ error: insertError.message }, 500)
      }
      return json({ message: 'User account created successfully.', user: { id: created.user.id, username, full_name: fullName, role } }, 201)
    }

    if (action === 'update') {
      const userId = String(body.user_id || '')
      if (!userId) return json({ error: 'User ID is required.' }, 400)
      if (!USERNAME_PATTERN.test(username)) return json({ error: 'Username must be 3–24 characters and use only letters, numbers, dots, underscores or hyphens.' }, 400)
      if (!fullName) return json({ error: 'Full name is required.' }, 400)
      if (password && password.length < 12) return json({ error: 'A new password must be at least 12 characters.' }, 400)

      const { data: target, error: targetError } = await admin.auth.admin.getUserById(userId)
      if (targetError || !target.user) return json({ error: 'User account not found.' }, 404)
      const { data: targetProfile, error: targetProfileError } = await admin
        .from('profiles').select('id,username,email,full_name,role').eq('id', userId).maybeSingle()
      if (targetProfileError || !targetProfile) return json({ error: 'User profile not found.' }, 404)
      if (targetProfile.role === 'owner' && userId !== caller.id) return json({ error: 'Other Super Admin accounts cannot be edited here.' }, 403)
      if (userId === caller.id && role && role !== 'owner') return json({ error: 'You cannot change your own Super Admin role.' }, 403)
      if (targetProfile.role !== 'owner' && !['admin', 'editor'].includes(role)) return json({ error: 'Choose Admin or Editor access.' }, 400)

      const nextRole = targetProfile.role === 'owner' ? 'owner' : role
      const { error: profileUpdateError } = await admin.from('profiles').update({
        username, full_name: fullName, role: nextRole, email: authEmail(username),
      }).eq('id', userId)
      if (profileUpdateError) return json({ error: profileUpdateError.message }, 400)

      const authUpdate: { email: string; email_confirm: boolean; password?: string; user_metadata: Record<string, string> } = {
        email: authEmail(username),
        email_confirm: true,
        user_metadata: { username, full_name: fullName },
      }
      if (password) authUpdate.password = password
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(userId, authUpdate)
      if (authUpdateError) {
        await admin.from('profiles').update({
          username: targetProfile.username,
          full_name: targetProfile.full_name,
          role: targetProfile.role,
          email: targetProfile.email,
        }).eq('id', userId)
        return json({ error: authUpdateError.message }, 400)
      }
      return json({ message: userId === caller.id ? 'Your username login has been activated.' : 'User account updated successfully.' })
    }

    if (action === 'delete') {
      const userId = String(body.user_id || '')
      if (!userId) return json({ error: 'User ID is required.' }, 400)
      if (userId === caller.id) return json({ error: 'You cannot delete your own account.' }, 400)
      const { data: targetProfile, error: targetError } = await admin
        .from('profiles').select('role').eq('id', userId).maybeSingle()
      if (targetError || !targetProfile) return json({ error: 'User profile not found.' }, 404)
      if (targetProfile.role === 'owner') return json({ error: 'Super Admin accounts cannot be deleted here.' }, 403)

      const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId)
      if (deleteAuthError) return json({ error: deleteAuthError.message }, 400)
      await admin.from('profiles').delete().eq('id', userId)
      return json({ message: 'User account deleted successfully.' })
    }

    return json({ error: 'Unsupported user management action.' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected server error.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
