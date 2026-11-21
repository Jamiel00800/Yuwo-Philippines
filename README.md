# YUWO Philippines — Vue 3 storefront recreation

A developer-ready, responsive Vue 3 + Vite recreation of the publicly visible YUWO Philippines storefront. The project reproduces the site's main information architecture and product-shopping flow while keeping product content editable in one data file.

## Stack
- Vue 3 (Composition API, `<script setup>`)
- Vite
- Vue Router
- lucide-vue-next icons
- Plain CSS (responsive, no utility framework)

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (normally http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```
The production bundle is generated in `dist/`.

## Project structure
```text
src/
  components/
    FAQ.vue             Accordion FAQ
    ProductCard.vue     Reusable product card
  data/
    store.js            Product catalog, article cards, FAQs and price formatter
  views/
    Home.vue            Homepage / landing page
    Catalog.vue         Product collection, filters, search and sorting
    Product.vue         Product details, variants, quantity and add-to-cart
    Articles.vue        Kitchen guides index and sample article reader
    Professionals.vue   Project pricing inquiry form
    Contact.vue         Contact and showroom information
  App.vue               Shared header, navigation, cart drawer and footer
  main.js              Router and app bootstrap
  style.css            Global responsive design system
```

## Working frontend functionality
- Responsive navigation and mobile menu
- Catalog filtering (All / Undermount / Topmount), text search and price sorting
- Product detail route for each catalog item
- Product variant and quantity selection
- Cart drawer with quantity controls and remove action
- Cart persistence via `localStorage`
- Order inquiry generated from cart and opened in WhatsApp for customer review
- Expand/collapse FAQ accordion
- Project and contact forms that prepare WhatsApp messages (not submitted silently)
- Article index and sample article reading view

## Customization guide

### Edit products, variants, pricing and product imagery
Update `src/data/store.js`. Each product has a `slug`, `name`, `category`, `size`, `price`, `compareAt`, `image` and `variants` array. Product cards, catalog filters and product detail pages all read from this shared data source.

### Change brand colors and typography
Edit CSS variables at the top of `src/style.css` (`--navy`, `--blue`, `--gold`, `--ink`, `--muted`). Font families are loaded in `index.html`.

### Change business contact details
Search for `639985412344`, `0998 541 2344`, and `yuwophilippines@gmail.com` in `src/App.vue` and the contact/professional views. Replace the Messenger destination with the correct page URL.

### Replace images
Image URLs are intentionally centralized in `src/data/store.js` for catalog imagery; homepage editorial images are in `src/views/Home.vue`. Use images that you own or are authorized to use. One product image points to a publicly accessible YUWO Shopify CDN image; the other image URLs are illustrative placeholders and should be replaced with verified official product/customer images before production.

## Important production notes
This is a frontend recreation, not a copy of Shopify's private theme or backend. It does not connect to Shopify Admin, inventory, customer accounts, shipping rates, payment gateways, order APIs, or a database. The cart is browser-local and the final action opens a WhatsApp inquiry; it does not create an order or collect payment. Product availability, price and policy details are sample content transcribed from public pages and must be confirmed with YUWO before launch.

To connect a real backend later, add a server/API layer and replace the local `add`/`checkout` functions in `App.vue` with authenticated product, cart and order endpoints. Do not put Shopify private access tokens or payment secrets in frontend code.

## Reference
Public website: https://www.yuwophilippines.com/
