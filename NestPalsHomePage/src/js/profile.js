import { initializeApp } from 'firebase/app';
import { getAuth,onAuthStateChanged } from 'firebase/auth';
import { setDoc,getDoc } from 'firebase/firestore';
import { getFirestore, collection, getDocs, query, where, addDoc, doc, updateDoc } from "firebase/firestore";
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