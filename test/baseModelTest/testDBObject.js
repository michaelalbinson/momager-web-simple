"use strict";

let expect = require('chai').expect;
let chai = require('chai');
let dbh = require('../util/dbHelp');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');

let B = require('../util/basicInheritance').B;

chai.use(sinonChai);

let DBObject = require('../../util/baseModels/DBObject');

const mockData =
    `INSERT INTO User (id, password, salt, email, type) VALUES ('aaaaa', 'notarealhash', 'notarealsalt', 'abc@example.com', 'athlete');` +
    `INSERT INTO User (id, PASSWORD, SALT, EMAIL, TYPE) VALUES ('bbbbb', 'notarealhash', 'notarealsalt', 'ddd@example.com', 'coach');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('12345', 'aaaaa', '2019-04-04 12:00:00');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('09876', 'bbbbb', '2019-05-05 12:00:00');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('to_be_updated', 'bbbbb', '2019-05-05 12:00:00');`;

const dbName = 'tdbo-****';

describe('DBObject', function() {
    before(function() {
        this.timeout(5000); // needs a bit more time on my travel setup

        return dbh.createEmptyProdDB(dbName).then(function(conn) {
            return dbh.executeArbitrarySQL(conn, mockData);
        }).then(function(conn) {
            new DBObject().db.useDB(dbName);
            conn.end();
        });
    });

    after(function() {
        new DBObject().db.kill();
        return dbh.dropDB(dbName);
    });

    describe('#constructor', function() {
        it('should create a abstract object with the following unimplemented functions', function() {
            let dbo = new DBObject();
            expect(dbo.create).to.equal(null);
            expect(dbo.delete).to.equal(null);
            expect(dbo.get).to.equal(null);
            expect(dbo.update).to.equal(null);
            expect(dbo.query).to.equal(null);
            expect(typeof dbo.setQueryBy).to.equal("function");
            expect(dbo.setQueryBy("")).to.equal("");
            expect(typeof dbo._setInternalValues).to.equal("function");
        });

        it('should have the following parameters', function() {
            let dbo = new DBObject();
            expect(dbo.id).to.equal(null);
            expect(dbo._queryBy).to.equal('id');
        });

        it('should contain the following helper functions and objects attached', function() {
            let dbo = new DBObject();
            expect(typeof dbo.db).to.equal("object");
            expect(typeof dbo.generate).to.equal("function");
            expect(typeof dbo.escape).to.equal("function");
        });
    });

    describe('#super_get()', function() {
        it('should reject if an invalid table is provided (I)', function() {
            return new DBObject().super_get('not a real table', 'aaaaa').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if an invalid table is provided (II)', function() {
            return new DBObject().super_get(45, 'aaaaa').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if an invalid table is provided (III)', function() {
            return new DBObject().super_get({'a': []}, 'aaaaa').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (I)', function() {
            return new DBObject().super_get('Session').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (II)', function() {
            return new DBObject().super_get('Session', 44).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (III)', function() {
            return new DBObject().super_get('Session', {}).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (IV)', function() {
            let o = new DBObject();
            o.id = 123;
            return o.super_get('Session').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (V)', function() {
            let o = new DBObject();
            o.id = [];
            return o.super_get('Session').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if a valid table and id are passed, but there are no matches', function() {
            return new DBObject().super_get("Session", "notavalidid").catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should resolve with a row if a valid table and ID are provided', function() {
            let o = new DBObject();
            return o.super_get("Session", "09876").then(function() {
                expect(1).to.equal(1); // query was a success
            });
        });

        it('should reject if the db connection is interrupted', function() {
            let o = new DBObject();
            new DBObject().db.kill();
            return o.super_get("Session", "09876").catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
                return new DBObject().db.useDB(dbName);
            });
        });
    });

    describe('#super_delete()', function() {
        before(function() {
            return new DBObject().db.query("INSERT INTO Session (id, user_id, expires) VALUES ('11111', 'aaaaa', '2019-04-04 12:00:00')");
        });
        it('should reject if an invalid table is provided (I)', function() {
            return new DBObject().super_delete('not a real table', 'aaaaa').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if an invalid table is provided (II)', function() {
            return new DBObject().super_delete(45, 'aaaaa').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if an invalid table is provided (III)', function() {
            return new DBObject().super_delete({'a': []}, 'aaaaa').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (I)', function() {
            return new DBObject().super_delete('Session').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (II)', function() {
            return new DBObject().super_delete('Session', 44).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (III)', function() {
            return new DBObject().super_delete('Session', {}).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (IV)', function() {
            let o = new DBObject();
            o.id = 123;
            return o.super_delete('Session').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if there is no internal ID or ID passed to it (V)', function() {
            let o = new DBObject();
            o.id = [];
            return o.super_delete('Session').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if the two IDs do not match (I)', function() {
            let o = new DBObject();
            o.id = [];
            return o.super_delete('Session', []).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if the two IDs do not match (II)', function() {
            let o = new DBObject();
            o.id = 45;
            return o.super_delete('Session', 46).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if the two IDs do not match (III)', function() {
            let o = new DBObject();
            o.id = "these strings";
            return o.super_delete('Session', "don't match").catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should reject if it is unable to locate a row to delete', function() {
            let o = new DBObject();
            o.id = "thesematch";
            return o.super_delete('Session', "thesematch").catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should resolve if it finds the row to delete and successfully deletes it', function() {
            let o = new DBObject();
            o.id = "11111";
            return o.super_delete('Session', "11111").then(function() {
                expect(1).to.equal(1);
            }).catch(function(err) {
                console.log(err.toString());
                expect(err).to.equal(undefined);
            });
        });

        it('should fail gracefully with no DB connection', function() {
            new DBObject().db.kill();
            let o = new DBObject();
            o.id = "11111";
            return o.super_delete('Session', "11111").catch(function(err) {
                expect(typeof err).to.equal("object");
                new DBObject().db.useDB(dbName);
            });
        });
    });

    describe('#super_update()', function() {
        it('should fail if the table provided does not exist', function() {
            return new DBObject().super_update('blah', {}, 'neat').catch(function(err) {
                  expect(err.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if parameters of the wrong type are passed in I', function() {
            return new DBObject().super_update().catch(function(err) {
                expect(err.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if parameters of the wrong type are passed in II', function() {
            return new DBObject().super_update(2345).catch(function(err) {
                expect(err.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if parameters of the wrong type are passed in III', function() {
            return new DBObject().super_update("str", "hello").catch(function(err) {
                expect(err.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if parameters of the wrong type are passed in IV', function() {
            return new DBObject().super_update("str", {}, false).catch(function(err) {
                expect(err.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if parameters of the wrong type are passed in or are undefined V', function() {
            return new DBObject().super_update(undefined, undefined, "an_id").catch(function(err) {
                expect(err.constructor.name).to.equal("MCError");
            });
        });

        it('should succeed if valid parameters are passed into the function', function() {
            return new DBObject().super_update('Session', {EXPIRES: "2019-05-05 4:00:00"}, "to_be_updated").then(function() {
                expect(true).to.equal(true);
            });
        });

        it('should fail gracefully if the db connection is interrupted', function() {
            new DBObject().db.kill();
            return new DBObject().super_update('Session', {EXPIRES: "2019-05-05 4:00:00"}, "to_be_updated").catch(function(err) {
                expect(err.constructor.name).to.equal("MCError");
                new DBObject().db.useDB(dbName);
            });
        });
    });

    describe('#anyUndefinedOrNull()', function() {
        it('should determine if an object has any null keys if it is passed an object', function() {
            expect(new DBObject().anyUndefinedOrNull({})).to.equal(false);
            expect(new DBObject().anyUndefinedOrNull({hello: "world", thisIs: "neat"})).to.equal(false);

            expect(new DBObject().anyUndefinedOrNull({hello: null})).to.equal(true);
            expect(new DBObject().anyUndefinedOrNull({lots: "o", keys: "and", values: null})).to.equal(true);
        });

        it('should parse only the key-value pairs on the top level object', function() {
            let b = new B();
            let s = sinon.stub(b, 'hasOwnProperty');
            s.returns(false);
            expect(new DBObject().anyUndefinedOrNull(b)).to.equal(false);
            b.hasOwnProperty.restore();
        });

        it('should loop through arguments to see if any are undefined or null (no objects!!)', function() {
            expect(new DBObject().anyUndefinedOrNull("hello", null, "neat!")).to.equal(true);
            expect(new DBObject().anyUndefinedOrNull("hello", undefined, "neat!")).to.equal(true);
            let a;
            expect(new DBObject().anyUndefinedOrNull(a)).to.equal(true);
            expect(new DBObject().anyUndefinedOrNull()).to.equal(true);
            expect(new DBObject().anyUndefinedOrNull("hello", 1234, "neat!", 890, false)).to.equal(false);
            expect(new DBObject().anyUndefinedOrNull(123, new B())).to.equal(false);
        });
    });

    describe('#escapeAll()', function() {
        it('should escape the provided values to a sql-friendly format', function() {
            let o = {a: 123, b: "hello", c: false, d: null, e: undefined};
            o = new DBObject().escapeAll(o);
            expect(o.a).to.equal("123");
            expect(o.b).to.equal("'hello'");
            expect(o.c).to.equal("false");
            expect(o.d).to.equal("NULL");
            expect(o.e).to.equal("NULL");
        });

        // not a realistic example
        it('needed for code coverage', function() {
            let S = function() {
                this.a = "a property";
            };

            let s = new S();
            let stub = sinon.stub(s, 'hasOwnProperty');
            stub.returns(false);

            let d = new DBObject().escapeAll(s);
            expect(d.a).to.equal(undefined);
            s.hasOwnProperty.restore();
        });
    });

    describe('#getKVPairs()', function() {
        it('should get the key-value pairs and stringify them to a SQL syntax', function() {
            const shouldBe = " hello=world, neat=o";
            const o = {hello: "world", neat: "o"};
            expect(new DBObject().getKVPairs(o)).to.equal(shouldBe);
        });

        it('should get the SQL key-value pairs (more realistic example', function() {
            let o = {hello: "world", neat: "o"};
            const shouldBe = " hello='world', neat='o'";
            o = new DBObject().escapeAll(o);
            expect(new DBObject().getKVPairs(o)).to.equal(shouldBe);
        });

        // (not a realistic example, needed for code coverage)
        it('should only add top level key-value pairs to the string', function() {
            let S = function() {
                this.a = "a property";
            };

            let s = new S();
            let stub = sinon.stub(s, 'hasOwnProperty');
            stub.returns(false);

            const shouldEqual = "";
            expect(new DBObject().getKVPairs(s)).to.equal(shouldEqual);
            s.hasOwnProperty.restore();
        });
    });

    describe('#generateEscaped()', function() {
        it('should generate a 32 char uid that is escaped', function() {
            expect(new DBObject().generateEscaped().length).to.equal(34); // 34 instead of 32 because of the escaping
        });
    });

    describe('#super_query()', function() {
        it('should reject if the table parameter is undefined', function() {
            return new DBObject().super_query().catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if passed a non-existent table', function() {
            return new DBObject().super_query('this_is_not_a_table').catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should reject if the queryBy parameter is null or undefined I', function() {
            return new DBObject().super_query('Session').catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should reject if the queryBy parameter is null or undefined II', function() {
            let o = new DBObject();
            o.id = undefined;
            return o.super_query('Session').catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        it('should fail if the connection to the database is interrupted', function() {
            let o = new DBObject();
            o.id = '09876';
            new DBObject().db.kill();
            return o.super_query('Session').catch(function(e) {
                 expect(e.constructor.name).to.equal('MCError');
                 new DBObject().db.useDB(dbName);
            });
        });

        it('should resolve', function() {
            let o = new DBObject();
            o.id = '09876';
            return o.super_query('Session').then(function() {
                expect(o.id).to.equal('09876');
            });
        });
    });

    describe('#super_setQueryBy()', function() {
        it('should return null if passed non-strings', function() {
            let dbo = new DBObject();
            expect(dbo.super_setQueryBy(3)).to.equal(null);
            expect(dbo.super_setQueryBy([])).to.equal(null);
            expect(dbo.super_setQueryBy({})).to.equal(null);
            expect(dbo.super_setQueryBy(7.77)).to.equal(null);
            expect(dbo.super_setQueryBy(-0)).to.equal(null);
            expect(dbo.super_setQueryBy(false)).to.equal(null);
            expect(dbo.super_setQueryBy(new DBObject())).to.equal(null);
        });

        it('should return null if the string is not in the provided list', function() {
            const allowedStrings = ['string_a', 'string_b', 'string_c'];
            let dbo = new DBObject();
            expect(dbo.super_setQueryBy("", allowedStrings)).to.equal(null);
            expect(dbo.super_setQueryBy("hello", allowedStrings)).to.equal(null);
            expect(dbo.super_setQueryBy("NOT THE STRING", allowedStrings)).to.equal(null);
        });

        it('should throw an error if the second argument is not an array', function() {
            let dbo = new DBObject();
            try {
                dbo.super_setQueryBy("str", false);
            } catch (e) {
                expect(e.constructor.name).to.equal('Error');
            }
            try {
                dbo.super_setQueryBy("str", {});
            } catch (e) {
                expect(e.constructor.name).to.equal('Error');
            }
            try {
                dbo.super_setQueryBy("str", 23);
            } catch (e) {
                expect(e.constructor.name).to.equal('Error');
            }
            try {
                dbo.super_setQueryBy("str", "str");
            } catch (e) {
                expect(e.constructor.name).to.equal('Error');
            }
        });

        it('should allow the following strings through', function() {
            const allowedStrings = ['string_a', 'string_b', 'string_c'];
            let dbo = new DBObject();
            expect(dbo.super_setQueryBy("STRING_A", allowedStrings)).to.not.equal(null);
            expect(dbo.super_setQueryBy("STRING_B", allowedStrings)).to.not.equal(null);
            expect(dbo.super_setQueryBy("STRING_C", allowedStrings)).to.not.equal(null);
        })
    });
});
