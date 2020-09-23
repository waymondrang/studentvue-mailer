const fetch = require('node-fetch');

module.exports = async function () {
    var status = await fetch('https://www.google.com').then(response => response.status).catch(error => error.code)
    if (status === 200) {
        return true
    } else {
        return false
    }
}