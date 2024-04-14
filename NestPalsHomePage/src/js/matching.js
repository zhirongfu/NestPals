import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
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
const storage = getStorage(app);
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

// Function to create a profile card
async function createProfileCard(user) {
    const profileItem = document.createElement('div');
    profileItem.className = 'profile-item';
  
    const img = document.createElement('img');
    img.className="pfp";
    // Assuming user has a uid field
    if (user.uid) {
        try {
            const docRef = doc(db, "pfp", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().filePath) {
                const filePath = docSnap.data().filePath;
                const fileRef = storageRef(storage, filePath);

                // Use getDownloadURL to fetch the actual URL
                const url = await getDownloadURL(fileRef);
                img.src = url;
            } 
            else {
                console.log("Document or filePath field missing");
                img.src = 'default-avatar.png'; // Fallback image
            }
        } 
        catch (error) {
            console.error("Error fetching image URL:", error);
            img.src = 'default-avatar.png'; // Fallback image on error
        }
    } 
    else {
        console.error("User UID is undefined.");
        img.src = 'default-avatar.png'; // Fallback image if user UID is undefined
    }

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
    chatboxLink.href = 'chat.html';
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
    const q = query(profilesRef, where('budget', '!=', ''));
    const querySnapshot = await getDocs(q);
    const currentUser = auth.currentUser;
  const profileContainer = document.querySelector('.profile-container');
  const profileCardsPromises = querySnapshot.docs
    .filter(doc => doc.id !== currentUser.uid) // Filter out the current user's document
    .map(doc => {
      const user = { ...doc.data(), uid: doc.id }; // Include uid in the user object
      return createProfileCard(user); // Return the promise created by createProfileCard
    });

  // Wait for all profile cards to be created
  const profileCards = await Promise.all(profileCardsPromises);

  // Append all profile cards to the container at once
  profileCards.forEach(profileCard => {
    profileContainer.appendChild(profileCard);
  });
}
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
        // Now that we have a confirmed user, call fetchProfiles or pass the user down
        fetchProfiles(); // If fetchProfiles doesn't directly use auth.currentUser
        setUserProfilePictureAsNavbarLogo(user.uid);
    } 
    else {
        window.location.href='signin.html';
    }
});
