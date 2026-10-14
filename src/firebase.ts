import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDhi6T7b8LF0WkndvUb2-4wIdrsng52b28",
  authDomain: "cozy-429f4.firebaseapp.com",
  projectId: "cozy-429f4",
  storageBucket: "cozy-429f4.firebasestorage.app",
  messagingSenderId: "519894912832",
  appId: "1:519894912832:web:302136aecf21575cedf4a5",
  measurementId: "G-2K2FBPWQZB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  app, 
  auth, 
  db,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
};
export type { User };
