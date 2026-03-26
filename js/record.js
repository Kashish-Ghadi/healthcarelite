const recordsRef = db.ref("manualRecords");

function saveRecord(){

const record = {

systolic: document.getElementById("sys").value,

diastolic: document.getElementById("dia").value,

spo2: document.getElementById("spo2Input").value,

temp: document.getElementById("tempInput").value,

notes: document.getElementById("notes").value,

timestamp: Date.now()

};

recordsRef.push(record);

alert("Record saved");

}