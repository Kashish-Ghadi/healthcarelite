let chart;

/* your ESP32 device ID */
const deviceId = "A4F00F5AC2E8";

/* references */
const latestRef =
db.ref("devices/"+deviceId+"/latest");

const logsRef =
db.ref("devices/"+deviceId+"/logs");

/* arrays for graph */
let hrData=[];
let spo2Data=[];
let tempData=[];
let labels=[];

let alertShown=false;


/* LOAD LIVE SENSOR VALUES */
latestRef.on("value", snapshot => {

const d = snapshot.val();

if(!d){

console.log("No live data yet");

return;

}


/* update cards */

document.getElementById("hr").innerText =
d.hr ? Math.round(d.hr) : "--";

document.getElementById("spo2").innerText =
d.spo2 ? Math.round(d.spo2)+"%" : "--";

document.getElementById("temp").innerText =
d.tempC ? d.tempC.toFixed(1)+" °C" : "--";


/* fall status */

if(d.fall){

document.getElementById("status").innerText =
"FALL DETECTED";

document.getElementById("status").style.color="red";


if(!alertShown){

showAlert();

alertShown=true;

}

}
else{

document.getElementById("status").innerText =
"Normal";

document.getElementById("status").style.color="green";

alertShown=false;

}

});



/* LOAD PREVIOUS RECORDS */

logsRef.limitToLast(30).on("value", snapshot => {

const logs = snapshot.val();

if(!logs){

console.log("No log history yet");

return;

}


/* clear old arrays */

hrData=[];
spo2Data=[];
tempData=[];
labels=[];


/* sort timestamps */

const sortedKeys =
Object.keys(logs).sort();


sortedKeys.forEach(key => {

const l = logs[key];


/* push sensor values */

hrData.push(
l.hr ? Number(l.hr) : 0
);

spo2Data.push(
l.spo2 ? Number(l.spo2) : 0
);

tempData.push(
l.tempC ? Number(l.tempC) : 0
);


/* convert timestamp */

labels.push(

new Date(l.ts_ms)
.toLocaleTimeString()

);

});


drawChart();

});



/* DRAW GRAPH */

function drawChart(){

const ctx =
document.getElementById("chart");

if(!ctx) return;


/* destroy old chart */

if(chart){

chart.destroy();

}


/* create new chart */

chart =
new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{

label:"Heart Rate",

data:hrData,

borderWidth:2,

tension:0.4

},

{

label:"SpO2",

data:spo2Data,

borderWidth:2,

tension:0.4

},

{

label:"Temperature",

data:tempData,

borderWidth:2,

tension:0.4

}

]

},

options:{

responsive:true,

plugins:{

legend:{

display:true

}

},

scales:{

y:{

beginAtZero:false

}

}

}

});

}



/* FALL ALERT POPUP */

function showAlert(){

const popup =
document.createElement("div");

popup.innerHTML = `

<div style="

position:fixed;

top:20px;

right:20px;

background:#ff4d4d;

color:white;

padding:15px 20px;

border-radius:12px;

font-weight:bold;

box-shadow:0 6px 18px rgba(0,0,0,0.2);

z-index:9999;

">

⚠ FALL DETECTED

</div>

`;

document.body.appendChild(popup);


/* remove after 4 sec */

setTimeout(()=>{

popup.remove();

},4000);

}