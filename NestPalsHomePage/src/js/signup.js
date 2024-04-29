import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth"; 
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
    authDomain: "nestpals-backend.firebaseapp.com",
    projectId: "nestpals-backend",
    storageBucket: "nestpals-backend.appspot.com",
    messagingSenderId: "377954426735",
    appId: "1:377954426735:web:92eaef2c3160067572529a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signup-form");
    const usernameInput = document.getElementById("username");

    usernameInput.addEventListener('input', function() {
        const isValid = /^[A-Za-z0-9_-]+$/.test(this.value);
        this.setCustomValidity(isValid ? "" : "Usernames can only contain letters, numbers, underscores, and hyphens.");
    });

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        const username = usernameInput.value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        if (!/^[A-Za-z0-9_-]+$/.test(username)) {
            alert("Usernames can only contain letters, numbers, underscores, and hyphens.");
            return;
        }

        try {
            const emailSnapshot = await getDoc(doc(db, "users", email));
            if (emailSnapshot.exists()) {
                alert("Email already exists. Please use a different email.");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email
            });

            sendEmailVerification(user);
            alert("Sign up successful! Please verify your email.");
            window.location.href = "signin.html";
        } catch (error) {
            console.error("Error signing up:", error.message);
            alert("Error signing up. Please try again later.");
        }
    });
});
    const googleLoginButton=document.getElementById("google-login-btn");
    googleLoginButton.addEventListener("click", async function() {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await setDoc(doc(db, 'users', user.uid), {
                username: user.displayName,
                email: user.email
            });
            window.location.href = "roomatequestionares.html";
        } catch (error) {
            console.error("Error during Google sign in:", error);
            alert("Error during sign in: " + error.message);
        }
    });
    const alreadyHaveAccount = document.getElementById('alreadyhaveanacc');
    alreadyHaveAccount.addEventListener('click', () => {
        window.location.href = 'signin.html';
    });
