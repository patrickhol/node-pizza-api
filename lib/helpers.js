

// Kontener dla wszystkiech helpers
var helpers = {};

// Parse a JSON string to an object in all cases , without throwing
helpers.parseJsonToObject = (str) => {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};
// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the posible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuwxyz0123456789';
        // Start the final string
        let str = '';
        for (let i = 1; i <= strLength; i++) {
            // Get a random character from the possibleCharacters string
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
};

module.exports = helpers;