firebase.auth().onAuthStateChanged(user=>{
if(!user){
window.location.href="login.html";
return;
}
loadAllLogs();
});

let chart;
let timelineChart;
let allLogs=[];

function fixTime(t){
if(!t) return Date.now();
if(t.toString().length<=10) return t*1000;
return t;
}


// ================= LOAD DATA =================
function loadAllLogs(){

allLogs=[];

// DEVICE LOGS
db.ref("devices/A4F00F5AC2E8/logs").once("value",snap=>{
let data=snap.val();
if(data){
Object.values(data).forEach(r=>{
allLogs.push({
time:fixTime(r.ts_ms),
data:r,
type:"device"
});
});
}
});

// SENSOR LOGS
db.ref("health_monitoring").once("value",snap=>{
let data=snap.val();
if(data){
Object.values(data).forEach(r=>{
allLogs.push({
time:fixTime(r.ts_ms),
data:r,
type:"sensor"
});
});
}
});

// MANUAL RECORDS
db.ref("manualRecords").once("value",snap=>{
let data=snap.val();
if(data){
Object.values(data).forEach(r=>{
allLogs.push({
time:fixTime(r.timestamp),
data:r,
type:"manual"
});
}
}
displayLogs();
drawTimeline();
});
}


// ================= DISPLAY LIST =================
function displayLogs(){

allLogs.sort((a,b)=>b.time-a.time);

let html="";

allLogs.forEach((r,i)=>{
html+=`
<div class="card clickable" onclick="openLog(${i})">
<b>${new Date(r.time).toLocaleString("en-IN")}</b><br>
${r.type.toUpperCase()} RECORD
</div>
`;
});

document.getElementById("records").innerHTML=html;

}


// ================= OPEN POPUP =================
function openLog(i){

let r=allLogs[i];
let d=r.data;

let info="";
let labels=[];
let values=[];
let normal=[];


// helper
function check(val,n){
if(val==null) return "-";
if(val>n*1.2 || val<n*0.8){
return `<span style="color:red;font-weight:bold">${val}</span>`;
}
return val;
}


// HR
if(d.hr){
info+=`HR: ${check(d.hr,75)}<br>`;
labels.push("HR"); values.push(d.hr); normal.push(75);
}

// SPO2
if(d.spo2){
info+=`SpO2: ${check(d.spo2,98)}%<br>`;
labels.push("SpO2"); values.push(d.spo2); normal.push(98);
}

// TEMP
if(d.tempC){
info+=`Temp: ${check(d.tempC,37)}°C<br>`;
labels.push("Temp"); values.push(d.tempC); normal.push(37);
}

// BODY TEMP
if(d.bodyTemperature){
info+=`Body Temp: ${check(d.bodyTemperature,37)}<br>`;
labels.push("Body"); values.push(d.bodyTemperature); normal.push(37);
}

// ECG
if(d.ecgRaw || d.ecgValue){
info+=`ECG: ${d.ecgRaw || d.ecgValue}<br>`;
}

// ACCEL
if(d.accelX){
let mag=Math.sqrt(
d.accelX**2 + d.accelY**2 + d.accelZ**2
).toFixed(2);

info+=`Accel: ${mag}<br>`;
labels.push("Accel"); values.push(mag); normal.push(9.8);
}

document.getElementById("popupContent").innerHTML=info;
document.getElementById("popup").style.display="flex";

drawGraph(labels,values,normal,d.ecgRaw || d.ecgValue);
}


// ================= ECG + NORMAL GRAPH =================
function drawGraph(labels,data,normal,ecg){

if(chart) chart.destroy();

let ctx=document.getElementById("popupChart");

// ECG waveform
if(ecg){

let ecgData=[];
let x=[];

for(let i=0;i<100;i++){
ecgData.push(ecg + Math.sin(i/3)*20 + Math.random()*5);
x.push(i);
}

chart=new Chart(ctx,{
type:"line",
data:{
labels:x,
datasets:[{
label:"ECG Waveform",
data:ecgData,
tension:0.4
}]
}
});

return;
}


// NORMAL COMPARISON
chart=new Chart(ctx,{
type:"bar",
data:{
labels:labels,
datasets:[
{
label:"Your Value",
data:data,
backgroundColor:data.map((v,i)=>{
return (v>normal[i]*1.2 || v<normal[i]*0.8) ? "red":"blue";
})
},
{
label:"Normal",
data:normal
}
]
}
});
}


// ================= TIMELINE GRAPH =================
function drawTimeline(){

let time=[];
let hr=[];
let spo2=[];
let temp=[];

allLogs.sort((a,b)=>a.time-b.time);

allLogs.forEach(r=>{
time.push(new Date(r.time).toLocaleTimeString());

let d=r.data;

hr.push(d.hr || null);
spo2.push(d.spo2 || null);
temp.push(d.tempC || null);
});

if(timelineChart) timelineChart.destroy();

timelineChart=new Chart(
document.getElementById("timelineChart"),
{
type:"line",
data:{
labels:time,
datasets:[
{
label:"HR",
data:hr,
spanGaps:true
},
{
label:"SpO2",
data:spo2,
spanGaps:true
},
{
label:"Temp",
data:temp,
spanGaps:true
}
]
}
});
}


// ================= PDF EXPORT =================
function exportPDF(){

let content="Health Report\n\n";

allLogs.forEach(r=>{
content+=new Date(r.time).toLocaleString()+"\n";
content+=JSON.stringify(r.data,null,2)+"\n\n";
});

let blob=new Blob([content],{type:"text/plain"});
let link=document.createElement("a");

link.href=URL.createObjectURL(blob);
link.download="health_report.txt";
link.click();

}


// ================= CLOSE =================
function closePopup(){
document.getElementById("popup").style.display="none";
}