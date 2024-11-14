import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { doc, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

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
    this.dropdown = document.getElementById("evtType");
    this.employeeSelect = document.getElementById("emp");
    this.users = [];
    this.events = {};  // Store events
    this.fetchEventTypesFromFirestore().then(() => {
      this.createEventOptions();
    });

    this.fetchUsersFromFirestore().then(() => {
      this.createEmployeeOptions();
    });

    this.fetchUsersFromFirestore().then(() => {
      this.createEmployeeOptions();
    });

    this.fetchEventsFromFirestore();
  }

  async fetchEventTypesFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "eventType"));
      //console.log("Query snapshot size:", querySnapshot.size);
      this.eventTypes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      //console.log("Fetched event types:", this.eventTypes);
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  }

  async fetchUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      //console.log("Query snapshot size:", querySnapshot.size);
      this.users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      //console.log("Fetched users:", this.users);

      // Populate employee select dropdown
      const employeeSelect = document.getElementById("emp");
      employeeSelect.innerHTML = ''; // Clear existing options
      this.users.forEach((employee) => {
        const opt = document.createElement("option");
        opt.value = `${employee.firstName} ${employee.lastName}`; // Use the actual document ID as value
        opt.textContent = `${employee.firstName} ${employee.lastName}`;
        employeeSelect.appendChild(opt);
      });
      
      // Log the IDs of fetched users
      //console.log("User IDs:", this.users.map(user => user.id));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async fetchEventsFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
  
      // Clear existing data
      this.events = {};
  
      // Fetch all events
      querySnapshot.forEach((doc) => {
        const { eventType, userId, details } = doc.data();
  
        // Check if date exists
        if (!details.date || typeof details.date !== 'string') {
          console.error('Invalid or missing date', details.date);
          return; // Skip this event if the date is invalid
        }
  
        // Try parsing the date, if it's not in the YYYY-MM-DD format
        const date = new Date(details.date);
        if (isNaN(date.getTime())) {
          console.error('Invalid date structure', details.date);
          return; // Skip event if the date cannot be parsed
        }
  
        // Get year, month, and day from the parsed date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get 01-12 format
        const day = String(date.getDate()).padStart(2, '0'); // Get 01-31 format
  
        // Initialize nested year/month/day structure
        if (!this.events[year]) {
          this.events[year] = {};
        }
        if (!this.events[year][month]) {
          this.events[year][month] = {};
        }
  
        // Add the event to the year/month/day collection
        this.events[year][month][day] = { eventType, userId, details };
      });
  
      console.log("Events fetched and stored:", this.events);
      cal.draw(); // Redraw calendar after fetching events
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }
  
  
  

  createEventOptions() {
    this.dropdown.innerHTML = ''; // Clear existing options
    this.eventTypes.forEach((eventType) => {
      const opt = document.createElement("option");
      opt.value = eventType.name;
      opt.textContent = eventType.name;
      this.dropdown.appendChild(opt);
    });
  }
  

  createEmployeeOptions() {
    if (!this.employeeSelect) {
      console.error("Element with id 'emp' not found");
      return;
    }

    this.employeeSelect.innerHTML = '';
    this.users.forEach((employee) => {
      const opt = document.createElement("option");
      opt.value = employee.firstName + " " + employee.lastName;
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



  // Helper function to get the selected user ID
  getSelectedUserId() {
    return document.getElementById("emp").value;
  }


  async save() {

    const eventType = document.getElementById("evtType").value;
    const description = document.getElementById("evtTxt").value;
    const userId = document.getElementById("emp").value;
    const evtDateInput = document.getElementById("evtDate");


    try {
      // Validate the rawDate
      if (!rawDate || typeof rawDate !== 'string') {
        throw new Error('Invalid date format');
      }

      const newEvent = {
        eventType: eventType,
        userId: userId,
        details: {
          date: rawDate,
          description: description
        }
      };

  
      // Refresh events after saving
      await this.fetchEventsFromFirestore();
      this.resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
      alert(`An error occurred while saving the event: ${error.message}`);
    }
  }
  

  getFormattedMonthName(monthNumber) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1];
  }
  
  async del() {
    if (confirm("Delete event?")) {
      const selectedDay = document.getElementById("evtDate").value;
      const eventId = document.getElementById("evtId").value; // Assuming you have event ID in the form
  
      try {
        // Use the correct document reference
        await deleteDoc(doc(db, "events", eventId));
        console.log("Event deleted successfully from Firestore");
        await this.fetchEventsFromFirestore();
      } catch (error) {
        console.error("Error deleting event:", error);
        alert(`Failed to delete the event: ${error.message}`);
      }
    }
  }
  

  updateCalendarDisplay() {
    this.fetchEventsFromFirestore().then(() => {
      cal.draw();
    });
  }
  
  

  
  init() {
    cal.init();
    //console.log("Calendar initialized");

    this.handleFormSubmission();
  }

  handleFormSubmission() {
    const form = document.getElementById("calForm");
    if (form) {
      //console.log('Found form element');
      
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        //console.log('Form submitted');
        
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
  // (D) DRAW CALENDAR FOR SELECTED MONTH
  draw: () => {
    // (D1) DAYS IN MONTH + START/END DAYS
    let daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(),
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(),
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(),
        now = new Date(),
        nowMth = now.getMonth(),
        nowYear = now.getFullYear(),
        nowDay = cal.sMth == nowMth && cal.sYear == nowYear ? now.getDate() : null;
  
    let squares = [];
  
    // (D3-1) BLANK SQUARES BEFORE START OF MONTH
    if (cal.sMon && startDay != 1) {
      let blanks = startDay == 0 ? 7 : startDay;
      for (let i = 1; i < blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i = 0; i < startDay; i++) { squares.push("b"); }
    }
  
    // (D3-2) DAYS OF THE MONTH
    for (let i = 1; i <= daysInMth; i++) { squares.push(i); }
  
    // (D3-3) BLANK SQUARES AFTER END OF MONTH
    if (cal.sMon && endDay != 0) {
      let blanks = endDay == 6 ? 1 : 7 - endDay;
      for (let i = 0; i < blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay == 0 ? 6 : 6 - endDay;
      for (let i = 0; i < blanks; i++) { squares.push("b"); }
    }
  
    // (D4) "RESET" CALENDAR
    cal.hWrap.innerHTML = `<div class="calHead"></div><div class="calBody"><div class="calRow"></div></div>`;
  
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
  
    for (let i = 0; i < squares.length; i++) {
      let cell = document.createElement("div");
      cell.className = "calCell";
  
      // Check if today
      if (nowDay === squares[i] && cal.sMth === nowMth && cal.sYear === nowYear) {
        cell.classList.add("calToday");
      }
  
      // Blank squares
      if (squares[i] === "b") {
        cell.classList.add("calBlank");
      }
  
      // Get the formatted date for this cell (YYYY-MM-DD)
      const formattedDate = `${cal.sYear}-${String(cal.sMth + 1).padStart(2, '0')}-${String(squares[i]).padStart(2, '0')}`;
  
      // Ensure the events data for this date exists
      if (
        cal.events &&
        cal.events[cal.sYear] &&
        cal.events[cal.sYear][String(cal.sMth + 1).padStart(2, '0')] &&
        cal.events[cal.sYear][String(cal.sMth + 1).padStart(2, '0')][String(squares[i]).padStart(2, '0')]
      ) {
        const event = cal.events[cal.sYear][String(cal.sMth + 1).padStart(2, '0')][String(squares[i]).padStart(2, '0')];
        cell.innerHTML = `<div class='evt'>${event.eventType}: ${event.userId}</div>`;
        cell.onclick = () => {
          cal.show(cell);
        };
      } else {
        // No event, just show the day number
        cell.innerHTML = `<div class="cellDate">${squares[i]}</div>`;
        cell.onclick = () => {
          cal.show(cell);
        };
      }
  
      row.appendChild(cell);
  
      // Next row
      if ((i + 1) % 7 === 0 && i !== 0) {
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
  

  // (G) DELETE EVENT FOR SELECTED DATE
};







// Initialize calendar
document.addEventListener('DOMContentLoaded', function() {
  //console.log('DOM fully loaded');
  const handler = new EventHandler();
  handler.init();
})
