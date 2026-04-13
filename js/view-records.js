firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";
return;

}

loadAllLogs();

});


let chart;



function parseTime(value){

if(!value) return Date.now();


// if seconds convert to ms
if(value.toString().length<=10){

return value*1000;

}

return value;

}



function loadAllLogs(){

let combined=[];


// DEVICE LOGS

db.ref("devices/A4F00F5AC2E8/logs")

.once("value",snap=>{

const logs=snap.val();

if(logs){

Object.values(logs).forEach(l=>{

combined.push({

source:"device",

time:parseTime(l.ts_ms),

data:l

});

});

}

});



// SENSOR LOGS

db.ref("health_monitoring")

.once("value",snap=>{

const logs=snap.val();

if(logs){

Object.values(logs).forEach(l=>{

combined.push({

source:"sensor",

time:parseTime(l.ts_ms),

data:l

});

});

}

});



// MANUAL RECORDS

db.ref("manualRecords")

.once("value",snap=>{

const logs=snap.val();

if(logs){

Object.values(logs).forEach(l=>{

combined.push({

source:"manual",

time:parseTime(l.timestamp),

data:l

});

});

}


showLogs(combined);

});

}



function showLogs(list){

list.sort((a,b)=> b.time-a.time);


const container=document.getElementById("records");

container.innerHTML="";


list.forEach((log,i)=>{

const date=new Date(log.time)

.toLocaleString("en-IN",{

day:"2-digit",

month:"2-digit",

year:"numeric",

hour:"2-digit",

minute:"2-digit"

});


container.innerHTML+=`

<div class="card clickable"

onclick="openPopup(${i})">

<b>${date}</b>

<br>

${log.source.toUpperCase()} RECORD

</div>

`;

});


window.allLogs=list;

}



function openPopup(i){

const log=window.allLogs[i];

const d=log.data;


let html="";

let labels=[];

let actual=[];

let normal=[];



// DEVICE

if(log.source==="device"){

html=`

Heart Rate: ${d.hr}<br>

SpO2: ${d.spo2}%<br>

Temp: ${d.tempC}°C<br>

ECG Raw: ${d.ecgRaw}<br>

Fall: ${d.fall}

`;

labels=["HR","SpO2","Temp"];

actual=[d.hr,d.spo2,d.tempC];

normal=[75,98,37];

}



// SENSOR

if(log.source==="sensor"){

html=`

ECG Value: ${d.ecgValue}<br>

Body Temp: ${d.bodyTemperature}<br>

Accel X: ${d.accelX}<br>

Accel Y: ${d.accelY}<br>

Accel Z: ${d.accelZ}

`;

labels=["Body Temp"];

actual=[d.bodyTemperature];

normal=[37];

}



// MANUAL

if(log.source==="manual"){

html=`

BP: ${d.systolic}/${d.diastolic}<br>

SpO2: ${d.spo2}%<br>

Temp: ${d.temp}°C<br>

Notes: ${d.notes}

`;

labels=["SpO2","Temp"];

actual=[d.spo2,d.temp];

normal=[98,37];

}



document.getElementById("popupContent").innerHTML=html;

document.getElementById("popup").style.display="flex";


drawChart(labels,actual,normal);

}



function drawChart(labels,actual,normal){

const ctx=document.getElementById("popupChart");


if(chart) chart.destroy();


chart=new Chart(ctx,{

type:"bar",

data:{

labels:labels,

datasets:[

{

label:"Your Value",

data:actual

},

{

label:"Normal",

data:normal

}

]

},

options:{

responsive:true,

plugins:{

legend:{position:"bottom"}

}

}

});

}



function closePopup(){

document.getElementById("popup").style.display="none";

}