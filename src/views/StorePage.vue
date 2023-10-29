<template>
  <div class="storeContainer">
    <div class="searchFunctionContainer">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Søg..."
        @input="filterShoes"
      />
      <select v-model="selectedCategory" @change="filterShoes">
        <option value="">Alle</option>
        <option
          v-for="category in categories"
          :key="category"
          :value="category"
        >
          {{ category }}
        </option>
      </select>
    </div>
    <div class="shoe-grid">
      <div class="shoe-card" v-for="shoe in filteredShoes" :key="shoe.id">
        <img :src="shoe.image" alt="shoe.name" class="shoe-image" />
        <h2>{{ shoe.name || "Intet Navn Fundet" }}</h2>

        <p>{{ shoe.description }}</p>
        <p><strong>Pris: </strong>{{ shoe.price }} DKK</p>
        <button @click="addToCart(shoe)">Læg i kurven</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Default (light) theme */
:root {
  --primary-bg-color: white;
  --primary-text-color: black;
  --nav-border-color: gray;
  --hover-color: rgba(0, 0, 0, 0.466);
  --link-color: black;
  --link-border-color: black;
  --icon-color: black;
  --input-bg-color: white;
}

/* Dark theme */
[data-theme="dark"] {
  --primary-bg-color: #333;
  --primary-text-color: #fff;
  --nav-border-color: #fff;
  --hover-color: rgba(255, 255, 255, 0.733);
  --link-color: #fff;
  --link-border-color: #fff;
  --icon-color: white;
  --input-bg-color: #6d6b6b;
}

.storeContainer {
  width: 80vw;
  text-align: center;
}

.searchFunctionContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80vw;
  padding: 2rem;
}

.searchFunctionContainer input,
.searchFunctionContainer select {
  padding: 0.5rem 1rem;
  border: 2px solid var(--nav-border-color);
  color: var(--primary-text-color);
  background-color: var(--primary-bg-color);
  margin-right: 1rem;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 15px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border: 2px solid var(--link-border-color);
  color: var(--primary-text-color);
  background-color: var(--primary-bg-color);
  margin-top: 8%;
  outline: none;
}

button:hover {
  box-shadow: 0 3px 10px rgba(117, 117, 117, 0.671);
}

button:active {
  box-shadow: 0 2px 7px rgba(0, 0, 0, 0.2);
}

.shoe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  justify-content: center;
  padding: 2rem;
}

.shoe-card {
  background-color: var(--primary-bg-color);
  border: 1px solid var(--nav-border-color);
  border-radius: 15px;
  text-align: center;
  transform: 2s box-shadow ease-in-out;
  height: 100%;
}

.shoe-card img {
  aspect-ratio: 1 / 1;
  height: 60%;
}

.shoe-card p {
  margin-top: 0.6rem;
}

.shoe-card:hover {
  box-shadow: 0px 4px 20px var(--hover-color);
}

.shoe-image {
  width: 100%;
  margin: 0 auto 1rem auto;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .shoe-grid {
    gap: 1rem;
  }
}
</style>

<script>
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  data() {
    return {
      shoes: [],
      searchTerm: "",
      categories: [],
      selectedCategory: "",
      user: null,
      role: null,
      userId: null,
    };
  },

  mounted() {
    this.fetchShoes();
    this.fetchCategories();
    if (this.userId) {
      this.fetchCart();
    }
  },

  computed: {
    filteredShoes() {
      return this.shoes.filter((shoe) => {
        const matchesSearchTerm = shoe.name
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
        const matchesCategory =
          !this.selectedCategory || shoe.category === this.selectedCategory;

        return matchesSearchTerm && matchesCategory;
      });
    },
  },

  created() {
    const auth = getAuth();
    const db = getFirestore();

    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        this.user = currentUser;
        this.userId = currentUser.uid;

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          this.role = userDocSnap.data().role;
        }
      }
    });
  },

  methods: {
    async addToCart(shoe) {
      if (!this.userId) {
        this.$toast.error(
          "Du skal være logget in for at kunne lægge til kurven!"
        );
        return;
      }
      try {
        const db = getFirestore();
        const cartRef = doc(db, "carts", this.userId);
        const cartSnap = await getDoc(cartRef);

        let currentCart = [];

        if (cartSnap.exists()) {
          currentCart = cartSnap.data().items || [];
        }

        const existingItem = currentCart.find((item) => item.id === shoe.id);

        this.$store.commit("incrementCart", 1);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          currentCart.push({ ...shoe, quantity: 1 });
        }

        await setDoc(cartRef, { items: currentCart });
      } catch (error) {
        this.$toast.error("Fejl: " + JSON.stringify(error));
        console.error("Kunne ikke tilføje til kurven:", error);
      }
    },

    async fetchCart() {
      const db = getFirestore();
      const cartRef = doc(db, "carts", this.userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        this.cart = cartSnap.data().items || [];
      }
    },
    async fetchShoes() {
      const db = getFirestore();
      const shoesCollection = collection(db, "shoes");
      const shoesSnapshot = await getDocs(shoesCollection);

      this.shoes = shoesSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      });
    },

    async fetchCategories() {
      const db = getFirestore();
      const shoesCollection = collection(db, "shoes");
      const shoesSnapshot = await getDocs(shoesCollection);

      const uniqueCategories = new Set();

      shoesSnapshot.docs.forEach((doc) => {
        const shoe = doc.data();
        if (shoe.category) {
          uniqueCategories.add(shoe.category);
        }
      });

      this.categories = [...uniqueCategories];
    },

    filterShoes() {
      if (!this.searchTerm && !this.selectedCategory) {
        return this.shoes;
      }

      return this.shoes.filter((shoe) => {
        const matchesSearchTerm = shoe.name
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
        const matchesCategory =
          !this.selectedCategory || shoe.category === this.selectedCategory;

        return matchesSearchTerm && matchesCategory;
      });
    },
  },
};
</script>
