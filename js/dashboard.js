const deviceId = "A4F00F5AC2E8";

let chart;


/* -------- LATEST SENSOR DATA -------- */

db.ref("devices/"+deviceId+"/latest")
.on("value", snap => {

const d = snap.val();

console.log("latest:", d);

if(!d) return;

document.getElementById("hr").innerText =
Math.round(d.hr);

document.getElementById("spo2").innerText =
d.spo2 + " %";

document.getElementById("temp").innerText =
d.tempC + " °C";

document.getElementById("ecg").innerText =
d.ecgRaw;

if(d.fall){

document.getElementById("status").innerText =
"Fall Detected";

document.getElementById("status").style.color =
"red";

}else{

document.getElementById("status").innerText =
"Normal";

document.getElementById("status").style.color =
"green";

}

});



/* -------- BODY TEMP + ACCEL -------- */

db.ref("health_monitoring")
.limitToLast(1)
.on("value", snap => {

const data = snap.val();

console.log("health:", data);

if(!data) return;

const latest =
Object.values(data)[0];

document.getElementById("bodyTemp").innerText =
latest.bodyTemperature + " °C";

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

console.log("logs:", logs);

if(!logs) return;

const labels=[];
const hr=[];
const spo2=[];
const temp=[];

Object.values(logs).forEach(l=>{

labels.push(
new Date(l.ts_ms)
.toLocaleTimeString()
);

hr.push(l.hr);
spo2.push(l.spo2);
temp.push(l.tempC);

});

drawChart(labels, hr, spo2, temp);

});



/* -------- PREVIOUS RECORDS -------- */

db.ref("devices/"+deviceId+"/logs")
.limitToLast(5)
.on("value", snap => {

const logs = snap.val();

const div =
document.getElementById("records");

div.innerHTML="";

if(!logs) return;

Object.values(logs)
.reverse()
.forEach(r=>{

div.innerHTML += `

<div class="record">

${new Date(r.ts_ms).toLocaleString()}

<br>

HR: ${r.hr}

|

SpO2: ${r.spo2}

|

Temp: ${r.tempC}

</div>

`;

});

});



/* -------- CHART -------- */

function drawChart(

labels,
hr,
spo2,
temp

){

const ctx =
document.getElementById("chart");

if(chart) chart.destroy();

chart = new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{
label:"Heart Rate",
data:hr
},

{
label:"SpO2",
data:spo2
},

{
label:"Temperature",
data:temp
}

]

}

});

}