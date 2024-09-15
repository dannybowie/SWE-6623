var cal ={
    sMon : false,
    data : null,
    sDay : 0, sMth : 0, sYear : 0,

months : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"

],

days : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"

],

hMth : null, hYear : null, hWrap : null, hFormWrap : null, hForm : null, hfDate : null, hfTxt : null, hfDel : null, 

init : () => {
    cal.hMth = document.getElementById("calMonth");
    cal.hYear = document.getElementById("calYear");
    cal.hWrap = document.getElementById("calWrap");
    cal.hFormWrap = document.getElementById("calForm");
    cal.hForm = document.getElementById("calForm");
    cal.hfDate = document.getElementById("evtDate");
    cal.hfTxt = document.getElementById("evtTxt");
    cal.hfDel = document.getElementById("evtDel");


    let now = new Date(), nowMth = now.getMonth();
    cal.hYear.value = parseInt(now.getFullYear);
    for (let i=0; i<12; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = cal.months[i];
        if (i==nowMth) {opt.selected = true}; 
    }
    cal.data,hMth.appendChild(opt);
}

    cal.hMth.onchange = cal.draw;
    cal.hYear.onchange = cal.draw;
    document.getElementById("calBack").onclick = () => cal.pshift();
    document.getElementById("calNext").onclick = () => cal.pshift(1);
    cal.hForm.onsubmit = cal.save;
    document.getElementById("evtClose").onclick = () => cal.hFormWrap.close();
    cal.hfDel.onclick = cal.del;

    if (cal.sMon) {
        cal.days.push(cal.days.shift());
    }
    cal.draw();
},





};
window.onload = cal.init;    