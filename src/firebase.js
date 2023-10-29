import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAcWjhwyWbVuNAU62obFsko2pXEvdoIiqo",
  authDomain: "my-project-93058-1688072688174.firebaseapp.com",
  projectId: "my-project-93058-1688072688174",
  storageBucket: "my-project-93058-1688072688174.appspot.com",
  messagingSenderId: "951726509664",
  appId: "1:951726509664:web:46395643a69d50fe2b7d05",
  measurementId: "G-5RF7WRM47R",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
