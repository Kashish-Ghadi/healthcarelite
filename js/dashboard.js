let chart;

const deviceId = "A4F00F5AC2E8";

/* graph arrays */
let bpData=[];
let spo2Data=[];
let tempData=[];
let labels=[];


/* ---------------- LIVE SENSOR DATA ---------------- */

function loadLiveData(){

const ref =
firebase.database()
.ref("devices/"+deviceId+"/latest");

ref.on("value", snapshot => {

const d = snapshot.val();

if(!d) return;


/* update cards */

document.querySelector("#spo2Stat")
.innerText =
Math.round(d.spo2 || 0) + " %";


document.querySelector("#tempStat")
.innerText =
(d.tempC || 0) + " °C";


/* status */

if(d.fall){

document.querySelector("#statusStat")
.innerText = "Check Required";

document.querySelector("#statusStat")
.style.color="red";

}
else{

document.querySelector("#statusStat")
.innerText = "Normal";

document.querySelector("#statusStat")
.style.color="green";

}

});

}


/* ---------------- LOAD GRAPH FROM ESP LOGS ---------------- */

function loadGraph(){

const logsRef =
firebase.database()
.ref("devices/"+deviceId+"/logs");

logsRef.limitToLast(10)
.on("value", snapshot => {

const logs = snapshot.val();

if(!logs) return;


/* reset arrays */

bpData=[];
spo2Data=[];
tempData=[];
labels=[];


/* convert object → array */

const entries =
Object.entries(logs);


/* sort by timestamp */

entries.sort((a,b)=>{

return a[1].ts_ms - b[1].ts_ms;

});


entries.forEach(item => {

const r = item[1];


/* simulate BP using HR */

bpData.push(
Math.round(r.hr/1.5)
);


spo2Data.push(
r.spo2
);


tempData.push(
r.tempC
);


labels.push(
new Date(r.ts_ms)
.toLocaleDateString()
);

});


drawChart();

showRecentRecords(entries);

});

}


/* ---------------- DRAW CHART ---------------- */

function drawChart(){

const ctx =
document.getElementById("healthChart");

if(chart) chart.destroy();

chart = new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{
label:"Blood Pressure (Sys)",
data:bpData
},

{
label:"SpO₂",
data:spo2Data
},

{
label:"Temperature",
data:tempData
}

]

}

});

}


/* ---------------- SHOW RECENT RECORDS ---------------- */

function showRecentRecords(entries){

const container =
document.getElementById("recentRecords");

container.innerHTML="";


entries.reverse().forEach(item => {

const r=item[1];

const div =
document.createElement("div");

div.className="recordCard";


div.innerHTML = `

<div class="recordHeader">

${new Date(r.ts_ms)
.toLocaleString()}

<span class="badge">

Check Required

</span>

</div>


<div class="recordValues">

BP:
${Math.round(r.hr/1.5)}/85 mmHg


SpO₂:
${r.spo2}%


Temp:
${r.tempC}°C

</div>

`;

container.appendChild(div);

});

}


/* ---------------- START ---------------- */

loadLiveData();

loadGraph();