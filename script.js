// script.js
const calendarContainer = document.querySelector('.calendar-container');
const monthYearElement = document.getElementById('month-year');
const calendarTable = document.getElementById('calendar-table');
const calendarBody = document.getElementById('calendar-body');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function renderCalendar(month, year) {
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYearElement.textContent = `${getMonthName(month)} ${year}`;

    calendarBody.innerHTML = '';

    for (let i = 0; i < firstDayOfWeek; i++) {
        const dayCell = document.createElement('td');
        dayCell.className = 'weekday';
        calendarBody.appendChild(dayCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('td');
        dayCell.textContent = day;

        if (new Date(year, month, day).toDateString() === new Date().toDateString()) {
            dayCell.classList.add('current-day');
        }

        calendarBody.appendChild(dayCell);

        if ((day + firstDayOfWeek) % 7 === 0) {
            calendarBody.appendChild(document.createElement('tr'));
        }
    }

    while (calendarBody.children.length < 42) {
        calendarBody.appendChild(document.createElement('td'));
    }
}

function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

function updateCalendar() {
    renderCalendar(currentMonth, currentYear);
}

renderCalendar(currentMonth, currentYear);

prevMonthButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    updateCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    updateCalendar();
});