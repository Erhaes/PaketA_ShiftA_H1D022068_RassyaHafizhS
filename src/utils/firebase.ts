// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// auth email
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDknl4HhVBQmYo0oX_rOtIfTd8we5kTWyQ",
  authDomain: "responsiradiatorspring.firebaseapp.com",
  projectId: "responsiradiatorspring",
  storageBucket: "responsiradiatorspring.firebasestorage.app",
  messagingSenderId: "970726013214",
  appId: "1:970726013214:web:acf25d7486d861def7b10f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//auth
const auth = getAuth(app);

import { getFirestore } from 'firebase/firestore';

const db = getFirestore(app);


export { auth, db };