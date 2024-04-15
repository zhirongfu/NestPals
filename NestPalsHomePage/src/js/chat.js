import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
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
            //console.log(user);
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
          text.className ='username';
          text.textContent = doc.data().username;
          profileDiv.appendChild(text);

          // Attach an event listener to the profile bar
          profileDiv.addEventListener('click', () => createChatBox(doc.id));
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
function createChatBox(otheruserid) {
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
    submitformbutton.addEventListener('click', ()=> sendMsg(otheruserid))

    //appends everything to the conov form
    const convo=document.querySelector('.convoform');
    convo.appendChild(chatBox);
    //console.log(otheruserid);

  }
}
function sendMsg(otheruserid){
    //establishes the current user and the user to send the msg to 
    const currentuser = auth.currentUser.uid;
    const inputvalue=document.querySelector('.conversation-form-input');
    //keeps track of the msg to send
    const msgToSend = inputvalue.value;
    //method to send the msg now to firebase
    if (msgToSend.trim()) { // Check if the message isn't just empty spaces
      // Code to send message to Firestore or your preferred database
      //sendMessageToFirestore(currentUser.uid, otherUserId, messageToSend);
      //console.log(msgToSend);
      // Clear the input after sending
      sendMsgToFirestore(currentuser,otheruserid,msgToSend);
      inputvalue.value = '';
  }

    //console.log(currentuser);
    //console.log(otheruserid);
}
async function sendMsgToFirestore(currentUser,otherUserId,msgToSend){
  /*console.log(msgToSend);
  console.log(currentuser);
  console.log(otheruserid);*/
  const docId = [currentUser, otherUserId].sort().join('_');
  //console.log(docId);
  const currentUsername = await getUsername(currentUser);
  const otherUsername = await getUsername(otherUserId);
  //console.log(currentUsername);
  //console.log(otherUsername);
  //sets the msg to send in the form of username:msgtosend
  const msgWithUsername = `${currentUsername}:${msgToSend}`;
  //console.log(msgWithUsername);
  //gets the doc refs and everything
  const conversationRef = doc(db, 'conversations', docId);
  const conversationDoc = await getDoc(conversationRef);
  if(conversationDoc.exists()){
    await updateDoc(conversationRef, {
      messages: arrayUnion(msgWithUsername)
    });
  }else{
    //else creates a new doc with first msg
    await setDoc(conversationRef, {
      messages: [msgWithUsername]
    });
  }
}
// Helper function to get a username by user ID
async function getUsername(userId) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
      return userDoc.data().username;  // Assuming the username field is stored in the user document
  } else {
      throw new Error(`User with ID ${userId} does not exist.`);
  }
}