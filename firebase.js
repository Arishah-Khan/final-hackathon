// Import Firebase App (core SDK) and Firestore SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import { getFirestore , addDoc , collection , getDocs, doc, setDoc,serverTimestamp,where,orderBy,query,onSnapshot} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDssSxCZFYPvjSEzHLTT_Eg5yTsbYD9VG8",
  authDomain: "hackathon-1cb15.firebaseapp.com",
  projectId: "hackathon-1cb15",
  storageBucket: "hackathon-1cb15.appspot.com",
  messagingSenderId: "1094484649771",
  appId: "1:1094484649771:web:fd218500fbad2fe059476e",
  measurementId: "G-PVE9SPET5C"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firestore instance for usage in other files if needed
export { db , addDoc , collection , getDocs, doc, setDoc , getAuth, createUserWithEmailAndPassword , signInWithEmailAndPassword, serverTimestamp, where,orderBy,query,onAuthStateChanged,onSnapshot};
