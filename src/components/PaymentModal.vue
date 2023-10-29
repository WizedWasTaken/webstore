<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="payment-modal-container">
      <div class="modal-header">
        <button class="close-btn" @click="close">X</button>
        <h1>Betal</h1>
      </div>
      <div id="card-element" class="card-element"></div>
      <button
        @click="handlePayment"
        class="payment-btn"
        :disabled="isProcessing"
      >
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Betal {{ totalPrice }} DKK</span>
      </button>
      <div v-if="paymentSuccess" class="success-message">
        Payment was successful!
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";

export default {
  props: {
    isVisible: Boolean,
    totalPrice: Number,
    onSuccess: Function,
  },
  data() {
    return {
      isProcessing: false,
      paymentSuccess: false,
      user: null,
    };
  },
  created() {
    this.authCheck();
  },
  methods: {
    authCheck() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.user = user;
        } else {
          this.user = null;
        }
      });
    },
    close() {
      this.$emit("close");
    },
    async handlePayment() {
      if (!this.user) {
        console.error("User is not authenticated");
        return;
      }

      this.isProcessing = true;
      try {
        const db = getFirestore();
        const customersRef = doc(db, "customers", this.user.uid);
        await setDoc(
          customersRef,
          {
            createStripeSetupIntent: true,
          },
          { merge: true }
        );

        // TODO: Retrieve the client_secret from the appropriate Firestore document
        // const clientSecret = ...

        // TODO: Confirm the setup or payment using the Firebase Stripe extension

        // Example success handling
        this.paymentSuccess = true;
        if (this.onSuccess) {
          this.onSuccess();
        }
        this.close();
      } catch (error) {
        console.error("Payment failed", error);
      } finally {
        this.isProcessing = false;
      }
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
  z-index: 1001; /* Ensure it's above other modals */
}

.payment-modal-container {
  width: 80%;
  max-width: 500px;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal-header {
  position: relative;
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

.card-element {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.payment-btn {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.payment-btn:hover {
  background-color: #218838;
}
</style>
