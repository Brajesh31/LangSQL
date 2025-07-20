import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
};


// Check if required config is present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  console.error(
    "Essential Firebase configuration is missing. Please check your .env file."
  );
  throw new Error("Firebase configuration error");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };
