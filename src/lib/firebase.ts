import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC8S6clykU1yGdtZ5twg-kbLqWCZ9V4m1Q",
  authDomain: "bijora-f6139.firebaseapp.com",
  projectId: "bijora-f6139",
  storageBucket: "bijora-f6139.firebasestorage.app",
  messagingSenderId: "1008932518527",
  appId: "1:1008932518527:web:635c554411d2a4b8ed1d4a",
  measurementId: "G-0KBSW6J3KM"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
