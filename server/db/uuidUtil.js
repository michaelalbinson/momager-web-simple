/*
 * uuidUtil.js
 * Written by Michael Albinson 11/19/16
 *
 * Functional interface for generating random things
 */

"use strict";

/** Generates a system unique 32 char string
 *
 * @returns {*} A 32 char alphanumeric string (a UUID)
 */
exports.generate = function() {
    return generateUUID0(32);
};

/** Generates a random 6 char string
 *
 * @returns {*} A 6 char alphanumeric string
 */
exports.generateShort = function() {
    return generateUUID0(6);
};

/** For when the built-ins just don't do the trick... Use them first, there's no sense hardcoding numbers throughout code
 *
 * @param length the desired length of the alphanumeric string
 * @returns {string} the string of length @length
 */
exports.generateIdentifierOfLength = function(length) {
    return generateUUID0(length);
};

/**
 * Generic alpha-numeric string generator. Note that the longer the identifier is the more likely it is to be unique.
 *
 * @param length length of the identifier to create
 * @returns {string} the random identifier
 */
function generateUUID0(length) {
    let identifier = "";
    const allowedChars = "abcdef0123456789";

    for(let i = 0; i < length; i++)
        identifier += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    return identifier
}
