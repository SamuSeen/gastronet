document.head.appendChild(
    Object.assign(document.createElement("script"), { src: "js/push.js" })
);
//import js/push.js
//Loging in logging out logic
var loginPopup = document.getElementById("loginPopup");
function showLoginPopup() {
    loginPopup.hidden=false
}
function closeLoginPopup() {
    loginPopup.hidden=true
}
/**
 * Wykonuje procedury związane z rejestracją
 */
function registerUser() {
    var uidText = document.getElementById("uidText").value;
    setCookie("uid",uidText,365);
    subscribeToPush();
    console.log("Registered phone login:", uidText);
    notifyMe();
    closeLoginPopup();
    updateUI();
}

function logoutUser() {
    removeCookie("uid");
    unsubscribeFromPush();
    updateUI();
}

/**
 * aktualizacja ui
 */
function updateUI(){
    const user = getCookie("uid");

    //stan przycisków login/logout
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");
    if (user !== null) {
        loginLink.hidden = true;
        logoutLink.hidden = false;
    } else {
        loginLink.hidden = false;
        logoutLink.hidden = true;
    }
}