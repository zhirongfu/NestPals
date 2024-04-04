import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { getFirestore, collection, getDocs, query, where, addDoc, doc, updateDoc } from "firebase/firestore";

//our Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
    authDomain: "nestpals-backend.firebaseapp.com",
    projectId: "nestpals-backend",
    storageBucket: "nestpals-backend.appspot.com",
    messagingSenderId: "377954426735",
    appId: "1:377954426735:web:92eaef2c3160067572529a"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('questionnaire-form');
  if (form) {
    form.addEventListener('submit', submitForm);
  } else {
    console.error('Form not found');
  }
});
// Function to handle form submission
async function submitForm(event) {
  event.preventDefault();
  // Check for a signed-in user
const user = auth.currentUser;
if (!user) {
  alert('You must be signed in to submit the questionnaire.');
  return;
}
console.log(user.uid);

  // Get form values

  const userDocRef = doc(db, "users", user.uid); // Reference to the user's document
  const name = document.getElementById('name').value ;
  console.log(name);
  const age = document.getElementById('age').value ;
  const gender= document.getElementById('gender').value ;
  const state = document.getElementById('state').value;
  const city = document.getElementById('city').value;
  const budget = document.getElementById('budget').value;
  const cleanliness = document.getElementById('cleanliness').value;
  const smoking = document.getElementById('smoking').value;
  const occupation = document.getElementById('occupation').value;
  const pets = document.getElementById('pets').value;
  const interests = document.getElementById('interests').value.split(',').map(interest => interest.trim());

  try {
    // Update the user's document with questionnaire responses
    await setDoc(userDocRef, {
    name: name,
    age: age,
    gender: gender,
    state: state,
    city: city,
    budget: budget,
    cleanliness: cleanliness,
    smoking: smoking,
    occupation: occupation,
    pets: pets,
    interests: interests
  },{ merge: true });; 
    alert("Questionnaire submitted successfully!");
    document.getElementById('questionnaire-form').reset();
} catch (error) {
    console.error("Error submitting questionnaire: ", error);
    alert("An error occurred while submitting the questionnaire. Please try again later.");
}
}

