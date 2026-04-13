function loadNavbar(){

firebase.auth().onAuthStateChanged(user=>{

if(!user){

window.location.href="login.html";

return;

}

const navbar = `

<div class="nav">

<div class="logo">

Health Monitor

</div>


<div class="menu">

<a href="dashboard.html">Dashboard</a>

<a href="add-record.html">Add Record</a>

<a href="emergency.html">Emergency</a>

<a href="records.html">Records</a>


<span class="userEmail">

${user.email}

</span>


<button onclick="logout()" class="logoutBtn">

Logout

</button>


</div>

</div>

`;

document.body.insertAdjacentHTML("afterbegin", navbar);

});

}


function logout(){

firebase.auth().signOut()

.then(()=>{

window.location.href="login.html";

});

}