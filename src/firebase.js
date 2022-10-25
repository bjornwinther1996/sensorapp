// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
//import { getAnalytics } from "firebase/analytics"; // commented out - dont need analytics
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAw3ZKanFoLXuVHoZsNUwV1_-qqHVdZIak",
  authDomain: "planetarium-playstore.firebaseapp.com",
  databaseURL: "https://planetarium-playstore-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "planetarium-playstore",
  storageBucket: "planetarium-playstore.appspot.com",
  messagingSenderId: "693474022475",
  appId: "1:693474022475:web:93a34703f3122fee71a9ce",
  measurementId: "G-EE0Z519HTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
//const databaseRef = firebase.database().ref(); // From yt video? Use in App.js probably.
//const analytics = getAnalytics(app); // Commented out - dont need analytics