"use strict";

let expect = require('chai').expect;
let Encryptor = require('../util/crypt/Encryptor');

describe('Encryptor', function() {
    describe('#hashAndSalt()', function() {
        it('should hash and salt the provided password to be different than the original', function() {
            const pass = "test123";
            const salt = "testsalt";
            let e = new Encryptor();
            let res = e.hashAndSalt(pass, salt);
            expect(res.passwordHash).to.not.equal(pass);
            expect(res.salt).to.equal(salt); // the salt out is the same as the salt in
        });

        it('should return the same result if the same password is hashed with the same salt', function() {
            const pass = "test123";
            const salt = "testsalt";
            let e = new Encryptor();
            let res1 = e.hashAndSalt(pass, salt);
            let res2 = e.hashAndSalt(pass, salt);
            expect(res1).to.deep.equal(res2);
        });

        it('should create two different hashes if two different salts or passwords are provided', function() {
            const pass1 = "test";
            const pass2 = "elohel";
            const salt1 = "salty";
            const salt2 = "saltier";

            let e = new Encryptor();
            expect(e.hashAndSalt(pass1, salt1)).to.not.deep.equal(e.hashAndSalt(pass1, salt2));
            expect(e.hashAndSalt(pass2, salt1)).to.not.deep.equal(e.hashAndSalt(pass1, salt2));
            expect(e.hashAndSalt(pass1, salt2)).to.not.deep.equal(e.hashAndSalt(pass2, salt2));
            expect(e.hashAndSalt(pass2, salt2)).to.not.deep.equal(e.hashAndSalt(pass1, salt2));
        });

        it('should generate a short salt if no salt is provided to the function', function() {
            const pass = "abc123";
            let e = new Encryptor();
            let lazy = e.hashAndSalt(pass);
            expect(lazy.salt).to.not.equal(undefined);
            expect(lazy.passwordHash).to.not.equal(undefined);
        });
    });

    describe('#getNewSalt()', function() {
        it('should generate a short (6 chararcter) random string for salting with', function() {
            let e = new Encryptor();
            let salt = e.getNewSalt();
            expect(salt.length).to.equal(6);
        })
    });

    describe('#compareHashAndSalt', function() {
        it('should return false if no salt is supplied', function() {
            let e = new Encryptor();
            expect(e.compareHashAndSalt("password")).to.equal(false);
        });

        it('should return false if the hashed password does not match the compareTo argument', function() {
            let e = new Encryptor();
            expect(e.compareHashAndSalt("password", "a salt", "not a match")).to.equal(false);
        });

        it('should return true if the compareTo argument matched the hashed and salted password', function() {
            const pass = "password";
            const salt = "salt";
            const hash = "1c8e432462648d825ade4983da4b1c9cc231180d3dd0e77b0cfe0b28c5e2f2b39aa3adabfcd5e1fe968b9e815" +
                "005cf67499c30177f4c0199e39064ceaa5adefa";

            let e = new Encryptor();
            expect(e.compareHashAndSalt(pass, salt, hash)).to.equal(true);
        });
    });
});