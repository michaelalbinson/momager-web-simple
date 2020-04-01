"use strict";

let chai = require('chai');
let expect = require('chai').expect;
let User = require('../../util/baseModels/User');
let DBObject = require('../../util/baseModels/DBObject');
let dbh = require('../util/dbHelp');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');

chai.use(sinonChai);

const dbName = "tuhp-****";

// note both user's actual passwords are 'pass'
const mockUsers =
    `INSERT INTO User (id, password, salt, email, type) VALUES ('12345', 
     '10370e2dd2a11f48cd74003fe3542e3efcb19dd439a04ce265f8bfff9a60c12adfa36694be91f0161be519fd32131e9df14afda119f014f679aa5f8b2d9df5a3',
     'salt', 'abc@abc.com', 'athlete');
    INSERT INTO User (id, password, salt, email, type) VALUES ('09876', 
     'b2fe542aadedcd89cbdcc6a60a143897093c15d59dc7cb7b35cdeb61eea1ef442a4b9fdb80e46bb0e5d4f6861683035b564191c9d239ed76fc5eb3b4ec1dd520',
     'abfdf', 'hello@example.com', 'admin')`;


describe('User', function() {
    before(function() {
        this.timeout(5000); // needs a bit more time on my travel setup

        return dbh.createEmptyProdDB(dbName).then(function(conn) {
            return dbh.executeArbitrarySQL(conn, mockUsers);
        }).then(function(conn) {
            new DBObject().db.useDB(dbName);
            conn.end();
        });
    });

    after(function() {
        new DBObject().db.kill();
        return dbh.dropDB(dbName);
    });

    describe('#create()', function() {
        it('should return undefined if the email and/or password are not passed in', function() {
            let u = new User();
            return u.create().then(function (res){
                expect(typeof res).to.equal("object");
                return u.create("michael@hello.com");
            }).catch(function(res) {
                expect(typeof res).to.equal("object");
                return u.create(undefined, "mynewpass");
            }).catch(function(res) {
                expect(typeof res).to.equal("object");
                return u.create(undefined, undefined, "athlete");
            }).catch(function(res) {
                expect(typeof res).to.equal("object");
            });
        });

        it('should create a new user', function() {
            let u = new User();
            expect(u.id).to.equal(undefined);
            return u.create('email@email.com', 'myNewPassword', 'athlete').then(function(res) {
                expect(res).to.equal(true);
                expect(u.email).to.equal('email@email.com');
                expect(u.type).to.equal('athlete');
                expect(u.id).to.not.equal(undefined);
            }).catch(function(err) {
                expect(err).to.equal(undefined); // purposely invalid assertion
            });
        });

        it('should handle being disconnected from the DB gracefully', function() {
            new DBObject().db.kill();
            return new User().create('abc@aol.com', 'helloWorld', 'admin').catch(function(err) {
                 expect(typeof err).to.equal("object");
                 new DBObject().db.useDB(dbName);
            });
        });
    });

    describe('#authenticate', function() {
        it('should succeed if a user is found matching the applied credentials', function() {
            let u = new User();
            return u.authenticate("abc@abc.com", "pass").then(function(res) {
                expect(res).to.equal(true);
            }).catch(function(err) {
                expect(err).to.equal(undefined);
            });
        });

        it('should fail if a user is found but the credentials do not match', function() {
            let u = new User();
            return u.authenticate("abc@abc.com", "incorrect_pass").catch(function(res) {
                expect(typeof res).to.equal("object");
            });
        });

        it('should fail if a user that does not exist is provided', function() {
            let u = new User();
            return u.authenticate("this user does not exist", "incorrect_pass").catch(function(res) {
                expect(typeof res).to.equal("object");
            });
        });
    });

    describe('#setQueryBy()', function() {
        it('should fail to update the queried field if an invalid field is passed', function() {
            let u = new User();
            expect(u.setQueryBy("notareaflfield")).to.equal(false);
            expect(u.setQueryBy(2)).to.equal(false);
            expect(u.setQueryBy({})).to.equal(false);
            expect(u.setQueryBy([])).to.equal(false);
        });

        it('should allow the queried field to update if it is on the whitelisted field', function() {
            let u = new User();
            expect(u.setQueryBy("id")).to.equal(true);
            expect(u.setQueryBy("type")).to.equal(true);
            expect(u.setQueryBy("email")).to.equal(true);
        });
    });

    describe('#query()', function() {
        it('should not be able to be called if the query type specified doesn\'t have an associated value', function() {
            let u = new User('abc', undefined, 'athlete');
            u.setQueryBy('email');
            return u.query().catch(function(res) {
                expect(typeof res).to.equal("object");
                u = new User();
                return u.query();
            }).catch(function(res) {
                expect(typeof res).to.equal("object");
            });
        });

        it('should reject with an error if no matches are found', function() {
            let u = new User('ddf'); // invalid id
            u.setQueryBy("id");
            return u.query().catch(function(res) {
                expect(typeof res).to.equal("object");
            });
        });

        it('should obtain the user record and set internal values to match', function() {
            let u = new User('12345');
            return u.query().then(function() {
                expect(u.email).to.equal('abc@abc.com');
                expect(u.id).to.equal('12345');
                expect(u.type).to.equal('athlete');
            });
        });

        it('should gracefully handle query errors', function() {
            new DBObject().db.kill(); // close the db pool (mimic db disconnect)
            let u = new User('12345');
            return u.query().catch(function(err) {
                 expect(typeof err).to.equal("object");
                 new DBObject().db.useDB(dbName); // make sure to reconnect!
            });
        });

        it('should be able to query by type', function() {
            let u = new User(undefined, undefined, "athlete");
            u.setQueryBy('type');
            return u.query().then(function() {
                expect(u.type).to.equal('athlete');
            });
        })
    });

    describe('#get()', function () {
        it('should reject if not provided an id', function() {
            let u = new User();
            return u.get().catch(function(err) {
                expect(typeof err).to.equal('object');
            });
        });

        it('should reject if no results are found', function() {
            let u = new User();
            u.get('123').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should resolve and set internal values if a user is found', function() {
            let u = new User();
            return u.get('12345').then(function() {
                expect(u.email).to.equal('abc@abc.com');
                expect(u.type).to.equal('athlete');
                expect(u.id).to.equal('12345');
            });
        });

        it('should follow the internally set ID if none is passed, or the passed id if one is given', function() {
            let u = new User('12345');
            return u.get().then(function() {
                expect(u.email).to.equal('abc@abc.com');
                expect(u.type).to.equal('athlete');
                expect(u.id).to.equal('12345');
                return u.get('09876');
            }).then(function() {
                expect(u.email).to.equal('hello@example.com');
                expect(u.type).to.equal('admin');
                expect(u.id).to.equal('09876');
            });
        });
    });

    describe('#delete()', function() {
        // create some deletable rows that other tests don't depend on
        before(function() {
            return new DBObject().db.query("INSERT INTO User (id, password, salt, email, type) VALUES ('aaa', 'abc', " +
                "'abf', 'goodbye@example.com', 'admin')").then(function() {

                return new DBObject().db.query("INSERT INTO User (id, password, salt, email, type) VALUES ('bbb', " +
                    "'abc', 'abf', 'neat@example.com', 'coach')");
            });
        });

        it('should reject if the internal id does not match the passed in id', function() {
            let u = new User();
            u.delete().catch(function(err) {
                expect(typeof err).to.equal("object");

                let u2 = new User('12345');
                return u2.delete();
            }).catch(function(err) {
                expect(typeof err).to.equal("object");

                let u2 = new User();
                return u2.delete('12345');
            }).catch(function(err) {
                expect(typeof err).to.equal("object");

                let u2 = new User('09876');
                return u2.delete('12345');
            }).catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should delete the record with an id matching the one passed in', function() {
            let u = new User('aaa');
            expect(u.id).to.equal('aaa');
            return  u.delete(u.id).then(function() {
                expect(u.id).to.equal(null);
            });
        });

        // a more likely use case
        it('should query and then delete the User', function() {
            let u = new User(undefined, 'neat@example.com');
            u.setQueryBy('email');
            return u.query().then(function() {
                expect(u.id).to.equal("bbb");
                expect(u.email).to.equal("neat@example.com");
                expect(u.type).to.equal("coach");
                return u.delete(u.id);
            }).then(function() {
                expect(u.id).to.equal(null);
                expect(u.email).to.equal(null);
                expect(u.type).to.equal(null);
            }).catch(function(e) {
                console.log(e.toString());
            });

        });
    });

    describe('#updateEmail()', function() {
        it('should fail if invalid credentials are passed in', function() {
            let u = new User();
            return u.updateEmail("h@example.com", "pass", "newEmail@example.com").catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should fail if there is an issue updating the row', function() {
            let u = new User();
            new DBObject().db.kill();
            return u.updateEmail("hello@example.com", "pass", "new@example.com").catch(function(err) {
                expect(typeof err).to.equal('object');
                new DBObject().db.useDB(dbName);
            });
        });

        it('should successfully update the user\'s email', function() {
            let u = new User();
            return u.updateEmail("hello@example.com", "pass", "new@example.com").then(function() {
                expect(u.email).to.equal("new@example.com");

                // set it back!
                return new DBObject().db.query(`UPDATE User SET email='hello@example.com' WHERE id='09876'`);
            });
        });

        it('should fail when it hits the stub', function() {
            let u = new User();
            let stub = sinon.stub(u.db, 'query');
            stub.callThrough();
            stub.onCall(1).rejects();

            return u.updateEmail("hello@example.com", "pass", "new@example.com").catch(function(err) {
                expect(typeof err).to.equal('object');
                u.db.query.restore();
            });
        });
    });

    describe('#updatePassword()', function() {
        it('should fail if invalid credentials are passed in', function() {
            let u = new User();
            return u.updatePassword('hello@example.com', 'password_not', 'new').catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should succeed if valid credentials are passed in', function() {
            let u = new User();
            return u.updatePassword("hello@example.com", "pass", "newPassword!").then(function() {
                expect(1).to.equal(1); // positive assertion that the promise succeeded

                // change it back
                return u.updatePassword("hello@example.com", "newPassword!", "pass");
            });
        });

        it('should fail if the connection to the server is interrupted', function(){
            let u = new User();
            new DBObject().db.kill();
            u.updatePassword("hello@example.com", "pass", "new!").catch(function(err) {
                expect(typeof err).to.equal("object");
                new DBObject().db.useDB(dbName);
            });
        });

        it('should fail when it hits the stub (coverage)', function() {
            let u = new User();
            let stub = sinon.stub(u.db, 'query');
            stub.callThrough();
            stub.onCall(1).rejects();

            return u.updatePassword("hello@example.com", "pass", "new!").catch(function(err) {
                expect(typeof err).to.equal('object');
                u.db.query.restore();
            });
        });
    });

    describe('#update()', function() {
         it('should reject if invalid credentials are passed (email)', function() {
             let u = new User();
             return u.update("hello@example.com", "pass_not_right", false, "newEmail@example.com").catch(function(err) {
                 expect(typeof err).to.equal("object");
             });
         });

        it('should reject if invalid credentials are passed (password)', function() {
            let u = new User();
            return u.update("hello@example.com", "pass_not_right", true, "newPassword").catch(function(err) {
                expect(typeof err).to.equal("object");
            });
        });

        it('should succeed if given valid credentials (email)', function() {
            let u = new User();
            return u.update("hello@example.com", "pass", false, "new@example.com").then(function() {
                 expect(u.email).to.equal("new@example.com");

                 // set it back
                return new DBObject().db.query(`UPDATE User SET email='hello@example.com' WHERE id='09876'`);
            });
        });

        it('should succeed if given valid credentials (password)', function() {
            let u = new User();
            return u.update("hello@example.com", "pass", true, "newPassword").then(function() {
                expect(1).to.equal(1);

                // set it back
                return u.update("hello@example.com", "newPassword", true, "pass");
            }).catch(function(err) {
                expect(err).to.equal(undefined);
            });
        });
    });
});