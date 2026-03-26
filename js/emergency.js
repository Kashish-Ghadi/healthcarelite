const contactsRef = db.ref("emergencyContacts");

function addContact(){

const contact = {

type: document.getElementById("type").value,

name: document.getElementById("name").value,

phone: document.getElementById("phone").value,

address: document.getElementById("address").value

};

contactsRef.push(contact);

alert("Contact added");

}

contactsRef.on("value", snapshot => {

const data = snapshot.val();

let html="";

for(let id in data){

const c=data[id];

html+=`

<div style="padding:10px;border-bottom:1px solid #eee">

<b>${c.name}</b><br>

${c.type}<br>

${c.phone}<br>

${c.address}

</div>

`;

}

document.getElementById("contactList").innerHTML=html;

});