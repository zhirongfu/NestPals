
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore"; // Import Firestore functions

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
    const form = document.getElementById("signup-form");

    form.addEventListener("submit", async function(event) {
        // Prevent default form submission
        event.preventDefault();

        // Retrieve form input values
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Validate password match
        if (password !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        try {
            // Check if email already exists
            const emailQuery = query(collection(db, "users"), where("email", "==", email));
            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                alert("Email already exists. Please use a different email.");
                return;
            }

            // Check if username already exists
            const usernameQuery = query(collection(db, "users"), where("username", "==", username));
            const usernameSnapshot = await getDocs(usernameQuery);

            if (!usernameSnapshot.empty) {
                alert("Username already exists. Please choose a different username.");
                return;
            }

            // Authenticate user using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Push email and username to Firestore "users" collection
            await addDoc(collection(db, "users"), {
                username: username,
                email: email
            });

            // If signup is successful, alert the user and optionally redirect to another page
            alert("Sign up successful!");

            // Redirect to survey.html
            window.location.href = "roomatequestionares.html";

        } catch (error) {
            // Handle error
            console.error("Error signing up:", error.message);
        }
    });
});