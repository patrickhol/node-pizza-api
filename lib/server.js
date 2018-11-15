/* 
 * Server -related 
 *
 */

const config = require('./config');
const http = require('http');
const https = require('https');
const hostname = '127.0.0.1';
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

const server = {};

// Instancja http
server.httpServer = http.createServer(function (req, res) {
    server.unifiedServer(req, res);
});

// Instancja https
server.httpsServerOptions = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

// Cała logika dla połączenia http i https
server.unifiedServer = (req, res) => {
    // Ustawienie hosta
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    // Pobranie url i parsowanie
    const parsedUrl = url.parse(req.url, true);

    // Pobranie sciezki
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Pobranie ciągu zapytań
    const queryStringObject = parsedUrl.query;

    // Pobranie metody HTTP
    let method = req.method.toLowerCase();

    // Pobranie HEAD jako objekt
    const headers = req.headers;

    // Pobranie payload jeśli jest jakieś
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // Wybierz handler do jakiego ządanie ma zostać wysłane. Jeśli brak to wybierz nothandlers.notFound
        const chosenHandler = typeof server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Konstrukcja obiektu do wysłania do handler
        const data = {
            trimmedPath: trimmedPath,
            queryStringObject: queryStringObject,
            method: method,
            headers: headers,
            payload: helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the server.router
        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 200;
            payload = typeof payload === 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json'); // Pretty w Postman pokazuje JSON w kolorach ;)
            res.writeHead(statusCode);
            res.end(payloadString);



            if (statusCode == 200) {
                console.log('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);

            } else {
                console.log('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            }


        });


    });
};

// Definiowanie routingu
server.router = {
    users: handlers.users,
    tokens: handlers.tokens

};

// Init script
server.init = () => {
    //Start serwera http
    server.httpServer.listen(config.httpPort, hostname, () => {
        console.log('\x1b[36m%s\x1b[0m', `Serwer słucha ${hostname}:${config.httpPort} in ${config.envName} mode`);
    });

    // Start serwera https
    server.httpsServer.listen(config.httpsPort, hostname, () => {
        console.log('\x1b[36m%s\x1b[0m', `Serwer słucha ${hostname}:${config.httpsPort} in ${config.envName} mode`);
    });
};


module.exports = server;