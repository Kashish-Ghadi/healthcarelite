let chart;

const deviceId = "A4F00F5AC2E8";

const latestRef =
db.ref("devices/"+deviceId+"/latest");

const logsRef =
db.ref("devices/"+deviceId+"/logs");

const healthRef =
db.ref("health_monitoring");


let hrData=[];
let spo2Data=[];
let tempData=[];
let labels=[];



/* LIVE DATA */

latestRef.on("value",snap=>{

const d=snap.val();

if(!d) return;

document.getElementById("hr").innerText=
Math.round(d.hr);

document.getElementById("spo2").innerText=
d.spo2+"%";

document.getElementById("temp").innerText=
d.tempC+"°C";

document.getElementById("ecg").innerText=
d.ecgRaw;

if(d.fall){

document.getElementById("status").innerText=
"Fall Detected";

document.getElementById("status").style.color="red";

alert("⚠ FALL DETECTED");

}
else{

document.getElementById("status").innerText=
"Normal";

document.getElementById("status").style.color="green";

}

});



/* LOG GRAPH */

logsRef.limitToLast(10).on("value",snap=>{

const logs=snap.val();

if(!logs) return;

hrData=[];
spo2Data=[];
tempData=[];
labels=[];

Object.values(logs).forEach(l=>{

hrData.push(l.hr);

spo2Data.push(l.spo2);

tempData.push(l.tempC);

labels.push(
new Date(l.ts_ms).toLocaleTimeString()
);

});

drawChart();

});



/* BODY TEMP + ACCEL */

healthRef.limitToLast(1).on("value",snap=>{

const data=snap.val();

if(!data) return;

const latest=Object.values(data)[0];

document.getElementById("bodyTemp").innerText=
latest.bodyTemperature+"°C";

document.getElementById("accel").innerText=

Math.round(

Math.sqrt(
latest.accelX**2+
latest.accelY**2+
latest.accelZ**2
)

);

});



/* RECORD LIST */

logsRef.limitToLast(5).on("value",snap=>{

const logs=snap.val();

const div=document.getElementById("records");

div.innerHTML="";

if(!logs) return;

Object.values(logs).reverse().forEach(l=>{

div.innerHTML+=`

<div class="recordItem">

${new Date(l.ts_ms).toLocaleString()}<br>

HR ${l.hr}
|
SpO2 ${l.spo2}
|
Temp ${l.tempC}

</div>

`;

});

});



/* CHART */

function drawChart(){

const ctx=document.getElementById("chart");

if(chart) chart.destroy();

chart=new Chart(ctx,{

type:"line",

data:{

labels:labels,

datasets:[

{
label:"Heart Rate",
data:hrData
},

{
label:"SpO2",
data:spo2Data
},

{
label:"Temp",
data:tempData
}

]

}

});

}



function logout(){

window.location.href="login.html";

}