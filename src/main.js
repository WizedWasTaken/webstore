import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import { db, functions } from "./firebase.js";
import Toast, { POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

Vue.config.productionTip = false;
Vue.prototype.$firebaseDb = db;
Vue.prototype.$firebaseFunctions = functions;

Vue.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 3500,
  closeOnClick: true,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  draggable: false,
  draggablePercent: 0.7,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: "button",
  icon: false,
  rtl: false,
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
