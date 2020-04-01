"use strict";

let expect = require('chai').expect;
let ItDBObject = require('../../util/baseModels/IterableDBObject');
let dbh = require('../util/dbHelp');

const mockData =
    `INSERT INTO User (id, password, salt, email, type) VALUES ('aaaaa', 'notarealhash', 'notarealsalt', 'abc@example.com', 'athlete');` +
    `INSERT INTO User (id, PASSWORD, SALT, EMAIL, TYPE) VALUES ('bbbbb', 'notarealhash', 'notarealsalt', 'ddd@example.com', 'coach');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('12345', 'aaaaa', '2019-04-04 12:00:00');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('09876', 'bbbbb', '2019-05-05 12:00:00');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('to_be_updated', 'bbbbb', '2019-05-05 12:00:00');`;

const dbName = 'tidbohp-****';

describe('IterableDBObject', function() {
    before(function() {
        this.timeout(5000); // needs a bit more time on my travel setup

        return dbh.createEmptyProdDB(dbName).then(function(conn) {
            return dbh.executeArbitrarySQL(conn, mockData);
        }).then(function(conn) {
            new ItDBObject().db.useDB(dbName);
            conn.end();
        });
    });

    after(function() {
        new ItDBObject().db.kill();
        return dbh.dropDB(dbName);
    });

    describe('#dump()', function() {
        it('should dump an empty array', function() {
            expect(new ItDBObject().dump().toString()).to.equal([].toString());
        });
    });

    describe('#next()', function() {
        it('should return false if no query has been made yet', function() {
            expect(new ItDBObject().next()).to.equal(false);
        });

        it('should fail if there are no additional rows', function() {
            let o = new ItDBObject;
            o._queried = true;
            expect(o.next()).to.equal(false);
        });

        it('should increase the index and return true if there are additional rows', function() {
            let o = new ItDBObject;
            o._queried = true;
            o._rows = [{}, {}];
            expect(o.next()).to.equal(true);
            expect(o._idx).to.equal(0);
        });
    });

    describe('#hasNext()', function() {
        it('should fail if no query has been made yet', function() {
            expect(new ItDBObject().hasNext()).to.equal(false);
        });

        it('should return false if there are no additional rows', function() {
            let o = new ItDBObject;
            o._queried = true;
            expect(o.hasNext()).to.equal(false);
        });

        it('should return true if there are additional rows and the index should not change', function() {
            let o = new ItDBObject;
            o._queried = true;
            o._rows = [{}, {}];
            expect(o.hasNext()).to.equal(true);
            expect(o._idx).to.equal(-1);
        });
    });

    describe('#resetIndex()', function() {
        it('should reset the internal index to 0', function() {
            let o = new ItDBObject();
            o._idx = 6;
            o.resetIndex();
            expect(o._idx).to.equal(-1);
        });
    });

    describe('#super_query()', function() {
        it('should reject if the table parameter is undefined', function() {
            return new ItDBObject().super_query().catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if passed a non-existent table', function() {
            return new ItDBObject().super_query('this_is_not_a_table').catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should reject if the queryBy parameter is null or undefined I', function() {
            return new ItDBObject().super_query('Session').catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should reject if the queryBy parameter is null or undefined II', function() {
            let o = new ItDBObject();
            o.id = undefined;
            return o.super_query('Session').catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if the connection to the database is interrupted', function() {
            let o = new ItDBObject();
            o.id = '09876';
            new ItDBObject().db.kill();
            return o.super_query('Session').catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
                new ItDBObject().db.useDB(dbName);
            });
        });

        it('should resolve', function() {
            let o = new ItDBObject();
            o.id = '09876';
            return o.super_query('Session').then(function() {
                expect(o.id).to.equal('09876');
            });
        })
    });
});
