import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// These values identify the project and are safe to ship in client code;
// access is controlled by Firebase Auth and the Firestore security rules.
const app = initializeApp({
  apiKey: 'AIzaSyD-pTGvc2rFxeL22LhPU0o9JzssT_jUW9o',
  authDomain: 'narrative-wargame.firebaseapp.com',
  projectId: 'narrative-wargame',
  storageBucket: 'narrative-wargame.firebasestorage.app',
  messagingSenderId: '376148049131',
  appId: '1:376148049131:web:90613ef1f6eec47bf192ae',
})

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
