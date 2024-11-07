// src/eventHandler.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCxsEV7XU95eMCcYaWTQsr_1lpjlBOVOJ4",
    authDomain: "ksu-swe-project.firebaseapp.com",
    projectId: "ksu-swe-project",
    storageBucket: "ksu-swe-project.appspot.com",
    messagingSenderId: "990956535258",
    appId: "1:990956535258:web:bf143b1426f42309dc94e3",
    measurementId: "G-1250NG4CKM"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



class EventHandler {
  constructor() {
    this.events = [
      "Employee Anniversary Date", "Employee Birthday",
      "Company Events",
      "Company Holidays",
      "Out of the Office",
      "Personal Time",
      "Training",
      "Visitor",
      "Sick Day",
    ];

    this.dropdown = document.getElementById("evtType");
    this.employeeSelect = document.getElementById("emp");

    this.createEventOptions();
    this.createEmployeeOptions();
  }

  createEventOptions() {
    this.events.forEach(option => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      this.dropdown.appendChild(opt);
    });
  }

  createEmployeeOptions() {
    const employees = {
      emp1: { fName: "Jalen", lName: "Hurts" },
      emp2: { fName: "Bijan", lName: "Robinson" },
      emp3: { fName: "Micah", lName: "Parsons" },
      emp4: { fName: "Tyreek", lName: "Hill" },
      emp5: { fName: "Joe", lName: "Burrow" }
    };

    Object.keys(employees).forEach(employeeId => {
      const opt = document.createElement("option");
      opt.value = employeeId;
      opt.textContent = `${employees[employeeId].fName} ${employees[employeeId].lName}`;
      this.employeeSelect.appendChild(opt);
    });
  }
}

export { EventHandler };
