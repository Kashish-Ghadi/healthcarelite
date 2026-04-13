const deviceId = "A4F00F5AC2E8";

let chart;

/* DATABASE PATHS */

const latestRef =
firebase.database().ref(
"devices/"+deviceId+"/latest"
);

const logsRef =
firebase.database().ref(
"devices/"+deviceId+"/logs"
);

const healthRef =
firebase.database().ref(
"health_monitoring"
);



/* LOAD LATEST SENSOR VALUES */

latestRef.on("value", snap => {

const data = snap.val();

console.log("LATEST:", data);

if(!data) return;

document.getElementById("hr").innerText =
data.hr ?? "--";

document.getElementById("spo2").innerText =
data.spo2 ?? "--";

document.getElementById("temp").innerText =
data.tempC ?? "--";

document.getElementById("ecg").innerText =
data.ecgRaw ?? "--";


if(data.fall){

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



/* LOAD BODY TEMP + ACCEL */

healthRef.limitToLast(1).on("value", snap => {

const data = snap.val();

console.log("HEALTH:", data);

if(!data) return;

const latest =
Object.values(data)[0];

document.getElementById("bodyTemp").innerText =
latest.bodyTemperature ?? "--";

const accel = Math.sqrt(

(latest.accelX ?? 0)**2 +
(latest.accelY ?? 0)**2 +
(latest.accelZ ?? 0)**2

).toFixed(2);

document.getElementById("accel").innerText =
accel;

});



/* LOAD GRAPH */

logsRef.limitToLast(10).on("value", snap => {

const logs = snap.val();

console.log("LOGS:", logs);

if(!logs) return;

const labels=[];
const hr=[];
const spo2=[];
const temp=[];

Object.values(logs).forEach(item => {

labels.push(
new Date(item.ts_ms).toLocaleTimeString()
);

hr.push(item.hr);
spo2.push(item.spo2);
temp.push(item.tempC);

});

drawChart(labels, hr, spo2, temp);

});



/* LOAD PREVIOUS RECORDS */

logsRef.limitToLast(5).on("value", snap => {

const logs = snap.val();

const container =
document.getElementById("records");

container.innerHTML="";

if(!logs) return;

Object.values(logs)
.reverse()
.forEach(item => {

container.innerHTML += `

<div class="recordItem">

${new Date(item.ts_ms).toLocaleString()}

<br>

HR: ${item.hr}

|

SpO2: ${item.spo2}

|

Temp: ${item.tempC}

</div>

`;

});

});



/* DRAW CHART */

function drawChart(

labels,
hr,
spo2,
temp

){

const ctx =
document.getElementById("chart");

if(chart) chart.destroy();

chart = new Chart(ctx, {

type: "line",

data: {

labels: labels,

datasets: [

{
label: "Heart Rate",
data: hr
},

{
label: "SpO2",
data: spo2
},

{
label: "Temperature",
data: temp
}

]

}

});

}



/* LOGOUT */

function logout(){

window.location.href =
"login.html";

}