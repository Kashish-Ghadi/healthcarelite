let chart;

const devicesRef = db.ref("devices");

let hrData=[];
let spo2Data=[];
let tempData=[];
let labels=[];

devicesRef.once("value", snapshot => {

const devices = snapshot.val();

if(!devices){

alert("No device found");

return;

}

const deviceId = Object.keys(devices)[0];

console.log("Device:",deviceId);

listenLive(deviceId);
loadGraph(deviceId);

});

function listenLive(deviceId){

const ref=db.ref("devices/"+deviceId+"/latest");

ref.on("value", snap=>{

const d=snap.val();

if(!d) return;

document.getElementById("hr").innerText=Math.round(d.hr);

document.getElementById("spo2").innerText=d.spo2+"%";

document.getElementById("temp").innerText=d.tempC+"°C";

if(d.fall){

document.getElementById("status").innerText="Fall detected";

document.getElementById("status").style.color="red";

showAlert();

}else{

document.getElementById("status").innerText="Normal";

document.getElementById("status").style.color="green";

}

});

}

function loadGraph(deviceId){

const logsRef=db.ref("devices/"+deviceId+"/logs");

logsRef.limitToLast(10).on("value", snap=>{

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

labels.push(new Date(l.ts_ms).toLocaleTimeString());

});

drawChart();

});

}

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

data:hrData,

borderWidth:2

},

{

label:"SpO2",

data:spo2Data,

borderWidth:2

},

{

label:"Temperature",

data:tempData,

borderWidth:2

}

]

}

});

}

function showAlert(){

alert("⚠ FALL DETECTED");

}