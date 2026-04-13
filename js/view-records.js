firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";
return;

}

loadAllLogs();

});


function loadAllLogs(){

let allLogs=[];


// manual records

db.ref("manualRecords")

.once("value",snap=>{

const data=snap.val();

if(data){

Object.values(data).forEach(r=>{

allLogs.push({

type:"Manual",

time:r.timestamp || Date.now(),

data:r

});

});

}

});



// device logs

db.ref("devices/A4F00F5AC2E8/logs")

.once("value",snap=>{

const data=snap.val();

if(data){

Object.values(data).forEach(r=>{

allLogs.push({

type:"Vitals",

time:r.ts_ms || Date.now(),

data:r

});

});

}

});




// sensor logs

db.ref("health_monitoring")

.once("value",snap=>{

const data=snap.val();

if(data){

Object.values(data).forEach(r=>{

allLogs.push({

type:"Sensors",

time:r.ts_ms || Date.now(),

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


let details="";


if(log.type==="Manual"){

details=`

BP: ${log.data.systolic}/${log.data.diastolic}

SpO2: ${log.data.spo2}%

Temp: ${log.data.temp}°C

Notes: ${log.data.notes || "-"}

`;

}


if(log.type==="Vitals"){

details=`

Heart Rate: ${log.data.hr}

SpO2: ${log.data.spo2}%

Temperature: ${log.data.tempC}°C

ECG Raw: ${log.data.ecgRaw}

Fall: ${log.data.fall}

`;

}


if(log.type==="Sensors"){

details=`

ECG Value: ${log.data.ecgValue}

Body Temp: ${log.data.bodyTemperature}

Accel X: ${log.data.accelX}

Accel Y: ${log.data.accelY}

Accel Z: ${log.data.accelZ}

`;

}


alert(details);

}