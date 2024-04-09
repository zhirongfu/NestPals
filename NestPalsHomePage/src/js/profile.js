import { initializeApp } from 'firebase/app';
import { getAuth,onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where } from 'firebase/firestore';
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

const user = auth.currentUser;

const storage = getStorage(app);

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
          const { username, city, state, budget } = userData;
          return { username, city, state, budget };
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
    const stateDisplay = document.getElementById('user-state');
    const cityDisplay = document.getElementById('user-city');
    const budgetDisplay = document.getElementById('user-budget');
    const usernameDisplay = document.getElementById('user-name');

    let isEditing = false;

    let stateInput, cityInput, budgetInput, usernameInput; // Declare variables here

    toggleButton.addEventListener('click', () => {
        if (isEditing) {
            // Save edited values
            saveEditedValues(stateDisplay, cityDisplay, budgetDisplay, usernameDisplay);

            // Revert to text
            stateDisplay.textContent = stateInput.value;
            cityDisplay.textContent = cityInput.value;
            budgetDisplay.textContent = budgetInput.value;
            usernameDisplay.textContent = usernameInput.value;

            // Show text, hide inputs
            stateDisplay.style.display = 'inline';
            cityDisplay.style.display = 'inline';
            budgetDisplay.style.display = 'inline';
            usernameDisplay.style.display = 'inline';

            stateInput.remove();
            cityInput.remove();
            budgetInput.remove();
            usernameInput.remove();
        } else {
            // Switch to inputs
            stateInput = createTextInput(stateDisplay.textContent);
            cityInput = createTextInput(cityDisplay.textContent);
            budgetInput = createTextInput(budgetDisplay.textContent);
            usernameInput = createTextInput(usernameDisplay.textContent);

            // Hide text, show inputs
            stateDisplay.style.display = 'none';
            cityDisplay.style.display = 'none';
            budgetDisplay.style.display = 'none';
            usernameDisplay.style.display = 'none';

            stateDisplay.parentNode.insertBefore(stateInput, stateDisplay);
            cityDisplay.parentNode.insertBefore(cityInput, cityDisplay);
            budgetDisplay.parentNode.insertBefore(budgetInput, budgetDisplay);
            usernameDisplay.parentNode.insertBefore(usernameInput, usernameDisplay);
        }

        isEditing = !isEditing;
        toggleButton.textContent = isEditing ? 'Save' : 'Edit user info';
    });

    function createTextInput(value) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        return input;
    }

    async function saveEditedValues(stateDisplay, cityDisplay, budgetDisplay, usernameDisplay) {
        try {
            // Update Firestore document with edited values
            const stateValue = stateInput.value;
            const cityValue = cityInput.value;
            const budgetValue = budgetInput.value;
            const usernameValue = usernameInput.value;

            // Assuming Firebase is already declared
            const user = auth.currentUser;
            if (user) {
                await setDoc(doc(db, "users", user.uid), {
                    state: stateValue,
                    city: cityValue,
                    budget: budgetValue,
                    username: usernameValue
                });
            } else {
                console.log('No authenticated user.');
            }
        } catch (error) {
            console.error('Error saving edited values:', error);
        }
    }
});
