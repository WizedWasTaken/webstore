<template>
  <nav>
    <div class="img-brand">
      <img :src="logoSrc" alt="NIDIDAS LOGO" />
    </div>
    <div class="top-nav">
      <i
        class="fa-regular fa-cart-shopping cart-icon"
        @click="toggleCartDropdown"
      >
        <span class="cart-count">{{ cartItemsCount }}</span>
      </i>

      <router-link :to="userRoute">
        <i class="fa-regular fa-user"></i>
      </router-link>
      <i class="fa-solid fa-moon" id="darkToggle" @click="toggleDarkMode"></i>
    </div>
    <CartDropdown v-if="isCartVisible" @close="toggleCart" />
    <div class="mid-nav">
      <ul>
        <li>
          <router-link to="/">Hjem</router-link>
        </li>
        <li>
          <router-link to="/store">Butik</router-link>
        </li>
        <li>
          <router-link to="/about">Om Os</router-link>
        </li>
        <li>
          <router-link to="/contact">Kontakt</router-link>
        </li>
        <li>
          <router-link to="/konto">Konto</router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import CartDropdown from "./CartModal.vue";
import { mapState, mapMutations } from "vuex";

export default {
  name: "NavBar",
  data() {
    return {
      darkMode: false,
      user: null,
    };
  },

  components: {
    CartDropdown,
  },

  computed: {
    ...mapState(["isCartVisible"]),
    cartItemsCount() {
      return this.$store.getters.cartCount;
    },
    logoSrc() {
      return this.darkMode
        ? require("../assets/logo-white.png")
        : require("../assets/logo-black.png");
    },
    userRoute() {
      return this.user ? "/konto" : "/login";
    },
  },
  methods: {
    ...mapMutations(["toggleCart"]),
    toggleCartDropdown() {
      this.toggleCart();
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      if (this.darkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("darkMode", "true");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.removeItem("darkMode");
        localStorage.setItem("lightMode", "true");
      }
      this.$emit("themeChanged", this.darkMode);
    },
  },
  mounted() {
    if (localStorage.getItem("lightMode")) {
      this.darkMode = false;
      document.documentElement.removeAttribute("data-theme");
    } else if (localStorage.getItem("darkMode")) {
      this.darkMode = true;
      document.documentElement.setAttribute("data-theme", "dark");
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        this.$store.dispatch("fetchCartCount", user.uid);
      } else {
        this.user = null;
      }
    });
  },
};
</script>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition: background-color 0.7s ease;
}

/* Default (light) theme */
:root {
  --primary-bg-color: white;
  --primary-text-color: black;
  --nav-border-color: gray;
  --link-color: black;
  --link-border-color: black;
  --icon-color: black;
  --input-bg-color: white;
  --widget-color: green;
}

/* Dark theme */
[data-theme="dark"] {
  --primary-bg-color: #333;
  --primary-text-color: #fff;
  --nav-border-color: #fff;
  --link-color: #fff;
  --link-border-color: #fff;
  --icon-color: white;
  --input-bg-color: #6d6b6b;
  --widget-color: red;
}

body {
  background-color: var(--primary-bg-color);
  color: var(--primary-text-color);
  padding-left: 15vw;
}

nav {
  display: flex;
  flex-direction: column;
  width: 15vw;
  border-right: 2px solid var(--nav-border-color);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background-color: var(--primary-bg-color);
  overflow-y: auto;
  z-index: 1000;
}

.cart-icon {
  position: relative;
}

.img-brand {
  display: flex;
  align-items: center;
}

.img-brand img {
  width: 100%;
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 5px;
  font-size: 0.7rem;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  width: 100%;
}

.top-nav i {
  font-size: 1.5rem;
  margin: 0px 10px;
  cursor: pointer;
  color: var(--icon-color);
}

.mid-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mid-nav ul {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  list-style: none;
  justify-content: space-between;
}

.mid-nav ul li {
  margin: 1rem 0;
  font-size: 2rem;
}

.mid-nav ul li a {
  text-decoration: none;
  color: var(--link-color);
}

.mid-nav ul li a:hover {
  color: var(--hover-color);
  cursor: pointer;
}

.mid-nav ul li a:visited {
  color: var(--link-color);
  text-decoration: none;
}

/* General */

input {
  padding: 1rem 2rem;
  outline: none;
  border: 1px solid var(--nav-border-color);
  background-color: var(--primary-bg-color);
  color: var(--primary-text-color);
}

.fade-enter-active {
  transition: opacity 0.3s;
}
.fade-leave-active {
  transition: opacity 0s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

#darkToggle {
  transform: rotate(-20deg);
}

.hamburger-menu {
  display: none; /* Initially hidden on desktop */
  flex-direction: column;
  justify-content: space-between;
  height: 24px;
  width: 30px;
  cursor: pointer;
}

.hamburger-menu div {
  height: 3px;
  width: 30px;
  background-color: var(--primary-text-color);
}

/* Responsive Styles */
@media only screen and (max-width: 768px) {
  body {
    padding: 0;
  }

  .hamburger-menu {
    display: flex;
  }

  /* Hide the main navigation when menu is not toggled */
  nav:not(.active) .mid-nav,
  nav:not(.active) .top-nav {
    display: none;
  }

  nav {
    width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-right: none;
    border-bottom: 2px solid var(--nav-border-color);
    position: relative;
  }

  .top-nav,
  .mid-nav {
    flex-direction: row;
  }

  .mid-nav ul {
    flex-direction: row;
  }

  .mid-nav ul li {
    margin: 0 1rem;
    font-size: 1.5rem; /* Adjust font size for mobile */
  }
}

@media screen and (max-width: 1000px) {
  .top-nav i {
    font-size: 1rem;
  }
}
</style>
