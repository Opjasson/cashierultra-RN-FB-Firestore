import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey:
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY ??
        process.env.apiKey ??
        "AIzaSyCkR82C2APEzSRn5UYHJJM7Qr8n1Dsvfjg",
    authDomain:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
        process.env.authDomain ??
        "ultraglow-cashier.firebaseapp.com",
    projectId:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
        process.env.projectId ??
        "ultraglow-cashier",
    storageBucket:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
        process.env.storageBucket ??
        "ultraglow-cashier.firebasestorage.app",
    messagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
        process.env.messagingSenderId ??
        "210144618109",
    appId:
        process.env.EXPO_PUBLIC_FIREBASE_APP_ID ??
        process.env.appId ??
        "1:210144618109:web:db36ab9f534e5694fdb314",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app)
