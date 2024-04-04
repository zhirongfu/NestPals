import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
    authDomain: "nestpals-backend.firebaseapp.com",
    projectId: "nestpals-backend",
    storageBucket: "nestpals-backend.appspot.com",
    messagingSenderId: "377954426735",
    appId: "1:377954426735:web:92eaef2c3160067572529a"
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
