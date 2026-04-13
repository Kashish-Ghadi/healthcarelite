let chart;

const deviceId = "A4F00F5AC2E8";


/* arrays for graph */

let hrData=[];
let spo2Data=[];
let tempData=[];
let labels=[];


/* ---------------- LOAD LIVE DATA ---------------- */

function loadLatest(){

firebase.database()

.ref("devices/"+deviceId+"/latest")

.on("value", snap => {

const d = snap.val();

if(!d) return;


/* update cards */

document.getElementById("hr").innerText =
d.hr ? Math.round(d.hr) : "--";


document.getElementById("spo2").innerText =
d.spo2 ? d.spo2 + "%" : "--";


document.getElementById("temp").innerText =
d.tempC ? d.tempC + "°C" : "--";


/* status */

if(d.fall){

document.getElementById("status").innerText =
"Check Required";

document.getElementById("status").style.color="red";

}

else{

document.getElementById("status").innerText =
"Normal";

document.getElementById("status").style.color="green";

}

});

}



/* ---------------- LOAD LOG HISTORY ---------------- */

function loadLogs(){

firebase.database()

.ref("devices/"+deviceId+"/logs")

.limitToLast(20)

.on("value", snap => {

const logs = snap.val();

if(!logs){

console.log("no logs found");

return;

}


hrData=[];
spo2Data=[];
tempData=[];
labels=[];


/* convert object → array */

const entries = Object.entries(logs);


/* sort by timestamp */

entries.sort((a,b)=>

a[1].ts_ms - b[1].ts_ms

);


/* fill arrays */

entries.forEach(item => {

const r=item[1];


hrData.push(Number(r.hr||0));

spo2Data.push(Number(r.spo2||0));

tempData.push(Number(r.tempC||0));


labels.push(

new Date(r.ts_ms)

.toLocaleTimeString()

);

});


drawChart();

displayRecords(entries);

});

}



/* ---------------- LOAD EXTRA SENSOR DATA ---------------- */

function loadExtra(){

firebase.database()

.ref("health_monitoring")

.limitToLast(1)

.on("value", snap => {

const data = snap.val();

if(!data) return;


const key = Object.keys(data)[0];

const d = data[key];


/* update cards */

document.getElementById("ecg").innerText =
d.ecgValue || "--";


document.getElementById("bodyTemp").innerText =
d.bodyTemperature || "--";


document.getElementById("accel").innerText =
Number(d.accelX||0).toFixed(1);

});

}



/* ---------------- DRAW GRAPH ---------------- */

function drawChart(){

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
data:hrData,
borderWidth:2
},

{
label:"SpO₂",
data:spo2Data,
borderWidth:2
},

{
label:"Temperature",
data:tempData,
borderWidth:2
}

]

},

options:{

responsive:true,

plugins:{
legend:{
position:"bottom"
}
}

}

});

}



/* ---------------- SHOW RECORD LIST ---------------- */

function displayRecords(entries){

const container =
document.getElementById("records");

container.innerHTML="";


entries.reverse().forEach(item=>{

const r=item[1];


const div=document.createElement("div");

div.className="recordItem";


div.innerHTML=`

<div>

<b>

${new Date(r.ts_ms)

.toLocaleString()}

</b>

</div>


<div>

HR:
${Math.round(r.hr)}

|

SpO₂:
${r.spo2}%

|

Temp:
${r.tempC}°C

</div>

`;

container.appendChild(div);

});

}



/* ---------------- START ---------------- */

loadLatest();

loadLogs();

loadExtra();