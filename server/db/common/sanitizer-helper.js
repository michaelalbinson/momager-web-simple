"use strict";

/**
 * Returns true if the types specified in the JSON object <should> match the types found in the JSON object <is>. It is
 * easiest to illustrate this through an example.
 *
 * Suppose I have a JSON object sent to the server from the client with the following structure:
 * clientObj = {
 *      a: "a string",
 *      b: 123,
 *      c: [],
 *      d: {e: "a nested object"}
 * }
 *
 * And I want to check to ensure it has the structure:
 * expectedObj = {
 *     a: string
 *     b: number,
 *     c: array,
 *     d: object (with sub-object) {e: string}
 * }
 *
 * This function would allow me to do so by passing in <clientObj> as the <is> parameter and
 * shouldBe = {
 *      a: "string"
 *      b: "number"
 *      c: "array"
 *      d: {e: "string"}
 * }
 *
 * as the <should> parameter. More examples can be found in the README.
 *
 * @param should
 * @param is
 * @returns {boolean}
 */
function jsonHasStructure(should, is) {
    if (typeof should !== "object" || typeof is !== "object" || isArray(should) || isArray(is))
        return false;

    const shouldKeys = Object.keys(should);
    const isKeys = Object.keys(is);

    // if we don't have the same number of keys in both objects, they can't match
    if (shouldKeys.length !== isKeys.length)
        return false;

    // if <should> has zero keys, then so does <is> and there's no point in trying to iterate over their keys
    if (shouldKeys.length === 0)
        return true;

    for (let k in shouldKeys) {
        let curr = shouldKeys[k];
        if (!should.hasOwnProperty(curr))
            continue;

        // if is doesn't have the current property, the structures can't match
        if (is[curr] === undefined || !keyTypeMatch(should[curr], is[curr]))
            return false;
    }

    return true;
}

/**
 * Helper methods for jsonHasStructure
 */

/**
 * Determines if the value passed in matches the type specified in <shouldType>.
 * @param shouldType
 * @param isValue
 */
function keyTypeMatch(shouldType, isValue) {
    let ext = extractPrefix(shouldType);
    let prefix = ext.prefix;
    let postfix = ext.postfix;

    switch(prefix) {
        case (dataTypes.string):
            if (!parseStringType(prefix, postfix, isValue)) return false;
            break;
        case (dataTypes.boolean):
            if (!isBoolean(isValue)) return false;
            break;
        case (dataTypes.date):
            if (!parseDateType(prefix, postfix, isValue)) return false;
            break;
        case (dataTypes.uid):
            if (!isValidUID(isValue)) return false;
            break;
        case (dataTypes.json):
            if (!jsonHasStructure(shouldType, isValue)) return false;
            break;
        case (dataTypes.array):
            if (!parseArrayType(prefix, postfix, isValue)) return false;
            break;
        case (dataTypes.number):
            if (!isNumber(isValue)) return false;
            break;
        default:
            console.error('Invalid type passed to keyTypeMatch "' + prefix +'".');
            return false;
    }

    return true;
}

/**
 * Grabs the prefix and postfix for the type string passed in. If there is no postfix, postfix will return undefined.
 * @param shouldType
 * @returns {{prefix: *, postfix: *}}
 */
function extractPrefix(shouldType) {
    let prefix, postfix;
    if (typeof shouldType === 'object') // if it's an object we have to recurse
        return {prefix: 'json', postfix: shouldType};

    const idx = shouldType.indexOf(':');

    if (idx < 0) {
        prefix = shouldType;
    }
    else {
        prefix = shouldType.slice(0, idx);
        postfix = shouldType.slice(idx + 2);
    }

    return {prefix: prefix, postfix: postfix}
}

/**
 * Grabs information from the postfix, if there is any, and applies the arguments it finds to the isValidString function.
 * @param prefix
 * @param postfix
 * @param isValue
 * @returns {boolean}
 */
function parseStringType(prefix, postfix, isValue) {
    if (postfix === undefined)
        return isString(isValue);

    let postJS = JSON.stringify(postfix);
    return isValidString(isValue, postJS.regex);
}

/**
 * Grabs information from the postfix, if it exists, and applies it to the isValidDate function.
 * @param prefix
 * @param postfix
 * @param isValue
 * @returns {boolean}
 */
function parseDateType(prefix, postfix, isValue) {
    if (postfix === undefined)
        return isDate(isValue);

    let postJS = JSON.stringify(postfix);
    return isValidDate(isValue, postJS.start, postJS.end);
}

/**
 * Grabs information from the postfix, if there is any, and applies it the isArray function.
 * @param prefix
 * @param postfix
 * @param isValue
 * @returns {boolean}
 */
function parseArrayType(prefix, postfix, isValue) {
    if (postfix === undefined)
        return isArray(isValue);

    let postJS = JSON.stringify(postfix);
    return isArray(isValue, postJS.len);
}

/**
 * Public type-checking helper methods
 */

/**
 * Returns whether or not an argument is a number (either an integer, float, or NaN).
 * @param arg
 * @returns {boolean}
 */
function isNumber(arg) {
    return typeof arg === "number";
}

/**
 * Checks if the argument <arg> is both a valid number, and between the upper and lower bounds, if specified. If only
 * the lower bound is specified, only this bound is checked. If neither the upper or lower bounds are specified, the number
 * is just checked if it is a valid javascript number or not.
 *
 * @param arg
 * @param lb
 * @param ub
 * @returns {boolean}
 */
function isValidNumber(arg, lb, ub) {
    if (!isNumber(arg))
        return false;

    if (!lb && !ub)
        return true;

    if (ub)
        return arg >= lb && arg <= ub;
    else
        return arg >= lb;
}

/**
 * Determines if the argument arg is a boolean or not (only <true> or <false>) is acceptable.
 * @param arg
 * @returns {boolean}
 */
function isBoolean(arg) {
    return typeof arg === "boolean";
}

/**
 * Detemines if the argument <arg> is a string or not
 * @param arg
 * @returns {boolean}
 */
function isString(arg) {
    return typeof arg === "string";
}


/**
 * Determines if the argument <arg> is a valid argument and matches the specified regular expression.
 * @param arg The variable to check
 * @param regex The regular expression to match against
 * @returns {boolean}
 */
function isValidString(arg, regex) {
    if (!isString(arg))
        return false;

    if (!regex)
        return true;

    // if provided with something other than a Regular expression as the second argument, fail the test.
    if (typeof regex !== "object" || regex.constructor.name !== "RegExp") {
        console.error('sanitizer-helper.isValidString was passed a non-regex as its second argument.\nDid you mean to pass one?');
        return false;
    }

    return regex.test(arg);
}

/**
 * Determines if the argument <arg> is both a string and a valid 32 character UID
 * @param arg
 * @returns {boolean}
 */
function isValidUID(arg) {
    if (!isString(arg) && !/[0-9,a-f]/.test(arg))
        return false;

    return arg.length === 32;
}

/**
 * Returns whether or not the input argument is an object. Note that both arrays and JSON are classified as objects
 * (as well as any actual objects, such as a new RegExp(...) or new Boolean(...), though javascript objects like these
 * cannot be passed in request JSON).
 * @param arg
 * @returns {boolean}
 */
function isObject(arg) {
    return typeof arg === "object"
}

/**
 * Returns if the argument is a valid date or not.
 * @param arg
 * @returns {boolean}
 */
function isDate(arg) {
    // this allows ISO-standard dates, but takes away a few other weird things... like Date.parse accepting
    // notadate-03-27 as a parsable date.
    const dateFormat =
        /^([0-9]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december|-|\/|,|\s)*$/;
    if (!isString(arg))
        return false;

    if (!dateFormat.test(arg.toLowerCase()))
        return false;

    return !isNaN(Date.parse(arg));
}

/**
 * Returns is the date argument is a valid date between the start and end dates specified.
 * @param date
 * @param start
 * @param end
 * @returns {boolean}
 */
function isValidDate(date, start, end) {
    if (!isDate(date))
        return false;

    if (start === undefined && end === undefined)
        return true;

    let test = Date.parse(date);
    let stD = Date.parse(start);

    if (end === undefined)
        return stD <= test;

    let endD = Date.parse(end);

    if (stD > endD)
        return false; // start date must come before the end date

    return stD <= test && test <= endD;
}

/**
 * Determines if <arg> is a valid array. Optional second argument <len> allows you to check the length of the array.
 * @param arg
 * @param len
 * @returns {boolean}
 */
function isArray(arg, len) {
    if (len === undefined)
        return Array.isArray(arg);

    if (!isNumber(len))
        return false;

    return Array.isArray(arg) && arg.length === len;
}

const dataTypes = {
    number: "number",
    boolean: "boolean",
    string: "string",
    uid: "uid",
    date: "date",
    array: "array",
    json: "json"
};

module.exports = {
    jsonHasStructure: jsonHasStructure,
    isNumber: isNumber,
    isValidNumber: isValidNumber,
    isBoolean: isBoolean,
    isString: isString,
    isValidString: isValidString,
    isValidUID: isValidUID,
    isObject: isObject,
    isDate: isDate,
    isValidDate: isValidDate,
    isArray: isArray,
    dt: dataTypes
};