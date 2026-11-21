import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Catalog from './views/Catalog.vue'
import Product from './views/Product.vue'
import Articles from './views/Articles.vue'
import Professionals from './views/Professionals.vue'
import Contact from './views/Contact.vue'
import './style.css'
const router=createRouter({history:createWebHistory(),scrollBehavior:()=>({top:0}),routes:[
{path:'/',component:Home},{path:'/collections/all',component:Catalog},{path:'/products/:slug',component:Product},{path:'/blogs/articles',component:Articles},{path:'/pages/for-professionals',component:Professionals},{path:'/pages/contact',component:Contact},{path:'/:pathMatch(.*)*',redirect:'/'}
]})
createApp(App).use(router).mount('#app')
