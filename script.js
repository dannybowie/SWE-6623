var cal ={
    sMon : false,
    data : null,
    sDay : 0, sMth : 0, sYear : 0,

    //set month and days by name
months : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"

],

days : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"

],
//setting up html elements
hMth : null, hYear : null, hWrap : null, hFormWrap : null, hForm : null, hfDate : null, hfTxt : null, hfDel : null, 

init : () => {
    //get the HTML elements
    cal.hMth = document.getElementById("calMonth");
    cal.hYear = document.getElementById("calYear");
    cal.hWrap = document.getElementById("calWrap");
    cal.hFormWrap = document.getElementById("calForm");
    cal.hForm = document.getElementById("calForm");
    cal.hfDate = document.getElementById("evtDate");
    cal.hfTxt = document.getElementById("evtTxt");
    cal.hfDel = document.getElementById("evtDel");

    //ordering months and year
    let now = new Date(), nowMth = now.getMonth();
    cal.hYear.value = parseInt(now.getFullYear);
    for (let i=0; i<12; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = cal.months[i];
        if (i==nowMth) {opt.selected = true}; 
    
    cal.data,hMth.appendChild(opt);
    }

    //setting up clicks/controls
    cal.hMth.onchange = cal.draw;
    cal.hYear.onchange = cal.draw;
    document.getElementById("calBack").onclick = () => cal.monthNext();
    document.getElementById("calNext").onclick = () => cal.monthNext(1);
    cal.hForm.onsubmit = cal.save;
    document.getElementById("evtClose").onclick = () => cal.hFormWrap.close();
    cal.hfDel.onclick = cal.del;

    //initialize drawing of calendar
    if (cal.sMon) {
        cal.days.push(cal.days.shift());
    }
    cal.draw();
},

//change month
monthNext : forward => {
    cal.sMth = parseInt(cal.hMth.value);
    cal.sYear = parent(cal.hYear.value);
    if (forward) {
        cal.sMth++;
    } else {
        cal.sMth--;
    }
    if (cal.sMth > 11) { calsMth = 0; cal.sYear++;}
    if (cal.sMth < 0) {calsMth = 11; cal.sYear--;}
    cal.hMth.value = cal.sMth;
    cal.hYear.value = cal.sYear;
    cal.draw()
    },

//draw selected month
draw : () => {
    cal.sMth = parseInt(cal.hMth.value);
    cal.sYear = parseInt(cal.hYear.value);
    let daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), 
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(),
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(),
        now = new Date(),
        nowMth = now.getMonth(),
        nowYear = parseInt(now.getFullYear()),
        nowDay = cal.smth==nowMth && cal.sYear==nowYear ? now.getDate() : null ; 

        //Load info from local storage
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
        localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}")
        cal.data = {};
    } else {
        cal.data = JSON.parse(cal.data); 
    }

//start the squares
//blank squares of start of month














}


};
window.onload = cal.init;  

