import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAFxE6pp5QbmCvdEo4owpkqAbSF6xfk1V0",
    authDomain: "ai-wheedle-digital-marketing.firebaseapp.com",
    projectId: "ai-wheedle-digital-marketing",
    storageBucket: "ai-wheedle-digital-marketing.firebasestorage.app",
    messagingSenderId: "432839779283",
    appId: "1:432839779283:web:a8caa5cc0e95ce2e240526",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { auth, googleProvider, facebookProvider };