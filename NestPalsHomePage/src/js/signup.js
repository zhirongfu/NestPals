import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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
            const emailQuery = doc(db, "users", email);
            const emailSnapshot = await getDoc(emailQuery);

            if (emailSnapshot.exists()) {
                alert("Email already exists. Please use a different email.");
                return;
            }

            // Check if username already exists
            const usernameQuery = doc(db, "users", username);
            const usernameSnapshot = await getDoc(usernameQuery);

            if (usernameSnapshot.exists()) {
                alert("Username already exists. Please choose a different username.");
                return;
            }

            // Authenticate user using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userDocRef = doc(db, "users", user.uid);

            // Push email and username to Firestore "users" collection
            await setDoc(userDocRef, {
                username: username,
                email: email
            });

            // If signup is successful, alert the user and optionally redirect to another page
            alert("Sign up successful!");

            // Redirect to signin.html to formally login and use cookie tracking
            window.location.href = "signin.html";

        } catch (error) {
            // Handle error
            console.error("Error signing up:", error.message);
            alert("Error signing up. Please try again later.");
        }
    });
});

// Function to handle Google Sign-In callback
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();

    const userId = profile.getId();
    const userName = profile.getName();
    const userEmail = profile.getEmail();

    // Check if the user already exists in Firestore based on their ID
    const userDocRef = doc(db, "users", userId);
    getDoc(userDocRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                console.log("User already exists in Firestore.");
            } else {
                // User does not exist, create a new entry in Firestore
                setDoc(userDocRef, {
                    username: userName,
                    email: userEmail
                })
                .then(() => {
                    console.log("New user created in Firestore.");
                })
                .catch((error) => {
                    console.error("Error creating new user in Firestore:", error);
                });
            }
        })
        .catch((error) => {
            console.error("Error querying Firestore:", error);
        });
}
