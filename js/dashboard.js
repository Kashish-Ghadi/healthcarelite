const deviceId = "A4F00F5AC2E8";

let chart;


/* -------- CHECK FIREBASE CONNECTION -------- */

console.log("Firebase connected:", firebase.app().name);


/* -------- LATEST SENSOR DATA -------- */

firebase.database()
.ref("devices/" + deviceId + "/latest")
.on("value", function(snapshot){

const d = snapshot.val();

console.log("LATEST DATA:", d);

if(!d){

console.log("No latest data found");

return;

}

document.getElementById("hr").innerText =
d.hr ?? "--";

document.getElementById("spo2").innerText =
d.spo2 ?? "--";

document.getElementById("temp").innerText =
d.tempC ?? "--";

document.getElementById("ecg").innerText =
d.ecgRaw ?? "--";

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

firebase.database()
.ref("health_monitoring")
.limitToLast(1)
.on("value", function(snapshot){

const data = snapshot.val();

console.log("HEALTH DATA:", data);

if(!data) return;

const latest =
Object.values(data)[0];

document.getElementById("bodyTemp").innerText =
latest.bodyTemperature ?? "--";

const accel = Math.sqrt(

(latest.accelX || 0) ** 2 +
(latest.accelY || 0) ** 2 +
(latest.accelZ || 0) ** 2

).toFixed(2);

document.getElementById("accel").innerText =
accel;

});



/* -------- GRAPH -------- */

firebase.database()
.ref("devices/" + deviceId + "/logs")
.limitToLast(10)
.on("value", function(snapshot){

const logs = snapshot.val();

console.log("LOG DATA:", logs);

if(!logs) return;

const labels=[];
const hr=[];
const spo2=[];
const temp=[];

Object.values(logs).forEach(function(l){

labels.push(
new Date(l.ts_ms).toLocaleTimeString()
);

hr.push(l.hr);
spo2.push(l.spo2);
temp.push(l.tempC);

});

drawChart(labels, hr, spo2, temp);

});



/* -------- PREVIOUS RECORDS -------- */

firebase.database()
.ref("devices/" + deviceId + "/logs")
.limitToLast(5)
.on("value", function(snapshot){

const logs = snapshot.val();

const div =
document.getElementById("records");

div.innerHTML="";

if(!logs){

div.innerHTML="No previous records";

return;

}

Object.values(logs)
.reverse()
.forEach(function(r){

div.innerHTML += `

<div class="recordItem">

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

function drawChart(labels, hr, spo2, temp){

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