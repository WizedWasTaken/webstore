<template>
  <div v-if="isOpen" class="modal">
    <div class="modal-header">
      <h2>Kontakter</h2>
      <button @click="close">Luk</button>
    </div>

    <div v-if="contacts.length > 0" class="contacts-container">
      <div class="contact-card">
        <h2>Kontakt {{ currentContactIndex + 1 }}</h2>
        <p>Mail: {{ currentContact.email }}</p>
        <p>Navn: {{ currentContact.name }}</p>
        <p>Beskrivelse: {{ currentContact.description }}</p>
        <select
          v-model="currentContact.status"
          @change="updateStatus(currentContact)"
        >
          <option disabled value="">Vælg status</option>
          <option>Afventer</option>
          <option>Set Af Admin</option>
          <option>Løst</option>
        </select>
        <button @click="toggleImages">Se billeder</button>
        <div
          v-if="
            showImages && currentContact.images && currentContact.images.length
          "
        >
          <img
            v-for="(image, imgIndex) in currentContact.images"
            :key="imgIndex"
            :src="image"
            alt="KAN IKKE LOADES"
          />
        </div>
      </div>
    </div>
    <div class="pagination">
      <button
        @click="goToPreviousContact"
        :disabled="currentContactIndex === 0"
      >
        ← Forrige
      </button>
      <span
        v-for="(contact, index) in contacts"
        :key="index"
        class="bullet"
        :class="{ active: currentContactIndex === index }"
        @click="goToContact(index)"
      ></span>
      <button
        @click="goToNextContact"
        :disabled="currentContactIndex === contacts.length - 1"
      >
        Næste →
      </button>
    </div>
  </div>
</template>

<script>
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      contacts: [],
      showImages: false,
      currentContactIndex: 0,
    };
  },
  watch: {
    async isOpen(newVal) {
      if (newVal) {
        await this.fetchContacts();
      }
    },
  },
  mounted() {
    if (this.isOpen) {
      this.open();
    }
  },
  computed: {
    currentContact() {
      return this.contacts[this.currentContactIndex];
    },
  },
  methods: {
    open() {
      document.body.classList.add("blurred");
    },
    async fetchContacts() {
      const db = getFirestore();
      const contactsCollection = collection(db, "contactForms");
      const contactsSnapshot = await getDocs(contactsCollection);

      this.contacts = contactsSnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
    },
    close() {
      this.$emit("close");
    },
    toggleImages() {
      this.showImages = !this.showImages;
    },
    async updateStatus(contact) {
      const db = getFirestore();
      const contactRef = doc(db, "contactForms", contact.id);

      const updatePayload = {
        status: contact.status,
      };

      if (contact.status === "Løst") {
        updatePayload.deleteTimestamp = new Date().toISOString();
      }

      await updateDoc(contactRef, updatePayload);
    },

    goToNextContact() {
      if (this.currentContactIndex === this.contacts.length - 1) {
        this.currentContactIndex = 0;
      } else {
        this.currentContactIndex++;
      }
    },
    goToPreviousContact() {
      if (this.currentContactIndex === 0) {
        this.currentContactIndex = this.contacts.length - 1;
      } else {
        this.currentContactIndex--;
      }
    },
    goToContact(index) {
      this.currentContactIndex = index;
    },
  },
};
</script>

<style scoped>
:root {
  --modal-bg-color: rgba(255, 255, 255, 0.9);
  --btn-bg-color: #007bff;
  --btn-hover-bg-color: #0056b3;
  --btn-text-color: #ffffff;
  --card-bg-color: #ffffff;
  --input-bg-color: #f8f9fa;
  --input-text-color: #343a40;
  --input-border-color: #ced4da;
}

[data-theme="dark"] {
  --modal-bg-color: rgba(34, 40, 49, 0.9);
  --btn-bg-color: #343a40;
  --btn-hover-bg-color: #212529;
  --btn-text-color: #f8f9fa;
  --card-bg-color: #343a40;
  --input-bg-color: #495057;
  --input-text-color: #e9ecef;
  --input-border-color: #ced4da;
}

.modal-header button {
  background-color: #ff4b5c; /* Change this to your desired color */
  color: #ffffff;
  font-weight: bold;
  border: none;
  padding: 5px 15px;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.modal-header button:hover {
  background-color: #e43f4f; /* Change this to your desired hover color */
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--modal-bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 1.2rem;
}

.modal p {
  margin-bottom: 0.3rem;
}

.modal h2 {
  margin-bottom: 1.5rem;
}

button {
  margin: 10px;
  padding: 8px 15px;
  background-color: var(--btn-bg-color);
  border: none;
  border-radius: 4px;
  color: var(--btn-text-color);
  transition: background-color 0.3s;
}

button:hover {
  background-color: var(--btn-hover-bg-color);
}

.contacts-container {
  display: flex;
  flex-direction: column;
  overflow-x: scroll;
  gap: 20px;
}

.contact-card {
  margin: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.356);
  background-color: var(--card-bg-color);
  min-width: 250px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

select {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: var(--input-bg-color);
  color: var(--input-text-color);
  border: 1px solid var(--input-border-color);
  border-radius: 4px;
}

option:disabled {
  color: var(--input-text-color);
  border: 1px solid var(--input-border-color);
  cursor: not-allowed;
}

img {
  max-width: 250px;
  aspect-ratio: 1 / 1;
  border-radius: 5px;
  margin: 5px;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 20px;
}

.bullet {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ddd;
  cursor: pointer;
  transition: background-color 0.3s;
}

.bullet:hover {
  background-color: #bbb;
}

.bullet.active {
  background-color: var(--btn-bg-color);
}
</style>
