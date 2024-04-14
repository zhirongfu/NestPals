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
let currentChatUserId = null;
// Wrap your code to ensure the DOM is fully loaded
// Wrap your code to ensure the DOM is fully loaded
  onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const userName = docSnap.data().username;
                document.querySelector('.username').textContent = userName; // Ensure this selector exists
            } else {
                console.error("No such document!");
            }

            // Set profile image
            const pfpRef = doc(db, "pfp", user.uid);
            const pfpSnap = await getDoc(pfpRef);
            if (pfpSnap.exists() && pfpSnap.data().filePath) {
                const fileRef = storageRef(storage, pfpSnap.data().filePath);
                const url = await getDownloadURL(fileRef);
                document.querySelector('.profile-img').src = url; // Update the src attribute of the img element
            } else {
                console.log("Document or filePath field missing");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        window.location.href = 'signin.html';
    }
});
// ... rest of your imports and Firebase setup

document.addEventListener('DOMContentLoaded', () => {
  // Reference to the search form and search results container
  const searchForm = document.getElementById('userSearchForm');
  const searchResults = document.getElementById('searchResults');
  const messageForm = document.getElementById('sendMessageForm');
  const messageInput = document.getElementById('messageInput');
  const conversationMessages = document.getElementById('conversationMessages');


  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('searchInput').value.trim();
    searchResults.innerHTML = ''; // Clear the previous search results

    if (username) {
      // Query Firestore for users with matching usernames
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Iterate over the documents returned by the query
        querySnapshot.forEach(async (doc) => {
          // Attempt to get the user's profile picture
        let imgUrl;
        try {
          imgUrl = await getUserProfilePictureUrl(doc.id);
        } catch (error) {
            console.log("Error getting profile picture URL:", error);
            imgUrl = 'path_to_default_image.jpg'; // Fallback image path
          }

          // Create a new profile bar for each user
          const profileDiv = document.createElement('div');
          profileDiv.className = 'user-profile flex items-center p-2';
          
          // Profile picture
          const img = document.createElement('img');
          img.src = imgUrl;
          img.className = 'h-12 w-12 rounded-full mr-2';
          profileDiv.appendChild(img);
          
          // Username text
          const text = document.createElement('span');
          text.textContent = doc.data().username;
          profileDiv.appendChild(text);

          // Attach an event listener to the profile bar
          profileDiv.addEventListener('click', () => createChatBox());
          searchResults.appendChild(profileDiv);
        });
      } else {
        // Handle the case where no users are found
        searchResults.textContent = 'No users found.';
      }
    }
  });
  async function getUserProfilePictureUrl(userId) {
    const pfpRef = doc(db, "pfp", userId);
    const pfpSnap = await getDoc(pfpRef);
    if (pfpSnap.exists() && pfpSnap.data().filePath) {
      const filePath = pfpSnap.data().filePath;
      const fileRef = storageRef(storage, filePath);
      const url = await getDownloadURL(fileRef);
      return url;
    } else {
      throw new Error("Profile picture not found.");
    }
  }
  

});
// Function to create a chat box if it doesn't exist
function createChatBox() {
  // Check if the chat box already exists
  let chatBox = document.getElementById('conversation-form');
  if (!chatBox) {
    chatBox = document.createElement('div');
    chatBox.id = 'conversation-form';
    chatBox.className = 'conversation-form';

    // emote button
    const emotebutton = document.createElement('button');
    emotebutton.className = 'conversation-form-button';
    const icon=document.createElement('i');
    //creates an icon
    icon.className='ri-emotion-line';
    emotebutton.appendChild(icon);

    chatBox.appendChild(emotebutton);

    // text area (skipped conversation form group)
    const convoformgroup = document.createElement('div');
    convoformgroup.className ='conversation-form-group';


    const forminput = document.createElement('textarea');
    forminput.className = 'conversation-form-input';
    forminput.placeholder = 'Type here...';
    forminput.rows='1';

    convoformgroup.appendChild(forminput);

    //create submit button
    const submitfilebutton = document.createElement('button');
    submitfilebutton.className = 'conversation-form-record';
    //the button to append to the submit button
    const icon1 = document.createElement('i');
    icon1.className='ri-attachment-line';
    //append logo to submit btn
    submitfilebutton.appendChild(icon1);

    convoformgroup.appendChild(submitfilebutton);

    chatBox.appendChild(convoformgroup);
    //creates submit form button
    const submitformbutton = document.createElement('button');
    submitformbutton.className='conversation-form-button conversation-form-submit';
    //creates a send form icon
    const icon2 = document.createElement('i');
    icon2.className='ri-send-plane-fill';
    //appends the button to the form
    submitformbutton.appendChild(icon2);

    chatBox.appendChild(submitformbutton);


    //appends everything to the conov form
    const convo=document.querySelector('.convoform');
    convo.appendChild(chatBox);

  }

  return chatBox;
}


