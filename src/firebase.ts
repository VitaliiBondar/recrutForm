import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAcp9olglX_UyJTqQw1kNz7Qp-cASYU5V0',
  authDomain: 'recrut-ab610.firebaseapp.com',
  projectId: 'recrut-ab610',
  storageBucket: 'recrut-ab610.firebasestorage.app',
  messagingSenderId: '903913933458',
  appId: '1:903913933458:web:68408abdbde8395fa9b44b',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
