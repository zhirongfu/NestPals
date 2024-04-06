import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
// Dynamically create a script element for Font Awesome and append it to the document's head
const fontAwesomeScript = document.createElement('script');
fontAwesomeScript.src = 'https://kit.fontawesome.com/5194cba8a8.js';
fontAwesomeScript.crossOrigin = 'anonymous';
document.head.appendChild(fontAwesomeScript);

// Wrap your code to ensure the DOM is fully loaded
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
    });
  });
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
  const db = getFirestore(app);
  const auth = getAuth(app);

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
    }
  });
  // Function to create a profile card
function createProfileCard(user) {
    const profileItem = document.createElement('div');
    profileItem.className = 'profile-item';
  
    const img = document.createElement('img');
    img.src = user.profilepic || 'default-avatar.png'; // Placeholder if no photo
    profileItem.appendChild(img);
  
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = user.name;
    profileItem.appendChild(name);
  
    const details = document.createElement('div');
    details.className = 'details';
    details.textContent = `Budget: $${user.budget}`;
    profileItem.appendChild(details);

    const state = document.createElement('div');
    state.className = 'state';
    state.textContent = `State: ${user.state}`;
    profileItem.appendChild(state);

    /*const email = document.createElement('div');
    email.className = 'email';
    email.textContent = `Email: ${user.email}`;
    profileItem.appendChild(email);*/
  
    // Create an <a> element for the chatbox logo link
    const chatboxLink = document.createElement('a');
    chatboxLink.href = 'your_chatbox_link_url_here';
    chatboxLink.className = 'chatboxLink'; // Ensure this matches your CSS class for styling

    const chatIcon = document.createElement('i');
    chatIcon.textContent='CHAT';
    chatIcon.className = 'fa-solid fa-comment';
    chatboxLink.appendChild(chatIcon);
    profileItem.appendChild(chatboxLink);

    return profileItem;
  }
  
  // Function to fetch profiles from Firestore
  async function fetchProfiles() {
    const profilesRef = collection(db, 'users');
    // Assuming you want to find users with a defined budget and looking for roommates in 'NY'
    const q = query(profilesRef, where('budget', '!=', ''));
    const querySnapshot = await getDocs(q);
  
    const profileContainer = document.querySelector('.profile-container');
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const profileCard = createProfileCard(user);
      profileContainer.appendChild(profileCard);
    });  
  }
  
  document.addEventListener('DOMContentLoaded', fetchProfiles);