// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Module for export
let lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// Zapisanie danych do pliku
lib.create = (dir, file, data, callback) => {
    // Otwarcie pliku do zapisu
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // konwersja data do JSON
            let stringData = JSON.stringify(data);

            // zapisz do pliku i zamknij go
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error zamykania pliku');
                        }
                    });
                } else {
                    callback('Error zapisywania nowego pliku');
                }
            });
        } else {
            callback('Nie mozna stworzyc pliku, mozliwe ze juz istnieje');
        }
    });
};

// Czytanie danych z pliku
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            let parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

// Aktualizacja danych w pliku
lib.update = (dir, file, data, callback) => {
    // Otwarcie pliku do zapisu

    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // konwersja data do JSON
            let stringData = JSON.stringify(data);
            fs.ftruncate(fileDescriptor, (err) => {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error zamkniecia pliku');
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};


// Kasowanie danych w pliku
lib.delete = (dir, file, callback) => {
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error podczas usuwania pliku');
        }
    });
};

// List all the item in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir + dir + '/', (err, data) => {

        if (!err && data && data.length > 0) {
            console.log("data: ", data);
            let trimmedFileNames = [];
            data.forEach((fileName) => {
                console.log(fileName);
                trimmedFileNames.push(fileName.replace('.json', ''));
                console.log(trimmedFileNames);
            });
            callback(false, trimmedFileNames);

        } else {
            callback(err, data);
        }
    })
}



module.exports = lib;