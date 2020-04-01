"use strict";

let uuidUtil = require('../util/uuidUtil');
let expect = require('chai').expect;

describe('uuidUtil', function() {
    describe('#generateIdentifierOfLength()', function() {
        it('should generate a unique identifier of the correct length following the spec regular expression', function() {
            let uid = uuidUtil.generateIdentifierOfLength(15);
            expect(uid.length).to.equal(15);
            expect(new RegExp('[a-f,0-9]*').test(uid)).to.equal(true);
        });
    });
});