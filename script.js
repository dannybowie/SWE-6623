import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDocs, getDoc, collection, arrayUnion, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  constructor() {
    this.eventTypes = [];
    this.dropdown = document.getElementById("evtType");
    this.employeeSelect = document.getElementById("emp");
    this.users = [];
    
    this.fetchEventTypesFromFirestore().then(() => {
      this.createEventOptions();
      this.createEmployeeOptions();
    });

    this.fetchUsersFromFirestore().then(() => {
      this.createEmployeeOptions();
    });
  }

  async fetchEventTypesFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "eventType"));
      console.log("Query snapshot size:", querySnapshot.size);
      this.eventTypes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched event types:", this.eventTypes);
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  }

  async fetchUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      console.log("Query snapshot size:", querySnapshot.size);
      this.users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Fetched users:", this.users);

      // Populate employee select dropdown
      const employeeSelect = document.getElementById("emp");
      employeeSelect.innerHTML = ''; // Clear existing options
      this.users.forEach((employee) => {
        const opt = document.createElement("option");
        opt.value = employee.id; // Use the actual document ID as value
        opt.textContent = `${employee.firstName} ${employee.lastName}`;
        employeeSelect.appendChild(opt);
      });
      
      // Log the IDs of fetched users
      console.log("User IDs:", this.users.map(user => user.id));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async fetchEventsFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      console.log("Query snapshot size:", querySnapshot.size);
      this.eventsByDate = {};
      querySnapshot.forEach((doc) => {
        const { eventDate, firstName, lastName } = doc.data();
        const dateObj = new Date(eventDate);
        const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
        
        if (!this.eventsByDate[formattedDate]) {
          this.eventsByDate[formattedDate] = [];
        }
        this.eventsByDate[formattedDate].push({ 
            type: doc.data().type, 
            description: doc.data().description,
            firstName: firstName,
            lastName: lastName
        });
      });
      console.log("Fetched events:", this.eventsByDate);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  createEventOptions() {
    if (!this.dropdown) {
      console.error("Element with id 'evtType' not found");
      return;
    }
  }
  createEventOptions() {
    this.dropdown.innerHTML = ''; // Clear existing options
    this.eventTypes.forEach((eventType) => {
      const opt = document.createElement("option");
      opt.value = eventType.id;
      opt.textContent = eventType.name;
      this.dropdown.appendChild(opt);
    });
  }

  createEmployeeOptions() {
    if (!this.employeeSelect) {
      console.error("Element with id 'emp' not found");
      return;
    }

    this.employeeSelect.innerHTML = ''; // Clear existing options
    this.users.forEach((employee) => {
      const opt = document.createElement("option");
      opt.value = employee.id;
      opt.textContent = employee.firstName + " " + employee.lastName;
      this.employeeSelect.appendChild(opt);
    });
  }
  
  // Helper function to reset the form
  resetForm() {
    document.getElementById("evtType").value = "";
    document.getElementById("evtTxt").value = "";
    document.getElementById("evtDate").value = "";
  }

  closeForm() {
    // Get the form wrapper element
    const formWrapper = document.getElementById('calForm');
    
    // Check if the form wrapper exists
    if (formWrapper) {
        // Close the form
        formWrapper.style.display = 'none';
        
        // Reset the form fields
        this.resetForm();
    } else {
        console.error('Form wrapper not found');
    }
  }

  // Helper function to get the selected user ID
  getSelectedUserId() {
    return document.getElementById("emp").value;
  }


  async save() {
    console.log('Save function called');
  
    const eventType = document.getElementById("evtType").value;
    const description = document.getElementById("evtTxt").value;
    const userId = document.getElementById("emp").value;
    const evtDateInput = document.getElementById("evtDate");
      
  
    console.log('Form dat:', { eventType, description, userId, evtDate: evtDateInput.value });
  
    try {
      // Generate a unique ID for the event
      const eventId = EventHandler.generateUUID();

      // Create a new event object
      const newEvent = {
      id: eventId,
        description: description,
        userId: userId,
        eventDate: evtDateInput.value,
        firstName: document.getElementById("reg_nameFirst").value,
        lastName: document.getElementById("reg_nameLast").value,
        timestamp: new Date(),
      };
  
      // Add the new event to the events collection
      await setDoc(doc(db, "events", eventId), newEvent);
  
      console.log("Event saved successfully!");
      
      // Refresh events after saving
      await this.fetchEventsFromFirestore();

      // Close the form
      this.closeForm();
    } catch (error) {
      console.error("Error saving event:", error);
      alert(`An error occurred while saving the event: ${error.message}`);
    }
  }
  
  async del() {
    if (confirm("Delete event?")) {
      const selectedDay = document.getElementById("evtDate").value;
      
      try {
        await deleteDoc(doc(db, "events", selectedDay));
        console.log("Event deleted successfully from Firestore");
        
        // Update the calendar display
        this.updateCalendarDisplay();
        
        // Close the form
        this.closeForm();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert(`Failed to delete the event: ${error.message}`);
      }
    }
  }

  // New method to update the calendar display
  updateCalendarDisplay() {
    this.fetchEventsFromFirestore().then(() => {
      this.draw();
    });
  }
  

  
  init() {
    cal.init();
    console.log("Calendar initialized");

    this.handleFormSubmission();
  }

  handleFormSubmission() {
    const form = document.getElementById("calForm");
    if (form) {
      console.log('Found form element');
      
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        await this.save();
      });
    } else {
      console.error('Form element not found');
    }
  }
}

var cal = {
  // (A) PROPERTIES
  // (A1) FLAGS & DATA
  sMon : false, // week start on monday
  data : null, // events for selected period
  sDay : 0, sMth : 0, sYear : 0, // selected day month year

  // (A2) MONTHS & DAY NAMES
  months : [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  days : ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],

//   // EVENTS
//   events : [
//     "Employee Anniversary Date", "Employee Birthday",
//       "Company Events",
//       "Company Holidays",
//       "Out of the Office",
//       "Personal Time",
//       "Training",
//       "Visitor",
//       "Sick Day",
// ],


  // (A3) HTML ELEMENTS
  hMth : null, hYear : null, // month/year selector
  hWrap : null, // calendar wrapper
  hFormWrap : null, hForm : null, // event form
  hfDate : null, hfTxt : null, hfDel : null, // form fields

  // (B) INIT CALENDAR
  init : () => {
    // (B1) GET HTML ELEMENTS
    cal.hMth = document.getElementById("calMonth");
    cal.hYear = document.getElementById("calYear");
    cal.hWrap = document.getElementById("calWrap");
    cal.hFormWrap = document.getElementById("calForm");
    cal.hForm = cal.hFormWrap.querySelector("form");
    cal.hfDate = document.getElementById("evtDate");
    cal.hfTxt = document.getElementById("evtTxt");
    cal.hfDel = document.getElementById("evtDel");

    // (B2) APPEND MONTHS/YEAR
    let now = new Date(), nowMth = now.getMonth();
    cal.hYear.value = parseInt(now.getFullYear());
    for (let i=0; i<12; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = cal.months[i];
      if (i==nowMth) { opt.selected = true; }
      cal.hMth.appendChild(opt);
    }

    // (B3) ATTACH CONTROLS
    cal.hMth.onchange = cal.draw;
    cal.hYear.onchange = cal.draw;
    document.getElementById("calBack").onclick = () => cal.pshift();
    document.getElementById("calNext").onclick = () => cal.pshift(1);
    cal.hForm.onsubmit = cal.save;
    document.getElementById("evtClose").onclick = () => cal.hFormWrap.close();
    cal.hfDel.onclick = cal.del;

    // (B4) START - DRAW CALENDAR
    if (cal.sMon) { cal.days.push(cal.days.shift()); }
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

  // (D) DRAW CALENDAR FOR SELECTED MONTH
  draw : () => {
    // (D1) DAYS IN MONTH + START/END DAYS
    // note - jan is 0 & dec is 11
    // note - sun is 0 & sat is 6
    cal.sMth = parseInt(cal.hMth.value); // selected month
    cal.sYear = parseInt(cal.hYear.value); // selected year
    let daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // number of days in selected month
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(), // last day of the month
        now = new Date(), // current date
        nowMth = now.getMonth(), // current month
        nowYear = parseInt(now.getFullYear()), // current year
        nowDay = cal.sMth==nowMth && cal.sYear==nowYear ? now.getDate() : null ;

    // (D2) LOAD DATA FROM LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else { cal.data = JSON.parse(cal.data); }

    // (D3) DRAWING CALCULATIONS
    // (D3-1) BLANK SQUARES BEFORE START OF MONTH
    let squares = [];
    if (cal.sMon && startDay != 1) {
      let blanks = startDay==0 ? 7 : startDay ;
      for (let i=1; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i=0; i<startDay; i++) { squares.push("b"); }
    }

    // (D3-2) DAYS OF THE MONTH
    for (let i=1; i<=daysInMth; i++) { squares.push(i); }

    // (D3-3) BLANK SQUARES AFTER END OF MONTH
    if (cal.sMon && endDay != 0) {
      let blanks = endDay==6 ? 1 : 7-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay==0 ? 6 : 6-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }

    // (D4) "RESET" CALENDAR
    cal.hWrap.innerHTML = `<div class="calHead"></div>
    <div class="calBody">
      <div class="calRow"></div>
    </div>`;

    // (D5) CALENDAR HEADER - DAY NAMES
    let wrap = cal.hWrap.querySelector(".calHead");
    for (let d of cal.days) {
      let cell = document.createElement("div");
      cell.className = "calCell";
      cell.innerHTML = d;
      wrap.appendChild(cell);
    }

    // (D6) CALENDAR BODY - INDIVIDUAL DAYS & EVENTS
    wrap = cal.hWrap.querySelector(".calBody");
    let row = cal.hWrap.querySelector(".calRow");

    for (let i=0; i<squares.length; i++) {
    // (D6-1) GENERATE CELL
    let cell = document.createElement("div");
    cell.className = "calCell";
  
    if (nowDay==squares[i]) { cell.classList.add("calToday"); }
    if (squares[i]=="b") { cell.classList.add("calBlank"); }
    else {
      cell.innerHTML = `<div class="cellDate">${squares[i]}</div>`;
      
      if (cal.data[squares[i]]) {
          const event = cal.data[squares[i]];

          
          cell.innerHTML += `<div class='evt'>${event.type}: ${event.description}</div>`;

          // Show employee name
          cell.innerHTML += `<span class="employee-name">${event.firstName} ${event.lastName}</span>`;

          // Add event color
          
          cell.innerHTML += `<div class='evt'>${event.type}: ${event.description}</div>`;

          // Add click handler for each event
          cell.onclick = () => { cal.show(cell); };
      }
      
      cell.onclick = () => { cal.show(cell); };
  }

  function getEventColor(eventType) {
    switch (eventType) {
        case "Employee Anniversary Date":
            return "#ffcccb"; // Pastel pink
        case "Employee Birthday":
            return "#ffff00"; // Yellow
        case "Company Events":
            return "#0000ff"; // Blue
        case "Company Holidays":
            return "#ffa500"; // Orange
        case "Out of the Office":
            return "#808080"; // Gray
        case "Personal Time":
            return "#00ff00"; // Green
        case "Training":
            return "#800080"; // Purple
        case "Visitor":
            return "#ff00ff"; // Magenta
        case "Sick Day":
            return "#ff0000"; // Red
        default:
            return "#ffffff"; // White
    }
}
  
  row.appendChild(cell);

      // (D6-2) NEXT ROW
      if (i!=(squares.length-1) && i!=0 && (i+1)%7==0) {
        row = document.createElement("div");
        row.className = "calRow";
        wrap.appendChild(row);
      }
    }
  },

  // (E) SHOW EDIT EVENT DOCKET FOR SELECTED DAY
  show : cell => {
    cal.hForm.reset();
    cal.sDay = cell.querySelector(".cellDate").innerHTML;
    cal.hfDate.value = `${cal.sDay} ${cal.months[cal.sMth]} ${cal.sYear}`;
    if (cal.data[cal.sDay] !== undefined) {
      cal.hfTxt.value = cal.data[cal.sDay];
      cal.hfDel.classList.remove("hide");
    } else { cal.hfDel.classList.add("hide"); }
    cal.hFormWrap.show();
  },

  // // (F) SAVE EVENT
  // save : () => {
  //   const eventType = document.getElementById("evtType").value;
  //   cal.data[cal.sDay] = {
  //     type: eventType,
  //     description: cal.hfTxt.value
  //   };
    
  //   localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
  //   cal.draw();
  //   cal.hFormWrap.close();
  //   return false;
  // },

  // (G) DELETE EVENT FOR SELECTED DATE
  // del : () => { if (confirm("Delete event?")) {
  //   delete cal.data[cal.sDay];
  //   localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
  //   cal.draw();
  //   cal.hFormWrap.close();
  // }}
};







// Initialize calendar
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  const handler = new EventHandler();
  handler.init();
})
