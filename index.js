/**
 * 
 * Primary file for the API pizza-delivery company.
 * 
 */

// Dependencies
const server = require('./lib/server');



const app = {};

// Init function
app.init = () => {
    // Start the server
    server.init();
};


app.init();

module.exports = app;