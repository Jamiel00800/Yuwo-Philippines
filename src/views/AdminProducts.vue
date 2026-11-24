<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'

const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const deletingId = ref(null)
const error = ref('')
const notice = ref('')
const search = ref('')
const statusFilter = ref('all')
const editingId = ref(null)
const imageFile = ref(null)
const imagePreview = ref('')
const form = ref(blankForm())

function blankForm() {
  return { name: '', slug: '', category: 'Undermount', short_description: '', description: '', price: '', compare_at_price: '', size: '', tag: '', is_featured: false, status: 'draft', variants: [] }
}
const filteredRows = computed(() => rows.value.filter(item => {
  const matchesSearch = `${item.name} ${item.slug} ${item.category}`.toLowerCase().includes(search.value.toLowerCase())
  return matchesSearch && (statusFilter.value === 'all' || item.status === statusFilter.value)
}))
const money = value => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(Number(value || 0))
const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function loadProducts() {
  if (!supabase) { error.value = 'Supabase is not configured.'; loading.value = false; return }
  loading.value = true
  error.value = ''
  const { data, error: queryError } = await supabase.from('products').select('*, product_variants(*), product_images(*)').order('created_at', { ascending: false })
  if (queryError) error.value = queryError.message
  else rows.value = (data || []).map(item => ({ ...item, product_variants: item.product_variants || [], product_images: item.product_images || [] }))
  loading.value = false
}

function openNew() {
  editingId.value = null
  form.value = blankForm()
  imageFile.value = null
  imagePreview.value = ''
  error.value = ''
  notice.value = ''
}
function editProduct(product) {
  editingId.value = product.id
  form.value = {
    name: product.name || '', slug: product.slug || '', category: product.category || 'Undermount',
    short_description: product.short_description || '', description: product.description || '',
    price: product.price ?? '', compare_at_price: product.compare_at_price ?? '', size: product.size || '',
    tag: product.tag || '', is_featured: Boolean(product.is_featured), status: product.status || 'draft',
    variants: product.product_variants.map(v => ({ id: v.id, variant_name: v.variant_name || '', sku: v.sku || '', price: v.price ?? '', compare_at_price: v.compare_at_price ?? '', size: v.size || '', is_available: v.is_available !== false }))
  }
  const primary = product.product_images.find(image => image.is_primary) || product.product_images[0]
  imagePreview.value = primary?.image_url || ''
  imageFile.value = null
  error.value = ''
  notice.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function addVariant() {
  form.value.variants.push({ variant_name: '', sku: '', price: form.value.price || '', compare_at_price: form.value.compare_at_price || '', size: form.value.size || '', is_available: true })
}
function removeVariant(index) { form.value.variants.splice(index, 1) }
function chooseImage(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { error.value = 'Please choose an image file.'; return }
  if (file.size > 8 * 1024 * 1024) { error.value = 'Image must be 8 MB or smaller.'; return }
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}
async function uploadProductImage(productId) {
  if (!imageFile.value) return
  uploading.value = true
  const extension = imageFile.value.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${productId}/${Date.now()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile.value, { upsert: true, contentType: imageFile.value.type })
  if (uploadError) { uploading.value = false; throw new Error(uploadError.message) }
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  const { error: resetPrimaryError } = await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  if (resetPrimaryError) { uploading.value = false; throw new Error(resetPrimaryError.message) }
  const { error: imageError } = await supabase.from('product_images').insert({ product_id: productId, image_url: data.publicUrl, alt_text: form.value.name, is_primary: true, display_order: 0 })
  uploading.value = false
  if (imageError) throw new Error(imageError.message)
}
async function saveProduct() {
  error.value = ''
  notice.value = ''
  if (!form.value.name.trim() || !form.value.slug.trim() || form.value.price === '') { error.value = 'Product name, slug, and price are required.'; return }
  saving.value = true
  const payload = {
    name: form.value.name.trim(), slug: form.value.slug.trim(), category: form.value.category,
    short_description: form.value.short_description.trim() || null, description: form.value.description.trim() || null,
    price: Number(form.value.price), compare_at_price: form.value.compare_at_price === '' ? null : Number(form.value.compare_at_price),
    size: form.value.size.trim() || null, tag: form.value.tag.trim() || null,
    is_featured: form.value.is_featured, status: form.value.status
  }
  let productId = editingId.value
  const result = editingId.value
    ? await supabase.from('products').update(payload).eq('id', editingId.value).select('id').single()
    : await supabase.from('products').insert(payload).select('id').single()
  if (result.error) { error.value = result.error.message; saving.value = false; return }
  productId = result.data.id

  const variants = form.value.variants.filter(v => v.variant_name.trim()).map(v => ({
    product_id: productId, variant_name: v.variant_name.trim(), sku: v.sku.trim() || null,
    price: Number(v.price || payload.price), compare_at_price: v.compare_at_price === '' ? null : Number(v.compare_at_price),
    size: v.size.trim() || null, is_available: v.is_available
  }))
  const { error: clearVariantsError } = await supabase.from('product_variants').delete().eq('product_id', productId)
  if (clearVariantsError) { error.value = clearVariantsError.message; saving.value = false; return }
  if (variants.length) {
    const { error: variantError } = await supabase.from('product_variants').insert(variants)
    if (variantError) { error.value = variantError.message; saving.value = false; return }
  }
  try {
    await uploadProductImage(productId)
  } catch (uploadError) {
    error.value = `Product saved, but image upload failed: ${uploadError.message}`
    saving.value = false
    await loadProducts()
    return
  }
  saving.value = false
  const successMessage = editingId.value ? 'Product updated successfully.' : 'Product created successfully.'
  openNew()
  notice.value = successMessage
  await loadProducts()
}
async function deleteProduct(product) {
  if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  deletingId.value = product.id
  error.value = ''
  const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id)
  if (deleteError) error.value = deleteError.message
  else { notice.value = 'Product deleted.'; await loadProducts() }
  deletingId.value = null
}
onMounted(loadProducts)
</script>

<template>
  <div class="min-h-screen bg-[#f5f6f7]">
    <header class="border-b border-yuwo-line bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <RouterLink to="/admin" class="flex flex-col leading-none text-yuwo-navy"><span class="font-display text-2xl font-extrabold tracking-[-.08em]">YUWO</span><small class="mt-1 text-[8px] font-bold tracking-[.22em]">ADMINISTRATION</small></RouterLink>
        <RouterLink to="/admin" class="text-xs font-bold text-yuwo-navy hover:underline">← Dashboard</RouterLink>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p class="text-[10px] font-bold tracking-[.18em] text-[#a17c20]">CATALOG MANAGEMENT</p><h1 class="mt-2 font-display text-3xl font-extrabold text-yuwo-ink">Products</h1><p class="mt-2 text-sm text-yuwo-muted">Create and maintain the products in your YUWO catalog.</p></div>
        <button @click="openNew" class="bg-yuwo-navy px-5 py-3 text-xs font-bold text-white hover:bg-yuwo-deep">＋ Add product</button>
      </div>
      <div v-if="error" role="alert" class="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{{ error }}</div>
      <div v-if="notice" role="status" class="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-800">{{ notice }}</div>

      <section class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.85fr)]">
        <div class="border border-yuwo-line bg-white p-5 sm:p-6">
          <div class="flex flex-col gap-3 sm:flex-row">
            <input v-model="search" placeholder="Search products…" class="min-w-0 flex-1 border border-yuwo-line px-3 py-3 text-xs outline-none focus:border-yuwo-navy">
            <select v-model="statusFilter" class="border border-yuwo-line bg-white px-3 py-3 text-xs"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
          </div>
          <div class="mt-5 flex items-center justify-between"><h2 class="font-display text-lg font-bold">Catalog</h2><span class="text-[10px] text-yuwo-muted">{{ filteredRows.length }} products</span></div>
          <div v-if="loading" class="py-12 text-center text-xs text-yuwo-muted">Loading products…</div>
          <div v-else-if="!filteredRows.length" class="py-12 text-center text-xs text-yuwo-muted">No products found. Add your first product.</div>
          <div v-else class="mt-4 divide-y divide-yuwo-line">
            <article v-for="product in filteredRows" :key="product.id" class="flex items-center gap-3 py-4">
              <img v-if="(product.product_images.find(i => i.is_primary) || product.product_images[0])" :src="(product.product_images.find(i => i.is_primary) || product.product_images[0]).image_url" :alt="product.name" class="h-16 w-16 shrink-0 bg-[#f4f4f3] object-contain">
              <div v-else class="flex h-16 w-16 shrink-0 items-center justify-center bg-[#f4f4f3] text-[9px] text-yuwo-muted">No image</div>
              <div class="min-w-0 flex-1"><h3 class="truncate text-xs font-bold text-yuwo-ink">{{ product.name }}</h3><p class="mt-1 text-[10px] text-yuwo-muted">{{ product.category || 'Uncategorized' }} · {{ money(product.price) }}</p><span class="mt-1 inline-block text-[9px] font-bold uppercase tracking-wide" :class="product.status === 'published' ? 'text-green-700' : product.status === 'archived' ? 'text-gray-500' : 'text-amber-700'">{{ product.status }}</span></div>
              <div class="flex shrink-0 gap-2"><button @click="editProduct(product)" class="border border-yuwo-line px-3 py-2 text-[10px] font-bold text-yuwo-navy">Edit</button><button @click="deleteProduct(product)" :disabled="deletingId === product.id" class="px-2 py-2 text-[10px] font-bold text-red-600 disabled:opacity-50">{{ deletingId === product.id ? '…' : 'Delete' }}</button></div>
            </article>
          </div>
        </div>

        <div class="h-fit border border-yuwo-line bg-white p-5 sm:p-6">
          <div class="flex items-center justify-between gap-3"><h2 class="font-display text-lg font-bold">{{ editingId ? 'Edit product' : 'New product' }}</h2><button v-if="editingId" @click="openNew" class="text-[10px] font-bold text-yuwo-muted underline">Cancel edit</button></div>
          <form class="mt-5 space-y-4" @submit.prevent="saveProduct">
            <label class="block text-[10px] font-bold">Product name *<input v-model="form.name" @input="!editingId && (form.slug = slugify(form.name))" required class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs outline-none focus:border-yuwo-navy"></label>
            <label class="block text-[10px] font-bold">URL slug *<input v-model="form.slug" required class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs outline-none focus:border-yuwo-navy"></label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block text-[10px] font-bold">Category<select v-model="form.category" class="mt-2 w-full border border-yuwo-line bg-white px-3 py-3 text-xs"><option>Undermount</option><option>Topmount</option><option>Other</option></select></label>
              <label class="block text-[10px] font-bold">Size<input v-model="form.size" class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs"></label>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="block text-[10px] font-bold">Price (PHP) *<input v-model="form.price" type="number" min="0" step="0.01" required class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs"></label>
              <label class="block text-[10px] font-bold">Compare-at price<input v-model="form.compare_at_price" type="number" min="0" step="0.01" class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs"></label>
            </div>
            <label class="block text-[10px] font-bold">Short description<input v-model="form.short_description" class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs"></label>
            <label class="block text-[10px] font-bold">Full description<textarea v-model="form.description" rows="3" class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs"></textarea></label>
            <label class="block text-[10px] font-bold">Product tag<input v-model="form.tag" placeholder="e.g. Best seller" class="mt-2 w-full border border-yuwo-line px-3 py-3 text-xs"></label>
            <div class="border-t border-yuwo-line pt-4">
              <div class="flex items-center justify-between"><h3 class="text-xs font-bold">Variants</h3><button type="button" @click="addVariant" class="text-[10px] font-bold text-yuwo-navy">＋ Add variant</button></div>
              <p v-if="!form.variants.length" class="mt-2 text-[10px] text-yuwo-muted">Optional. Add faucet, finish, or package options.</p>
              <div v-for="(variant, index) in form.variants" :key="index" class="mt-3 space-y-2 border border-yuwo-line p-3">
                <div class="flex items-center justify-between"><span class="text-[9px] font-bold text-yuwo-muted">VARIANT {{ index + 1 }}</span><button type="button" @click="removeVariant(index)" class="text-[9px] font-bold text-red-600">Remove</button></div>
                <input v-model="variant.variant_name" placeholder="Variant name" class="w-full border border-yuwo-line px-3 py-2 text-xs">
                <div class="grid grid-cols-2 gap-2"><input v-model="variant.sku" placeholder="SKU (optional)" class="min-w-0 border border-yuwo-line px-3 py-2 text-xs"><input v-model="variant.size" placeholder="Size" class="min-w-0 border border-yuwo-line px-3 py-2 text-xs"><input v-model="variant.price" type="number" min="0" placeholder="Price" class="min-w-0 border border-yuwo-line px-3 py-2 text-xs"><input v-model="variant.compare_at_price" type="number" min="0" placeholder="Compare price" class="min-w-0 border border-yuwo-line px-3 py-2 text-xs"></div>
                <label class="flex items-center gap-2 text-[10px]"><input v-model="variant.is_available" type="checkbox"> Available for sale</label>
              </div>
            </div>
            <div class="border-t border-yuwo-line pt-4">
              <label class="block text-[10px] font-bold">Primary product image<input type="file" accept="image/*" @change="chooseImage" class="mt-2 block w-full text-[10px] file:mr-3 file:border-0 file:bg-yuwo-soft file:px-3 file:py-2 file:text-[10px] file:font-bold"></label>
              <img v-if="imagePreview" :src="imagePreview" alt="Product preview" class="mt-3 h-36 w-full bg-[#f4f4f3] object-contain">
              <p class="mt-2 text-[9px] text-yuwo-muted">Image uploads use the Supabase Storage bucket named product-images. Maximum file size: 8 MB.</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="block text-[10px] font-bold">Status<select v-model="form.status" class="mt-2 w-full border border-yuwo-line bg-white px-3 py-3 text-xs"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
              <label class="flex items-end gap-2 pb-3 text-[10px] font-bold"><input v-model="form.is_featured" type="checkbox"> Featured product</label>
            </div>
            <button type="submit" :disabled="saving || uploading" class="w-full bg-yuwo-navy px-5 py-3.5 text-xs font-bold text-white disabled:opacity-50">{{ saving || uploading ? 'Saving…' : editingId ? 'Save changes' : 'Create product' }}</button>
          </form>
        </div>
      </section>
    </main>
  </div>
</template>
