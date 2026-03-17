import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB1weuJeUAmNKB4-QFWlHWpUnU3EQXcOV4",
  authDomain: "city-simulator-64c7a.firebaseapp.com",
  projectId: "city-simulator-64c7a",
  storageBucket: "city-simulator-64c7a.firebasestorage.app",
  messagingSenderId: "1072677324007",
  appId: "1:1072677324007:web:a6c50db311c4a62e398e42",
  measurementId: "G-K6D30LFS4R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);