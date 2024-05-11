import { Loader } from "@googlemaps/js-api-loader";
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU",
  authDomain: "nestpals-backend.firebaseapp.com",
  projectId: "nestpals-backend",
  storageBucket: "nestpals-backend.appspot.com",
  messagingSenderId: "377954426735",
  appId: "1:377954426735:web:92eaef2c3160067572529a"
};

const stateCoordinates = {
  "Alabama": { lat: 32.806671, lng: -86.791130 }, "Alaska": { lat: 61.370716, lng: -152.404419 }, "Arizona": { lat: 33.729759, lng: -111.431221 }, "Arkansas": { lat: 34.969704, lng: -92.373123 }, "California": { lat: 36.116203, lng: -119.681564 },
  "Colorado": { lat: 39.059811, lng: -105.311104 }, "Connecticut": { lat: 41.597782, lng: -72.755371 }, "Delaware": { lat: 39.318523, lng: -75.507141 }, "Florida": { lat: 27.766279, lng: -81.686783 }, "Georgia": { lat: 33.040619, lng: -83.643074 },
  "Hawaii": { lat: 21.094318, lng: -157.498337 }, "Idaho": { lat: 44.240459, lng: -114.478828 }, "Illinois": { lat: 40.349457, lng: -88.986137 }, "Indiana": { lat: 39.849426, lng: -86.258278 }, "Iowa": { lat: 42.011539, lng: -93.210526 },
  "Kansas": { lat: 38.526600, lng: -96.726486 }, "Kentucky": { lat: 37.668140, lng: -84.670067 }, "Louisiana": { lat: 31.169546, lng: -91.867805 }, "Maine": { lat: 44.693947, lng: -69.381927 }, "Maryland": { lat: 39.063946, lng: -76.802101 },
  "Massachusetts": { lat: 42.230171, lng: -71.530106 }, "Michigan": { lat: 43.326618, lng: -84.536095 }, "Minnesota": { lat: 45.694454, lng: -93.900192 }, "Mississippi": { lat: 32.741646, lng: -89.678696 }, "Missouri": { lat: 38.456085, lng: -92.288368 },
  "Montana": { lat: 46.921925, lng: -110.454353 }, "Nebraska": { lat: 41.125370, lng: -98.268082 }, "Nevada": { lat: 38.313515, lng: -117.055374 }, "New Hampshire": { lat: 43.452492, lng: -71.563896 }, "New Jersey": { lat: 40.298904, lng: -74.521011 },
  "New Mexico": { lat: 34.840515, lng: -106.248482 }, "New York": { lat: 42.165726, lng: -74.948051 }, "North Carolina": { lat: 35.630066, lng: -79.806419 }, "North Dakota": { lat: 47.528912, lng: -99.784012 }, "Ohio": { lat: 40.388783, lng: -82.764915 },
  "Oklahoma": { lat: 35.565342, lng: -96.928917 }, "Oregon": { lat: 44.572021, lng: -122.070938 }, "Pennsylvania": { lat: 40.590752, lng: -77.209755 }, "Rhode Island": { lat: 41.680893, lng: -71.511780 }, "South Carolina": { lat: 33.856892, lng: -80.945007 },
  "South Dakota": { lat: 44.299782, lng: -99.438828 }, "Tennessee": { lat: 35.747845, lng: -86.692345 }, "Texas": { lat: 31.054487, lng: -97.563461 }, "Utah": { lat: 40.150032, lng: -111.862434 }, "Vermont": { lat: 44.045876, lng: -72.710686 },
  "Virginia": { lat: 37.769337, lng: -78.169968 }, "Washington": { lat: 47.400902, lng: -121.490494 }, "West Virginia": { lat: 38.491226, lng: -80.954903 }, "Wisconsin": { lat: 44.268543, lng: -89.616508 }, "Wyoming": { lat: 42.755966, lng: -107.302490 }
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
  img.className = "pfp";
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
          } else {
              console.log("Document or filePath field missing");
              img.src = 'default-avatar.png'; // Fallback image
          }
      } catch (error) {
          console.error("Error fetching image URL:", error);
          img.src = 'default-avatar.png'; // Fallback image on error
      }
  } else {
      console.error("User UID is undefined.");
      img.src = 'default-avatar.png'; // Fallback image if user UID is undefined
  }

  profileItem.appendChild(img);

  const detailsContainer = document.createElement('div');
  detailsContainer.className = 'details-container';

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = user.name;
  detailsContainer.appendChild(name);

  const details = document.createElement('div');
  details.className = 'details';
  details.textContent = `$${user.budget} | ${user.city}, ${user.state}`;
  detailsContainer.appendChild(details);

  profileItem.appendChild(detailsContainer);

  // Create an <a> element for the location link
  const locationLink = document.createElement('a');
  locationLink.href = '#'; // Set the href attribute to '#' for now, you can update it later if needed
  locationLink.className = 'location-link';

  const locationIcon = document.createElement('i');
  locationIcon.className = 'fa-solid fa-globe';
  locationLink.appendChild(locationIcon);
  profileItem.appendChild(locationLink);

  // Modify the event listener for the location link to call deleteMapContainer before creating a new map
locationLink.addEventListener('click', async () => {
  try {
      // Call the deleteMapContainer function to remove any existing map container
      deleteMapContainer();

      // Your existing code for creating the map goes here...
      // Ensure that the map container is removed when the close button is clicked as well
      closeButton.addEventListener('click', () => {
          deleteMapContainer();
      });

  } catch (error) {
      console.error("Error handling location button click:", error);
  }
});


  locationLink.addEventListener('click', async () => {
    try {
      // Call the deleteMapContainer function to remove any existing map container
      deleteMapContainer();  
      
      const address = `${user.city}, ${user.state}`;
        
        // Use the Geocoder to fetch coordinates based on the state name
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
                const location = results[0].geometry.location;
                
                // Proceed with the code for opening the Google Maps popup using location.lat() and location.lng()
                const width = 400;
                const left = (screen.width - width) / 2;

                // Create a new div element for the map container
                const mapContainerDiv = document.createElement('div');
                mapContainerDiv.className = 'custom-map-container';
                mapContainerDiv.style.left = `${left}px`; // Set the left position


                // Create a close button
                const closeButton = document.createElement('button');
                closeButton.textContent = 'X';
                closeButton.className = 'custom-close-button';
                closeButton.addEventListener('click', () => {
                    mapContainerDiv.remove();
                });

                // Append the close button to the map container div
                mapContainerDiv.appendChild(closeButton);

                // Create a label for user location
                const locationLabel = document.createElement('div');
                locationLabel.textContent = 'User Location:';
                locationLabel.className = 'custom-location-label';

                // Append the location label to the map container div
                mapContainerDiv.appendChild(locationLabel);

                // Append the map container div to the document body
                document.body.appendChild(mapContainerDiv);

                // Create a new div element for the map
                const mapDiv = document.createElement('div');
                mapDiv.className = 'custom-map';

                // Append the map div to the map container div
                mapContainerDiv.appendChild(mapDiv);


                const loader = new Loader({
                    apiKey: "AIzaSyCVrsMKR6f35_JQGglt5bCJaI_wpQkLWWU", // Replace with your Google Maps API key
                    version: "weekly",
                });
                
                loader.load().then(async () => {
                    const { Map } = await loader.importLibrary("maps");
                    
                    const map = new Map(mapDiv, {
                        center: { lat: location.lat(), lng: location.lng() },
                        zoom: 12,
                    });

                    new google.maps.Marker({
                      position: { lat: location.lat(), lng: location.lng() },
                      map: map,
                      title: 'City Location'
                    });

                }).catch((e) => {
                    console.error("Error loading Google Maps:", e);
                });
            } else {
                console.error("Geocode was not successful for the following reason: " + status);
            }
        });

        // Ensure that the map container is removed when the close button is clicked as well
        closeButton.addEventListener('click', () => {
          deleteMapContainer();
        });
    } catch (error) {
        console.error("Error handling location button click:", error);
    }
});

  // Create an <a> element for the chatbox logo link
  const chatboxLink = document.createElement('a');
  chatboxLink.href = 'chat.html';
  chatboxLink.className = 'chatboxLink'; // Ensure this matches your CSS class for styling

  const chatIcon = document.createElement('i');
  chatIcon.className = 'fa-solid fa-comment';
  chatboxLink.appendChild(chatIcon);
  profileItem.appendChild(chatboxLink);

  return profileItem;
}

// Function to delete the map container
function deleteMapContainer() {
  const mapContainer = document.querySelector('.custom-map-container');
  if (mapContainer) {
      mapContainer.remove();
  }
}
  
// Function to fetch profiles from Firestore based on budget range
async function fetchProfiles(minBudget, maxBudget) {
  const profilesRef = collection(db, 'users');
  const querySnapshot = await getDocs(profilesRef);
  const currentUser = auth.currentUser;
  const profileContainer = document.querySelector('.profile-container');

  // Clear existing profile cards
  profileContainer.innerHTML = '';

  // Filter users based on budget range
  const filteredUsers = querySnapshot.docs
    .filter(doc => {
      const userData = doc.data();
      // Check if user has budget and if it's within the specified range
      return userData.budget && parseInt(userData.budget) >= minBudget && parseInt(userData.budget) <= maxBudget;
    })
    .filter(doc => doc.id !== currentUser.uid); // Filter out the current user's document

  // Create profile cards for filtered users
  const profileCardsPromises = filteredUsers.map(async doc => {
    const user = { ...doc.data(), uid: doc.id }; // Include uid in the user object
    return await createProfileCard(user); // Return the promise created by createProfileCard
  });

  // Wait for all profile cards to be created
  const profileCards = await Promise.all(profileCardsPromises);

  // Append all profile cards to the container at once
  profileCards.forEach(profileCard => {
    profileContainer.appendChild(profileCard);
  });
}

// Event listener for min budget input field
const minBudgetInput = document.getElementById('minBudget');
minBudgetInput.addEventListener('input', () => {
  const minBudget = parseInt(minBudgetInput.value);
  const maxBudget = parseInt(document.getElementById('maxBudget').value);
  if (!isNaN(minBudget) && !isNaN(maxBudget)) {
    fetchProfiles(minBudget, maxBudget);
  }
});

// Event listener for max budget input field
const maxBudgetInput = document.getElementById('maxBudget');
maxBudgetInput.addEventListener('input', () => {
  const minBudget = parseInt(document.getElementById('minBudget').value);
  const maxBudget = parseInt(maxBudgetInput.value);
  if (!isNaN(minBudget) && !isNaN(maxBudget)) {
    fetchProfiles(minBudget, maxBudget);
  }
});

// Initial fetch of profiles based on default min and max budget values
const initialMinBudget = parseInt(document.getElementById('minBudget').value);
const initialMaxBudget = parseInt(document.getElementById('maxBudget').value);
fetchProfiles(initialMinBudget, initialMaxBudget);

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