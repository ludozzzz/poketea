import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, onSnapshot, query, orderBy, where, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collections
export const productsCol = collection(db, "products");
export const ordersCol = collection(db, "orders");
export const usersCol = collection(db, "users");
export const configDoc = doc(db, "config", "restaurant");
export const adminsCol = collection(db, "admins");

// Exports
export {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc,
  onSnapshot, query, orderBy, where, setDoc, serverTimestamp,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
};
