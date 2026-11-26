<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check, Crown, ShieldCheck, PencilLine, UserPlus, RefreshCw, Users, LockKeyhole } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'

const users=ref([])
const loading=ref(true)
const creating=ref(false)
const savingId=ref(null)
const error=ref('')
const notice=ref('')
const currentUserId=ref('')
const createForm=ref({full_name:'',email:'',password:'',role:'editor'})
const roleCounts=computed(()=>({
  owner:users.value.filter(user=>user.role==='owner').length,
  admin:users.value.filter(user=>user.role==='admin').length,
  editor:users.value.filter(user=>user.role==='editor').length,
}))
const dateLabel=value=>value?new Date(value).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'—'

async function loadUsers(){
  loading.value=true
  error.value=''
  const {data:{user}}=await supabase.auth.getUser()
  currentUserId.value=user?.id||''
  const {data,error:queryError}=await supabase.from('profiles').select('id,full_name,email,role,created_at').order('created_at',{ascending:false})
  if(queryError) error.value=queryError.message
  else users.value=data||[]
  loading.value=false
}

async function createUser(){
  error.value=''
  notice.value=''
  creating.value=true
  const {data,error:inviteError}=await supabase.functions.invoke('admin-create-user',{
    body:{full_name:createForm.value.full_name.trim(),email:createForm.value.email.trim(),password:createForm.value.password,role:createForm.value.role}
  })
  if(inviteError){
    let message=inviteError.message
    try{const details=await inviteError.context?.json();if(details?.error)message=details.error}catch{}
    error.value=message
    creating.value=false
    return
  }
  if(data?.error){error.value=data.error;creating.value=false;return}
  notice.value=data?.message||'User account created successfully.'
  createForm.value={full_name:'',email:'',password:'',role:'editor'}
  creating.value=false
  await loadUsers()
}

async function saveRole(user){
  if(user.id===currentUserId.value){error.value='You cannot change your own Super Admin role.';return}
  if(user.role==='owner'){error.value='Super Admin roles cannot be changed here.';return}
  error.value=''
  notice.value=''
  savingId.value=user.id
  const {error:saveError}=await supabase.from('profiles').update({role:user.role}).eq('id',user.id)
  if(saveError)error.value=saveError.message
  else notice.value=`Access updated for ${user.email||user.full_name}.`
  savingId.value=null
  await loadUsers()
}
onMounted(loadUsers)
</script>

<template>
<div>
  <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div><p class="text-[10px] font-bold uppercase tracking-[.18em] text-[#a17c20]">Super Admin settings</p><h1 class="mt-2 font-display text-3xl font-extrabold">User management</h1><p class="mt-2 text-sm text-slate-500">Create team accounts and control their CMS access.</p></div>
    <div class="rounded-lg bg-[#eef3fa] px-4 py-2 text-[10px] font-bold text-[#092f70]"><LockKeyhole :size="13" class="mr-1 inline"/> Super Admin only</div>
  </div>

  <div v-if="error" role="alert" class="mt-6 flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><span>{{error}}</span><button @click="error=''" aria-label="Dismiss error">×</button></div>
  <div v-if="notice" role="status" class="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-800">{{notice}}</div>

  <section class="mt-7 grid gap-3 sm:grid-cols-3">
    <article v-for="card in [{key:'owner',label:'Super Admins',icon:Crown,tone:'amber'},{key:'admin',label:'Admins',icon:ShieldCheck,tone:'blue'},{key:'editor',label:'Editors',icon:PencilLine,tone:'violet'}]" :key="card.key" class="rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between"><span class="text-xs text-slate-500">{{card.label}}</span><component :is="card.icon" :size="18" :class="{'text-amber-600':card.tone==='amber','text-blue-700':card.tone==='blue','text-violet-700':card.tone==='violet'}"/></div>
      <p class="mt-3 font-display text-3xl font-extrabold text-[#102d55]">{{roleCounts[card.key]}}</p>
    </article>
  </section>

  <section class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,.9fr)]">
    <div class="rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm sm:p-6">
      <div class="flex items-center justify-between gap-3"><div><h2 class="font-display text-lg font-bold">Team members</h2><p class="mt-1 text-xs text-slate-500">Existing CMS profiles and assigned roles.</p></div><button @click="loadUsers" :disabled="loading" class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Refresh users"><RefreshCw :size="15" :class="loading?'animate-spin':''"/></button></div>
      <div v-if="loading" class="py-12 text-center text-xs text-slate-500">Loading users…</div>
      <div v-else-if="!users.length" class="py-12 text-center text-xs text-slate-500">No CMS profiles found.</div>
      <div v-else class="mt-4 divide-y divide-slate-100">
        <article v-for="user in users" :key="user.id" class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
          <div class="flex min-w-0 flex-1 items-center gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf0fa] text-sm font-bold text-[#092f70]">{{(user.full_name||user.email||'U').slice(0,1).toUpperCase()}}</div><div class="min-w-0"><p class="truncate text-xs font-bold text-slate-800">{{user.full_name||'Unnamed user'}} <span v-if="user.id===currentUserId" class="ml-1 font-normal text-slate-400">(You)</span></p><p class="truncate text-[10px] text-slate-500">{{user.email||'No email on profile'}}</p><p class="mt-1 text-[9px] text-slate-400">Profile created {{dateLabel(user.created_at)}}</p></div></div>
          <div class="flex items-center gap-2 sm:justify-end">
            <span v-if="user.role==='owner'" class="rounded-full bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-800">Super Admin</span>
            <template v-else><select v-model="user.role" class="min-w-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold"><option value="admin">Admin</option><option value="editor">Editor</option></select><button @click="saveRole(user)" :disabled="savingId===user.id" class="rounded-lg bg-[#092f70] px-3 py-2.5 text-[10px] font-bold text-white disabled:opacity-50">{{savingId===user.id?'Saving…':'Save'}}</button></template>
          </div>
        </article>
      </div>
    </div>

    <div class="h-fit rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm sm:p-6">
      <div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3fa] text-[#092f70]"><UserPlus :size="19"/></span><div><h2 class="font-display text-lg font-bold">Create a user account</h2><p class="mt-1 text-xs text-slate-500">Create a CMS login with an initial password.</p></div></div>
      <form class="mt-5 space-y-4" @submit.prevent="createUser">
        <label class="block text-[10px] font-bold text-slate-700">Full name<input v-model="createForm.full_name" required maxlength="100" placeholder="e.g. Juan Dela Cruz" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#092f70]"/></label>
        <label class="block text-[10px] font-bold text-slate-700">Email address<input v-model="createForm.email" required type="email" placeholder="name@example.com" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#092f70]"/></label>
        <label class="block text-[10px] font-bold text-slate-700">Initial password<input v-model="createForm.password" required type="password" minlength="12" autocomplete="new-password" placeholder="At least 12 characters" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-xs outline-none focus:border-[#092f70]"/><span class="mt-1 block font-normal text-slate-400">Share this password with the user through a secure channel.</span></label>
        <label class="block text-[10px] font-bold text-slate-700">Assign role<select v-model="createForm.role" class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-xs"><option value="editor">Editor</option><option value="admin">Admin</option></select></label>
        <div class="rounded-lg bg-[#f5f7fa] p-3 text-[10px] leading-5 text-slate-500">The account is created immediately and can sign in with the email and initial password. Use a unique password and share it securely. New accounts can only be Admin or Editor; Super Admin access stays under your control.</div>
        <button type="submit" :disabled="creating" class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#092f70] px-4 py-3.5 text-xs font-bold text-white hover:bg-[#061f4b] disabled:cursor-wait disabled:opacity-50"><UserPlus :size="15"/>{{creating?'Creating account…':'Create user account'}}</button>
      </form>
    </div>
  </section>

  <section class="mt-7 rounded-xl border border-[#e8edf3] bg-white p-5 shadow-sm sm:p-6">
    <div class="flex items-center gap-2"><Users :size="18" class="text-[#092f70]"/><h2 class="font-display text-lg font-bold">Role permissions</h2></div>
    <p class="mt-1 text-xs text-slate-500">Current access rules in the YUWO CMS.</p>
    <div class="mt-5 overflow-x-auto"><table class="w-full min-w-[650px] text-left text-xs"><thead class="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">Permission</th><th class="px-4 py-3">Super Admin</th><th class="px-4 py-3">Admin</th><th class="px-4 py-3">Editor</th></tr></thead><tbody class="divide-y divide-slate-100">
      <tr v-for="row in [{label:'Dashboard',values:[true,true,true]},{label:'Manage products, articles, reviews, FAQs and homepage content',values:[true,true,true]},{label:'View and manage website inquiries',values:[true,true,true]},{label:'Financial overview',values:[true,true,false]},{label:'Create users and change user roles',values:[true,false,false]},{label:'Assign Super Admin access',values:[true,false,false]}]" :key="row.label"><td class="px-4 py-3 font-medium text-slate-700">{{row.label}}</td><td v-for="(allowed,index) in row.values" :key="index" class="px-4 py-3"><Check v-if="allowed" :size="16" class="text-emerald-600"/><span v-else class="text-slate-300">—</span></td></tr>
    </tbody></table></div>
    <p class="mt-4 text-[10px] leading-5 text-slate-500">Editors can manage CMS content, but cannot access financial reporting or user administration. Admins have the same content permissions plus financial overview access. Only Super Admin can manage accounts.</p>
  </section>
</div>
</template>