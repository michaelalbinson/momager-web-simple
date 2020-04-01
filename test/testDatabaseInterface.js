"use strict";

let chai = require('chai');
let expect = require('chai').expect;
let dbi = require('../util/db/DatabaseInterface');
let dbHelper = require('./util/dbHelp');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');

chai.use(sinonChai);


const dbName = 'tdbi_******'; // if this conflicts with something local for you for some reason, change it
const sampleQ = "select 'some text' as ''";

describe('DatabaseManager', function() {

    before(function() {
        return dbHelper.createDefaultTestDB(dbName).then(function() {
            return dbi.useDB(dbName);
        });
    });

    after(function() {
        dbi.kill();
        return dbHelper.dropDB(dbName);
    });

    describe('#query()', function() {
        let deleted = false;
        it('should respond with a single, simple object containing "some text"', function() {
            return dbi.query(sampleQ, false).then(function(rows) {
                expect(rows).to.deep.equal([ { '': 'some text' } ]);
            });
        });

        it('should insert a row into the vote table and return the row', function() {
            let queryString = "INSERT INTO tab1 (id, col1t1, col2t1) VALUES ('dbm1', 4, 'h')";
            return dbi.query(queryString, false).then(function(rows) {
                expect(rows.affectedRows).to.equal(1);
            });
        });

        it('should update the row from the last test', function() {
            let queryString = "UPDATE tab1 SET col2t1='1' WHERE id='dbm1'";
            return dbi.query(queryString, false).then(function(rows) {
                expect(rows.affectedRows).to.equal(1);
            });
        });

        it('should retrieve the row inserted in the first test', function() {
            let queryString = "SELECT * FROM tab1 WHERE id='dbm1'";
            return dbi.query(queryString, false).then(function(rows) {
                expect(rows.length).to.equal(1);
                expect(rows[0]).to.deep.equal({'col1t1': 4, 'col2t1': '1', 'id': 'dbm1'})
            });
        });

        it('should delete the row from the last two tests', function() {
            let queryString = "DELETE FROM tab1 WHERE id='dbm1'";
            return dbi.query(queryString, false).then(function(rows) {
                expect(rows.affectedRows).to.equal(1);
                deleted = true;
            });
        });

        it('should fail to execute successfully if a garbage query is provided', function() {
            return dbi.query('this is nonsense').then(function() {
                expect(0).to.equal(1); // purposely incorrect assertion as query should fail
            }).catch(function() {
                expect(0).to.equal(0);
            });
        });

        it('should fail to execute the query and ignore the failure', function() {
            return dbi.query('this is nonsense', true).then(function() {
                expect(0).to.equal(1); // purposely incorrect assertion as query should fail
            }).catch(function() {
                expect(0).to.equal(0);
            })
        });

        after(function() {
            if (!deleted)
                dbi.query("DELETE FROM tab1 WHERE id=\'dbm1\'"); // delete the row we use for testing even if there's an error

            dbi.kill();
        });
    });

    describe('#kill()', function() {
        it('should prevent us from querying once the database manager is killed', function() {
            dbi.kill();

            return dbi.query("select 'some text' as ''").catch(function(err) {
                expect(err).not.equal(undefined);
            })
        });
    });

    describe('#useDB()', function() {
        it('should connect to the testing database after the pool is killed', function() {
            dbi.kill();
            return dbi.useDB(dbName).then(function() {
                return dbi.query("select 'some text' as ''").then(function(rows) {
                    expect(rows).to.deep.equal([ { '': 'some text' } ]);
                });
            });
        });

        after(function() {
            dbi.kill();
        })
    });

    describe('#setSQLLogging()', function() {
        before(function() {
            return dbi.useDB(dbName);
        });

        after(function() {
            return dbi.kill();
        });

        it('should successfully turn logging off', function() {
            let sp = sinon.spy(console, 'log');
            dbi.setSQLLog(false);
            return dbi.query(sampleQ).then(function() {
                expect(sp).to.not.have.been.called;
                console.log.restore();
            });
        });

        it('should turn logging back on', function() {
            let sp = sinon.spy(console, 'log');
            dbi.setSQLLog(true);
            return dbi.query(sampleQ).then(function() {
                expect(sp).to.have.been.called;
                console.log.restore();
            });
        });
    });
});