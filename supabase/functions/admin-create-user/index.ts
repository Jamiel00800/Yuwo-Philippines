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
      return json({ error: 'Only the Super Admin can create CMS users.' }, 403)
    }

    const body = await req.json()
    const email = String(body.email || '').trim().toLowerCase()
    const fullName = String(body.full_name || '').trim()
    const password = String(body.password || '')
    const role = String(body.role || '')

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter a valid email address.' }, 400)
    if (!fullName) return json({ error: 'Full name is required.' }, 400)
    if (password.length < 12) return json({ error: 'Password must be at least 12 characters.' }, 400)
    if (!['admin', 'editor'].includes(role)) return json({ error: 'New accounts can be assigned Admin or Editor access only.' }, 400)

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (createError) return json({ error: createError.message }, 400)
    if (!created.user) return json({ error: 'The account could not be created.' }, 500)

    const { error: profileInsertError } = await adminClient.from('profiles').upsert({
      id: created.user.id,
      email,
      full_name: fullName,
      role,
    }, { onConflict: 'id' })

    if (profileInsertError) {
      await adminClient.auth.admin.deleteUser(created.user.id)
      return json({ error: profileInsertError.message }, 500)
    }

    return json({
      message: 'User account created successfully.',
      user: { id: created.user.id, email, full_name: fullName, role },
    }, 201)
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
