let chart;

const deviceId = "A4F00F5AC2E8";


/* arrays */

let hrData=[];
let spo2Data=[];
let tempData=[];
let labels=[];


/* ---------------- LIVE DATA ---------------- */

function listenLive(){

const ref =
db.ref("devices/"+deviceId+"/latest");

ref.on("value", snap=>{

const d=snap.val();

if(!d) return;


/* update UI */

document.getElementById("hr")
.innerText = d.hr
? Math.round(d.hr)
: "--";


document.getElementById("spo2")
.innerText = d.spo2
? d.spo2 + "%"
: "--";


document.getElementById("temp")
.innerText = d.tempC
? d.tempC + "°C"
: "--";


/* fall detection */

if(d.fall){

document.getElementById("status")
.innerText = "Check Required";

document.getElementById("status")
.style.color = "red";

showAlert();

}
else{

document.getElementById("status")
.innerText = "Normal";

document.getElementById("status")
.style.color = "green";

}

});

}


/* ---------------- GRAPH ---------------- */

function loadGraph(){

const logsRef =
db.ref("devices/"+deviceId+"/logs");

logsRef.limitToLast(15)
.on("value", snap=>{

const logs=snap.val();

if(!logs) return;


hrData=[];
spo2Data=[];
tempData=[];
labels=[];


const entries =
Object.entries(logs);


/* sort */

entries.sort((a,b)=>{

return a[1].ts_ms - b[1].ts_ms;

});


entries.forEach(item=>{

const r=item[1];

hrData.push(Number(r.hr || 0));

spo2Data.push(Number(r.spo2 || 0));

tempData.push(Number(r.tempC || 0));


labels.push(

new Date(r.ts_ms)
.toLocaleTimeString()

);

});


drawChart();

showRecords(entries);

});

}


/* ---------------- EXTRA SENSOR ---------------- */

function loadExtra(){

const ref =
db.ref("health_monitoring");

ref.limitToLast(1)
.on("value", snap=>{

const data=snap.val();

if(!data) return;


const key=
Object.keys(data)[0];

const d=data[key];


/* update UI */

document.getElementById("ecg")
.innerText = d.ecgValue || "--";


document.getElementById("bodyTemp")
.innerText =
d.bodyTemperature || "--";


document.getElementById("accel")
.innerText =
Number(d.accelX || 0)
.toFixed(1);

});

}


/* ---------------- CHART ---------------- */

function drawChart(){

const ctx =
document.getElementById("chart");

if(chart) chart.destroy();

chart =
new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{
label:"Heart Rate",
data:hrData,
borderWidth:2
},

{
label:"SpO2",
data:spo2Data,
borderWidth:2
},

{
label:"Temperature",
data:tempData,
borderWidth:2
}

]

},

options:{

plugins:{
legend:{
position:"bottom"
}
}

}

});

}


/* ---------------- RECORD LIST ---------------- */

function showRecords(entries){

const container =
document.getElementById("records");

container.innerHTML="";


entries.reverse().forEach(item=>{

const r=item[1];

const div =
document.createElement("div");

div.className="recordItem";


div.innerHTML = `

<div>

${new Date(r.ts_ms)
.toLocaleString()}

</div>

<div>

HR:
${Math.round(r.hr)}

|
SpO2:
${r.spo2}%

|
Temp:
${r.tempC}°C

</div>

`;

container.appendChild(div);

});

}


/* ---------------- FALL ALERT ---------------- */

function showAlert(){

alert("⚠ Fall detected");

}


/* ---------------- START ---------------- */

listenLive();

loadGraph();

loadExtra();