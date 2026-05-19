import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey:
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
        process.env.apiKey ??
        "AIzaSyDzmGeKdRj--ILni9reY1JYDQcCzRnFlOs",
    authDomain:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        process.env.authDomain ??
        "ultraglow-application-new.firebaseapp.com",
    projectId:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
        process.env.projectId ??
        "ultraglow-application-new",
    storageBucket:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
        process.env.storageBucket ??
        "ultraglow-application-new.firebasestorage.app",
    messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
        process.env.messagingSenderId ??
        "945165330495",
    appId:
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
        process.env.appId ??
        "1:945165330495:web:70b4dc6c55391fdadd708a",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app)
