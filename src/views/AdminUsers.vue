<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check, Crown, ShieldCheck, PencilLine, UserPlus, RefreshCw, Users, LockKeyhole, Pencil, Trash2, X, Save } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const users = ref([])
const loading = ref(true)
const creating = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const error = ref('')
const notice = ref('')
const currentUserId = ref('')
const createForm = ref({ username: '', full_name: '', password: '', role: 'editor' })
const editForm = ref({ id: '', username: '', full_name: '', password: '', role: 'editor' })
const editing = ref(false)
const roleCounts = computed(() => ({
  owner: users.value.filter(user => user.role === 'owner').length,
  admin: users.value.filter(user => user.role === 'admin').length,
  editor: users.value.filter(user => user.role === 'editor').length,
}))
const dateLabel = value => value ? new Date(value).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const usernameHint = '3–24 characters: letters, numbers, dots, underscores or hyphens.'

async function loadUsers() {
  loading.value = true
  error.value = ''
  const { data: { user } } = await supabase.auth.getUser()
  currentUserId.value = user?.id || ''
  const { data, error: queryError } = await supabase.from('profiles')
    .select('id,username,full_name,role,created_at').order('created_at', { ascending: false })
  if (queryError) error.value = queryError.message
  else users.value = data || []
  loading.value = false
}

function openEdit(user) {
  editForm.value = { id: user.id, username: user.username || '', full_name: user.full_name || '', password: '', role: user.role }
  editing.value = true
  error.value = ''
  notice.value = ''
}

function closeEdit() {
  editing.value = false
  editForm.value = { id: '', username: '', full_name: '', password: '', role: 'editor' }
}

async function invokeManagement(action, payload = {}) {
  const { data, error: functionError } = await supabase.functions.invoke('admin-manage-users', {
    body: { action, ...payload },
  })
  if (functionError) {
    let message = functionError.message
    try {
      const details = await functionError.context?.json()
      if (details?.error) message = details.error
    } catch {}
    throw new Error(message)
  }
  if (data?.error) throw new Error(data.error)
  return data
}

async function createUser() {
  error.value = ''
  notice.value = ''
  creating.value = true
  try {
    const result = await invokeManagement('create', {
      username: createForm.value.username.trim().toLowerCase(),
      full_name: createForm.value.full_name.trim(),
      password: createForm.value.password,
      role: createForm.value.role,
    })
    notice.value = result.message || 'User account created successfully.'
    createForm.value = { username: '', full_name: '', password: '', role: 'editor' }
    await loadUsers()
  } catch (err) {
    error.value = err.message || 'Unable to create the user account.'
  } finally {
    creating.value = false
  }
}

async function saveUser() {
  error.value = ''
  notice.value = ''
  saving.value = true
  try {
    const result = await invokeManagement('update', {
      user_id: editForm.value.id,
      username: editForm.value.username.trim().toLowerCase(),
      full_name: editForm.value.full_name.trim(),
      password: editForm.value.password,
      role: editForm.value.role,
    })
    notice.value = result.message || 'User account updated successfully.'
    closeEdit()
    await loadUsers()
  } catch (err) {
    error.value = err.message || 'Unable to update the user account.'
  } finally {
    saving.value = false
  }
}

async function deleteUser(user) {
  if (user.id === currentUserId.value || user.role === 'owner') return
  const confirmed = window.confirm(`Permanently delete the account for ${user.username}? This action cannot be undone.`)
  if (!confirmed) return
  error.value = ''
  notice.value = ''
  deletingId.value = user.id
  try {
    const result = await invokeManagement('delete', { user_id: user.id })
    notice.value = result.message || 'User account deleted successfully.'
    await loadUsers()
  } catch (err) {
    error.value = err.message || 'Unable to delete the user account.'
  } finally {
    deletingId.value = null
  }
}

onMounted(loadUsers)
</script>

<template>
<div>
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><p class="text-[10px] font-bold uppercase tracking-[.18em] text-[#a17c20]">Super Admin settings</p><h1 class="mt-2 font-display text-3xl font-extrabold">User management</h1><p class="mt-2 text-sm text-slate-500">Create, edit and remove CMS accounts using username-based sign-in.</p></div>
    <div class="rounded-lg bg-[#eef3fa] px-4 py-2 text-[10px] font-bold text-[#092f70]"><LockKeyhole :size="13" class="mr-1 inline"/> Super Admin only</div>
  </div>

  <div v-if="error" role="alert" class="mt-6 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><span>{{ error }}</span><button @click="error = ''" aria-label="Dismiss error">×</button></div>
  <div v-if="notice" role="status" class="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-800">{{ notice }}</div>

  <section class="mt-7 grid gap-3 sm:grid-cols-3">
    <article v-for="card in [{key:'owner',label:'Super Admins',icon:Crown,tone:'amber'},{key:'admin',label:'Admins',icon:ShieldCheck,tone:'blue'},{key:'editor',label:'Editors',icon:PencilLine,tone:'violet'}]" :key="card.key" class="rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between"><span class="text-xs text-slate-500">{{ card.label }}</span><component :is="card.icon" :size="18" :class="{'text-amber-600':card.tone==='amber','text-blue-700':card.tone==='blue','text-violet-700':card.tone==='violet'}"/></div>
      <p class="mt-3 font-display text-3xl font-extrabold text-[#102d55]">{{ roleCounts[card.key] }}</p>
    </article>
  </section>

  <section class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]">
    <div class="rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm sm:p-6">
      <div class="flex items-center justify-between gap-3"><div><h2 class="font-display text-lg font-bold">Team members</h2><p class="mt-1 text-xs text-slate-500">Usernames, assigned roles and account creation dates.</p></div><button @click="loadUsers" :disabled="loading" class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Refresh users"><RefreshCw :size="15" :class="loading?'animate-spin':''"/></button></div>
      <div v-if="loading" class="py-12 text-center text-xs text-slate-500">Loading users…</div>
      <div v-else-if="!users.length" class="py-12 text-center text-xs text-slate-500">No CMS profiles found.</div>
      <div v-else class="mt-4 divide-y divide-slate-100">
        <article v-for="user in users" :key="user.id" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div class="flex min-w-0 flex-1 items-center gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf0fa] text-sm font-bold text-[#092f70]">{{ (user.full_name || user.username || 'U').slice(0,1).toUpperCase() }}</div><div class="min-w-0"><p class="truncate text-xs font-bold text-slate-800">{{ user.full_name || 'Unnamed user' }} <span v-if="user.id===currentUserId" class="ml-1 font-normal text-slate-400">(You)</span></p><p class="truncate text-[10px] font-semibold text-[#092f70]">@{{ user.username || 'username required' }}</p><p class="mt-1 text-[9px] text-slate-400">Profile created {{ dateLabel(user.created_at) }}</p></div></div>
          <div class="flex items-center gap-2 sm:justify-end">
            <span v-if="user.role==='owner'" class="rounded-full bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-800">Super Admin</span>
            <span v-else class="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-semibold capitalize text-slate-600">{{ user.role }}</span>
            <button @click="openEdit(user)" class="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" :title="user.id===currentUserId?'Edit your username and profile':'Edit user'"><Pencil :size="14"/></button>
            <button v-if="user.role!=='owner' && user.id!==currentUserId" @click="deleteUser(user)" :disabled="deletingId===user.id" class="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" title="Delete user"><Trash2 :size="14"/></button>
          </div>
        </article>
      </div>
    </div>

    <div class="h-fit rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm sm:p-6">
      <div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3fa] text-[#092f70]"><UserPlus :size="19"/></span><div><h2 class="font-display text-lg font-bold">Create a user account</h2><p class="mt-1 text-xs text-slate-500">No email address is required.</p></div></div>
      <form class="mt-5 space-y-4" @submit.prevent="createUser">
        <label class="block text-[10px] font-bold text-slate-700">Username<input v-model="createForm.username" required minlength="3" maxlength="24" pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,23}" autocomplete="off" placeholder="e.g. juandelacruz" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#092f70]"/><span class="mt-1 block font-normal text-slate-400">{{ usernameHint }}</span></label>
        <label class="block text-[10px] font-bold text-slate-700">Full name<input v-model="createForm.full_name" required maxlength="100" placeholder="e.g. Juan Dela Cruz" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#092f70]"/></label>
        <label class="block text-[10px] font-bold text-slate-700">Initial password<input v-model="createForm.password" required type="password" minlength="12" autocomplete="new-password" placeholder="At least 12 characters" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#092f70]"/><span class="mt-1 block font-normal text-slate-400">Share the initial password securely.</span></label>
        <label class="block text-[10px] font-bold text-slate-700">Assign role<select v-model="createForm.role" class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs"><option value="editor">Editor</option><option value="admin">Admin</option></select></label>
        <div class="rounded-lg bg-[#f5f7fa] p-3 text-[10px] leading-5 text-slate-500">Users sign in with their username and password. An internal, non-deliverable authentication alias is generated automatically; no real email address is collected or displayed.</div>
        <button type="submit" :disabled="creating" class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#092f70] px-4 py-3.5 text-xs font-bold text-white hover:bg-[#061f4b] disabled:cursor-wait disabled:opacity-50"><UserPlus :size="15"/>{{ creating?'Creating account…':'Create user account' }}</button>
      </form>
    </div>
  </section>

  <section v-if="editing" class="mt-6 rounded-xl border border-[#cbd7e8] bg-white p-5 shadow-sm sm:p-6">
    <div class="flex items-start justify-between gap-3"><div><h2 class="font-display text-lg font-bold">Edit user account</h2><p class="mt-1 text-xs text-slate-500">Leave the new password blank to keep the current password.</p></div><button @click="closeEdit" class="rounded-lg border border-slate-200 p-2 text-slate-500"><X :size="15"/></button></div>
    <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="saveUser">
      <label class="block text-[10px] font-bold text-slate-700">Username<input v-model="editForm.username" required minlength="3" maxlength="24" pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,23}" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs"/></label>
      <label class="block text-[10px] font-bold text-slate-700">Full name<input v-model="editForm.full_name" required maxlength="100" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs"/></label>
      <label v-if="editForm.role!=='owner'" class="block text-[10px] font-bold text-slate-700">Role<select v-model="editForm.role" class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs"><option value="editor">Editor</option><option value="admin">Admin</option></select></label>
      <label class="block text-[10px] font-bold text-slate-700">New password (optional)<input v-model="editForm.password" type="password" minlength="12" autocomplete="new-password" placeholder="At least 12 characters" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs"/></label>
      <div class="flex items-end gap-2 sm:col-span-2"><button type="button" @click="closeEdit" class="rounded-lg border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600">Cancel</button><button type="submit" :disabled="saving" class="inline-flex items-center gap-2 rounded-lg bg-[#092f70] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"><Save :size="14"/>{{ saving?'Saving…':'Save changes' }}</button></div>
    </form>
    <p v-if="editForm.id===currentUserId" class="mt-4 rounded-lg bg-amber-50 p-3 text-[10px] leading-5 text-amber-800">Saving your own account activates username-only sign-in for your existing Super Admin account. Your current session remains active.</p>
  </section>

  <section class="mt-7 rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm sm:p-6">
    <div class="flex items-center gap-2"><Users :size="18" class="text-[#092f70]"/><h2 class="font-display text-lg font-bold">Role permissions</h2></div>
    <p class="mt-1 text-xs text-slate-500">Current access rules in the YUWO CMS.</p>
    <div class="mt-5 overflow-x-auto"><table class="w-full min-w-[650px] text-left text-xs"><thead class="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">Permission</th><th class="px-4 py-3">Super Admin</th><th class="px-4 py-3">Admin</th><th class="px-4 py-3">Editor</th></tr></thead><tbody class="divide-y divide-slate-100">
      <tr v-for="row in [{label:'Dashboard',values:[true,true,true]},{label:'Manage products, articles, reviews, FAQs and homepage content',values:[true,true,true]},{label:'View and manage website inquiries',values:[true,true,true]},{label:'Financial overview',values:[true,true,false]},{label:'Create, edit and delete users',values:[true,false,false]},{label:'Assign Super Admin access',values:[true,false,false]}]" :key="row.label"><td class="px-4 py-3 font-medium text-slate-700">{{ row.label }}</td><td v-for="(allowed,index) in row.values" :key="index" class="px-4 py-3"><Check v-if="allowed" :size="16" class="text-emerald-600"/><span v-else class="text-slate-300">—</span></td></tr>
    </tbody></table></div>
    <p class="mt-4 text-[10px] leading-5 text-slate-500">Editors can manage CMS content, but cannot access financial reporting or user administration. Admins have the same content permissions plus financial overview access. Only Super Admin can manage accounts.</p>
  </section>
</div>
</template>
