import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, doc, getDoc, getDocs, addDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

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
const storage = getStorage(app);

// Navbar code
document.addEventListener('DOMContentLoaded', () => {
  let profileDropdownList = document.querySelector(".profile-dropdown-list");
  let btn = document.querySelector(".profile-dropdown-btn");
  let classList = profileDropdownList.classList;

  // Define the toggle function
  const toggle = () => classList.toggle("active");

  // Add the event listener to btn
  btn.addEventListener('click', toggle);

  // Hide the dropdown when clicking outside of it
  window.addEventListener("click", function (e) {
    if (!btn.contains(e.target)) {
      classList.remove("active");
    }
  const edit= document.querySelector('.EditProfile');
  if(edit){
    edit.addEventListener('click', function(event){
      event.preventDefault();
      window.location.href ='profile.html';
    })
  }
  const lo=this.document.getElementById('logout');
  lo.addEventListener('click',function(event){
    event.preventDefault();
    signOut(auth).then(()=>{
      window.location.href='index.html';
    })
  })
  });
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, fetch their name
    const userDocRef = doc(db, 'users', user.uid);
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const userName = docSnap.data().username;
        // Display the user's name
        document.querySelector('.username').textContent = userName;
      } else {
        // Handle the case where the user document does not exist
        console.error("No such document!");
      }
    }).catch((error) => {
      console.error("Error fetching user data:", error);
    });
  } else {
    // Handle user not signed in or other actions
    window.location.href='signin.html';
  }
});

async function setUserProfilePictureAsNavbarLogo(userId) {
  try {
    const docRef = doc(db, "pfp", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().filePath) {
      const filePath = docSnap.data().filePath;
      const fileRef = storageRef(storage, filePath);
      const url = await getDownloadURL(fileRef);

      const profileImgDiv = document.querySelector('.profile-img');
      if (profileImgDiv) {
        profileImgDiv.style.backgroundImage = `url('${url}')`;
        profileImgDiv.style.backgroundSize = 'cover';
        profileImgDiv.style.backgroundPosition = 'center';
      }
    } else {
      console.log("Document or filePath field missing");
    }
  } catch (error) {
    console.error("Error fetching image URL:", error);
  }
}
  onAuthStateChanged(auth, (user) => {
    if (user) {
        // Now that we have a confirmed user, call preloadUserInfo or pass the user down
        preloadUserInfo()
        setUserProfilePictureAsNavbarLogo(user.uid);
    } 
    else {
        window.location.href='signin.html';
    }
});
// End navbar code

// Survey related code below this comment
// Fill in the text fields with existing user info
// Function to preload user information
async function preloadUserInfo() {
  // Check for a signed-in user
  const user = auth.currentUser;
  if (!user) {
    alert('You must be signed in to preload user information.');
    return;
  }

  try {
    // Fetch user info from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Populate the form fields with user data
      document.getElementById('name').value = userData.name || '';
      document.getElementById('age').value = userData.age || '';
      document.getElementById('gender').value = userData.gender || '';
      document.getElementById('state').value = userData.state || '';
      document.getElementById('city').value = userData.city || '';
      document.getElementById('budget').value = userData.budget || '';
      document.getElementById('cleanliness').value = userData.cleanliness || '';
      document.getElementById('smoking').value = userData.smoking || '';
      document.getElementById('occupation').value = userData.occupation || '';
      document.getElementById('pets').value = userData.pets || '';
      document.getElementById('interests').value = userData.interests ? userData.interests.join(', ') : '';
    } else {
      console.error("No such document for user:", user.uid);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("An error occurred while loading user data. Please try again later.");
  }
}

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
//console.log(user.uid);

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
    window.location.href="matching.html";
    document.getElementById('questionnaire-form').reset();
} catch (error) {
    console.error("Error submitting questionnaire: ", error);
    alert("An error occurred while submitting the questionnaire. Please try again later.");
}
}

