'use strict';


const mysql = require('mysql');
const config = require('../config/dbConfig.json');
const fs = require('fs');
const path = require('path');

const load_core = fs.readFileSync(path.join(__dirname, '..', 'config', 'mgr-core.sql')).toString();

const opts = {
    host: config.host,
    user: config.user,
    password: config.secret,
    multipleStatements: true
};

console.log('reloading the core db ... all current data will be lost...');
let conn = mysql.createConnection(opts);

conn.connect(function(err) {
    console.log('getting connection...');
    if (err) {
        console.error("could not connect to the mysql server. Possibly a dbConfig issue?");
        return process.exit(1);
    }
    let name = config.dbName;
    let q = `DROP DATABASE IF EXISTS \`${name}\`;
            CREATE DATABASE \`${name}\`;
            USE \`${name}\`;`;

    conn.query(q + load_core, function (err) {
        if (err) {
            console.error("error loading the db core in!\n" + err);
            return process.exit(1);
        }

        console.log('core successfully reloaded');
        conn.end();
    });
});

