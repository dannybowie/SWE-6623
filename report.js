document.addEventListener("DOMContentLoaded", () => {
  populateUserDropdownForReport();  // Populate the user dropdown for the report
});


async function populateUserDropdownForReport() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const dropdown = document.getElementById("reportUserDropdown");
    dropdown.innerHTML = '<option value="">--- Select Employee ---</option>';
    
    users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.firstName} ${user.lastName}`;
      dropdown.appendChild(option);
    });

    // Attach event listener for when a user is selected
    dropdown.addEventListener("change", (event) => {
      const userId = event.target.value;
      if (userId) {
        // Retrieve the PTO balance and events for the selected user
        displayReport(userId);
      } else {
        document.getElementById("reportContainer").innerHTML = "";
      }
    });

  } catch (error) {
    console.error("Error fetching users for report dropdown:", error);
  }
}

async function displayReport(userId) {
  const month = parseInt(document.getElementById("monthSelector").value);
  const year = parseInt(document.getElementById("yearSelector").value);

  try {
    // Fetch the user's PTO balance
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userPTO = userData.PTO || 0; // PTO balance from the user document
      document.getElementById("ptoBalance").textContent = userPTO;
    }

    // Fetch all events for the selected month and year
    const querySnapshot = await getDocs(collection(db, "events"));
    const userEvents = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((event) => event.userId === userId);

    // Filter events to only those that fall within the selected month and year
    const filteredEvents = userEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });

    // Group the filtered events by week
    const eventsByWeek = groupEventsByWeek(filteredEvents);

    // Generate the report
    const reportContainer = document.getElementById("reportContainer");
    reportContainer.innerHTML = ""; // Clear previous report

    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>Week</th>
          <th>Events</th>
          <th>PTO Used</th>
        </tr>
      </thead>
      <tbody>
        ${eventsByWeek.map((week) => `
          <tr>
            <td>${week.weekStart}</td>
            <td>${week.events.join("<br>")}</td>
            <td>${week.pto}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    reportContainer.appendChild(table);

  } catch (error) {
    console.error("Error displaying report:", error);
  }
}

function groupEventsByWeek(events) {
  const weeks = {};

  events.forEach((event) => {
    // Get the start date of the week for the event's date
    const eventDate = new Date(event.date);
    const startOfWeek = getStartOfWeek(eventDate);
    const weekKey = `${startOfWeek.getFullYear()}-${startOfWeek.getMonth() + 1}-${startOfWeek.getDate()}`;

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        weekStart: `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`,
        events: [],
        pto: 0,
      };
    }

    // Add event to the week
    weeks[weekKey].events.push(`${event.eventType}: ${event.details.description}`);

    // Add PTO if this event has PTO assigned
    weeks[weekKey].pto += event.details.pto || 0;
  });

  return Object.values(weeks); // Return the weeks as an array
}

function getStartOfWeek(date) {
  const startDate = new Date(date);
  const dayOfWeek = startDate.getDay();
  const diff = startDate.getDate() - dayOfWeek + (dayOfWeek == 0 ? -6 : 1); // Adjust if it's Sunday
  startDate.setDate(diff);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
}

document.getElementById("monthSelector").addEventListener("change", () => {
  const userId = document.getElementById("reportUserDropdown").value;
  if (userId) {
    displayReport(userId); // Re-fetch the report data based on the selected month
  }
});

document.getElementById("yearSelector").addEventListener("change", () => {
  const userId = document.getElementById("reportUserDropdown").value;
  if (userId) {
    displayReport(userId); // Re-fetch the report data based on the selected year
  }
});

document.addEventListener("DOMContentLoaded", () => {
  populateUserDropdownForReport();  // Populate the user dropdown for the report
  
  // Populate the year selector (e.g., for the last 5 years)
  const currentYear = new Date().getFullYear();
  const yearSelector = document.getElementById("yearSelector");
  for (let year = currentYear - 5; year <= currentYear + 1; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelector.appendChild(option);
  }

  // Set the default year
  yearSelector.value = currentYear;
});
