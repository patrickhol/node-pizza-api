const https = require('https');
const querystring = require('querystring');
const private = require('../.private');

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

// Integrate with the Sandbox of Stripe.com to accept payment.
helpers.sandboxStripe = (email, orderObject, callback) => {
    email = typeof email == 'string' && email.trim().length > 0 && email.trim().indexOf("@") > -1 ? email.trim() : false;
    orderObject = typeof orderObject == 'object' ? orderObject : false;

    if (email && orderObject) {

        // Configure the request payload
        let payload = {
            'amount': orderObject.amount,
            'currency': orderObject.currency,
            'source': orderObject.source,
            'metadata': {
                'order_id': '6735'
            }

        }

        let stringPayload = querystring.stringify(payload);

        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.stripe.com',
            'method': 'POST',
            'path': '/v1/charges',
            'auth': private.stripApiTestKey + ':' + private.stripApiPublicKey,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        let req = https.request(requestDetails, (res) => {
            // Grab the status of the sent request
            let status = res.statusCode;
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
        });
        // Bind to the error event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e);
        });
        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();



    } else {
        callback('Given parameters were missing or invalid' +
            orderObject + email);
    }

}

// Integrate with the Sandbox of Mailgun.com
helpers.sandboxMailgun = (email, userOrders, callback) => {
    email = typeof email == 'string' && email.trim().length > 0 && email.trim().indexOf("@") > -1 ? email.trim() : false;
    userOrders = typeof userOrders == 'object' ? userOrders : false;

    if (email && userOrders) {

        // Configure the request payload
        let payload = {
            'from': private.from,
            'to': private.mailgunVerifiedEmail1,
            'to': private.mailgunVerifiedEmail2,
            'subject': "test",
            'text': 'Hi your order id: ' + userOrders.id + '\n\nShopping card:' + userOrders.description + '\n\n Amount: ' + userOrders.amount + ' ' + userOrders.currency + '\n payments method: ' + userOrders.source + '\n payments status: done',

        }

        let stringPayload = querystring.stringify(payload);

        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.mailgun.net',
            'method': 'POST',
            'path': '/v3/' + private.sandboxMailgun + "/messages",
            'auth': 'api:' + private.mailgunPrivateApiKey,

            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        let req = https.request(requestDetails, (res) => {

            // Grab the status of the sent request
            let status = res.statusCode;

            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was ' + status);
            }
        });
        // Bind to the error event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e);
        });
        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();



    } else {
        callback('Given parameters were missing or invalid' +
            userOrders);
    }

}


module.exports = helpers;