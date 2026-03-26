// auto-detect deviceId

const devicesRef = db.ref("devices");

devicesRef.once("value", snapshot => {

const devices = snapshot.val();

if(!devices){

alert("No device data found in Firebase");

return;

}

// get first device id
const deviceId = Object.keys(devices)[0];

console.log("Detected device:", deviceId);

listenToDevice(deviceId);

});

function listenToDevice(deviceId){

const ref = db.ref("devices/"+deviceId+"/latest");

ref.on("value", snap => {

const d = snap.val();

if(!d) return;

document.getElementById("hr").innerText =
Math.round(d.hr);

document.getElementById("spo2").innerText =
d.spo2 + " %";

document.getElementById("temp").innerText =
d.tempC + " °C";

document.getElementById("fall").innerText =
d.fall ? "Detected ⚠" : "Normal";

});

}

function logout(){

auth.signOut();

window.location="login.html";

}