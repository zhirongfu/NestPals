import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

//our web app's Firebase configuration
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

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signin-form");

    form.addEventListener("submit", async function(event) {
        // Prevent default form submission
        event.preventDefault();

        // Retrieve form input values
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            // Authenticate user using Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // If sign-in is successful, alert the user and optionally redirect to another page
            alert("Sign in successful!");

            // Redirect to another page
            window.location.href = "roomatequestionares.html"; //not yet set on where to redirect

        } catch (error) {
            // Handle error
            console.error("Error signing in:", error.message);
            alert("Error signing in. Please check your email and password.");
        }
    });
});