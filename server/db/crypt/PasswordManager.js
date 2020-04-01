/**
 * PasswordManager.js
 * Written by Michael Albinson 1/11/20
 *
 * Functional interface for generating secure password hashes and salts, and verifying them
 */

"use strict";

const bcrypt = require('bcrypt');
const createSalt = require('../../db/uuidUtil').generateShort;


class PasswordManager {
    /**
     *
     * @param password {string}
     * @param salt {string=}
     * @return {Promise<{salt: string, passwordHash: string}>}
     */
    static hashAndSalt(password, salt) {
        return new Promise((resolve, reject) => {
            if (!salt)
                salt = createSalt();

            return bcrypt.hash(password + salt, 10, (err, hash) => {
                if (err)
                    return reject(err);

                resolve({
                    salt: salt,
                    passwordHash: hash
                });
            });
        });
    }

    /**
     *
     * @param inData {string}
     * @param salt {string}
     * @param compareTo {string}
     * @return {Promise<boolean>}
     */
    static compareHashAndSalt(inData, salt, compareTo) {
        return new Promise((resolve, reject) => {
            if (!salt)
                return reject(false);

            bcrypt.compare(inData + salt, compareTo, (err, result) => {
                if (err || result === false)
                    return reject(false);

                resolve(true);
            });
        });
    };
}

module.exports = PasswordManager;
