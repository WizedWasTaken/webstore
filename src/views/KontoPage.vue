<template>
  <div class="accountPage-container">
    <h1>KONTO SIDE</h1>
    <div v-if="user">
      <p>Your email: {{ user.email }}</p>
      <button @click="handleLogout">Log Ud</button>
      <button v-if="role === 'admin'" @click="openModal" class="add-btn">
        Tilføj Sko
      </button>
      <AddShoeModal
        :isOpen="isModalOpen"
        @close="closeModal"
        @added="shoeAdded"
      ></AddShoeModal>
      <button
        v-if="role === 'admin'"
        @click="isContactsModalOpen = true"
        class="view-btn"
      >
        Se Kontakter
      </button>
      <ContactsModal
        :isOpen="isContactsModalOpen"
        @close="isContactsModalOpen = false"
      ></ContactsModal>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import router from "@/router";
import AddShoeModal from "@/components/AddShoeModal.vue";
import ContactsModal from "@/components/ContactsModal.vue";

export default {
  components: {
    AddShoeModal,
    ContactsModal,
  },

  data() {
    return {
      isContactsModalOpen: false,
      isModalOpen: false,
      user: null,
      role: null,
    };
  },
  created() {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        this.user = currentUser;

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          this.role = userDocSnap.data().role;
        }
      } else {
        if (router.currentRoute.path !== "/login") {
          router.push("/login");
        }
      }
    });
  },
  methods: {
    async handleLogout() {
      try {
        const auth = getAuth();
        await signOut(auth);
        this.user = null;
        this.$store.commit("CLEAR_USER_STATE");
        this.$toast.success("Loggede ud.");
      } catch (error) {
        console.error("Kunne ikke logge ud:", error);
      }
    },
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    },
    shoeAdded() {
      this.isModalOpen = false;
    },
  },
};
</script>

<style scoped>
.accountPage-container button {
  margin: 1.5rem;
  padding: 0.5rem 1rem;
}
</style>
