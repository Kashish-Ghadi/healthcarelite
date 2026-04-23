// AUTH CHECK
firebase.auth().onAuthStateChanged(user=>{
if(!user){
window.location.href="login.html";
return;
}
loadAllLogs();
});

let allLogs = [];


/* ================= TIME FIX ================= */
function fixTime(t){
if(!t) return Date.now();
if(t < 1000000000000) t = t * 1000;
if(isNaN(new Date(t).getTime())) return Date.now();
return t;
}


/* ================= DATE ================= */
function formatDate(t){
let d = new Date(t);
return d.toLocaleDateString("en-IN", {
day:"2-digit",
month:"short",
year:"numeric"
});
}


/* ================= LOAD ================= */
function loadAllLogs(){

allLogs = [];

Promise.all([
db.ref("devices/A4F00F5AC2E8/logs").once("value"),
db.ref("health_monitoring").once("value"),
db.ref("manualRecords").once("value")
])
.then(([s1,s2,s3])=>{

[s1.val(), s2.val()].forEach(data=>{
if(data){
Object.values(data).forEach(r=>{
allLogs.push({
time: fixTime(r.ts_ms),
data:r,
type:"sensor"
});
});
}
});

if(s3.val()){
Object.values(s3.val()).forEach(r=>{
allLogs.push({
time: fixTime(r.timestamp),
data:r,
type:"manual"
});
});
}

displayLogs();

});

}


/* ================= DISPLAY ================= */
function displayLogs(){

allLogs.sort((a,b)=>b.time-a.time);

let sHTML="", mHTML="";

allLogs.forEach((r,i)=>{

let card = `
<div class="card clickable" onclick="openLog(${i})">
<b>${formatDate(r.time)}</b><br>
${r.type==="manual"?"User Entry":"Sensor Reading"}
</div>`;

if(r.type==="manual") mHTML+=card;
else sHTML+=card;

});

document.getElementById("sensorRecords").innerHTML=sHTML;
document.getElementById("manualRecords").innerHTML=mHTML;

}


/* ================= POPUP ================= */
function openLog(i){

let r = allLogs[i];
let d = r.data;

// ===== SAFE VALUES =====
let hr = d.hr ?? null;
let spo2 = d.spo2 ?? null;
let temp = d.tempC ?? d.bodyTemperature ?? null;
let ecg = d.ecgRaw ?? d.ecgValue ?? null;

// ===== TEXT DISPLAY (FIXED) =====
let info = "";

function highlight(val, normal){
if(val === null) return "-";
if(val > normal*1.2 || val < normal*0.8){
return `<span style="color:red;font-weight:600">${val}</span>`;
}
return val;
}

info += `Heart Rate: ${highlight(hr,75)}<br>`;
info += `SpO2: ${highlight(spo2,98)}<br>`;
info += `Temp: ${highlight(temp,37)} °C<br>`;
info += `ECG: ${ecg !== null ? ecg : "-"}<br>`;

if(d.systolic){
info += `BP: ${d.systolic}/${d.diastolic}<br>`;
}

if(d.notes){
info += `Notes: ${d.notes}<br>`;
}

document.getElementById("popupContent").innerHTML = info;
document.getElementById("popup").style.display = "flex";


// ===== DESTROY OLD CHARTS SAFELY =====
if (window.compareChart && typeof window.compareChart.destroy === "function") {
window.compareChart.destroy();
}

if (window.ecgChart && typeof window.ecgChart.destroy === "function") {
window.ecgChart.destroy();
}


// ===== ALWAYS SHOW NORMAL VALUES =====
let labels = ["HR","SpO2","Temp","ECG"];

let actual = [
hr !== null ? hr : null,
spo2 !== null ? spo2 : null,
temp !== null ? temp : null,
ecg !== null ? ecg : null
];

let normal = [75, 98, 37, 500];


// ===== COMPARISON CHART =====
let ctx1 = document.getElementById("compareChart");

if(ctx1){
window.compareChart = new Chart(ctx1, {
type: "bar",
data: {
labels: labels,
datasets: [
{
label: "Actual",
data: actual
},
{
label: "Normal",
data: normal
}
]
},
options: {
responsive: true
}
});
}


// ===== ECG WAVEFORM =====
if(ecg !== null){

let ctx2 = document.getElementById("ecgChart");

if(ctx2){

let wave = [];
for(let i=0;i<60;i++){
wave.push(ecg + Math.sin(i/3)*20);
}

window.ecgChart = new Chart(ctx2, {
type: "line",
data: {
labels: wave.map((_,i)=>i),
datasets: [{
label: "ECG Wave",
data: wave,
borderWidth: 2,
tension: 0.4,
pointRadius: 0
}]
},
options: {
responsive: true
}
});

}
}

}


/* ================= CLOSE ================= */
function closePopup(){
document.getElementById("popup").style.display="none";
}


/* ================= DROPDOWN ================= */
function toggleSection(id){
let el=document.getElementById(id);
el.style.display = (el.style.display==="block")?"none":"block";
}