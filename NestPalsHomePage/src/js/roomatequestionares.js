import { initializeApp } from "firebase/app";
//our Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
    authDomain: "nestpals-backend.firebaseapp.com",
    projectId: "nestpals-backend",
    storageBucket: "nestpals-backend.appspot.com",
    messagingSenderId: "377954426735",
    appId: "1:377954426735:web:92eaef2c3160067572529a"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to handle form submission
function submitForm(event) {
  event.preventDefault();

  // Get form values
  const formData = {
    name: document.getElementById('name').value,
    age: document.getElementById('age').value,
    gender: document.getElementById('gender').value,
    state: document.getElementById('state').value,
    city: document.getElementById('city').value,
    budget: document.getElementById('budget').value,
    cleanliness: document.getElementById('cleanliness').value,
    smoking: document.getElementById('smoking').value,
    occupation: document.getElementById('occupation').value,
    pets: document.getElementById('pets').value,
    interests: document.getElementById('interests').value.split(',').map(interest => interest.trim()) // Split interests by comma and trim whitespace
  };

  // Store data in Firebase Firestore
  db.collection("questionnaires").add(formData)
    .then(() => {
      alert("Questionnaire submitted successfully!");
      // Clear form fields after submission
      document.getElementById('questionnaire-form').reset();
    })
    .catch(error => {
      console.error("Error adding document: ", error);
      alert("An error occurred while submitting the questionnaire. Please try again later.");
    });
}

// Add event listener to the form submission
document.getElementById('questionnaire-form').addEventListener('submit', submitForm);