// AUTH CHECK
firebase.auth().onAuthStateChanged(user=>{
if(!user){
window.location.href="login.html";
}
});


function saveRecord(){

let systolic = document.getElementById("systolic").value;
let diastolic = document.getElementById("diastolic").value;
let spo2 = document.getElementById("spo2").value;
let temp = document.getElementById("temp").value;
let notes = document.getElementById("notes").value;

// BASIC VALIDATION
if(!systolic || !diastolic || !spo2 || !temp){
alert("Please fill all required fields");
return;
}

// SAVE TO FIREBASE
db.ref("manualRecords").push({

systolic: Number(systolic),
diastolic: Number(diastolic),
spo2: Number(spo2),
temp: Number(temp),

notes: notes || "", // ✅ FIXED (always saved)

timestamp: Date.now()

})
.then(()=>{

alert("Record saved successfully!");

// CLEAR FORM
document.getElementById("systolic").value = "";
document.getElementById("diastolic").value = "";
document.getElementById("spo2").value = "";
document.getElementById("temp").value = "";
document.getElementById("notes").value = "";

})
.catch(err=>{
console.error(err);
alert("Error saving record");
});

}