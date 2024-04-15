import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,sendEmailVerification } from "firebase/auth"; 
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

const provider = new GoogleAuthProvider();

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
            //sendEmailVerification(auth.currentUser);

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

const googlelogin=document.getElementById("google-login-btn");
googlelogin.addEventListener("click",function(){
    signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    const user = result.user;
    const userDocRef = doc(db, 'users', user.uid);
    // Set the user document with Google name and email
    return setDoc(userDocRef, {
        username: user.displayName, // User's name from Google
        email: user.email // User's email from Google
    });
    
  }).then(() => {
    // Data saved successfully!
    window.location.href = "roomatequestionares.html";
  })
  .catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
  });
}
)
const alreadyhaveacc = document.getElementById('alreadyhaveanacc');
alreadyhaveacc.addEventListener('click',()=>{
    window.location.href = 'signin.html';
});
