
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Import the necessary auth functions

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

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firebase Authentication
const auth = getAuth(app);


// Function to download CSV file from Firebase Storage
const downloadCSVFile = async (user) => {
    try {
        const storageRef = ref(storage, 'signup_data.csv'); // Path to your CSV file in Firebase Storage
        const url = await getDownloadURL(storageRef, { cors: true });
        const idToken = await user.getIdToken(); // Get user's authentication token
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${idToken}`
            },
            mode: 'cors'
        });
        
       const csvData = await response.text();
        return csvData;
    } catch (error) {
        console.error("Error downloading CSV file:", error.message);
        return null;
    }
};

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
            // Authenticate user using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Download CSV file from Firebase Storage
            const csvData = await downloadCSVFile(user);

            if (!csvData) {
                // Handle case where CSV data couldn't be fetched
                console.error("Failed to fetch CSV data.");
                return;
            }

            // Parse CSV data and check if username or email already exists
            const rows = csvData.split('\n');
            let usernameExists = false;
            let emailExists = false;
            rows.forEach(row => {
                const [existingUsername, existingEmail] = row.split(',');
                if (existingUsername === username) {
                    usernameExists = true;
                }
                if (existingEmail === email) {
                    emailExists = true;
                }
            });

            // If username or email exists, prevent signup and display error message
            if (usernameExists || emailExists) {
                alert("Username or email already exists. Please choose a different one.");
                return;
            }

            // Otherwise, proceed with user signup using Firebase Authentication
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Sign up successful!");

            // Redirect to survey.html
            window.location.href = "roomatequestionares.html";

        } catch (error) {
            // Handle error
            console.error("Error signing up:", error.message);
        }
    });
});