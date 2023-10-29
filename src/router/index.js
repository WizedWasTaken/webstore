import Vue from "vue";
import VueRouter from "vue-router";

// Page Imports
import HomePage from "@/views/HomePage.vue";
import Login from "@/views/LoginPage.vue";
import Konto from "@/views/KontoPage.vue";
import Store from "@/views/StorePage.vue";
import Kontakt from "@/views/ContactPage.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/konto",
    name: "Konto",
    component: Konto,
  },
  {
    path: "/store",
    name: "Store",
    component: Store,
  },
  {
    path: "/contact",
    name: "Kontakt",
    component: Kontakt,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
