"use strict";

let expect = require('chai').expect;
let Session = require('../../util/baseModels/Session');
let DBObject = require('../../util/baseModels/DBObject');
let dbh = require('../util/dbHelp');

const dbName = "tshp-****";

const mockData =
    `INSERT INTO User (id, password, salt, email, type) VALUES ('aaaaa', 'notarealhash', 'notarealsalt', 'abc@example.com', 'athlete');` +
    `INSERT INTO User (id, PASSWORD, SALT, EMAIL, TYPE) VALUES ('bbbbb', 'notarealhash', 'notarealsalt', 'ddd@example.com', 'coach');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('12345', 'aaaaa', '2019-04-04 12:00:00');` +
    `INSERT INTO Session (id, USER_ID, EXPIRES, LONG_EXPIRE) VALUES ('09876', 'bbbbb', '2019-05-05 12:00:00', true);`;

describe('Session', function() {
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

    describe('#setQueryBy()', function() {
        it('should fail to update the queried field if an invalid field is passed', function() {
            let s = new Session();
            expect(s.setQueryBy("notareaflfield")).to.equal(false);
            expect(s.setQueryBy(2)).to.equal(false);
            expect(s.setQueryBy({})).to.equal(false);
            expect(s.setQueryBy([])).to.equal(false);
            expect(s.setQueryBy("long_expires")).to.equal(false);
        });

        it('should allow the queried field to update if it is on the whitelisted field', function() {
            let s = new Session();
            expect(s.setQueryBy("id")).to.equal(true);
            expect(s.setQueryBy("user_id")).to.equal(true);
            expect(s.setQueryBy("expires")).to.equal(true);
        });
    });

    describe('#create()', function() {
        it('should fail to create a user if missing input arguments (I)', function() {
            return new Session().create("aaaaa", undefined).catch(function(err) {
                expect(typeof err).to.equal("object");
            })
        });

        it('should fail to create a user if missing input arguments (II)', function() {
            return new Session().create(undefined, undefined).catch(function(err) {
                expect(typeof err).to.equal("object");
            })
        });

        it('should fail to create a user if missing input arguments (III)', function() {
            return new Session().create(undefined, false).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail to create a user if invalid argument types are passed to create (I)', function() {
            return new Session().create(567, false).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail to create a user if invalid argument types are passed to create (II)', function() {
            return new Session().create('aaaaa', 555).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail to create a user if invalid argument types are passed to create (III)', function() {
            return new Session().create({}, false).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail to create a user if invalid argument types are passed to create (IV)', function() {
            return new Session().create('aaaaa', {}).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if an invalid id is passed in', function() {
            return new Session().create('ccccc', false).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if no database connection is available', function() {
            new DBObject().db.kill();
            return new Session().create('ccccc', false).catch(function(err) {
                expect(typeof err).to.equal("object");
                new DBObject().db.useDB(dbName);
            });
        });

        it('should succeed if provided with a valid user ID and boolean (I)', function() {
            let s = new Session();
            return s.create('aaaaa', true).then(function() {
                expect(s.user_id).to.equal('aaaaa');
                expect(s.long_expire).to.equal(true);
                expect(s.id).to.not.equal(undefined);
                expect(s.getExpires().constructor.name).to.equal("Date");
            });
        });
    });

    describe('#query()', function() {
        it('should fail if the value for the query is not instantiated (I)', function() {
            return new Session().query().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if the value for the query is not instantiated (II)', function() {
            let s = new Session();
            s.setQueryBy('id');
            return s.query().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if the value for the query is not instantiated (II)', function() {
            let s = new Session();
            s.setQueryBy('user_id');
            return s.query().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if the value for the query is not instantiated (III)', function() {
            let s = new Session();
            s.setQueryBy('expires');
            return s.query().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if the value for the query is not instantiated (IV)', function() {
            let s = new Session();
            s.setExpires(new Date());
            s.long_expire = true;
            s.user_id = 'aaaaa';
            s.setQueryBy('id');
            return s.query().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if an invalid query is passed', function() {
            let s = new Session();
            s.user_id = 'eeeeee';
            s.setQueryBy('user_id');
            return s.query().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail gracefully if there is no DB connection', function() {
            new DBObject().db.kill();
            let s = new Session();
            s.user_id = 'aaaaa';
            s.setQueryBy('user_id');
            return s.query().catch(function(err) {
                expect(typeof err).to.equal("object");
                new DBObject().db.useDB(dbName);
            });
        });

        it('should succeed given valid parameters (I-user_id)', function() {
            let s = new Session();
            s.user_id = 'aaaaa';
            s.setQueryBy('user_id');
            return s.query().then(function() {
                expect(s.user_id).to.equal("aaaaa");
                expect(s.id).to.not.equal(undefined);
                expect(s.getExpires().constructor.name).to.equal("Date");
                expect(s.long_expire).to.equal(false);
            }).catch(function(err) {
                console.log(err.toString());
                expect(err).to.equal(undefined);
            });
        });

        it('should succeed given valid parameters (II-id)', function() {
            let s = new Session();
            s.id = '12345';
            s.setQueryBy('id');
            return s.query().then(function() {
                expect(s.user_id).to.equal("aaaaa");
                expect(s.id).to.equal("12345");
                expect(s.getExpires().constructor.name).to.equal("Date");
                expect(s.long_expire).to.equal(false);
            }).catch(function(err) {
                console.log(err.toString());
                expect(err).to.equal(undefined);
            });
        });

        it('should succeed given valid parameters (III-expiration date)', function() {
            let s = new Session();
            s.setExpires(new Date('2019-04-04 12:00:00')); // Session.expires MUST be a date
            s.setQueryBy('expires');
            return s.query().then(function() {
                expect(s.user_id).to.equal("aaaaa");
                expect(s.id).to.equal("12345");
                expect(s.getExpires().constructor.name).to.equal("Date");
                expect(s.long_expire).to.equal(false);
            }).catch(function(err) {
                console.log(err.toString());
                expect(err).to.equal(undefined);
            });
        });
    });

    describe('#setExpires(), #getExpires()', function() {
        it('should set the date to the one passed in', function() {
            let s = new Session();
            s.setExpires(new Date('2012-05-05 12:00:00'));
            expect(s.getExpires().constructor.name).to.equal("Date");
            expect(s.getExpires().toISOString()).to.equal(new Date('2012-05-05 12:00:00').toISOString());
        });

        it('should set the date to the string passed in', function() {
            let s = new Session();
            s.setExpires('2012-05-05 12:00:00');
            expect(s.getExpires().constructor.name).to.equal("Date");
            expect(s.getExpires().toISOString()).to.equal(new Date('2012-05-05 12:00:00').toISOString());
        });

        it('if no date is passed in, set the expire date to now', function() {
            let s = new Session();
            s.setExpires();
            expect(s.getExpires().constructor.name).to.equal("Date");
        });
    });

    describe('#get()', function() {
        it('will fail if no id is set', function() {
            return new Session().get().catch(function(err) {
                expect(typeof err).to.equal("object");
            })
        });

        it('will fail if an invalid id is passed to the function', function() {
            return new Session().get('hahahaha').catch(function(err) {
                expect(typeof err).to.equal("object");
            })
        });

        it('will fail if no DB connection can be made', function() {
            new DBObject().db.kill();
            return new Session().get().catch(function(err) {
                expect(typeof err).to.equal("object");
                new DBObject().db.useDB(dbName);
            });
        });

        it('will succeed if a valid id is passed in', function() {
            let s = new Session();
            return s.get('12345').then(function() {
                expect(s.id).to.equal('12345');
                expect(s.user_id).to.equal('aaaaa');
            });
        });

        it('will succeed if a valid id is set in the constructor', function() {
            let s = new Session(undefined, '12345');
            return s.get().then(function() {
                expect(s.id).to.equal('12345');
                expect(s.user_id).to.equal('aaaaa');
            });
        });
    });

    describe('#delete()', function() {
        before(function() {
            return new DBObject().db.query(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('hello', 'aaaaa', '2019-04-04 12:00:00')`)
        });

        it('should fail to delete if no id is passed to the function', function() {
            let s = new Session(undefined, '12345');
            return s.delete().catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail to delete if no internal id is set', function() {
            let s = new Session();
            return s.delete('12345').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail to delete if no db connection is made', function() {
            new DBObject().db.kill();
            let s = new Session(undefined, '12345');
            return s.delete('12345').catch(function(err) {
                expect(typeof err).to.equal("object");
                new DBObject().db.useDB(dbName);
            });
        });

        it('should succeed if the two IDs match', function() {
            let s = new Session(undefined, 'hello');
            return s.delete('hello').then(function() {
                expect(s.id).to.equal(undefined);
            });
        });
    });

    describe('#toString()', function() {
        it('should provide a string summarizing the Session object when no values have been set', function() {
            expect(new Session().toString()).to.equal("An uninitialized Session object.");
        });

        it('should provide a brief description of an initialized Session', function() {
            let s = new Session();
            s.user_id = 'abcd';
            expect(s.toString()).to.equal("Session Object expiring at " + s.getExpires().toISOString() + ' belonging to user with ID: abcd');
        });
    });

    describe('#setInternalValues()', function() {
        it('should set all internal values to undefined if passed an empty object', function() {
            let s = new Session();
            s._setInternalValues({});
            expect(s.id).to.equal(undefined);
            // expect(s.getExpires().toISOString()).to.equal(new Date().toISOString());
            expect(s.user_id).to.equal(undefined);
            expect(s.long_expire).to.equal(false);
        });

        it('should set all values to undefined if a non-object is passed to the function', function() {
            let s = new Session();
            s._setInternalValues([]);
            expect(s.id).to.equal(undefined);
            // expect(s.getExpires().toISOString()).to.equal(new Date().toISOString());
            expect(s.user_id).to.equal(undefined);
            expect(s.long_expire).to.equal(false);

            s._setInternalValues(123);
            expect(s.id).to.equal(undefined);
            // expect(s.getExpires().toISOString()).to.equal(new Date().toISOString());
            expect(s.user_id).to.equal(undefined);
            expect(s.long_expire).to.equal(false);

            s._setInternalValues("hello");
            expect(s.id).to.equal(undefined);
            // expect(s.getExpires().toISOString()).to.equal(new Date().toISOString());
            expect(s.user_id).to.equal(undefined);
            expect(s.long_expire).to.equal(false);
        });

        it('should set the appropriate values', function() {
            let s = new Session();
            s._setInternalValues({USER_ID: 'abcd', id: '1234', EXPIRES: "2014-04-03 12:00:00", LONG_EXPIRE: true});
            expect(s.id).to.equal('1234');
            expect(s.getExpires().toISOString()).to.equal(new Date("2014-04-03 12:00:00").toISOString());
            expect(s.user_id).to.equal('abcd');
            expect(s.long_expire).to.equal(true);
        });
    });

    describe('#refresh()', function() {
        before(function() {
            let alias = new DBObject().db.query;
            let dateCloseToNow = new Date(new Date() - 0 + 3*60*1000);
            dateCloseToNow = new DBObject().escape(dateCloseToNow);

            let dateFarFromNow = new Date(new Date() - 0 + 5*60*60*1000);
            dateFarFromNow = new DBObject().escape(dateFarFromNow);
            return alias(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('far-future', 'aaaaa', ${dateFarFromNow})`)
                .then(function() {
                    return alias(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('in-the-past', 'aaaaa', '1990-04-04 12:00:00')`);
                }).then(function() {
                    return alias(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('close-to-now', 'aaaaa', ${dateCloseToNow})`);
                }).then(function() {
                    return alias(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('way-expired', 'aaaaa', '1980-04-04 12:00:00')`);
                }).then(function() {
                    return alias(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('also-close', 'aaaaa',  ${dateCloseToNow})`);
                });
        });

        it('should resolve with no change if the date of the row has more than 5 minutes before expiring', function() {
            let s = new Session();
            let oldDate;
            return s.get('far-future').then(function() {
                oldDate = s.getExpires();
                return s.refresh();
            }).then(function() {
                expect(s.getExpires()).to.equal(oldDate);
            });
        });

        it('should delete the Session if it is too old', function() {
            let s = new Session();
            return s.get('in-the-past').then(function() {
               return s.refresh();
            }).catch(function(e) {
                expect(e.constructor.name).to.equal("MCError");
            });
        });

        // this test sometimes flaps, still not sure why
        it('should refresh the Session expires date', function() {
            let s = new Session();
            let oldDate;
            return s.get('close-to-now').then(function() {
                oldDate = s.getExpires();
                return s.refresh()
            }).then(function() {
                expect(s.getExpires() - 0 > oldDate - 0).to.equal(true);
            });
        });

        it('should fail gracefully if no db connection is made (I - should\'ve deleted)', function() {
            let s = new Session();
            return s.get('way-expired').then(function() {
                new DBObject().db.kill();
                return s.refresh();
            }).catch(function(err) {
                expect(err.constructor.name).to.equal('MCError');
                new DBObject().db.useDB(dbName);
            });
        });

        it('should fail gracefully if no db connection is made (II - should\'ve refreshed)', function() {
            let s = new Session();
            return s.get('also-close').then(function() {
                new DBObject().db.kill();
                return s.refresh();
            }).catch(function(err) {
                expect(err.constructor.name).to.equal('MCError');
                new DBObject().db.useDB(dbName);
            });
        });
    });

    describe('#update()', function() {
        before(function() {
            let alias = new DBObject().db.query;
            let dateCloseToNow = new Date(new Date() - 0 + 3*60*1000);
            dateCloseToNow = new DBObject().escape(dateCloseToNow);
            return alias(`INSERT INTO Session (id, USER_ID, EXPIRES) VALUES ('near', 'aaaaa', ${dateCloseToNow})`);
        });

        it('should successfully update a row\'s expiration', function() {
            let s = new Session();
            let oldDate;
            return s.get('near').then(function() {
                oldDate = s.getExpires();
                return s.refresh()
            }).then(function() {
                expect(s.getExpires() - 0 > oldDate - 0).to.equal(true);
            });
        });

        it('should gracefully fail if there is no DB connection', function() {
            let s = new Session();
            return s.get('near').then(function() {
                new DBObject().db.kill();
                return s.update();
            }).catch(function(err) {
                expect(err.constructor.name).to.equal('MCError');
                new DBObject().db.useDB(dbName);
            });
        });

        it('should fail if there is no row previously queried', function() {
            let s = new Session();
            return s.update().catch(function(err) {
                expect(err.constructor.name).to.equal('MCError');
                new DBObject().db.useDB(dbName);
            });
        })
    });
});
