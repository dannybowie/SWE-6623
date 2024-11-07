import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxsEV7XU95eMCcYaWTQsr_1lpjlBOVOJ4",
    authDomain: "ksu-swe-project.firebaseapp.com",
    projectId: "ksu-swe-project",
    storageBucket: "ksu-swe-project.appspot.com",
    messagingSenderId: "990956535258",
    appId: "1:990956535258:web:bf143b1426f42309dc94e3",
    measurementId: "G-1250NG4CKM"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

async function addDocument() {
    try {
        await setDoc(doc(db, "cities", "LA"), {
            name: "Los Angeles",
            state: "CA",
            country: "USA"
        });
        console.log("Document successfully written!");
    } catch (error) {
        console.error("Error writing document: ", error);
    }
}

addDocument();
