"use strict";

let expect = require('chai').expect;
let PR = require('../../util/baseModels/PasswordReset');
let dbHelp = require('../util/dbHelp');

const dbName = 'tprhp-****';

const q = `INSERT INTO User (id, password, salt, email, type) VALUES ('user_id', ` +
    `'b2fe542aadedcd89cbdcc6a60a143897093c15d59dc7cb7b35cdeb61eea1ef442a4b9fdb80e46bb0e5d4f6861683035b564191c9d239ed76fc5eb3b4ec1dd520', ` +
    `'abfdf', 'coach@team.com', 'admin');` +
    `INSERT INTO Password_Reset (id, USER_ID, EMAIL_STR, REQ_DATE, CODE) VALUES ('req_1', 'user_id', 'aaaaaa', '1995-09-07 12:00:00', '000000');` +
    `INSERT INTO Password_Reset (id, USER_ID, EMAIL_STR, REQ_DATE, CODE) VALUES ('req_2', 'user_id', 'bbbbbb', '1994-06-07 12:00:00', '000001');` +
    `INSERT INTO Password_Reset (id, USER_ID, EMAIL_STR, REQ_DATE, CODE) VALUES ('to_be_updated', 'user_id', 'cc', '2006-04-20 12:00:00', '000002');` +
    `INSERT INTO Password_Reset (id, USER_ID, EMAIL_STR, REQ_DATE, CODE) VALUES ('to_be_deleted', 'user_id', 'dd', '2015-12-11 12:00:00', '000003');`;

describe('PasswordReset', function() {
    before(function() {
        this.timeout(5000); // needs a bit more time on my travel setup

        return dbHelp.createEmptyProdDB(dbName).then(function(conn) {
            return dbHelp.executeArbitrarySQL(conn, q);
        }).then(function (conn) {
            new PR().db.useDB(dbName);
            conn.end();
        });
    });

    after(function() {
        new PR().db.kill();
        return dbHelp.dropDB(dbName);
    });

    describe('#setQueryBy()', function() {
        it('should return null if anything but a string is passed to it', function() {
            let pr = new PR();
            expect(pr.setQueryBy(34)).to.equal(null);
            expect(pr.setQueryBy(false)).to.equal(null);
            expect(pr.setQueryBy([])).to.equal(null);
            expect(pr.setQueryBy({})).to.equal(null);
        });

        it('should return null if an invalid string is passed in', function() {
            let pr = new PR();
            expect(pr.setQueryBy("")).to.equal(null);
            expect(pr.setQueryBy("incorrect")).to.equal(null);
            expect(pr.setQueryBy("wrong")).to.equal(null);
        });

        it('should return the property name if a valid param is passed in', function() {
            let pr = new PR();
            expect(pr.setQueryBy('user_id')).to.equal('USER_ID');
            expect(pr.setQueryBy('id')).to.equal('id');
        });
    });

    describe('#create()', function() {
        it('should fail if missing a parameter I', function() {
            return new PR().create().catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should fail if missing a parameter II', function() {
            return new PR().create('user_id', '2018-04-05 12:00:00', null).catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should fail if missing a parameter III', function() {
            return new PR().create('user_id', undefined, 'fffff').catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should fail if there is no db connection', function() {
            new PR().db.kill();
            return new PR().create('user_id', '2018-04-05 12:00:00', 'efefef').catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
                new PR().db.useDB(dbName);
            });
        });

        it('should succeed', function() {
            let pr = new PR();
            return pr.create('user_id', '2018-04-05 12:00:00', 'efefef').catch(function(e) {
                expect(pr.user_id).to.equal('user_id');
                expect(pr.email_str).to.equal('efefef');
            });
        })
    });

    describe('#get()', function() {
        it('should reject for an id that does not exist', function() {
            return new PR().get('not_an_id').catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should resolve for a valid id', function() {
            let pr = new PR();
            return pr.get('req_1').then(function() {
                expect(pr.user_id).to.equal('user_id');
                expect(pr.email_str).to.equal('aaaaaa');
                expect(pr.id).to.equal('req_1');
            });
        });
    });

    describe('#query()', function() {
        it('should fail if no matching rows are found', function() {
            let pr = new PR();
            pr.id = 'req_3';
            return pr.query().catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should succeed', function() {
            let pr = new PR();
            pr.setQueryBy('email_str');
            pr.email_str = 'aaaaaa';
            return pr.query().then(function() {
                expect(pr.user_id).to.equal('user_id');
                expect(pr.email_str).to.equal('aaaaaa');
                expect(pr.id).to.equal('req_1');
            });
        });
    });

    describe('#update()', function() {
        it('should fail if no row has been queried yet', function() {
            return new PR().update().catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should update a row', function() {
            let pr = new PR();
            pr.id = 'to_be_updated';
            return pr.get().then(function() {
                pr.email_str = 'hello_new_str';
                return pr.update();
            }).then(function() {
                expect(pr.email_str).to.equal('hello_new_str');
                expect(pr.user_id).to.equal('user_id');
                expect(pr.id).to.equal('to_be_updated');
            });
        });
    });

    describe('#delete()', function() {
        it('should fail to delete an invalid row', function() {
            return new PR().delete().catch(function(e) {
                expect(e.constructor.name).to.equal('MCError');
            });
        });

        it('should successfully delete a row', function() {
            let pr = new PR();
            pr.id = 'to_be_deleted';
            return pr.get().then(function() {
                return pr.delete(pr.id);
            }).then(function() {
                expect(pr.id).to.equal(null);
                expect(pr.user_id).to.equal(null);
                expect(pr.req_date).to.equal(null);
                expect(pr.email_str).to.equal(null);
            });
        });
    });

    describe('#_setInternalValues()', function() {
        it('should set everything to null if an invalid parameter is passed in', function() {
            let pr = new PR();
            pr._setInternalValues();
            assertAllNull(pr);
            pr._setInternalValues({});
            assertAllNull(pr);
            pr._setInternalValues(34);
            assertAllNull(pr);
        });

        it('should set all the specified values on the CE', function() {
            let pr = new PR();
            pr._setInternalValues({EMAIL_STR: 'true@same.com', id: 'hello', REQ_DATE: 'a date', USER_ID: 'user_id'});
            expect(pr.id).to.equal('hello');
            expect(pr.user_id).to.equal('user_id');
            expect(pr.req_date).to.equal('a date');
            expect(pr.email_str).to.equal('true@same.com');
        });

        function assertAllNull(pr) {
            expect(pr.id).to.equal(null);
            expect(pr.user_id).to.equal(null);
            expect(pr.req_date).to.equal(null);
            expect(pr.email_str).to.equal(null);
        }
    });
});
