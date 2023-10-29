<template>
  <div class="container">
    <h1>Kontakt Os</h1>
    <form action="">
      <div class="form-item">
        <label for="navn">Indtast dit navn</label>
        <input type="text" id="navn" required />
      </div>
      <div class="form-item">
        <label for="email">Indtast din email</label>
        <input
          type="text"
          id="email"
          :value="userEmail"
          :disabled="userEmail"
          required
        />
      </div>
      <div class="form-item description">
        <label for="beskrivelse">Besked til os</label>
        <textarea
          v-model="description"
          name="beskrivelse"
          id="beskrivelse"
        ></textarea>

        <div class="char-count">{{ description.length }} / 25</div>
      </div>
      <div class="form-item file">
        <label for="billeder" class="custom-file-upload">Upload billeder</label>
        <input
          type="file"
          id="billeder"
          multiple
          accept="image/*"
          @change="showImages"
        />
      </div>
      <button :disabled="description.length < 25" @click.prevent="sendMessage">
        Send
      </button>
    </form>
    <div class="img-container">
      <div
        v-for="(imageSrc, index) in imageURLs"
        :key="index"
        class="image-wrapper"
      >
        <img :src="imageSrc" alt="Uploadet Billede" class="uploaded-image" />
        <button @click="removeImage(index)" class="delete-button">X</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-text-color: #000;
  --secondary-text-color: #363636;
  --border-color: #333;
}

[data-theme="dark"] {
  --primary-text-color: #fff;
  --secondary-text-color: #929292;
  --border-color: #d8d8d8;
}

.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

form {
  margin-top: 5rem;
  display: flex;
  width: 30vw;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

textarea {
  color: white;
}

input:active,
textarea:hover,
textarea:focus {
  outline: none;
}

.form-item {
  display: flex;
  flex-direction: column;
  width: 250px;
  margin-top: 2rem;
}

label {
  margin-bottom: 1rem;
}

input {
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  background-color: var(--primary-bg-color);
  border-bottom: 2px solid #ccc;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  background-color: var(--primary-bg-color);
  border-bottom: 2px solid #ccc;
  resize: vertical;
}

/* input:focus,
textarea:focus {
  border-color: none;
  box-shadow: none;
}

input,
textarea {
  border: none;
  border-bottom: 2px solid #ccc;
}  */

.description {
  width: 100%;
}

button {
  width: 100%;
  padding: 10px 20px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

button:hover {
  background-color: #0056b3;
}

.file {
  border: none;
}
.custom-file-upload {
  padding: 10px;
  display: inline-block;
  cursor: pointer;
  border-radius: 4px;
}

.img-container {
  width: 70%;
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  flex-wrap: wrap;
}

.image-wrapper {
  position: relative;
  display: inline-block; /* to place images side by side */
  margin: 1rem; /* space around each image */
}

.uploaded-image {
  width: 250px;
  aspect-ratio: 1 / 1;
  display: block;
}

.delete-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 0, 0, 0.7); /* semi-transparent red */
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 15px;
  aspect-ratio: 1 / 1;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease; /* smooth transition */
}

.delete-button:hover {
  background-color: rgba(255, 0, 0, 1); /* solid red on hover */
}

.char-count {
  margin-top: 5px;
  color: var(--secondary-text-color);
}

#billeder {
  display: none;
}

input:disabled {
  cursor: not-allowed;
}
</style>

<script>
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  data() {
    return {
      images: [],
      description: "",
    };
  },
  computed: {
    userEmail() {
      const authInstance = getAuth();
      const user = authInstance.currentUser;
      return user ? user.email : "";
    },
    imageURLs() {
      return this.images.map((image) =>
        image instanceof File ? URL.createObjectURL(image) : image
      );
    },
  },
  methods: {
    showImages(event) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
      ];
      const files = Array.from(event.target.files).filter((file) => {
        if (validImageTypes.includes(file.type)) {
          return true;
        } else {
          this.$toast.error(
            `Fil "${file.name}" er ikke en billedtype vi understøtter.`
          );
          return false;
        }
      });

      this.images = this.images.concat(files);
    },

    async sendMessage() {
      const storage = getStorage();
      const uploadedImageUrls = [];

      for (const imageFile of this.images) {
        const timestamp = new Date().toISOString();
        const fileExtension = imageFile.name.split(".").pop();
        const storageRef = ref(
          storage,
          `images/${timestamp}-${Math.random()
            .toString(36)
            .substring(2, 10)}.${fileExtension}`
        );

        await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedImageUrls.push(downloadURL);
      }

      const newContactForm = {
        name: document.getElementById("navn").value,
        email: document.getElementById("email").value,
        description: this.description,
        images: uploadedImageUrls,
      };

      try {
        const db = getFirestore();
        await addDoc(collection(db, "contactForms"), newContactForm);
        this.description = "";
        this.images = [];
        this.$toast.success(
          "Din besked er nu sendt videre til vores supportere!"
        );
      } catch (error) {
        console.error("Error adding document:", error);
        this.$toast.error(
          "Vi kunne ikke sende din besked til vores supportere. Kontakt vores IT afdeling for mere info."
        );
      }
    },

    removeImage(index) {
      this.images.splice(index, 1);
    },
  },
};
</script>
