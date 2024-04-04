import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; 
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
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
            const token = await user.getIdToken();

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