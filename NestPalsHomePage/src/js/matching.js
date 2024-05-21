import { Loader } from "@googlemaps/js-api-loader";
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs,setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Heap } from 'heap-js';

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
    const aiMatchLink = document.getElementById('ai-match-link');
    aiMatchLink.addEventListener('click',function(){
      activateAIMatch();
    })
  
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
  onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                //writeMatrix(user.uid);
                await fetchProfiles();// Initial fetch of profiles with no budget filter
                const userName = docSnap.data().username;
                document.querySelector('.username').textContent = userName;
            } else {
                console.log('No user data available');
            }

            const pfpdocRef = doc(db, "pfp", user.uid);
            const pfpdocSnap = await getDoc(pfpdocRef);
            const userpfp = document.querySelector('.profile-img');
            if (pfpdocSnap.exists() && pfpdocSnap.data().filePath) {
                const filePath = pfpdocSnap.data().filePath;
                const fileRef = storageRef(storage, filePath);
                const url = await getDownloadURL(fileRef);
                userpfp.style.backgroundImage = `url('${url}')`;
            } else {
                const defaultFileRef = storageRef(storage, 'pfp/DefaultNestPalsPfp7361/Screenshot 2024-05-12 194811.png');
                const defaultUrl = await getDownloadURL(defaultFileRef);
                userpfp.style.backgroundImage = `url('${defaultUrl}')`;
            }
        } catch (error) {
            console.error("Error processing user data:", error);
        }
    } else {
        console.log('User is not signed in.');
        window.location.href = 'signin.html';
    }
});
/*async function writeMatrix(userid){
  const userDocRef = doc(db, "users", userid);
  const userSnap = await getDoc(userDocRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    
    const age = parseInt(userData.age, 10) || 0; // convert age to number
    const genderScores = {'male':1, 'female':2, 'other':3};
    const gender = genderScores[userData.gender] || 0
    const budget = parseInt(userData.budget, 10)/1000 || 0; // Convert budget to number if stored as string
    const cityScores = {'Brooklyn': 1,'Staten Island': 2,'Manhattan': 3,'Queens': 4,'Bronx': 5};
    const city = cityScores[userData.city] || 0;
    const smoking = userData.smoking === 'smoker' ? 1 : 0; // Convert smoker status to 0 or 1
    const pets = userData.pets === 'yes' ? 1 : 0;
    const cleanlinessScores = { 'neat': 3, 'average': 2, 'messy': 1 };
    const cleanliness = cleanlinessScores[userData.cleanliness] || 0; // Provide a default value if undefined

    // Update the document with the new data matrix
    await updateDoc(userDocRef, {
      datamatrix: [age, gender, budget, city, smoking, pets, cleanliness]
    });

  } else {
    console.log("User document does not exist!");
  }
}*/
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
              /*if(storageRef(storage, 'pfp/DefaultNestPalsPfp7361/Screenshot 2024-05-12 194811.png')){
                console.log('doc exists');
              }*/
              const defaultfileref = storageRef(storage, 'pfp/DefaultNestPalsPfp7361/Screenshot 2024-05-12 194811.png');//path to deafult pfp
              const defaulturl = await getDownloadURL(defaultfileref);
              img.src = defaulturl; // sts the img src to defalt hardcoded pfp in fb
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
  locationLink.className = 'location-link';

  const locationIcon = document.createElement('i');
  locationIcon.className = 'fa-solid fa-globe';
  locationLink.appendChild(locationIcon);
  profileItem.appendChild(locationLink);

  locationLink.addEventListener('click', (event) => {
    event.preventDefault();
    openGmap(user);
})
  // Create an <a> element for the chatbox logo link
  const chatboxLink = document.createElement('a');
  chatboxLink.href = `chat.html?otherUserId=${user.uid}`
  chatboxLink.className = 'chatboxLink'; 

  const chatIcon = document.createElement('i');
  chatIcon.className = 'fa-solid fa-comment';
  chatboxLink.appendChild(chatIcon);
  profileItem.appendChild(chatboxLink);

  return profileItem;
}
async function openGmap(user){
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

    } catch (error) {
        console.error("Error handling location button click:", error);
    }
};



// Function to delete the map container
function deleteMapContainer() {
  const mapContainer = document.querySelector('.custom-map-container');
  if (mapContainer) {
      mapContainer.remove();
  }
}
async function fetchProfiles(minBudget = null, maxBudget = null, smokeFilter = null, cleanFilter = null, petsFilter = null) {
  const profilesRef = collection(db, 'users');
  const budgetQuery = query(profilesRef, where('budget', '!=', ''));
  const querySnapshot = await getDocs(budgetQuery);
  const currentUser = auth.currentUser;
  const profileContainer = document.querySelector('.profile-container');

  profileContainer.innerHTML = '';

  let filteredUsers = querySnapshot.docs;
  if (minBudget !== null && maxBudget == null) {
    filteredUsers = filteredUsers.filter(doc => {
      const userData = doc.data();
      return parseInt(userData.budget) >= minBudget;
    });
  }
  if (minBudget == null && maxBudget !== null) {
    filteredUsers = filteredUsers.filter(doc => {
      const userData = doc.data();
      return parseInt(userData.budget) <= maxBudget;
    });
  }
  if (minBudget !== null && maxBudget !== null) {
    filteredUsers = filteredUsers.filter(doc => {
      const userData = doc.data();
      return parseInt(userData.budget) >= minBudget && parseInt(userData.budget) <= maxBudget;
    });
  }

  if (smokeFilter !== null) {
    filteredUsers = filteredUsers.filter(doc => doc.data().smoking === smokeFilter);
  }
  if (cleanFilter !== null) {
    filteredUsers = filteredUsers.filter(doc => doc.data().cleanliness === cleanFilter);
  }
  if (petsFilter !== null) {
    filteredUsers = filteredUsers.filter(doc => doc.data().pets === petsFilter);
  }

  filteredUsers = filteredUsers.filter(doc => doc.id !== currentUser.uid);

  const profileCards = await Promise.all(filteredUsers.map(async doc => {
    return createProfileCard({ ...doc.data(), uid: doc.id });
  }));

  profileCards.forEach(profileCard => {
    profileContainer.appendChild(profileCard);
  });
}

function getFiltersAndFetchProfiles() {
  const minBudget = parseInt(document.getElementById('minBudget').value);
  const maxBudget = parseInt(document.getElementById('maxBudget').value);
  const smokeFilter = document.getElementById('smokeCheckbox').checked ? 'smoker' : null;
  const cleanFilter = document.getElementById('cleanlinessCheckbox').checked ? 'neat' : null;
  const petsFilter = document.getElementById('petsCheckbox').checked ? 'yes' : null;

  fetchProfiles(
    !isNaN(minBudget) ? minBudget : null,
    !isNaN(maxBudget) ? maxBudget : null,
    smokeFilter,
    cleanFilter,
    petsFilter
  );
}

document.getElementById('minBudget').addEventListener('input', getFiltersAndFetchProfiles);
document.getElementById('maxBudget').addEventListener('input', getFiltersAndFetchProfiles);
document.getElementById('smokeCheckbox').addEventListener('change', getFiltersAndFetchProfiles);
document.getElementById('cleanlinessCheckbox').addEventListener('change', getFiltersAndFetchProfiles);
document.getElementById('petsCheckbox').addEventListener('change', getFiltersAndFetchProfiles);
function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must be of same length');
  }
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.pow(vec1[i] - vec2[i], 2);
  }
  return Math.sqrt(sum);
}

async function activateAIMatch() {
  const currentUser = auth.currentUser;
  const currentUserDocRef = doc(db, 'users', currentUser.uid);
  const currentUserDoc = await getDoc(currentUserDocRef);

  if (!currentUserDoc.exists() || !currentUserDoc.data().datamatrix) {
    console.error('Current user or datamatrix does not exist');
    return;
  }

  const currentUserMatrix = currentUserDoc.data().datamatrix;

  const profilesRef = collection(db, 'users');
  const querySnapshot = await getDocs(profilesRef); 

  /*const users = [];

  querySnapshot.forEach(doc => {
    if (doc.id !== currentUser.uid && doc.data().datamatrix) {
      // Create an object literal and push it into the users array
      users.push({
        id: doc.id,
        data: doc.data(),
        distance: euclideanDistance(currentUserMatrix, doc.data().datamatrix)
      });
    }
  });

  // Sort users by distance and get the top 10 closest users
  users.sort((a, b) => a.distance - b.distance);
  const top10Users = users.slice(0, 10);
  */

  const minHeap = new Heap((a, b) => b.distance - a.distance);

  querySnapshot.forEach(doc => {
    if (doc.id !== currentUser.uid && doc.data().datamatrix) {
      const distance = euclideanDistance(currentUserMatrix, doc.data().datamatrix);
      minHeap.push({ id: doc.id, data: doc.data(), distance: distance });

      if (minHeap.size() > 10) {
        minHeap.pop();
      }
    }
  });

  const top10Users = [];
  while (minHeap.size() > 0) {
    top10Users.push(minHeap.pop());
  }

  const profileContainer = document.querySelector('.profile-container');
  profileContainer.innerHTML = '';

  const profileCards = await Promise.all(top10Users.map(async user => {
    return createProfileCard({ ...user.data, uid: user.id });
  }));

  profileCards.forEach(profileCard => {
    profileContainer.appendChild(profileCard);
  });

  //console.log('Top 10 closest users based on datamatrix:', top10Users);
}


/*  onAuthStateChanged(auth, (user) => {
    if (user) {
        // Now that we have a confirmed user, call fetchProfiles or pass the user down
        fetchProfiles(); // If fetchProfiles doesn't directly use auth.currentUser
        setUserProfilePictureAsNavbarLogo(user.uid);
    } 
    else {
        window.location.href='signin.html';
    }
});*/