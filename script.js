/* // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// Get a reference to the collection
const usersRef = collection(db, 'users');

// Add a new document
addDoc(usersRef, {
  name: 'John Doe',
  email: 'john.doe@example.com'
})
.then((docRef) => {
  console.log('Document written with ID:', docRef.id);
})
.catch((error) => {
  console.error('Error adding document:', error);
});

addDoc(); */


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

    // EVENTS
    events : [
      "Employee Anniversary Date", "Employee Birthday",
        "Company Events",
        "Company Holidays",
        "Out of the Office",
        "Personal Time",
        "Training",
        "Visitor",
        "Sick Day",
  ],
  
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

      var events = [
        "Employee Anniversary Date", "Employee Birthday",
          "Company Events",
          "Company Holidays",
          "Out of the Office",
          "Personal Time",
          "Training",
          "Visitor",
          "Sick Day",
    ];
      
      var dropdown = document.getElementById("evtType");

      events.forEach(function(option) {
        var opt = document.createElement("option");
        opt.value = option;
        opt.textContent = option;
        dropdown.appendChild(opt);
        
      });

      createEmployeeOptions();
      function createEmployeeOptions() {
      const employees = {
        emp1: { fName: "Jalen", lName: "Hurts" },
        emp2: { fName: "Bijan", lName: "Robinson" },
        emp3: { fName: "Micah", lName: "Parsons" },
        emp4: { fName: "Tyreek", lName: "Hill" },
        emp5: { fName: "Joe", lName: "Burrow" }

      };

      const dropdown = document.getElementById("emp");
  
      Object.keys(employees).forEach(function(employeeId) {
        const opt = document.createElement("option");
        opt.value = employeeId;
        opt.textContent = `${employees[employeeId].fName} ${employees[employeeId].lName}`;
        dropdown.appendChild(opt);
      });
    }

      // (D5) CALENDAR HEADER - DAY NAMES
      wrap = cal.hWrap.querySelector(".calHead");
      for (let d of cal.days) {
        let cell = document.createElement("div");
        cell.className = "calCell";
        cell.innerHTML = d;
        wrap.appendChild(cell);
      }
  
      // (D6) CALENDAR BODY - INDIVIDUAL DAYS & EVENTS
      wrap = cal.hWrap.querySelector(".calBody");
      row = cal.hWrap.querySelector(".calRow");

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
            cell.style.backgroundColor = getEventColor(event.type);
            
            cell.innerHTML += `<div class='evt'>${event.type}: ${event.description}</div>`;
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
  
    // (F) SAVE EVENT
    save : () => {
      const eventType = document.getElementById("evtType").value;
      cal.data[cal.sDay] = {
        type: eventType,
        description: cal.hfTxt.value
      };
      
      localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
      cal.draw();
      cal.hFormWrap.close();
      return false;
    },
  
    // (G) DELETE EVENT FOR SELECTED DATE
    del : () => { if (confirm("Delete event?")) {
      delete cal.data[cal.sDay];
      localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
      cal.draw();
      cal.hFormWrap.close();
    }}
  };
  window.onload = cal.init;
