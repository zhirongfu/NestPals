import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, setDoc,Timestamp, onSnapshot } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { Loader } from "@googlemaps/js-api-loader";
import axios from 'axios';
const GoogleMapsApiKey = 'AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU';
const loader = new Loader({
    apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
    version: "weekly",
    libraries: ["places"]
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
const storage = getStorage(app);
let activeListeners = {};  // Object to keep track of active listeners
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
              const defaultFileRef = storageRef(storage, 'pfp/DefaultNestPalsPfp7361/Screenshot 2024-05-12 194811.png');
              const defaultUrl = await getDownloadURL(defaultFileRef);
              document.querySelector('.profile-img').src = defaultUrl; // Update the src attribute of the img element
            }
            //loads the chats already in place from order docu
            const orderRef = doc(db, "chatorder", user.uid);
            const orderSnap = await getDoc(orderRef);
            if(orderSnap.exists()){
              orderSnap.data().order.forEach(chatId => {
                  //console.log(chatId);
                  //for each element in the order create a little profile tab
                  displayChatsTab(chatId);
              });
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    } else {
        window.location.href = 'signin.html';
    }
});
//displaychats tab helper function
async function displayChatsTab(chatId){
  const currentuser = auth.currentUser.uid;
  const q = doc(db,"users",chatId);
  const querySnapshot = await getDoc(q);

  if (!querySnapshot.empty ) {
    // Iterate over the documents returned by the query
      // Attempt to get the user's profile picture
    let imgUrl;
    try {
      imgUrl = await getUserProfilePictureUrl(chatId);
    } catch (error) {
        console.log("Error getting profile picture URL:", error);
        imgUrl = 'path_to_default_image.jpg'; // Fallback image path
      }
      const existingProfileDiv = document.getElementById(`${chatId}`);
      if (existingProfileDiv){
        searchResults.removeChild(existingProfileDiv);
        searchResults.prepend(existingProfileDiv);
      }
      else{
        // Create a new profile bar for each user
        const profileDiv = document.createElement('div');
        profileDiv.className = 'user-profile flex items-center p-2';
        profileDiv.id = `${chatId}`;
      
        
        // Profile picture
        const img = document.createElement('img');
        img.src = imgUrl;
        img.className = 'h-12 w-12 rounded-full mr-2';
        profileDiv.appendChild(img);
        
        // Username text
        const text = document.createElement('span');
        text.className ='username';
        text.textContent = querySnapshot.data().username;
        profileDiv.appendChild(text);

        // Attach an event listener to the profile bar
        profileDiv.addEventListener('click', async() => {
          await deleteMapContainer();
          const currentUsernamePromise = await getUsername(currentuser);
          const otherUsernamePromise = await getUsername(chatId);
          highlightProfile(profileDiv);
      
          try {
              const currentUsername = currentUsernamePromise;
              const otherUsername = otherUsernamePromise;
              createChatBox(chatId);
              displayChatMsg(chatId, currentUsername, otherUsername);
          } catch (error) {
              console.error("Failed to fetch usernames:", error);
          }
      });
        searchResults.appendChild(profileDiv);
        return profileDiv;
      }
      }
}
async function setupChatListener(otherUserId, currentUserId) {
  const docId = [currentUserId, otherUserId].sort().join('_');
  const docRef = doc(db, "conversations", docId);

  // Remove existing listener for the conversation if it exists
  if (activeListeners[docId]) {
    activeListeners[docId]();  // This will unsubscribe from the listener
  }

  // Set up a new listener for the conversation
  const unsubscribe = onSnapshot(docRef, async (doc) => {
    if (doc.exists()) {
      const currentUsername = await getUsername(currentUserId);
      const otherUsername = await getUsername(otherUserId);
      await displayChatMsg(otherUserId, currentUsername, otherUsername);
    } else {
      console.log("No messages found or document does not exist.");
    }
  });

  // Store the unsubscribe function to be able to remove the listener later
  activeListeners[docId] = unsubscribe;
}
document.addEventListener('DOMContentLoaded', async () => {
  // Retrieve the UID from session storage
  const userUid = sessionStorage.getItem('otherUserId');
  //console.log(userUid); // For debugging: check if the UID is retrieved correctly

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (userUid) {
        try {
          // Set up the onSnapshot listener
          await setupChatListener(userUid, auth.currentUser.uid);

          const profileDiv = await displayChatsTab(userUid);
          highlightProfile(profileDiv);
          createChatBox(userUid);
          const currentUsername = await getUsername(auth.currentUser.uid);
          const otherUsername = await getUsername(userUid);
          await displayChatMsg(userUid, currentUsername, otherUsername);
        } catch (error) {
          console.error('Error handling DOMContentLoaded:', error);
        }
      } else {
        console.error('User UID not found in session storage');
      }

      const searchForm = document.getElementById('userSearchForm');
      const searchResults = document.getElementById('searchResults');

      searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('searchInput').value.trim();
        const currentUser = auth.currentUser;
        const currentUserRef = doc(db, "users", currentUser.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        const currentUserUsername = currentUserDoc.data().username;

        if (username && username != currentUserUsername) {
          const q = query(collection(db, "users"), where("username", "==", username));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
              let imgUrl;
              try {
                imgUrl = await getUserProfilePictureUrl(doc.id);
              } catch (error) {
                console.log("Error getting profile picture URL:", error);
                imgUrl = 'path_to_default_image.jpg';
              }

              const existingProfileDiv = document.getElementById(`${doc.id}`);
              if (existingProfileDiv) {
                searchResults.removeChild(existingProfileDiv);
                searchResults.prepend(existingProfileDiv);
              } else {
                const profileDiv = document.createElement('div');
                profileDiv.className = 'user-profile flex items-center p-2';
                profileDiv.id = `${doc.id}`;

                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = 'h-12 w-12 rounded-full mr-2';
                profileDiv.appendChild(img);

                const text = document.createElement('span');
                text.className = 'username';
                text.textContent = doc.data().username;
                profileDiv.appendChild(text);

                profileDiv.addEventListener('click', async () => {
                  const currentUsernamePromise = getUsername(auth.currentUser.uid);
                  const otherUsernamePromise = getUsername(doc.id);
                  highlightProfile(profileDiv);

                  try {
                    const currentUsername = await currentUsernamePromise;
                    const otherUsername = await otherUsernamePromise;
                    createChatBox(doc.id);
                    displayChatMsg(doc.id, currentUsername, otherUsername);

                    // Update the onSnapshot listener for the new chat
                    await setupChatListener(doc.id, auth.currentUser.uid);
                  } catch (error) {
                    console.error("Failed to fetch usernames:", error);
                  }
                });

                searchResults.appendChild(profileDiv);
              }
            });
          } else {
            displayNoUserFound();
          }
        }
      });
    } else {
      console.error('User not authenticated');
    }
  });
});
function deleteFile(picture) {
  // Create a reference to the file to delete
  const fileRef = storageRef(storage, picture );

  // Delete the file
  deleteObject(fileRef).then(() => {
    console.log('File deleted successfully');
  }).catch((error) => {
    console.error('Error deleting file:', error);
  });
}
  function highlightProfile(profileDiv) {
    const currentlyActive = document.querySelector('.active-user-profile');
    if (currentlyActive) {
        currentlyActive.classList.remove('active-user-profile');
    }
    profileDiv.classList.add('active-user-profile');
    
}
  function displayNoUserFound(){
    const noUserFound = document.getElementById('textcontent')
      noUserFound.textContent = 'No users found.';
        // Clear the text after 3 seconds (3000 milliseconds)
    setTimeout(() => {
        noUserFound.textContent = ''; // Clears the text content
    }, 3000)
      }

  async function getUserProfilePictureUrl(userId) {
    const pfpRef = doc(db, "pfp", userId);
    const pfpSnap = await getDoc(pfpRef);
    if (pfpSnap.exists() && pfpSnap.data().filePath) {
      const filePath = pfpSnap.data().filePath;
      const fileRef = storageRef(storage, filePath);
      const url = await getDownloadURL(fileRef);
      return url;
    } else {
      const defaultFileRef = storageRef(storage, 'pfp/DefaultNestPalsPfp7361/Screenshot 2024-05-12 194811.png');
      const defaultUrl = await getDownloadURL(defaultFileRef);
      return defaultUrl;
    }
  }
  
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

    //create the google maps btn
    const googlemapsbutton = document.createElement('button');
    googlemapsbutton.className = 'google-maps-button';
    const mapicon = document.createElement('i');
    mapicon.className = 'ri-earth-fill';
    googlemapsbutton.appendChild(mapicon);

    /*googlemapsbutton.addEventListener('click', function() {
      toggleMapVisibility(); // Toggle visibility on button click
  })*/

    chatBox.appendChild(googlemapsbutton);

    // text area (skipped conversation form group)
    const convoformgroup = document.createElement('div');
    convoformgroup.className ='conversation-form-group';


    const forminput = document.createElement('textarea');
    forminput.className = 'conversation-form-input';
    forminput.placeholder = 'Type here...';
    forminput.rows='1';

    convoformgroup.appendChild(forminput);

    //create select files btn
    const submitfilebutton = document.createElement('button');
    submitfilebutton.className = 'conversation-form-record';
    //the button to append to the files icon
    const icon1 = document.createElement('i');
    icon1.className='ri-attachment-line';

    const inputfile = document.createElement('input');
    inputfile.type = 'file';
    inputfile.id = 'uploadimg';
    inputfile.accept = 'image/png, image/jpeg';
    inputfile.className= 'file-input'

    const fileNameDisplay = document.createElement('span');
    fileNameDisplay.className = 'file-name';

    //append logo to btn
    submitfilebutton.appendChild(icon1);
    submitfilebutton.appendChild(inputfile);
    submitfilebutton.appendChild(fileNameDisplay);

    // Event listener to update file name display when a file is chosen
    inputfile.addEventListener('change', function() {
      fileNameDisplay.textContent = inputfile.files.length > 0 ? inputfile.files[0].name : '';
    });
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
    //console.log(otheruserid);

  }
  //adding function for gmaps btn click
  const gmapsbtn = chatBox.querySelector('.google-maps-button');
  gmapsbtn.removeEventListener('click', gmapsbtn.clickHandler); //this removes the previous instance of event listener

  gmapsbtn.clickHandler = () => openGmaps(otheruserid);
  gmapsbtn.addEventListener('click', gmapsbtn.clickHandler);

  // Clear previous event listeners that might be attached
  const submitButton = chatBox.querySelector('.conversation-form-submit');
  submitButton.removeEventListener('click', submitButton.clickHandler);
  
  // Create a new handler function that captures the current `otheruserid`
  submitButton.clickHandler = () => sendMsg(otheruserid);
  submitButton.addEventListener('click', submitButton.clickHandler);
  // Add event listener for Enter key
  const forminput = chatBox.querySelector('.conversation-form-input');
  forminput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Check if Enter key is pressed without Shift
      event.preventDefault(); // Prevent default newline behavior
      sendMsg(otheruserid);
    }
  });
  // Ensure button is part of the chatBox
  chatBox.appendChild(submitButton);

  // Append chatBox to the DOM if necessary
  const convo = document.querySelector('.convoform');
  if (!convo.contains(chatBox)) {
      convo.appendChild(chatBox);
  }
}

async function getCityState(userId) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
      const locationString = userDoc.data().city + ', ' + userDoc.data().state;
      return locationString;  // Assuming the username field is stored in the user document
  } else {
      throw new Error(`User with ID ${userId} does not exist.`);
  }
}
async function getBudget(userId) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
      return userDoc.data().budget;  // Assuming the username field is stored in the user document
  } else {
      throw new Error(`User with ID ${userId} does not exist.`);
  }
}
async function getCoordsForAddress(address) {
  const encodedAddress = encodeURIComponent(address); // Properly encode the address
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GoogleMapsApiKey}`;

  try {
    const response = await axios.get(url); // Make the HTTP GET request with the correct URL
    if (response.data.status === 'OK') {
      const coords = response.data.results[0].geometry.location; // Extract latitude and longitude
      return coords; // { lat: XX.XXXX, lng: YY.YYYY }
    } else {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
async function getMidpoint(coord1, coord2){
  const lat = (coord1.lat + coord2.lat) /2 ;
  const lng = (coord1.lng + coord2.lng) /2 ;
  return {lat, lng};
}
async function openGmaps(otheruserid){
    //console.log(`${otheruserid}`);
    const ownUserid = auth.currentUser.uid;
    //console.log(`${ownUserid}`);
    const ownUserState = await getCityState(ownUserid);
    const otherUserState = await getCityState(otheruserid);
    const ownBuget = parseInt(await getBudget(ownUserid), 10);
    const otherUserBudget = +await getBudget(otheruserid);
    //console.log(`${otherUserState}`);
    //console.log(typeof(otherUserBudget));
    //console.log(typeof(ownBuget));
    const averageBudget = Math.min(ownBuget,otherUserBudget) *2;
    //console.log(averageBudget);
    const longlat1 = await getCoordsForAddress(ownUserState);//gets coords for own user
    const longlat2 = await getCoordsForAddress(otherUserState);//gets for other user u are chattign to
    const midPoint = await getMidpoint(longlat1,longlat2); //avgs out the 2 coords. the long and lat obj. google maps needs
    
    await displayMapAtMidPoint(midPoint);
    //await findRentals(midPoint, averageBudget);
    //console.log(longlat1);
    //console.log(longlat2);
    //console.log(midPoint);
}
async function displayMapAtMidPoint(midPoint) {
  let conversationForm = document.getElementById('conversation-form');
  let mapContainer = document.getElementById('map-container');

  // Check if the map container exists, if not, create it
  if (!mapContainer) {
    mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';
    mapContainer.className = 'map-container';
    conversationForm.prepend(mapContainer);
  } else {
    // Check if a map instance already exists
    if (mapContainer.mapInstance) {
      console.log("Map already exists. Deleting...");
      deleteMapContainer(); // Call the function to remove the map
      return; // Exit the function to prevent re-initialization in this call
    }
  }

  // Create a new map inside the 'map-container' div
  const map = new google.maps.Map(mapContainer, {
    center: midPoint,
    zoom: 15  // Adjusted zoom level for better overview
  });
  mapContainer.mapInstance = map; // Store the map instance on the container

  // Create a marker at the midpoint
  new google.maps.Marker({
    position: midPoint,
    map: map,
    title: 'Midpoint Location'
  });

  console.log("Map displayed at midpoint:", midPoint);

  // Find and display nearby places
  findNearbyPlaces(map, midPoint);
}

// Function to find and display nearby places
function findNearbyPlaces(map, location) {
  const service = new google.maps.places.PlacesService(map);
  const request = {
    location: location,
    radius: '500', // Search within 500 meters
    type: ['real_estate_agency'] 
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log('Nearby places found:', results);
      results.forEach(place => {
        createPlaceMarker(place, map);
      });
    } else {
      console.error('Failed to find nearby places:', status);
    }
  });
}

// Function to create a marker for each place
function createPlaceMarker(place, map) {
  new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    title: place.name
  });
}
async function deleteMapContainer() {
  let mapContainer = document.getElementById('map-container');
  if (mapContainer) {
      if (mapContainer.mapInstance) {
          // Remove the map instance if exists
          mapContainer.mapInstance = null; // Clear the stored instance
      }
      mapContainer.remove(); // Removes the map container from the DOM
      console.log('Map container removed');
  } else {
      console.log('Map container not found');
  }
}
function sendMsg(otheruserid){
    const currentuser = auth.currentUser.uid;
    //establishes the current user and the user to send the msg to 
    const inputvalue=document.querySelector('.conversation-form-input');
    //keeps track of the msg to send
    const msgToSend = inputvalue.value;
    //method to send the msg now to firebase
    const isThereImg = document.getElementById('uploadimg');
    if (msgToSend.trim()) { // Check if the message isn't just empty spaces
      // Code to send message to Firestore or your preferred database
      //sendMessageToFirestore(currentUser.uid, otherUserId, messageToSend);
      //console.log(msgToSend);
      // Clear the input after sending
      sendMsgToFirestore(currentuser,otheruserid,msgToSend);
      inputvalue.value = '';
    }
    if(isThereImg && isThereImg.files.length >0){
      sendImageToFirebase(currentuser,otheruserid);
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
  //timestamp function from firebase
  const timestamp = Timestamp.now();
  const msgWithUsernameAndTimestamp = `${currentUsername}:${timestamp}:${msgToSend}`;
  //console.log(msgWithUsername);
  //gets the doc refs and everything
  const conversationRef = doc(db, 'conversations', docId);
  const conversationDoc = await getDoc(conversationRef);
  if(conversationDoc.exists()){

    await updateDoc(conversationRef, {
      messages: arrayUnion(msgWithUsernameAndTimestamp)
    });
  }else{
    //else creates a new doc with first msg
    await setDoc(conversationRef, {
      messages: [msgWithUsernameAndTimestamp]
    });
  }
  //moves the user ur talking to to the top
  const existingProfileDiv = document.getElementById(`${otherUserId}`);
  if(existingProfileDiv){
    const searchResults = document.getElementById('searchResults');
    //if it is not already at the top
    if(searchResults.firstChild !== existingProfileDiv)
    {
      searchResults.removeChild(existingProfileDiv);
      searchResults.prepend(existingProfileDiv);
    }
  }
  await displayChatMsg(otherUserId,currentUsername,otherUsername);
  await storeChatOrderToFirebase(currentUser,otherUserId);
}
//Helper function for displayign msgs
async function displayChatMsg(otherUserId, currentUsername, otherUsername) {
  const conversationMsgDiv = document.getElementById('conversationMessages');
  const currentuser = auth.currentUser.uid;
  const docId = [currentuser, otherUserId].sort().join('_');
  const docRef = doc(db, "conversations", docId);

  const scrollToBottom = () => {
    conversationMsgDiv.scrollTop = conversationMsgDiv.scrollHeight;
  };

  onSnapshot(docRef, async (doc) => {
    if (doc.exists()) {
      const messages = doc.data().messages;
      const messageElements = [];

      // Clear the conversation message div
      conversationMsgDiv.innerHTML = '';

      for (const message of messages) {
        const messageParts = message.split(':');
        if (messageParts.length >= 3) {
          const username = messageParts[0];
          const timestamp = messageParts[1];
          const text = messageParts.slice(2).join(':');
          if (text.startsWith(`pictures/${docId}`)) {
            const fileRef = storageRef(storage, text);
            const imageUrl = await getDownloadURL(fileRef);
            const imageBox = document.createElement('div');
            const img = document.createElement('img');
            img.src = imageUrl;

            if (currentUsername === username) {
              imageBox.classList = 'ownImageBox';
              img.classList = 'ownImage';
            } else {
              imageBox.classList = 'otherImageBox';
              img.classList = 'otherImage';
            }

            imageBox.appendChild(img);
            messageElements.push(imageBox);
          } else {
            const messageBox = document.createElement('div');
            const messageText = document.createElement('div');
            messageText.textContent = text;

            if (currentUsername === username) {
              messageBox.classList = 'ownMessageBox';
              messageText.classList = 'ownMessage';
            } else {
              messageBox.classList = 'otherMessageBox';
              messageText.classList = 'otherMessage';
            }

            messageBox.appendChild(messageText);
            messageElements.push(messageBox);
          }
        }
      }

      // Append all message elements in the correct order
      for (const element of messageElements) {
        conversationMsgDiv.appendChild(element);
      }

      // Ensure scrolling to the bottom after all elements are appended
      scrollToBottom();
    } else {
      console.log("No messages found or document does not exist.");
    }
  });
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
async function storeChatOrderToFirebase(docId,otherUserDocId){
  //makes another document in db to store the order of the chats
  const chatOrderRef = doc(db,'chatorder',docId);
  const chatOrderDoc = await getDoc(chatOrderRef);
  if(chatOrderDoc.exists()){
     // Get current order or initialize it if not set
     let currentOrder = chatOrderDoc.data().order || [];
     // Remove the otherUserDocId if it already exists to prevent duplication
     currentOrder = currentOrder.filter(id => id !== otherUserDocId);
     // Prepend the otherUserDocId to start of the array to push it to the top
     currentOrder.unshift(otherUserDocId);
     // Update the document with the new order
     await updateDoc(chatOrderRef, {
       order: currentOrder
     });
  }else{
    await setDoc(chatOrderRef, {
      order: [otherUserDocId]
    });
  }

}
async function sendImageToFirebase(currentUserId,otherUserId){
  const imgToSend = document.getElementById('uploadimg');
  if(imgToSend){
    const file = imgToSend.files[0];
    const docId = [currentUserId,otherUserId].sort().join('_'); 
    try {
      // Corrected the file path using template literals
      const fileRef = storageRef(storage, `pictures/${docId}/${file.name}`);
      await uploadBytes(fileRef, file);
      sendMsgToFirestore(currentUserId,otherUserId,`pictures/${docId}/${file.name}`);
      clearFileInput(imgToSend);
  } catch (error) {
      console.error('Error uploading image:', error);
  }
  }
}
function clearFileInput(field) {
  // Debugging output to confirm the function is called

  // Set the value of the input to null to clear it
  field.value = '';
  const fileNameDisplay = document.querySelector('.file-name');
  if (fileNameDisplay) {
    fileNameDisplay.textContent = '';
  }
}