// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Definiowanie handlers
var handlers = {};

// Users
handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Kontener dla users submetod
handlers._users = {};

// Users - Post
// Required data: name, email address, street address
// Optional data: none
handlers._users.get = (data, callback) => {
    // Sprawdzenie czy email true
    const shortEmail = data.queryStringObject.email;
    let email = typeof shortEmail == 'string' && shortEmail.trim().length > 0 && shortEmail.trim().indexOf("@") > -1 ? shortEmail.trim() : false;

    if (email) {
        // Pobranie token z headers
        let token = typeof data.headers.token == 'string' ? data.headers.token : false;
        // Weryfikacja czy token i email jest true
        handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', email, (err, data) => {
                    if (!err && data) {
                        callback(200, data);
                    } else {
                        callback(400);
                    }
                });
            } else {
                callback(403, {
                    Error: 'Missing required token in header, or token is invalid'
                });
            }
        });
    } else {
        callback(400, {
            Error: 'Missing email field'
        });
    }
};

// Users - Put UPDATE
// Required data: email
// Optional data: name, street address (jedno pole musi być określone)
handlers._users.put = (data, callback) => {
    // Sprawdzenie Required data
    const shortEmail = data.payload.email;
    let email = typeof shortEmail == 'string' && shortEmail.trim().length > 0 && shortEmail.trim().indexOf("@") > -1 ? shortEmail.trim() : false;

    // Sprawdzenie Optional data
    const shortName = data.payload.name;
    const shortStreet = data.payload.street;
    let name = typeof shortName == 'string' && shortName.trim().length > 0 ? shortName.trim() : false;
    let street = typeof shortStreet == 'string' && shortStreet.trim().length > 0 ? shortStreet.trim() : false;
    // Error gdy email false
    if (email) {
        // Error gdy nic nie jest wysłane do update
        if (name || street) {
            // Pobranie token z headers
            let token = typeof data.headers.token == 'string' ? data.headers.token : false;
            handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
                if (tokenIsValid) {
                    // Lookup the User
                    _data.read('users', email, (err, userData) => {
                        if (!err && userData) {
                            // Update file =>>>
                            if (name) {
                                userData.name = name;
                            }
                            if (street) {
                                userData.street = street;
                            }

                            // Store the new Updates
                            _data.update('users', email, userData, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500, {
                                        Error: 'Nie mozna updatowac usera'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                Error: 'Wskazany user nie istnieje'
                            });
                        }
                    });
                } else {
                    callback(403, {
                        Error: 'Missing required token in header, or token is invalid'
                    });
                }
            });
        } else {
            callback(400, {
                Error: 'Brakuje name || street'
            });
        }
    } else {
        callback(400, {
            Error: 'Brakuje emaila'
        });
    }
};

// Users - Delete
// Required data: email
// Optional data: none
handlers._users.delete = (data, callback) => {
    const shortEmail = data.queryStringObject.email;
    let email = typeof shortEmail == 'string' && shortEmail.trim().length > 0 && shortEmail.trim().indexOf("@") > -1 ? shortEmail.trim() : false;
    if (email) {
        // Pobranie token z headers
        let token = typeof data.headers.token == 'string' ? data.headers.token : false;
        handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', email, (err, userData) => {
                    if (!err && userData) {
                        // Remove user data <<<=
                        _data.delete('users', email, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(200);
                            }
                        });
                    } else {
                        callback(400, {
                            Error: 'Could not find the specified user'
                        });
                    }
                });
            } else {
                callback(403, {
                    Error: 'Missing required token in header, or token is invalid'
                });
            }
        });
    } else {
        callback(400, {
            Error: 'Missing email field'
        });
    }
};

// Tokens
handlers.tokens = (data, callback) => {
    var acceptableMethods = ['post', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Kontener na wszystkie metody tokens
handlers._tokens = {};

// Tokens - post
// Required data: email
// Optional data: none
handlers._tokens.post = (data, callback) => {
    const shortEmail = data.payload.email;
    let email = typeof shortEmail == 'string' && shortEmail.trim().length > 0 && shortEmail.trim().indexOf("@") > -1 ? shortEmail.trim() : false;
    if (email) {
        // Lookup user ktory ma taki nr email
        _data.read('users', email, (err, userData) => {
            if (!err && userData) {

                // If valid, create a new token with a random name. Set expiration date 1 hour in the future
                let tokenId = helpers.createRandomString(20);
                let expires = Date.now() + 1000 * 60 * 60; // 1 godzina
                let tokenObject = {
                    email,
                    id: tokenId,
                    expires: expires
                }

                // Store the token
                _data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            Error: 'Could not create the new token'
                        });
                    }
                });

            } else {
                callback(400, {
                    Error: 'Could not find the specified user '
                });
            }
        });
    } else {
        callback(400, {
            Erroe: 'Brakuje wymaganych pól'
        });
    }
};


// Tokens - delete
// Wymagane dane: id
// Opcjonalne dane: brak
handlers._tokens.delete = (data, callback) => {
    // Sprawdzenie czy ID True
    const shortId = data.queryStringObject.id;
    let id = typeof shortId == 'string' && shortId.trim().length == 20 ? shortId.trim() : false;
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                // Remove user data <<<=
                _data.delete('tokens', id, (err, data) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {
                            Error: 'Could not delete the specified token'
                        });
                    }
                });
            } else {
                callback(400, {
                    Error: 'Could not find the specified token'
                });
            }
        });
    } else {
        callback(400, {
            Error: 'Missing id field'
        });
    }
};

// Weryfikacja czy obecny id TOKEN jest aktywny dla USERA
handlers._tokens.verifyToken = (id, email, callback) => {
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Sprawdzenie czy Token jest przypisany do tej osoby i nie wygasł
            if (tokenData.email == email && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handlers;