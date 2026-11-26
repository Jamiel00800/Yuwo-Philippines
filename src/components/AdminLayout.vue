<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Package, Newspaper, Star, CircleHelp, PanelsTopLeft, Inbox, Users, ChartNoAxesCombined, ChevronDown, ChevronLeft, ChevronRight, LogOut, ExternalLink } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
const route=useRoute(), router=useRouter()
const collapsed=ref(false), managementOpen=ref(true), signingOut=ref(false), profile=ref(null)
const role=computed(()=>profile.value?.role||'editor')
const isOwner=computed(()=>role.value==='owner')
const isAdmin=computed(()=>['owner','admin'].includes(role.value))
const displayRole=computed(()=>({owner:'Super Admin',admin:'Admin',editor:'Editor'}[role.value]||'Editor'))
const managementRoutes=[
 {label:'Products',to:'/admin/products',icon:Package},
 {label:'Articles',to:'/admin/articles',icon:Newspaper},
 {label:'Reviews',to:'/admin/reviews',icon:Star},
 {label:'FAQs',to:'/admin/faqs',icon:CircleHelp},
 {label:'Homepage content',to:'/admin/homepage',icon:PanelsTopLeft}
]
const isManagementActive=computed(()=>managementRoutes.some(item=>route.path===item.to))
onMounted(async()=>{const {data:{session}}=await supabase.auth.getSession();if(session){const {data}=await supabase.from('profiles').select('full_name,email,role').eq('id',session.user.id).maybeSingle();profile.value=data||{email:session.user.email,role:'editor'}}})
async function signOut(){signingOut.value=true;await supabase.auth.signOut();router.replace('/admin/login')}
</script>
<template>
<div class="min-h-screen bg-[#f5f7fa] text-[#263341]">
<aside :class="['fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#e7ebf1] bg-white transition-all duration-200',collapsed?'w-[76px]':'w-[264px]']">
<div class="flex h-[82px] items-center justify-between border-b border-[#edf0f4] px-5">
<RouterLink to="/admin" class="min-w-0 leading-none"><span v-if="!collapsed" class="block font-display text-[27px] font-extrabold tracking-[-.08em] text-[#092f70]">YUWO</span><span v-else class="block font-display text-2xl font-extrabold text-[#092f70]">Y</span><small v-if="!collapsed" class="mt-1 block text-[8px] font-bold tracking-[.22em] text-[#a17c20]">ADMIN CMS</small></RouterLink>
<button @click="collapsed=!collapsed" class="rounded-lg p-2 text-slate-500 hover:bg-[#eef3fa]" :aria-label="collapsed?'Expand sidebar':'Collapse sidebar'"><ChevronLeft v-if="!collapsed" :size="18"/><ChevronRight v-else :size="18"/></button></div>
<div v-if="!collapsed" class="mx-4 mt-5 flex items-center gap-2 rounded-lg bg-[#f5f7fa] px-3 py-3 text-xs font-semibold"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Store workspace<ChevronDown :size="14" class="ml-auto text-slate-400"/></div>
<nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
<p v-if="!collapsed" class="px-3 pb-2 pt-1 text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</p>
<RouterLink to="/admin" :title="collapsed?'Dashboard':undefined" class="admin-nav-link" :class="{'admin-nav-active':route.path==='/admin'}"><LayoutDashboard :size="18"/><span v-if="!collapsed">Dashboard</span></RouterLink>
<p v-if="!collapsed" class="px-3 pb-2 pt-5 text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Content management</p>
<button @click="managementOpen=!managementOpen" class="admin-nav-link w-full" :class="{'admin-nav-active':isManagementActive}" :title="collapsed?'Management':undefined"><Package :size="18"/><span v-if="!collapsed" class="flex-1 text-left">Management</span><ChevronDown v-if="!collapsed" :size="15" :class="managementOpen?'rotate-180':''" class="transition-transform"/></button>
<div v-if="managementOpen&&!collapsed" class="space-y-1 pb-1 pl-4"><RouterLink v-for="item in managementRoutes" :key="item.to" :to="item.to" class="admin-subnav-link" :class="{'admin-subnav-active':route.path===item.to}"><component :is="item.icon" :size="16"/>{{item.label}}</RouterLink></div>
<RouterLink to="/admin/forms" class="admin-nav-link" :class="{'admin-nav-active':route.path==='/admin/forms'}"><Inbox :size="18"/><span v-if="!collapsed">Forms & inquiries</span></RouterLink>
<p v-if="!collapsed" class="px-3 pb-2 pt-5 text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Administration</p>
<RouterLink v-if="isOwner" to="/admin/users" class="admin-nav-link" :class="{'admin-nav-active':route.path==='/admin/users'}"><Users :size="18"/><span v-if="!collapsed">Users</span></RouterLink>
<RouterLink v-if="isAdmin" to="/admin/finance" class="admin-nav-link" :class="{'admin-nav-active':route.path==='/admin/finance'}"><ChartNoAxesCombined :size="18"/><span v-if="!collapsed">Financial overview</span></RouterLink>
</nav>
<div class="border-t border-[#edf0f4] p-3"><a href="/" target="_blank" class="admin-nav-link mb-2 text-slate-500"><ExternalLink :size="17"/><span v-if="!collapsed">View storefront</span></a><div class="flex items-center gap-3 rounded-lg bg-[#f5f7fa] p-2"><div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dce6f4] text-sm font-bold text-[#092f70]">{{(profile?.full_name||profile?.email||'Y').slice(0,1).toUpperCase()}}</div><div v-if="!collapsed" class="min-w-0 flex-1"><p class="truncate text-[11px] font-bold">{{profile?.full_name||profile?.email||'Admin user'}}</p><p class="text-[9px] text-slate-500">{{displayRole}}</p></div><button @click="signOut" :disabled="signingOut" title="Sign out" class="rounded-md p-2 text-slate-500 hover:bg-white hover:text-red-600"><LogOut :size="16"/></button></div></div>
</aside>
<div :class="['min-h-screen transition-[padding] duration-200',collapsed?'pl-[76px]':'pl-[264px]']">
<header class="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#e7ebf1] bg-white/95 px-6 backdrop-blur lg:px-9"><div class="text-[11px] text-slate-500">Workspace <span class="mx-2 text-slate-300">/</span><span class="font-semibold text-[#263341]">{{route.meta.title||'Dashboard'}}</span></div><div class="flex items-center gap-3"><span class="rounded-full bg-[#eef3fa] px-3 py-1.5 text-[9px] font-bold tracking-wide text-[#092f70]">{{displayRole.toUpperCase()}}</span><div class="flex h-8 w-8 items-center justify-center rounded-full bg-[#092f70] text-xs font-bold text-white">{{(profile?.full_name||profile?.email||'Y').slice(0,1).toUpperCase()}}</div></div></header>
<main class="mx-auto w-full max-w-[1600px] p-5 sm:p-7 lg:p-9"><RouterView :profile="profile"/></main></div></div>
</template>
<style scoped>
.admin-nav-link{display:flex;min-height:42px;align-items:center;gap:12px;border-radius:8px;padding:0 12px;font-size:12px;font-weight:600;color:#526071;transition:background .15s,color .15s}.admin-nav-link:hover,.admin-subnav-link:hover{background:#f2f5fa;color:#092f70}.admin-nav-active{background:#eaf0fa;color:#092f70}.admin-subnav-link{display:flex;min-height:38px;align-items:center;gap:10px;border-radius:7px;padding:0 12px;font-size:11px;font-weight:500;color:#64748b}.admin-subnav-active{background:#f1f5fb;color:#092f70;font-weight:700}
</style>