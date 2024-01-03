/**
 * Function to set a cookie
 * @param {String} name name of a cookie
 * @param {String} value value of a cookie
 * @param {Int} daysToExpire number of days when cookie's active
 */
function setCookie(name, value, daysToExpire) {
    var expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);
    var cookieValue = encodeURIComponent(value) + "; expires=" + expirationDate.toUTCString();
    document.cookie = name + "=" + cookieValue;
}
/**
 * Function to get a cookie value by name
 * @param {String} name name of the cookie
 * @returns value of the found cookie or null
 */
function getCookie(name) {
    var cookies = document.cookie.split("; ");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split("=");
        if (cookie[0] === name) {
            return decodeURIComponent(cookie[1]);
        }
    }
    return null;
}
/**
 * Function to remove a cookie by name by setting date to the -1 day
 * @see setCookie
 * @param {String} name name of the cookie
 */
function removeCookie(name) {
    setCookie(name, "", -1); // Set the expiration date to a past date
}