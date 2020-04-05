'use strict';

const mysql = require('mysql');
const config = require('../config/dbConfig.json');
const fs = require('fs');
const path = require('path');

const load_core = fs.readFileSync(path.join(__dirname, '..', 'config', 'mock-data.sql')).toString();

const opts = {
    host: config.host,
    user: config.user,
    database: config.dbName,
    password: config.secret,
    multipleStatements: true
};

console.log('Loading mock data...');
let conn = mysql.createConnection(opts);

conn.connect(function(err) {
    console.log('getting connection...');
    if (err) {
        console.error("could not connect to the mysql server. Possibly a dbConfig issue?");
        return process.exit(1);
    }

    conn.query(load_core, function (err) {
        if (err) {
            console.error("error loading the mock data!\n" + err);
            return process.exit(1);
        }

        console.log('mock data successfully loaded');
        conn.end();
    });
});

