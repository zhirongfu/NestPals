import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", async function(event) {
        // Prevent default form submission
        event.preventDefault();

        // Retrieve form input values
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
            // Check if email exists in Firestore
            const emailQuery = query(collection(db, "users"), where("email", "==", username));
            const emailSnapshot = await getDocs(emailQuery);

            if (emailSnapshot.empty) {
                alert("Email not found. Please sign up first.");
                return;
            }

            // Authenticate user using Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;

            // If login is successful, alert the user and optionally redirect to another page
            alert("Login successful!");

            // Redirect to desired page
            window.location.href = "roomatequestionares.html";

        } catch (error) {
            // Handle error
            console.error("Error logging in:", error.message);
            alert("Invalid email or password. Please try again.");
        }
    });
});
