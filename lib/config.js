/*
 * zmienne konfiguracyjne
 *
 */

const environments = {};

// Staging(default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'dev'
};

// Production environments
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production'
};

// Sprawdzenie który env przeszedł
const currentEnvironment = typeof process.env.NODE_ENV == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Default setting Staging
const environmentToExport =
    typeof environments[currentEnvironment] == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;