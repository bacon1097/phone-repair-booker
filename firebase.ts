import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";

const DEV = process.env.NODE_ENV === "development";

const firebaseConfig = {
  apiKey: "AIzaSyAcpibNNl1Er62WHXaFrxyydzOfyrj3ffs",
  authDomain: "phone-repair-booker.firebaseapp.com",
  projectId: "phone-repair-booker",
  storageBucket: "phone-repair-booker.appspot.com",
  messagingSenderId: "942482378332",
  appId: "1:942482378332:web:e1b4d94b93c6d34a282099",
  measurementId: "G-T6MV2DJ1ZB",
};

const LOCAL = "localhost";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
export const db = getFirestore(app);
DEV && connectFirestoreEmulator(db, LOCAL, 8080);

export const auth = getAuth(app);
// Localize the OAuth the flow to the user's preferred language
auth.languageCode = "it";
DEV && connectAuthEmulator(auth, `http://${LOCAL}:9099`);

export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);

export const functions = getFunctions(app);
DEV && connectFunctionsEmulator(functions, LOCAL, 5001);
