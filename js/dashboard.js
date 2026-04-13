const deviceId = "A4F00F5AC2E8";

let chart;

console.log("Dashboard loaded");

console.log("Firebase DB:", db);


/* -------- LATEST -------- */

db.ref("devices/"+deviceId+"/latest")
.on("value", snap => {

const d = snap.val();

console.log("LATEST:", d);

if(!d){

document.getElementById("hr").innerText="--";

return;

}

document.getElementById("hr").innerText=d.hr;

document.getElementById("spo2").innerText=d.spo2;

document.getElementById("temp").innerText=d.tempC;

document.getElementById("ecg").innerText=d.ecgRaw;

document.getElementById("status").innerText =
d.fall ? "Fall Detected" : "Normal";

});


/* -------- BODY TEMP -------- */

db.ref("health_monitoring")
.limitToLast(1)
.on("value", snap => {

const data = snap.val();

console.log("BODY:", data);

if(!data) return;

const latest =
Object.values(data)[0];

document.getElementById("bodyTemp").innerText =
latest.bodyTemperature;

const accel = Math.sqrt(

latest.accelX**2 +
latest.accelY**2 +
latest.accelZ**2

).toFixed(2);

document.getElementById("accel").innerText =
accel;

});


/* -------- GRAPH -------- */

db.ref("devices/"+deviceId+"/logs")
.limitToLast(10)
.on("value", snap => {

const logs = snap.val();

console.log("LOGS:", logs);

if(!logs) return;

const labels=[];
const hr=[];
const spo2=[];
const temp=[];

Object.values(logs).forEach(l=>{

labels.push(
new Date(l.ts_ms).toLocaleTimeString()
);

hr.push(l.hr);
spo2.push(l.spo2);
temp.push(l.tempC);

});

drawChart(labels, hr, spo2, temp);

});


/* -------- RECORDS -------- */

db.ref("devices/"+deviceId+"/logs")
.limitToLast(5)
.on("value", snap => {

const logs = snap.val();

const container =
document.getElementById("records");

container.innerHTML="";

if(!logs){

container.innerHTML="No data";

return;

}

Object.values(logs)
.reverse()
.forEach(r=>{

container.innerHTML += `

<div class="record">

${new Date(r.ts_ms).toLocaleString()}

<br>

HR ${r.hr}

SpO2 ${r.spo2}

Temp ${r.tempC}

</div>

`;

});

});


function drawChart(labels, hr, spo2, temp){

const ctx=document.getElementById("chart");

if(chart) chart.destroy();

chart=new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{label:"HR",data:hr},

{label:"SpO2",data:spo2},

{label:"Temp",data:temp}

]

}

});

}