firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";
return;

}

loadAllLogs();

});


let chart;


function fixTime(t){

if(!t) return Date.now();

if(t.toString().length<=10) return t*1000;

return t;

}


function loadAllLogs(){

let all=[];


// device logs

db.ref("devices/A4F00F5AC2E8/logs").once("value",snap=>{

let data=snap.val();

if(data){

Object.values(data).forEach(r=>{

all.push({

time:fixTime(r.ts_ms),

data:r,

type:"device"

});

});

}

});


// sensor logs

db.ref("health_monitoring").once("value",snap=>{

let data=snap.val();

if(data){

Object.values(data).forEach(r=>{

all.push({

time:fixTime(r.ts_ms),

data:r,

type:"sensor"

});

});

}

});


// manual

db.ref("manualRecords").once("value",snap=>{

let data=snap.val();

if(data){

Object.values(data).forEach(r=>{

all.push({

time:fixTime(r.timestamp),

data:r,

type:"manual"

});

});

}


display(all);

});

}


function display(arr){

arr.sort((a,b)=>b.time-a.time);

window.logs=arr;


let html="";

arr.forEach((r,i)=>{

html+=`

<div class="card clickable"

onclick="openLog(${i})">

<b>

${new Date(r.time).toLocaleString("en-IN")}

</b>

<br>

${r.type.toUpperCase()} RECORD

</div>

`;

});


document.getElementById("records").innerHTML=html;

}



function openLog(i){

let r=logs[i];

let d=r.data;


let labels=[];

let values=[];

let normal=[];

let info="";


// HEART RATE

if(d.hr){

labels.push("Heart Rate");

values.push(d.hr);

normal.push(75);

info+=`Heart Rate: ${d.hr}<br>`;

}


// SPO2

if(d.spo2){

labels.push("SpO2");

values.push(d.spo2);

normal.push(98);

info+=`SpO2: ${d.spo2}%<br>`;

}


// TEMP C

if(d.tempC){

labels.push("Temp °C");

values.push(d.tempC);

normal.push(37);

info+=`Temp: ${d.tempC}°C<br>`;

}


// BODY TEMP

if(d.bodyTemperature){

labels.push("Body Temp");

values.push(d.bodyTemperature);

normal.push(37);

info+=`Body Temp: ${d.bodyTemperature}<br>`;

}


// ECG

if(d.ecgValue){

info+=`ECG: ${d.ecgValue}<br>`;

}


// BP

if(d.systolic){

info+=`BP: ${d.systolic}/${d.diastolic}<br>`;

}


// ACCEL

if(d.accelX){

let magnitude=Math.sqrt(

d.accelX*d.accelX+

d.accelY*d.accelY+

d.accelZ*d.accelZ

).toFixed(2);

labels.push("Accel");

values.push(magnitude);

normal.push(9.8);

info+=`Accel magnitude: ${magnitude}<br>`;

}


// FALL

if(d.fall){

info+=`Fall detected<br>`;

}


document.getElementById("popupContent").innerHTML=info;

document.getElementById("popup").style.display="flex";


draw(labels,values,normal);

}



function draw(labels,data,normal){

if(chart) chart.destroy();


chart=new Chart(

document.getElementById("popupChart"),

{

type:"bar",

data:{

labels:labels,

datasets:[

{

label:"Your Value",

data:data

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