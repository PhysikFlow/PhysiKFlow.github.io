// Import Firebase (modular, leve)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIG (substitui pelos seus dados)
const firebaseConfig = {
    apiKey: "SUA_KEY",
    authDomain: "SEU_APP.firebaseapp.com",
    projectId: "SEU_APP",
    storageBucket: "SEU_APP.appspot.com",
    messagingSenderId: "XXXX",
    appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);