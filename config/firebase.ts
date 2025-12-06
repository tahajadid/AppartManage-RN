// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
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
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore
export const firestore = getFirestore(app);