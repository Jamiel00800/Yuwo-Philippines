// Shared display formatting. Storefront content is loaded from Supabase.
export const money = value => '₱' + Number(value || 0).toLocaleString('en-PH', {
  maximumFractionDigits: 2
})
