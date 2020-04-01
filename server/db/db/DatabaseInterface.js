/*
 * DatabaseInterface.js
 * Written by Michael Albinson 11/19/17
 *
 * The interface object for working with the database
 */

"use strict";

const mysql = require('mysql');
const databaseInformation = require('../../../config/dbConfig.json');


function DatabaseInterface() {
	let pool;
    let shouldLogSQL = true;

    /** Queries the database by opening a connection and querying and then closes the connection and returns the response.
	 *
     * @param queryString: The sanitized query string from the query builder to be passed to the database
	 * @param ignoreFailure: whether or not to ignore query failures
     */
	this.query = function(queryString, ignoreFailure) {
		return new Promise(function(resolve, reject) {
			pool.getConnection(function(err, connection) {
				if (err) {
					console.error(err.message);
					return reject(err);
				}

				connection.query(queryString, function(err, rows) {
					if (err && !ignoreFailure) {
						console.error('SQL Error: ' + err.message);
                        console.error("The corresponding SQL was: " + queryString);
                        connection.release();
						return reject(err);
					}

                    logSQLIfRequired(queryString);

					connection.release();
					resolve(rows);
				});
			});
		});
	};

	this.useDB = function(DBName) {
		return new Promise(function(resolve) {
			pool = mysql.createPool({
				host: databaseInformation['host'],
				user: databaseInformation['user'],
				password: databaseInformation['secret'],
				database: DBName,
				connectionLimit: databaseInformation['max-connections']
			});
			resolve();
		});
	};

	this.kill = function() {
		pool.end();
	};

	this.setSQLLog = function(shouldLog) {
		shouldLogSQL = shouldLog;
	};

	function logSQLIfRequired(str) {
        if (shouldLogSQL)
            console.log('SQL.Trace: ' + str);
	}

    this.useDB(databaseInformation['database']);
}

module.exports = new DatabaseInterface();
