const deviceId = "A4F00F5AC2E8";

let chart;

/* REFERENCES */

const latestRef =
db.ref("devices/"+deviceId+"/latest");

const logsRef =
db.ref("devices/"+deviceId+"/logs");

const healthRef =
db.ref("health_monitoring");

/* LIVE SENSOR VALUES */

latestRef.on("value", snap => {

const d = snap.val();

if(!d) return;

document.getElementById("hr").innerText =
d.hr || "--";

document.getElementById("spo2").innerText =
d.spo2 ? d.spo2+"%" : "--";

document.getElementById("temp").innerText =
d.tempC ? d.tempC+"°C" : "--";

document.getElementById("ecg").innerText =
d.ecgRaw || "--";

if(d.fall){

document.getElementById("status").innerText =
"Fall Detected";

document.getElementById("status").style.color =
"red";

}
else{

document.getElementById("status").innerText =
"Normal";

document.getElementById("status").style.color =
"green";

}

});

/* BODY TEMP + ACCEL DATA */

healthRef.limitToLast(1).on("value", snap => {

const data = snap.val();

if(!data) return;

const latest =
Object.values(data)[0];

document.getElementById("bodyTemp").innerText =
latest.bodyTemperature
? latest.bodyTemperature+"°C"
: "--";

const accel =
Math.sqrt(

latest.accelX**2 +

latest.accelY**2 +

latest.accelZ**2

).toFixed(2);

document.getElementById("accel").innerText =
accel;

});

/* GRAPH */

logsRef.limitToLast(10).on("value", snap => {

const logs = snap.val();

if(!logs) return;

const hrData=[];
const spo2Data=[];
const tempData=[];
const labels=[];

Object.values(logs).forEach(l=>{

hrData.push(l.hr);

spo2Data.push(l.spo2);

tempData.push(l.tempC);

labels.push(

new Date(l.ts_ms).toLocaleTimeString()

);

});

drawChart(

labels,

hrData,

spo2Data,

tempData

);

});

/* RECORD LIST */

logsRef.limitToLast(5).on("value", snap => {

const logs = snap.val();

const div =
document.getElementById("records");

div.innerHTML="";

if(!logs) return;

Object.values(logs)

.reverse()

.forEach(l=>{

div.innerHTML+=`

<div class="recordItem">

${new Date(l.ts_ms).toLocaleString()}<br>

HR: ${l.hr}

|

SpO2: ${l.spo2}

|

Temp: ${l.tempC}

</div>

`;

});

});

/* CHART FUNCTION */

function drawChart(

labels,

hr,

spo2,

temp

){

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

/* LOGOUT */

function logout(){

window.location.href="login.html";

}