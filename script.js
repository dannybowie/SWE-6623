import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxsEV7XU95eMCcYaWTQsr_1lpjlBOVOJ4",
  authDomain: "ksu-swe-project.firebaseapp.com",
  projectId: "ksu-swe-project",
  storageBucket: "ksu-swe-project.appspot.com",
  messagingSenderId: "990956535258",
  appId: "1:990956535258:web:bf143b1426f42309dc94e3",
  measurementId: "G-1250NG4CKM",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

class EventHandler {
  constructor() {
    this.eventTypes = [];
    this.users = [];
    this.loggedInUser = null;

    this.initAuthListener();
    this.attachEventListeners();
    this.fetchInitialData();
  }

  // Initialize Authentication Listener
  initAuthListener() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Fetch the user's document from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
    
          if (userDoc.exists()) {
            const userData = userDoc.data();
    
            // Check if the 'department' field exists
            const department = userData.department || "Unknown Department";
    
            // Set the department in your UI or check if they are HR
            document.getElementById("userName").textContent = `Welcome, ${userData.firstName}!`;
    
            if (department === "Human Resources") {
              console.log("User is from the HR department");
              // Enable HR-specific features (like saving or deleting events)
            } else {
              console.log("User is not from HR");
              // Disable certain features for non-HR users
              document.getElementById("evtSave").disabled = true;
              document.getElementById("evtDel").disabled = true;
            }
          } else {
            console.log("No user data found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("No user logged in.");
      }
    });
  }
    

  // Fetch initial data
  async fetchInitialData() {
    try {
      await Promise.all([this.fetchEventTypes(), this.fetchUsers(), this.fetchEvents()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  }

  // Fetch Event Types
  async fetchEventTypes() {
    try {
      const querySnapshot = await getDocs(collection(db, "eventType"));
      const eventTypes = querySnapshot.docs.map((doc) => doc.data().name);
  
      console.log("Fetched event types:", eventTypes); // Debugging
      this.populateEventTypeDropdown("evtType", eventTypes, "--- Select Event Type ---");
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  }
  
  

  // Fetch Users
  //  async fetchUsers() {
  //    try {
  //      const querySnapshot = await getDocs(collection(db, "users"));
  //      this.users = querySnapshot.docs.map((doc) => ({
  //        id: doc.id,
  //        ...doc.data(),
  //      }));
  //      const userNames = this.users.map((user) => `${user.firstName} ${user.lastName}`);
  //      this.populateDropdown("emp", userNames, "--- Select Employee ---");
  //    } catch (error) {
  //      console.error("Error fetching users:", error);
  //    }
  //  }

  // Fetch Events
  fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      cal.data = {}; // Clear existing data
  
      querySnapshot.forEach((doc) => {
        const event = doc.data();
        const formattedDate = event.date;
        if (!cal.data[formattedDate]) {
          cal.data[formattedDate] = [];
        }
        cal.data[formattedDate].push({
          ...event,
          eventId: doc.id,
        });
      });
  
      console.log("Fetched events:", cal.data);
      cal.draw();
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  
  // Fetch Users
  async fetchUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("Fetched users:", users); // Debugging
      this.populateUserDropdown("emp", users, "--- Select Employee ---");
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  

populateUserDropdown(elementId, users, placeholder) {
  const dropdown = document.getElementById(elementId);
  dropdown.innerHTML = `<option value="">${placeholder}</option>`; // Placeholder option

  users.forEach((user) => {
    const optElement = document.createElement("option");
    optElement.value = user.id; // Use the user ID for Firestore lookups
    optElement.textContent = `${user.firstName} ${user.lastName}`; // Display full name
    dropdown.appendChild(optElement);
  });
}

populateEventTypeDropdown(elementId, eventTypes, placeholder) {
  const dropdown = document.getElementById(elementId);
  dropdown.innerHTML = `<option value="">${placeholder}</option>`; // Placeholder option

  eventTypes.forEach((eventType) => {
    const optElement = document.createElement("option");
    optElement.value = eventType; // Use the event type name as the value
    optElement.textContent = eventType; // Display the event type name
    dropdown.appendChild(optElement);
  });
}




  // Attach global event listeners
  attachEventListeners() {
    document.getElementById("evtSave").addEventListener("click", (e) => this.saveEvent(e));
    document.getElementById("evtDel").addEventListener("click", () => this.deleteEvent());
    document.getElementById("evtClose").addEventListener("click", () => this.closeForm());
  }

  // Open Event Form
  openEventForm(date, event = null) {
    const form = document.getElementById("calForm");
    form.showModal();
    const dateField = document.getElementById("evtDate");
    dateField.value = date;
  
    if (event) {
      document.getElementById("evtType").value = event.eventType;
      document.getElementById("emp").value = event.userId; // Populate with the user ID
      document.getElementById("evtDescription").value = event.details.description;
      document.getElementById("evtPTO").value = event.details.pto || 0;
  
      // Store the eventId for later use during saving
      dateField.setAttribute("data-event-id", event.eventId);
    } else {
      this.clearForm();
    }
  }
  

  // Save Event
  async saveEvent(e) {
    e.preventDefault();
  
    const date = document.getElementById("evtDate").value;
    const eventType = document.getElementById("evtType").value;
    const userId = document.getElementById("emp").value; // Get selected user ID
    const description = document.getElementById("evtDescription").value;
    const pto = parseFloat(document.getElementById("evtPTO").value) || 0; // PTO for the event
    
    if (!date || !eventType || !userId) {
      alert("Please fill out all required fields.");
      return;
    }
  
    // Retrieve eventId if it exists (editing an event)
    const eventId = document.getElementById("evtDate").getAttribute("data-event-id");
  
    try {
      // Fetch user's data from Firestore
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        alert("The selected employee does not exist.");
        return;
      }
  
      const userData = userDoc.data();
      const userFullName = `${userData.firstName} ${userData.lastName}`;
      let userPTOBalance = userData.PTO || 0; // Retrieve PTO balance from Firestore, default to 0 if undefined
  
      console.log("Current PTO balance:", userPTOBalance); // Debugging: Log current PTO balance
  
      // If editing, adjust PTO balance by removing the old event's PTO amount
      if (eventId) {
        const oldEvent = cal.data[date]?.find((event) => event.eventId === eventId);
        if (oldEvent && oldEvent.details.pto) {
          userPTOBalance += oldEvent.details.pto; // Add back the old PTO amount
        }
      }
  
      // Subtract new PTO amount from user's balance
      if (userPTOBalance < pto) {
        alert("Insufficient PTO balance.");
        return;
      }
  
      // Deduct PTO from user's balance
      userPTOBalance -= pto;
  
      // Update user PTO balance in Firestore
      await updateDoc(userDocRef, { PTO: userPTOBalance });
  
      // Prepare event data
      const eventData = {
        date,
        eventType,
        userId,
        userName: userFullName,
        details: { description, pto },
      };
  
      if (eventId) {
        // Update existing event
        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, eventData);
        console.log(`Event with ID ${eventId} updated.`);
      } else {
        // Create a new event
        const eventRef = await addDoc(collection(db, "events"), eventData);
        console.log(`New event created with ID ${eventRef.id}`);
        eventData.eventId = eventRef.id; // Store the generated ID
      }
  
      // Update local calendar data and redraw the calendar
      if (!cal.data[date]) cal.data[date] = [];
      const existingEventIndex = cal.data[date].findIndex((event) => event.eventId === eventId);
      if (existingEventIndex > -1) {
        cal.data[date][existingEventIndex] = { ...eventData, eventId };
      } else {
        cal.data[date].push({ ...eventData, eventId });
      }
  
      cal.draw(); // Redraw calendar to reflect changes
  
      this.clearForm();
      document.getElementById("calForm").close();
      
  
    } catch (error) {
      console.error("Error saving event:", error);
      
    }
  }
  
  

  async deleteEvent() {
    const eventId = document.getElementById("evtDate").getAttribute("data-event-id");
  
    if (!eventId) {
      alert("No event selected for deletion.");
      return;
    }
  
    try {
      // Find the event in the calendar data
      let eventToDelete = null;
      let dateToDeleteFrom = null;
  
      // Loop through each date and its events in cal.data to find the event
      for (const [date, events] of Object.entries(cal.data)) {
        const eventIndex = events.findIndex((event) => event.eventId === eventId);
        if (eventIndex > -1) {
          eventToDelete = events[eventIndex];
          dateToDeleteFrom = date;
          events.splice(eventIndex, 1); // Remove the event from local data
          break;
        }
      }
  
      if (!eventToDelete) {
        alert("Event not found.");
        return;
      }
  
      // Debugging: log the event and date found for deletion
      console.log("Event to delete:", eventToDelete);
      console.log("Event found on date:", dateToDeleteFrom);
  
      // Update the user's PTO balance
      const userDocRef = doc(db, "users", eventToDelete.userId);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedPTOBalance = (userData.PTO || 0) + (eventToDelete.details.pto || 0);
  
        // Update PTO balance in Firestore
        await updateDoc(userDocRef, { PTO: updatedPTOBalance });
        console.log(`Updated PTO balance for ${userData.firstName} ${userData.lastName}: ${updatedPTOBalance}`);
      }
  
      // Delete the event document from Firestore
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);
      console.log(`Event with ID ${eventId} deleted.`);
  
      // Redraw the calendar and close the form
      cal.draw();
      this.closeForm();
      
  
    } catch (error) {
      console.error("Error deleting event:", error);
      
    }
  }
  


  // Close Event Form
  closeForm() {
    const form = document.getElementById("calForm");
    form.close();
    this.clearForm();
  }

  // Clear Form Fields
  clearForm() {
    document.getElementById("evtType").value = "";
    document.getElementById("emp").value = "";
    document.getElementById("evtDescription").value = "";
    document.getElementById("evtPTO").value = "";
    document.getElementById("evtDate").removeAttribute("data-event-id");
  }
  
  

  // Update UI based on user
  updateUI() {
    const saveButton = document.getElementById("evtSave");
    const deleteButton = document.getElementById("evtDel");

    if (this.loggedInUser?.department !== "Human Resources") {
      saveButton.disabled = true;
      deleteButton.disabled = true;
    } else {
      saveButton.disabled = false;
      deleteButton.disabled = false;
    }
  }
}

// Calendar Object
const cal = {
  sMon: false,
  data: {},
  sDay: 0,
  sMth: 0,
  sYear: 0,

  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

  hMth: null,
  hYear: null,
  hWrap: null,

  init: function () {
    this.hMth = document.getElementById("calMonth");
    this.hYear = document.getElementById("calYear");
    this.hWrap = document.getElementById("calWrap");

    const now = new Date();
    this.sYear = now.getFullYear();
    this.sMth = now.getMonth();

    this.hYear.value = this.sYear;
    this.hMth.value = this.sMth;

    this.hMth.onchange = this.draw.bind(this);
    this.hYear.onchange = this.draw.bind(this);

    for (let i = 0; i < 12; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = this.months[i];
      if (i === this.sMth) opt.selected = true;
      this.hMth.appendChild(opt);
    }

    document.getElementById("calBack").onclick = () => this.pshift(false);
    document.getElementById("calNext").onclick = () => this.pshift(true);

    this.draw();
  },

  pshift: function (forward) {
    this.sMth = parseInt(this.hMth.value);
    this.sYear = parseInt(this.hYear.value);

    if (forward) {
      this.sMth++;
      if (this.sMth > 11) {
        this.sMth = 0;
        this.sYear++;
      }
    } else {
      this.sMth--;
      if (this.sMth < 0) {
        this.sMth = 11;
        this.sYear--;
      }
    }

    this.hMth.value = this.sMth;
    this.hYear.value = this.sYear;
    this.draw();
  },

  draw: function () {
    const wrap = this.hWrap;
    wrap.innerHTML = "";
  
    const daysInMth = new Date(this.sYear, this.sMth + 1, 0).getDate();
    const startDay = new Date(this.sYear, this.sMth, 1).getDay();
  
    let dayCounter = 1;
    for (let week = 0; week < 6; week++) {
      const row = document.createElement("div");
      row.className = "calRow";
  
      for (let day = 0; day < 7; day++) {
        const cell = document.createElement("div");
        cell.className = "calCell";
  
        if (week === 0 && day < startDay) {
          cell.classList.add("calBlank");
        } else if (dayCounter > daysInMth) {
          cell.classList.add("calBlank");
        } else {
          const date = `${String(this.sMth + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}-${this.sYear}`;
          const cellDate = document.createElement("div");
          cellDate.className = "cellDate";
          cellDate.textContent = dayCounter;
  
          cell.appendChild(cellDate);
  
          // Attach click listener for opening event form
          cell.addEventListener("click", () => eventHandler.openEventForm(date));
  
          // Render events
          if (this.data[date]) {
            const eventsContainer = document.createElement("div");
            eventsContainer.className = "eventsContainer";
  
            this.data[date].forEach((event) => {
              const eventDiv = document.createElement("div");
              eventDiv.className = "evt";
              eventDiv.innerHTML = `${event.eventType}: ${event.userName}`;
              eventDiv.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent triggering parent click
                eventHandler.openEventForm(date, event); // Pass event details
              });
  
              eventsContainer.appendChild(eventDiv);
            });
  
            cell.appendChild(eventsContainer);
          }
  
          dayCounter++;
        }
        row.appendChild(cell);
      }
      wrap.appendChild(row);
    }
  }
}  

// Initialize calendar and event handler
let eventHandler;
document.addEventListener("DOMContentLoaded", () => {
  eventHandler = new EventHandler();
  cal.init();
});
