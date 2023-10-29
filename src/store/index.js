import Vue from "vue";
import Vuex from "vuex";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore functions

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    cartCount: 0,
    isCartVisible: true,
    cartItems: [],
    user: null,
  },
  mutations: {
    SET_CART_COUNT(state, count) {
      state.cartCount = count;
    },
    SET_CART_ITEMS(state, items) {
      state.cartItems = items;
    },
    SET_USER(state, user) {
      state.user = user;
    },
    incrementCart(state, value) {
      state.cartCount += value;
    },
    CLEAR_USER_STATE(state) {
      state.cartCount = 0;
      state.cartItems = [];
      state.user = null;
    },
    toggleCart(state) {
      state.isCartVisible = !state.isCartVisible;
    },
  },
  actions: {
    async fetchCartCount({ commit }, userId) {
      const db = getFirestore();

      try {
        const cartRef = doc(db, "carts", userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
          const cartItems = cartSnap.data().items || [];
          const totalQuantity = cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          ); // Compute the total quantity
          commit("SET_CART_COUNT", totalQuantity);
          commit("SET_CART_ITEMS", cartItems); // Store the cart items in the state
        } else {
          commit("SET_CART_COUNT", 0);
          commit("SET_CART_ITEMS", []); // Clear cart items if cart does not exist
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    },
    setUser({ commit }, user) {
      commit("SET_USER", user);
      if (user) {
        this.dispatch("fetchCartCount", user.uid);
      } else {
        commit("CLEAR_USER_STATE");
      }
    },
  },
  getters: {
    cartCount: (state) => state.cartCount,
    cartItems: (state) => state.cartItems, // Added getter for cart items
    user: (state) => state.user, // Added getter for user information
  },
});

export default store;
