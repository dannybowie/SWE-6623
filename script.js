import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";  // Import auth
import { doc, updateDoc, collection, getDocs, addDoc, deleteDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { auth } from '/src/firebaseAuth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

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
    this.eventTypes = [];
    this.users = [];
    this.dropdown = document.getElementById("evtType");
    this.employeeSelect = document.getElementById("emp");
    this.auth = getAuth();
    this.loggedInUser = this.getLoggedInUser(); 
    

    // Existing initialization logic
    this.fetchEventTypesFromFirestore();
    this.fetchUsersFromFirestore();
    this.fetchEventsFromFirestore();
    this.initAuthListener();

    

    this.disableButtonsIfNotHR();

    // Bind the save button to the save method
    const saveButton = document.getElementById("evtSave");
    if (saveButton) {
      saveButton.addEventListener("click", () => this.save());
    } else {
      console.error("Save button (evtSave) not found in the DOM.");
    }

    // Bind the delete button to the delete method
    const deleteButton = document.getElementById("evtDel");
    if (deleteButton) {
      deleteButton.addEventListener("click", () => this.deleteEventFromForm());
    } else {
      console.error("Delete button (evtDel) not found in the DOM.");
    }

    // Bind the close button to close the form
    const closeButton = document.getElementById("evtClose");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.closeForm());
    } else {
      console.error("Close button (evtClose) not found in the DOM.");
    }
  }

  
  
   // Get the currently logged-in user from Firebase
  getLoggedInUser() {
    const user = auth.currentUser;
    if (user) {
      console.log('Logged in user:', user);
      const matchedUser = this.users.find(u => u.id === user.uid);
      console.log('Matched user:', matchedUser);
      return matchedUser;
    } else {
     console.log('No user logged in');
     return null;
   }
  }


  // Disable Save and Delete buttons if the user is not from HR
  disableButtonsIfNotHR() {
    const saveButton = document.getElementById("evtSave");
    const deleteButton = document.getElementById("evtDel");

    // Check if the logged-in user exists and if they are not from the HR department
    if (this.loggedInUser && this.loggedInUser.department !== "Human Resources") {
      if (saveButton) saveButton.disabled = true;
      if (deleteButton) deleteButton.disabled = true;
    }
  }

  initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User logged in:', user);
  
        // Wait for users to be fetched
        if (this.users.length === 0) {
          await this.fetchUsersFromFirestore(); // Ensure users are loaded
        }
  
        const currentUser = this.users.find(u => u.id === user.uid);
        if (currentUser) {
          console.log('Matched user:', currentUser);
          this.loggedInUser = currentUser;
          this.updateUI(currentUser);
        } else {
          console.warn(`User with UID ${user.uid} not found in Firestore`);
          this.loggedInUser = null;
        }
      } else {
        console.log('No user is logged in');
        this.loggedInUser = null;
      }
    });
  }
  

  updateUIForUser(user) {
    console.log('Users array:', this.users);
    const currentUser = this.users.find(u => u.id === user.uid);
    if (currentUser) {
      console.log('Found matching user for UID:', user.uid);
      this.updateUI(currentUser);
    } else {
      console.warn(`User with UID ${user.uid} not found in the users array`);
    }
  }
  
  
  // Add this method to handle individual user UI updates
  updateUI(user) {
    if (user.department === 'Human Resources') {

    } else
      this.disableButtonsIfNotHR()
    }

  resetForm() {
    document.getElementById("evtType").value = "";
    document.getElementById("evtTxt").value = "";
    document.getElementById("evtDate").value = "";
    document.getElementById("evtPTO").value = "";
  }

  // Method to close the form
  closeForm() {
    const eventForm = document.getElementById("calForm");
    if (eventForm) {
      eventForm.close(); // Close the form
      this.resetForm();
    } else {
      console.error("Event form (calForm) not found in the DOM.");
    }
  }

  // Method to handle deletion from the form
  async deleteEventFromForm() {
    const dateField = document.getElementById("evtDate");

    if (!dateField || !dateField.value) {
      console.error("Date field (evtDate) not found or is empty in the DOM.");
      return;
    }

    // Get the event ID from the data attribute
    const eventId = dateField.getAttribute("data-event-id");
    if (!eventId) {
      console.error("Event ID attribute not found on evtDate field.");
      return;
    }

    try {
      await deleteDoc(doc(db, "events", eventId));
      //alert("Event deleted successfully!");
      await this.fetchEventsFromFirestore(); // Refresh events after deletion
      document.getElementById("calForm").close(); // Close the form
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  }

  // Helper function to convert date to mm-dd-yyyy format
  formatDate(dateStr) {
    const dateParts = dateStr.split("-");
    return `${dateParts[1]}-${dateParts[2]}-${dateParts[0]}`;
  }

  // Fetch event types from Firestore
  async fetchEventTypesFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "eventType"));
      this.eventTypes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.createEventOptions();
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  }

  // Fetch users from Firestore and populate employee dropdown
  async fetchUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      this.users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Users fetched:', this.users);
      this.createEmployeeOptions();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  

  // Fetch events from Firestore and store in cal.data
  async fetchEventsFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      cal.data = {}; // Clear existing data

      querySnapshot.forEach(doc => {
        const { eventType, userId, details } = doc.data();
        const eventId = doc.id; // Get the event ID from Firestore
        const formattedDate = details.date;
        const pto = details.pto || '';

        if (!cal.data[formattedDate]) {
          cal.data[formattedDate] = [];
        }
        cal.data[formattedDate].push({ eventType, userId, details, eventId, pto }); // Include pto
      });

      console.log("Fetched events:", cal.data); // Log the events after fetching
      cal.draw(); // Redraw calendar after fetching events
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  // Create event type dropdown options
  createEventOptions() {
    this.dropdown.innerHTML = '';
    this.eventTypes.forEach(eventType => {
      const opt = document.createElement("option");
      opt.value = eventType.name;
      opt.textContent = eventType.name;
      this.dropdown.appendChild(opt);
    });
  }

  // Create employee dropdown options
  createEmployeeOptions() {
    this.employeeSelect.innerHTML = '';
    this.users.forEach(employee => {
      const opt = document.createElement("option");
      opt.value = `${employee.firstName} ${employee.lastName}`;
      opt.textContent = `${employee.firstName} ${employee.lastName}`;
      this.employeeSelect.appendChild(opt);
    });
  }

  // Open form to create a new event
  openEventForm(date, event = null) {
    const eventForm = document.getElementById("calForm");
    if (!eventForm) {
      console.error("Event form (calForm) not found in the DOM");
      return;
    }
  
    eventForm.showModal();
  
    const [month, day, year] = date.split('-');
    const formattedDate = `${year}-${month}-${day}`;
  
    const dateField = document.getElementById("evtDate");
    if (dateField) {
      dateField.value = formattedDate;
      
      if (event) {
        // Set the event ID for updating
        dateField.setAttribute("data-event-id", event.eventId);
        
        // Populate form fields with existing event data
        document.getElementById("evtType").value = event.eventType;
        document.getElementById("emp").value = event.userId; // Adjust if needed
        document.getElementById("evtTxt").value = event.details.description;
        const ptoValue = parseInt(event.details.pto, 10);
        const ptoField = document.getElementById("evtPTO");
        if (ptoField && !isNaN(ptoValue)) {
          ptoField.value = ptoValue.toString(); // Convert back to string for display
        } else {
          console.error('Invalid PTO value or evtPTO element not found');
        }
      } else {
        dateField.removeAttribute("data-event-id"); // Remove attribute if no event is passed
      }
    }
  
    // Add a flag to indicate we're editing an event
    eventForm.dataset.editingEvent = !!event ? 'true' : 'false';
  }

  // Save event to Firestore
  async save() {
    const eventType = this.dropdown.value;
    const description = document.getElementById("evtTxt").value;
    const userId = this.employeeSelect.value;
    const rawDate = document.getElementById("evtDate").value;
    const pto = document.getElementById("evtPTO").value;
  
    console.log("Saving event:", {
      eventType,
      description,
      userId,
      rawDate
    });
  
    if (!eventType || !description || !userId || !rawDate) {
      console.error("Please fill in all the fields.");
      return;
    }
  
    const formattedDate = this.formatDate(rawDate);
  
    try {
      const eventForm = document.getElementById("calForm");
      const isEditing = eventForm.dataset.editingEvent === 'true';
      const eventId = document.getElementById("evtDate").getAttribute("data-event-id");
  
      if (isEditing && eventId) {
        // Update existing event
        await updateDoc(doc(db, "events", eventId), {
          eventType,
          userId,
          details: { date: formattedDate, description, pto } // Add pto to the details object
        });
        console.log("Existing event updated:", eventId);
      } else {
        // Create new event
        const newEvent = {
          eventType,
          userId,
          details: { date: formattedDate, description, pto } // Add pto to the details object
        };
        const docRef = await addDoc(collection(db, "events"), newEvent);
        console.log("New event created:", docRef.id);
      }
  
      await this.fetchEventsFromFirestore();
      document.getElementById("calForm").close();
  
      // Reset the editing flag
      delete eventForm.dataset.editingEvent;
      document.getElementById("evtDate").removeAttribute("data-event-id");
    } catch (error) {
      console.error("Error saving/updating event:", error);
    }
  }

}

export { EventHandler };
var cal = {
  sMon: false,
  data: {},
  sDay: 0, sMth: 0, sYear: 0,

  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

  hMth: null, hYear: null, hWrap: null,

  init: () => {
    cal.hMth = document.getElementById("calMonth");
    cal.hYear = document.getElementById("calYear");
    cal.hWrap = document.getElementById("calWrap");

    let now = new Date();
    cal.sYear = now.getFullYear();
    cal.sMth = now.getMonth();
    
    cal.hYear.value = cal.sYear;
    cal.hMth.value = cal.sMth;
    
    cal.hMth.onchange = cal.draw;
    cal.hYear.onchange = cal.draw;

    for (let i=0; i<12; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = cal.months[i];
      if (i==cal.sMth) { opt.selected = true; }
      cal.hMth.appendChild(opt);
    }


    document.getElementById("calBack").onclick = () => cal.pshift();
    document.getElementById("calNext").onclick = () => cal.pshift(1);

    cal.draw();
  },

    // (C) SHIFT CURRENT PERIOD BY 1 MONTH
    pshift : forward => {
      cal.sMth = parseInt(cal.hMth.value);
      cal.sYear = parseInt(cal.hYear.value);
      if (forward) { cal.sMth++; } else { cal.sMth--; }
      if (cal.sMth > 11) { cal.sMth = 0; cal.sYear++; }
      if (cal.sMth < 0) { cal.sMth = 11; cal.sYear--; }
      cal.hMth.value = cal.sMth;
      cal.hYear.value = cal.sYear;
      cal.draw();
    },

  // Add the event details to the event click functionality
draw: () => {
  let daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(),
      startDay = new Date(cal.sYear, cal.sMth, 1).getDay(),
      wrap = cal.hWrap;

     

  wrap.innerHTML = "";

  let dayCounter = 1;
  for (let week = 0; week < 6; week++) {
    let row = document.createElement("div");
    row.className = "calRow";

    for (let day = 0; day < 7; day++) {
      let cell = document.createElement("div");
      cell.className = "calCell";

      if (week === 0 && day < startDay) {
        cell.classList.add("calBlank");
      } else if (dayCounter > daysInMth) {
        cell.classList.add("calBlank");
      } else {
        const date = `${(cal.sMth + 1).toString().padStart(2, '0')}-${dayCounter.toString().padStart(2, '0')}-${cal.sYear}`;

        // Create the cellDate element
        const cellDate = document.createElement("div");
        cellDate.className = "cellDate";
        cellDate.textContent = dayCounter;
        cell.appendChild(cellDate); // Always append cellDate first

        // Add click event to the cell
        cell.addEventListener("click", () => {
          eventHandler.openEventForm(date); // Open the form on cell click
        });

        // Check if there are events on this date
        if (cal.data[date]) {
          const eventsContainer = document.createElement("div");
          eventsContainer.className = "eventsContainer";

          cal.data[date].forEach(event => {
            const eventDiv = document.createElement("div");
            eventDiv.className = "evt";
            eventDiv.innerHTML = `${event.eventType}: ${event.userId}`;

            // Set background color based on eventType
        switch (event.eventType) {
          case "Employee Anniversary Date":
              eventDiv.style.backgroundColor = "#ffcccb"; // Light red
              break;
          case "Employee Birthday":
              eventDiv.style.backgroundColor = "#ffff00"; // Yellow
              break;
          case "Company Events":
              eventDiv.style.backgroundColor = "#0077ff"; // Blue
              break;
          case "Company Holidays":
              eventDiv.style.backgroundColor = "#ffa500"; // Orange
              break;
          case "Out of the Office":
              eventDiv.style.backgroundColor = "#808080"; // Gray
              break;
          case "Personal Time":
              eventDiv.style.backgroundColor = "#00ff00"; // Green
              break;
          case "Training":
              eventDiv.style.backgroundColor = "#fa18fa"; // Purple
              break;
          case "Visitor":
              eventDiv.style.backgroundColor = "#bb12bb"; // Magenta
              break;
          case "Sick Day":
              eventDiv.style.backgroundColor = "#ff0000"; // Red
              break;
          default:
              eventDiv.style.backgroundColor = "#f0f0f0"; // Default background if eventType doesn't match
              break;
      }

            // Add eventId to the eventDiv for easy identification
            eventDiv.setAttribute("data-event-id", event.details.date); // Store the date as event ID for simplicity

            // Add click event to populate the form with event details
            eventDiv.addEventListener("click", (e) => {
              eventHandler.openEventForm(date, event); // Pass the event object to the form
              e.stopPropagation(); // Prevent the cell click handler from firing
            });

            eventsContainer.appendChild(eventDiv); // Add each event to the container
          });

          cell.appendChild(eventsContainer); // Append the container after cellDate
        }

        dayCounter++;
      }
      row.appendChild(cell);
    }
    wrap.appendChild(row);
  }
},

// Modify the openEventForm to accept event data and populate the form
openEventForm(date, event = null) {
  const eventForm = document.getElementById("calForm");

  // Check if the calForm element exists
  if (!eventForm) {
    console.error("Event form (calForm) not found in the DOM");
    return;
  }

  eventForm.showModal();

  const [month, day, year] = date.split('-');
  const formattedDate = `${year}-${month}-${day}`;

  // Update the date field with the formatted date
  const dateField = document.getElementById("evtDate");
  if (dateField) {
  } else {
      dateField.removeAttribute("data-event-id"); // Remove attribute if no event is passed
  }

  // Add a flag to indicate we're editing an event
  eventForm.dataset.editingEvent = !!event ? 'true' : 'false';

  // If an event is passed, populate the form with event data
  if (event) {
    // Populate form fields with existing event data
    const descriptionField = document.getElementById("evtTxt");
    const employeeSelect = document.getElementById("emp");
    const eventTypeDropdown = document.getElementById("evtType");

    if (descriptionField && employeeSelect && eventTypeDropdown && ptoField) {
      descriptionField.value = event.details.description; // Set description field
      employeeSelect.value = event.userId;
      eventTypeDropdown.value = event.eventType;
    }

    
    
    
  }}
}


// Initialize calendar and event handler
let eventHandler;
document.addEventListener("DOMContentLoaded", () => {
  eventHandler = new EventHandler();
  cal.init();
});
