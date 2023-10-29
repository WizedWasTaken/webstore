<template>
  <div v-if="isCartVisible" class="modal-overlay" @click.self="closeCart">
    <div class="cartModal-container">
      <div class="modal-header">
        <button class="close-btn" @click="closeCart">X</button>
        <h1>Din Kurv</h1>
        <input
          v-model="search"
          class="search-bar"
          placeholder="Søg i kurven..."
        />
      </div>
      <PaymentModal
        :isVisible="isPaymentModalVisible"
        :totalPrice="totalPrice"
        @close="isPaymentModalVisible = false"
        :onSuccess="handlePaymentSuccess"
      />
      <div id="cartItemsContainer">
        <div
          v-for="(item, index) in filteredCartItems"
          :key="index"
          class="cart-item"
        >
          <div class="item-content">
            <img :src="item.image" alt="Product Image" class="product-image" />
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="price">
                <strong>{{ item.price }} DKK</strong>
              </p>
            </div>
            <input
              type="number"
              v-model.number="item.quantity"
              min="1"
              class="quantity-input"
            />
          </div>
          <div class="quantity-container">
            <button @click="removeItem(item)" class="remove-btn">Fjern</button>
          </div>
        </div>
        <div class="modal-footer">
          <div class="total-price">Total: {{ totalPrice }} DKK</div>
          <button @click="handlePayment" class="payment-btn">Betal</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadStripe } from "@stripe/stripe-js";
import { mapState, mapActions } from "vuex";
import "firebase/compat/functions";
import PaymentModal from "@/components/PaymentModal.vue"; // Make sure the path is correct

export default {
  components: {
    PaymentModal,
  },
  name: "CartModal",
  data() {
    return {
      search: "",
      stripe: null,
      elements: null,
      card: null,
      isPaymentModalVisible: false,
    };
  },
  computed: {
    ...mapState(["cartItems", "user", "isCartVisible"]),
    filteredCartItems() {
      return this.cartItems.filter((item) =>
        item.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    totalPrice() {
      return this.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  async mounted() {
    this.stripe = await loadStripe(
      "pk_live_51NRCPUHoNWCfLrwxemcZrfRpUEjOdqahzMNOcwlEtL06cN01hchC22PypMsuuHOuRX1OsBjg9oDfgOOYcNJN5fBE00tJax1nH3"
    );
    // Removed the card initialization from here as it's not needed in this component anymore
  },
  methods: {
    ...mapActions(["updateQuantity", "removeFromCart"]),
    closeCart() {
      this.$store.commit("toggleCart");
    },
    showPaymentModal() {
      this.isPaymentModalVisible = true;
    },
    handlePaymentSuccess() {
      console.log("Payment was successful!");
      // Handle post-payment success logic here
      this.closeCart(); // Close the cart modal when payment is successful
    },
    handlePayment() {
      this.showPaymentModal(); // Show the payment modal when the "Betal" button is clicked
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
  position: relative;
  width: 100%;
  bottom: 0;
}
.cartModal-container {
  width: 80%;
  max-width: 1000px;
  text-align: center;
  background-color: var(--primary-bg-color);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#cartItemsContainer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: 45vh;
  overflow-y: scroll;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: red;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: var(--primary-bg-color);
  transition: transform 0.2s ease-in-out;
}

.cart-item:hover {
  transform: translateY(-5px);
}

.item-content {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 15px;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 15px;
}

.price {
  margin: 5px 0;
  color: var(--widget-color);
  font-weight: bold;
}

.quantity-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 20%;
}

.quantity-input {
  width: 50px;
  padding: 5px;
  text-align: center;
  border: 1px solid var(--nav-border-color);
  border-radius: 5px;
  margin-right: -10%;
}

.search-bar {
  width: 100%;
  padding: 10px;
  margin: 20px auto;
  border: 1px solid var(--nav-border-color);
  border-radius: 5px;
}

.remove-btn {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.total-price {
  font-size: 18px;
  margin-top: 20px;
}

.payment-btn {
  background-color: var(--widget-color);
  color: var(--primary-bg-color);
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.payment-btn:hover {
  background-color: darken(var(--widget-color), 10%);
}
</style>
