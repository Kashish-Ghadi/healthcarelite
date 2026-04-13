firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";

return;

}

loadManualRecords();

loadDeviceLogs();

loadHealthMonitoring();

});



function addCard(title,data){

const container=document.getElementById("records");

container.innerHTML += `

<div class="card">

<h3>${title}</h3>

${data}

</div>

`;

}



function loadManualRecords(){

db.ref("manualRecords")

.limitToLast(10)

.on("value",snap=>{

const data=snap.val();

if(!data) return;

Object.values(data).reverse().forEach(r=>{

addCard(

"Manual Record",

`

<p>BP: ${r.systolic}/${r.diastolic}</p>

<p>SpO2: ${r.spo2}%</p>

<p>Temp: ${r.temp}°C</p>

<p>${r.notes || ""}</p>

`

);

});

});

}



function loadDeviceLogs(){

db.ref("devices/A4F00F5AC2E8/logs")

.limitToLast(10)

.on("value",snap=>{

const data=snap.val();

if(!data) return;

Object.values(data).reverse().forEach(r=>{

addCard(

"Device Log",

`

<p>HR: ${r.hr}</p>

<p>SpO2: ${r.spo2}%</p>

<p>Temp: ${r.tempC}°C</p>

<p>ECG: ${r.ecgRaw}</p>

`

);

});

});

}



function loadHealthMonitoring(){

db.ref("health_monitoring")

.limitToLast(10)

.on("value",snap=>{

const data=snap.val();

if(!data) return;

Object.values(data).reverse().forEach(r=>{

addCard(

"Sensor Record",

`

<p>ECG: ${r.ecgValue}</p>

<p>Body Temp: ${r.bodyTemperature}</p>

<p>Accel X: ${r.accelX}</p>

<p>Accel Y: ${r.accelY}</p>

<p>Accel Z: ${r.accelZ}</p>

`

);

});

});

}