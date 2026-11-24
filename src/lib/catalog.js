export function mapProduct(row) {
  const images = [...(row.product_images || [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return (a.display_order ?? 0) - (b.display_order ?? 0)
  })
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short: row.short_description || '',
    description: row.description || '',
    category: row.category || '',
    size: row.size || '',
    price: Number(row.price || 0),
    compareAt: row.compare_at_price == null ? null : Number(row.compare_at_price),
    tag: row.tag || '',
    image: images[0]?.image_url || '',
    images,
    variants: [...(row.product_variants || [])]
      .sort((a, b) => String(a.variant_name).localeCompare(String(b.variant_name)))
      .map(variant => ({
        id: variant.id,
        name: variant.variant_name,
        sku: variant.sku || '',
        price: Number(variant.price ?? row.price ?? 0),
        compareAt: variant.compare_at_price == null ? null : Number(variant.compare_at_price),
        size: variant.size || row.size || '',
        isAvailable: variant.is_available !== false
      }))
      .filter(variant => variant.isAvailable)
  }
}

export async function fetchPublishedProducts(client) {
  const { data, error } = await client
    .from('products')
    .select('*, product_variants(*), product_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map(mapProduct)
}

export function primaryImage(product) {
  return product?.image || product?.images?.[0]?.image_url || ''
}
