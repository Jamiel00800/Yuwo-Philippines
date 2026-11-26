import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization?.startsWith('Bearer ')) return json({ error: 'Authentication required.' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const token = authorization.replace('Bearer ', '')

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: { user: caller }, error: authError } = await callerClient.auth.getUser(token)
    if (authError || !caller) return json({ error: 'Your session is invalid. Please sign in again.' }, 401)

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: callerProfile, error: profileError } = await adminClient
      .from('profiles').select('role').eq('id', caller.id).maybeSingle()
    if (profileError || callerProfile?.role !== 'owner') {
      return json({ error: 'Only the Super Admin can invite CMS users.' }, 403)
    }

    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const fullName = String(body.full_name || '').trim()
    const role = String(body.role || '')
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400)
    if (!fullName) return json({ error: 'Full name is required.' }, 400)
    if (!['admin', 'editor'].includes(role)) return json({ error: 'New users can be assigned Admin or Editor access only.' }, 400)

    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
    })
    if (inviteError) return json({ error: inviteError.message }, 400)
    if (!invited.user) return json({ error: 'The invitation could not be created.' }, 500)

    const { error: insertError } = await adminClient.from('profiles').upsert({
      id: invited.user.id,
      email,
      full_name: fullName,
      role,
    }, { onConflict: 'id' })
    if (insertError) {
      await adminClient.auth.admin.deleteUser(invited.user.id)
      return json({ error: insertError.message }, 500)
    }

    return json({ message: 'Invitation sent successfully.', user: { id: invited.user.id, email, full_name: fullName, role } }, 200)
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
