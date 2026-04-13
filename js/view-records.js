firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";
return;

}

loadAllLogs();

});



let chart;



function loadAllLogs(){

let allLogs=[];


// manual

db.ref("manualRecords")

.once("value",snap=>{

const data=snap.val();

if(data){

Object.values(data).forEach(r=>{

allLogs.push({

type:"Manual",

time:r.timestamp,

data:r

});

});

}

});



// device

db.ref("devices/A4F00F5AC2E8/logs")

.once("value",snap=>{

const data=snap.val();

if(data){

Object.values(data).forEach(r=>{

allLogs.push({

type:"Vitals",

time:r.ts_ms,

data:r

});

});

}

});



// sensors

db.ref("health_monitoring")

.once("value",snap=>{

const data=snap.val();

if(data){

Object.values(data).forEach(r=>{

allLogs.push({

type:"Sensors",

time:r.ts_ms,

data:r

});

});

}


displayLogs(allLogs);

});

}



function displayLogs(logs){

logs.sort((a,b)=> b.time-a.time);


const container=document.getElementById("records");

container.innerHTML="";


logs.forEach((log,index)=>{


const date=new Date(log.time).toLocaleString();


container.innerHTML+=`

<div class="card clickable"

onclick="showDetails(${index})">

<strong>${date}</strong>

<br>

${log.type} Record

</div>

`;

});


window.allLogs=logs;

}



function showDetails(i){

const log=window.allLogs[i];

const d=log.data;


let html=``;


let actual=[];

let normal=[];

let labels=[];



if(log.type==="Vitals"){

html=`

Heart Rate: ${d.hr}<br>

SpO2: ${d.spo2}%<br>

Temp: ${d.tempC}°C<br>

ECG: ${d.ecgRaw}

`;

labels=["HR","SpO2","Temp"];

actual=[d.hr,d.spo2,d.tempC];

normal=[75,98,37];

}



if(log.type==="Sensors"){

html=`

ECG: ${d.ecgValue}<br>

Body Temp: ${d.bodyTemperature}<br>

Accel X: ${d.accelX}<br>

Accel Y: ${d.accelY}<br>

Accel Z: ${d.accelZ}

`;

labels=["Temp"];

actual=[d.bodyTemperature];

normal=[37];

}



if(log.type==="Manual"){

html=`

BP: ${d.systolic}/${d.diastolic}<br>

SpO2: ${d.spo2}%<br>

Temp: ${d.temp}°C

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

}

});

}



function closePopup(){

document.getElementById("popup").style.display="none";

}