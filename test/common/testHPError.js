"use strict";

let expect = require('chai').expect;
let MCError = require('../../util/common/MCError');

describe('MCError', function() {
    describe('#getJSON()', function() {
        it('should create an JSON representation of the error object', function() {
            let err = new MCError('myreason');
            expect(err.getJSON()).to.deep
                .equal({reason: 'myreason', status: 'UNKNOWN',
                    date: new Date().toString(), err: undefined});
        });

        it('should contain the error passed to it in the JSON object', function() {
            try {
                obj.propertyDoesntExist;
            } catch (e) {
                let err = new MCError('I did something dumb', 'INT', e);
                expect(err.getJSON()).to.deep.equal({reason: 'I did something dumb', status: 'INT',
                    date: new Date().toString(), err: e});
            }
        });
    });

    describe('#setStatus()', function() {
        it('should ensure that only three statuses are allowed: INT, EXT, and UNKNOWN', function() {
            let err = new MCError('reason', 'INT');
            expect(err.getJSON().status).to.equal("INT");
            err = new MCError('reason', 'EXT');
            expect(err.getJSON().status).to.equal("EXT");
            err = new MCError('reason');
            expect(err.getJSON().status).to.equal("UNKNOWN");
            err = new MCError('reason', 'UNKNOWN');
            expect(err.getJSON().status).to.equal("UNKNOWN");
        });

        it('should change the status to \'UNKNOWN\' if a different status is passed', function() {
             let err = new MCError('reason', 'hello');
             expect(err.getJSON().status).to.equal("UNKNOWN");
             err = new MCError('reason', 'not quite');
             expect(err.getJSON().status).to.equal("UNKNOWN");
        });

        it('should change the status to unknown if the status is not a string', function() {
            let err = new MCError('reason', {});
            expect(err.getJSON().status).to.equal("UNKNOWN");
            err = new MCError('reason', 55);
            expect(err.getJSON().status).to.equal("UNKNOWN");
            err = new MCError('reason', []);
            expect(err.getJSON().status).to.equal("UNKNOWN");
            err = new MCError('reason', false);
            expect(err.getJSON().status).to.equal("UNKNOWN");
        });
    });

    describe('#setReason()', function() {
        it('should prevent setting something that is not a string to the reason', function() {
            let err = new MCError({});
            expect(err.getJSON().reason).to.equal("UNKNOWN");
            err = new MCError([]);
            expect(err.getJSON().reason).to.equal("UNKNOWN");
            err = new MCError(342);
            expect(err.getJSON().reason).to.equal("UNKNOWN");
            err = new MCError(true);
            expect(err.getJSON().reason).to.equal("UNKNOWN");
        });

        it('allows for the reason to be set again after the object has been created', function() {
            let err = new MCError();
            err.setReason("here's a good reason");
            expect(err.getJSON().reason).to.equal("here's a good reason");
        });
    });

    describe('#toString()', function() {
        it('should encapsulate all the information found in the error', function() {
            let err = new MCError('this is silly', 'INT', 'yikes');
            expect(err.toString()).to.equal('{\'status\': \'INT\',\'reason\': \'this is silly\',\'date\': ' +
                '\'' + new Date().toString() + '\',\'err\': yikes}');
        });
    });

    describe('#valueOf()', function() {
        it('should be an alias for toString()', function() {
            let err = new MCError('this is silly', 'INT', 'yikes');
            expect(err.toString()).to.equal(err.valueOf());
        });
    });
});
