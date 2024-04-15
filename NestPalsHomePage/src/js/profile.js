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
          // Now we have a confirmed user
          setUserProfilePictureAsNavbarLogo(user.uid);
      } 
      else {
          window.location.href='signin.html';
      }
  });
  // End navbar code
async function uploadImg() {
    const fileInput = document.getElementById('uploadpfp');
    const file = fileInput.files[0]; // Get the file from input
    if (!file) {
        console.log('No file selected.');
        return;
    }

    const user = auth.currentUser;
    if (user) {
        try {
            // Corrected the file path using template literals
            const fileRef = storageRef(storage, `pfp/${user.uid}/${file.name}`);
            await uploadBytes(fileRef, file);

            // After successful upload, save a document in Firestore
            await setDoc(doc(db, "pfp", user.uid), {
                fileName: file.name,
                filePath: `pfp/${user.uid}/${file.name}`,
                uploadedAt: new Date() // save upload time
            });

            console.log('Image uploaded and document set in Firestore.');
            window.location.reload();
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    } else {
        console.log('No authenticated user.');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const uploadButton = document.getElementById('edit-btn');
    uploadButton.onclick = uploadImg; // Bind uploadImg function to the button's onclick event
});

async function setpfp(userId) {
    try {
      const docRef = doc(db, "pfp", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().filePath) {
        const filePath = docSnap.data().filePath;
        const fileRef = storageRef(storage, filePath);
        const url = await getDownloadURL(fileRef);
  
        const profileImg = document.getElementById('uploadimg');
        if (profileImg) {
          profileImg.src =url;
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
        setpfp(user.uid);
    } 
    else {
        window.location.href='signin.html';
    }
});

async function getUserInfo(userId) {
  try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
          const userData = docSnap.data();
          const { username, age, city, state, budget } = userData;
          return { username, age, city, state, budget };
      } else {
          console.error("No such document for user:", userId);
          return null;
      }
  } catch (error) {
      console.error("Error fetching user info:", error);
      return null;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
      setpfp(user.uid);
      const userInfo = await getUserInfo(user.uid);
      if (userInfo) {
          console.log("User info:", userInfo);
            
          // Populate the fields
          const usernameDisplay = document.getElementById('user-name');
          usernameDisplay.textContent = userInfo.username;

          const ageDisplay = document.getElementById('user-age');
          ageDisplay.textContent = userInfo.age;

          const stateDisplay = document.getElementById('user-state');
          stateDisplay.textContent = userInfo.state;

          const cityDisplay = document.getElementById('user-city');
          cityDisplay.textContent = userInfo.city;

          const budgetDisplay = document.getElementById('user-budget');
          budgetDisplay.textContent = userInfo.budget;

          /* Populate the fields
          document.querySelector('input[placeholder="State"]').value = userInfo.state;
          document.querySelector('input[placeholder="City"]').value = userInfo.city;
          document.querySelector('input[placeholder="Monthly Budget"]').value = userInfo.budget;
          */
      } else {
        console.error("Error fetching user data:", error);
      }
  } else {
      window.location.href = 'signin.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    const ageDisplay = document.getElementById('user-age');
    const stateDisplay = document.getElementById('user-state');
    const cityDisplay = document.getElementById('user-city');
    const budgetDisplay = document.getElementById('user-budget');
    const usernameDisplay = document.getElementById('user-name');

    let isEditing = false;

    let ageInput, stateInput, cityInput, budgetInput, usernameInput; // Declare variables here

    toggleButton.addEventListener('click', () => {
        if (isEditing) {
            // Save edited values
            saveEditedValues(stateDisplay, cityDisplay, budgetDisplay, usernameDisplay);

            // Revert to text
            ageDisplay.textContent = ageInput.value;
            stateDisplay.textContent = stateInput.value;
            cityDisplay.textContent = cityInput.value;
            budgetDisplay.textContent = budgetInput.value;
            usernameDisplay.textContent = usernameInput.value;

            // Show text, hide inputs
            ageDisplay.style.display = 'inline';
            stateDisplay.style.display = 'inline';
            cityDisplay.style.display = 'inline';
            budgetDisplay.style.display = 'inline';
            usernameDisplay.style.display = 'inline';

            ageInput.remove();
            stateInput.remove();
            cityInput.remove();
            budgetInput.remove();
            usernameInput.remove();
        } else {
            // Switch to inputs
            ageInput = createAgeDropdown(ageDisplay.textContent);
            stateInput = createStateDropdown(stateDisplay.textContent);
            cityInput = createTextInput(cityDisplay.textContent);
            budgetInput = createTextInput(budgetDisplay.textContent);
            usernameInput = createTextInput(usernameDisplay.textContent);

            // Hide text, show inputs
            ageDisplay.style.display = 'none';
            stateDisplay.style.display = 'none';
            cityDisplay.style.display = 'none';
            budgetDisplay.style.display = 'none';
            usernameDisplay.style.display = 'none';

            ageDisplay.parentNode.insertBefore(ageInput, ageDisplay);
            stateDisplay.parentNode.insertBefore(stateInput, stateDisplay);
            cityDisplay.parentNode.insertBefore(cityInput, cityDisplay);
            budgetDisplay.parentNode.insertBefore(budgetInput, budgetDisplay);
            usernameDisplay.parentNode.insertBefore(usernameInput, usernameDisplay);
        }

        isEditing = !isEditing;
        toggleButton.textContent = isEditing ? 'Save' : 'Edit user info';
    });
    
    function createAgeDropdown(currentAge) {
      const dropdown = document.createElement('select');
      dropdown.id = 'ageDropdown';
  
      // Populate dropdown with options from 18 to 65
      for (let age = 18; age <= 65; age++) {
          const option = document.createElement('option');
          option.text = age;
          option.value = age;
          dropdown.appendChild(option);
      }
  
      // Set the selected option to the current age if it exists within the range
      if (currentAge && currentAge >= 18 && currentAge <= 65) {
          dropdown.value = currentAge;
      }
  
      return dropdown;
  }
  
    function createStateDropdown(currentState) {
        const dropdown = document.createElement('select');
        dropdown.id = 'stateDropdown';

        // Create an array of all 50 states
        const states = [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
            "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
            "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
            "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina",
            "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
            "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
        ];

        // Populate dropdown with options
        states.forEach(state => {
            const option = document.createElement('option');
            option.text = state;
            option.value = state;
            dropdown.appendChild(option);
        });

        // Set the selected option to the current state if it exists
        if (currentState && states.includes(currentState)) {
            dropdown.value = currentState;
        }

        return dropdown;
    }

    function createTextInput(value) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        return input;
    }

    async function saveEditedValues(ageDisplay, stateDisplay, cityDisplay, budgetDisplay, usernameDisplay) {
      try {
          // Assuming Firebase is already declared
          const user = auth.currentUser;
          if (user) {
              const userDocRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                  const userData = userDoc.data();
                  const updates = {};
  
                  // Update only the fields that have changed
                  if (ageInput.value !== userData.age) {
                    updates.age = ageInput.value;
                  }
                  
                  if (stateInput.value !== userData.state) {
                      updates.state = stateInput.value;
                  }
                  if (cityInput.value !== userData.city) {
                      updates.city = cityInput.value;
                  }
                  if (budgetInput.value !== userData.budget) {
                      updates.budget = budgetInput.value;
                  }
                  if (usernameInput.value !== userData.username) {
                      updates.username = usernameInput.value;
                  }
  
                  // Update Firestore document with edited values
                  await updateDoc(userDocRef, updates);
              } else {
                  console.log('User document does not exist.');
              }
          } else {
              console.log('No authenticated user.');
          }
      } catch (error) {
          console.error('Error saving edited values:', error);
      }
  }  
});
