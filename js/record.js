function saveRecord(){

const data={

sys:document.getElementById("sys").value,

dia:document.getElementById("dia").value,

spo2:document.getElementById("spo2").value,

temp:document.getElementById("temp").value,

time:Date.now()

}

db.ref("manualRecords").push(data);

alert("saved")

}