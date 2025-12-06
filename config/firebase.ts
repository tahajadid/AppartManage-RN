import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDfWRH8wIg1Igeff1RiG2KP9rKmBC-qRH4",
    authDomain: "appartmanage.firebaseapp.com",
    projectId: "appartmanage",
    storageBucket: "appartmanage.firebasestorage.app",
    messagingSenderId: "953671950972",
    appId: "1:953671950972:web:1b9f46886e3c111a32dff9",
    measurementId: "G-GWJKWKVFCV"
};  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
// For Firebase v12+, getAuth works fine for React Native
// Persistence is handled automatically
export const auth = getAuth(app);

// Firestore
export const firestore = getFirestore(app);