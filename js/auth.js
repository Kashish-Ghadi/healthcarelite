function signup(){

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

firebase.auth()
.createUserWithEmailAndPassword(email,password)

.then(()=>{

alert("Account created");

window.location.href="dashboard.html";

})

.catch(error=>{

alert(error.message);

});

}



function login(){

const email =
document.getElementById("email").value;

const password =
document.getElementById("password").value;

firebase.auth()
.signInWithEmailAndPassword(email,password)

.then(()=>{

window.location.href="dashboard.html";

})

.catch(error=>{

alert(error.message);

});

}



function showPassword(){

document.getElementById("password").type="text";

}

function hidePassword(){

document.getElementById("password").type="password";

}