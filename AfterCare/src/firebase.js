// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyDHKnfu3TjOHuAD0ilE8tFecWbs3OjlQEE",
  authDomain: "aftercare-f44b3.firebaseapp.com",
  projectId: "aftercare-f44b3",
  storageBucket: "aftercare-f44b3.firebasestorage.app",
  messagingSenderId: "65571423638",
  appId: "1:65571423638:web:6142abb45e316f947249b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);