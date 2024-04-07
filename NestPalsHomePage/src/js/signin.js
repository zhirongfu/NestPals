import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, doc, getDoc } from "firebase/firestore";
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

// Initialize Firestore
const db = getFirestore(app);

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

            // Query Firestore for the user's document
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists() && userDocSnap.data().name) {
                // If the user's name exists in the Firestore document
                // Redirect to the matching.html page
                window.location.href = "matching.html";
            } else {
                // If the user's name does not exist in the Firestore document
                // Redirect to the roomatequestionares.html page
                window.location.href = "roomatequestionares.html";
            }

        } catch (error) {
            // Handle errors for authentication and Firestore query
            console.error("Error during sign in or querying the database:", error.message);
            alert("Error during sign in. Please check your email, password, or try again later.");
        }
    });
    const googleSignInButton = document.querySelector('.g-signin2');

    googleSignInButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();

        try {
            // Sign in with Google popup
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Save user ID to Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userData = {
                userId: user.uid
            };

            await setDoc(userDocRef, userData);

            console.log("User ID stored in Firestore:", user.uid);
            alert("Signed in successfully with Google!");
        } catch (error) {
            console.error("Google sign-in error:", error.message);
            alert("Google sign-in failed. Please try again.");
        }
    });
});

/*
window.addEventListener("DOMContentLoaded", () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAr29MtUZ2wqqdsIbp_EwbnF2dm4LG6BKE",
    authDomain: "nestpal-server-auth.firebaseapp.com",
    databaseURL: "https://nestpal-server-auth-default-rtdb.firebaseio.com",
    projectId: "nestpal-server-auth",
    storageBucket: "nestpal-server-auth.appspot.com",
    messagingSenderId: "308566895626",
    appId: "1:308566895626:web:21cd8412ebb713418183f3",
    measurementId: "G-TFRVF8V3YG"
  };
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

          document
            .getElementById("signin-form")
            .addEventListener("submit", (event) => {
              event.preventDefault();
              const login = event.target.email.value;
              const password = event.target.password.value;

              firebase
                .auth()
                .signInWithEmailAndPassword(login, password)
                .then(({ user }) => {
                  return user.getIdToken().then((idToken) => {
                    return fetch("/sessionLogin", {
                      method: "POST",
                      headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                      },
                      body: JSON.stringify({ idToken }),
                    });
                  });
                })
                .then(() => {
                  return firebase.auth().signOut();
                })
                .then(() => {
                  window.location.assign("/profile");
                });
              return false;
            });
        });
*/