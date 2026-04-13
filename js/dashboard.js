firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";

}

});
const deviceId = "A4F00F5AC2E8";

console.log("STARTING DASHBOARD");

let chart;

/* CONNECT DATABASE DIRECTLY */

firebase.database()
.ref("devices/" + deviceId + "/latest")
.once("value")
.then(function(snapshot){

console.log("LATEST SNAPSHOT:", snapshot.val());

const d = snapshot.val();

if(!d){

alert("No data found in devices/latest");

return;

}

document.getElementById("hr").innerText = d.hr;
document.getElementById("spo2").innerText = d.spo2;
document.getElementById("temp").innerText = d.tempC;
document.getElementById("ecg").innerText = d.ecgRaw;

document.getElementById("status").innerText =
d.fall ? "Fall Detected" : "Normal";

});


/* HEALTH NODE */

firebase.database()
.ref("health_monitoring")
.once("value")
.then(function(snapshot){

console.log("HEALTH SNAPSHOT:", snapshot.val());

const data = snapshot.val();

if(!data) return;

const latest =
Object.values(data)[0];

document.getElementById("bodyTemp").innerText =
latest.bodyTemperature;

const accel =
Math.sqrt(
latest.accelX*latest.accelX +
latest.accelY*latest.accelY +
latest.accelZ*latest.accelZ
).toFixed(2);

document.getElementById("accel").innerText =
accel;

});


/* LOG GRAPH */

firebase.database()
.ref("devices/" + deviceId + "/logs")
.once("value")
.then(function(snapshot){

console.log("LOG SNAPSHOT:", snapshot.val());

const logs = snapshot.val();

if(!logs) return;

const labels=[];
const hr=[];
const spo2=[];
const temp=[];

Object.values(logs).forEach(function(l){

labels.push(l.ts_ms);

hr.push(l.hr);
spo2.push(l.spo2);
temp.push(l.tempC);

});

drawChart(labels, hr, spo2, temp);

});


function drawChart(labels, hr, spo2, temp){

const ctx =
document.getElementById("chart");

chart = new Chart(ctx,{

type:"line",

data:{
labels: labels,

datasets:[

{
label:"HR",
data: hr
},

{
label:"SpO2",
data: spo2
},

{
label:"Temp",
data: temp
}

]

}

});

}