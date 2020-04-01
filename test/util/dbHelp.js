/**
 * note that a valid dbConfig MUST exist for this all to work
 */
"use strict";

const config = require('../../config/dbConfig.json');
const dbDefs = require('./mockDBData.json');
const mysql = require('mysql');

const path = require('path');
const fs = require('fs');

/**
 *
 * @param name the dbname to create
 */
function createDefaultTestDB(name) {
    return new Promise(function(resolve) {
        getConnection().then(function(conn) {
            createDB(name, conn)
                .then(function() {
                    return buildDefault(conn);
                })
                .then(function() {
                    conn.end(function() {
                        resolve();
                    });
                })
                .catch(function(err) {
                    throw new Error(err);
            });
        });
    });
}

/**
 * Creates a new database with the supplied name
 * Note that it will delete any old database with the same supplied name
 *
 * @param name
 * @param conn
 * @returns {Promise<any>}
 */
function createDB(name, conn) {
    return new Promise(function(resolve) {
        let q = `DROP DATABASE IF EXISTS \`${name}\`;
            CREATE DATABASE \`${name}\`;
            USE \`${name}\`;`;

        conn.query(q, function(err) {
            if (err)
                throw new Error('ERROR: Could not create fresh DB');

            resolve();
        });
    });
}

/**
 * Adds the default tables to a test database after the database has been created
 * @param conn
 * @returns {Promise<any>}
 */
function buildDefault(conn) {
    return new Promise(function(resolve) {
        addTable(conn, dbDefs.defaultTable1).then(function() {
            return addTable(conn, dbDefs.defaultTable2);
        }).then(function() {
            addTable(conn, dbDefs.defaultTable3);
            resolve();
        }).catch(function(err) {
            throw new Error(err);
        });
    });
}

/**
 * Adds a table to the connection
 * @param conn
 * @param schema
 */
function addTable(conn, schema) {
    return new Promise(function(resolve) {
        conn.query(schema, function (err) {
            if (err)
                throw new Error('Error in table creation');

            resolve();
        });
    });
}

/**
 *
 * @param name
 * @param schema
 * @returns {Promise<any>}
 */
function createCustomTestDB(name, schema) {
    return new Promise(function(resolve) {
        //TODO: stub, may add later
        resolve();
    });
}

function createEmptyProdDB(name) {
    const load_core = getProdSchema();

    return new Promise(function(resolve) {
        let connection;
        getConnection().then(function(conn) {
            connection = conn;
            return createDB(name, connection);
        }).then(function() {
            connection.query(load_core, function(err) {
                if (err)
                    throw new Error('Error creating DB:\n' + err);

                // we pass the connection back to the caller, so it is their responsibility to close it or the test will
                // not end
                resolve(connection);
             });
        }).catch(function(err) {
            throw new Error(err);
        });
    });
}

function getConnection() {
    return new Promise(function(resolve) {
        let conn = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.secret,
            multipleStatements: true
        });

        conn.connect(function(err) {
            if (err)
                throw new Error('Error attempting to delete the test database.\n' + err);

            resolve(conn);
        });
    });
}

/**
 * Gets the SQL to load a empty prod database without the name information
 * @returns {string}
 */
function getProdSchema() {
    return fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'mgr-core.sql')).toString();
}

/**
 *
 * @param name
 */
function dropDB(name) {
    return new Promise(function(resolve) {
        getConnection().then(function(conn) {
            conn.query(`DROP DATABASE \`${name}\`;`, function(err) {
                if (err)
                    throw new Error('Error executing the database drop.\n' + err);

                conn.end(function(err) {
                    if (err)
                        console.error(err);

                    resolve();
                });
            });
        });
    });
}

function executeArbitrarySQL(connnection, q) {
    return new Promise(function(resolve) {
        connnection.query(q, function(err) {
            if (err)
                throw new Error('error executing setup SQL:\n' + err);

            resolve(connnection);
        });
    });
}

module.exports = {
    createDefaultTestDB: createDefaultTestDB,
    createCustomTestDB: createCustomTestDB,
    addTable: addTable,
    executeArbitrarySQL: executeArbitrarySQL,
    createEmptyProdDB: createEmptyProdDB,
    dropDB: dropDB
};
