"use strict";

let chai = require('chai');
let expect = require('chai').expect;
let sanitizer = require('../../util/common/sanitizer-helper');
let sinon = require('sinon');
let sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('sanitizer-helper', function () {
    describe('#jsonHasStructure()', function() {
        it('should return false if either or both arguments are not JSON objects', function() {
            expect(sanitizer.jsonHasStructure(undefined, undefined)).to.equal(false);
            expect(sanitizer.jsonHasStructure(undefined, {})).to.equal(false);
            expect(sanitizer.jsonHasStructure({}, undefined)).to.equal(false);
            expect(sanitizer.jsonHasStructure(1, 2)).to.equal(false);
            expect(sanitizer.jsonHasStructure([], "hello")).to.equal(false);
            expect(sanitizer.jsonHasStructure(true, {})).to.equal(false);
            expect(sanitizer.jsonHasStructure([], [])).to.equal(false);
        });

        it('should succeed for two empty objects', function() {
            expect(sanitizer.jsonHasStructure({}, {})).to.equal(true);
        });

        it('should return false if the `is` parameter has more or fewer keys than the `should` key', function() {
            expect(sanitizer.jsonHasStructure({a: "only one key"}, {a: "one key", b: "two keys"})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: "one key", b: "two keys", c: "green key", d: "red key"}, {a: ":("}));
        });

        it('should verify the simple JSON object has the correct structure', function() {
            const should = {a: "number"};
            const is = {a: 123};
            expect(sanitizer.jsonHasStructure(should, is)).to.equal(true);
        });

        it ('should correctly verify each of the following cases', function() {
            expect(sanitizer.jsonHasStructure({a: 'number'}, {a: 123})).to.equal(true);
            expect(sanitizer.jsonHasStructure({a: 'boolean'}, {a: false})).to.equal(true);
            expect(sanitizer.jsonHasStructure({a: 'string'}, {a: "it's a string"})).to.equal(true);
            expect(sanitizer.jsonHasStructure({a: 'date'}, {a: "1997-03-03"})).to.equal(true);
            expect(sanitizer.jsonHasStructure({a: {b: "string"}}, {a: {b: "inner string!"}})).to.equal(true);
            expect(sanitizer.jsonHasStructure({a: "uid"}, {a: 'a4a6a4a2c5452a8f7a1a5089a1a50931'})).to.equal(true);
            expect(sanitizer.jsonHasStructure({a: "array"}, {a: [1, 2, 3, 4]})).to.equal(true);
        });

        it('should verify that the "is" JSON matches the "should" JSON', function() {
            const should = {
                a: "string",
                b: "number",
                c: "array",
                d: {
                    e: "string"
                },
                f: "date",
                g: 'uid'
            };

            const is = {
                a: "I'm a string!",
                b: 42,
                c: [1, 2, 3],
                d: {
                    e: "Another string!"
                },
                f: "1996-04-06",
                g: "a4a6a4a2c5452a8f7a1a5089a1a50931"
            };

            expect(sanitizer.jsonHasStructure(should, is)).to.equal(true);
        });

        it('should succeed in this slightly more complicated example', function() {
            const should = {
                a: "string: {'regex': 'I\'m a string!'}",
                b: "number",
                c: "array: {'len': 3}",
                d: {
                    e: "string"
                },
                f: "date: {'start': '1900-01-01', 'end': '2020-01-01'}",
                g: 'uid'
            };

            const is = {
                a: "I'm a string!",
                b: 42,
                c: [1, 2, 3],
                d: {
                    e: "Another string!"
                },
                f: "1996-04-06",
                g: "a4a6a4a2c5452a8f7a1a5089a1a50931"
            };

            expect(sanitizer.jsonHasStructure(should, is)).to.equal(true);
        });

        it('should return false in each of the following examples', function() {
            // type mismatches
            expect(sanitizer.jsonHasStructure({a: 'number'}, {a: "hello"})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: 'boolean'}, {a: 123})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: 'string'}, {a: false})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: 'date'}, {a: "I'm not a date"})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: {b: "string"}}, {a: "hello"})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: "uid"}, {a: 'not_a_real_uid'})).to.equal(false);
            expect(sanitizer.jsonHasStructure({a: "array"}, {a: false})).to.equal(false);

            // invalid type
            expect(sanitizer.jsonHasStructure({a: "an invalid type"}, {a: "yo"})).to.equal(false);
        });

        it('should take the hasOwnProperty branch', function() {
            let S = function() {
                this.a = "a property";
            };

            let s = new S();
            let stub = sinon.stub(s, 'hasOwnProperty');
            stub.returns(false);

            expect(sanitizer.jsonHasStructure(s, {a: "yo"})).to.equal(true);
            s.hasOwnProperty.restore();
        });
    });

    describe('#isNumber()', function() {
        it('should allow both floats, ints and NaNs through', function() {
            expect(sanitizer.isNumber(1)).to.equal(true);
            expect(sanitizer.isNumber(1.2)).to.equal(true);
            expect(sanitizer.isNumber(NaN)).to.equal(true);
            expect(sanitizer.isNumber(-45)).to.equal(true);
            expect(sanitizer.isNumber(-4.5222)).to.equal(true);
            expect(sanitizer.isNumber(0)).to.equal(true);
        });

        it('should fail on all non-numerical input', function() {
            expect(sanitizer.isNumber("")).to.equal(false);
            expect(sanitizer.isNumber({})).to.equal(false);
            expect(sanitizer.isNumber([])).to.equal(false);
            expect(sanitizer.isNumber(true)).to.equal(false);
            expect(sanitizer.isNumber("my string")).to.equal(false);
            expect(sanitizer.isNumber("0")).to.equal(false);
            expect(sanitizer.isNumber("1.1")).to.equal(false);
            expect(sanitizer.isNumber("-45")).to.equal(false);
        })
    });

    describe('#isValidNumber', function() {
        it('should allow numbers between an upper and lower bound', function() {
            expect(sanitizer.isValidNumber(1, 0, 2)).to.equal(true);
            expect(sanitizer.isValidNumber(1.67, -15, 45)).to.equal(true);
            expect(sanitizer.isValidNumber(-45, -100, 55)).to.equal(true);
            expect(sanitizer.isValidNumber(-5.6, -10.01, 1.23)).to.equal(true);
        });

        it('should return false if not with the upper or lower bounds', function() {
            expect(sanitizer.isValidNumber(-1, 0, 2)).to.equal(false);
            expect(sanitizer.isValidNumber(111.67, -15, 45)).to.equal(false);
            expect(sanitizer.isValidNumber(-115, -100, 55)).to.equal(false);
            expect(sanitizer.isValidNumber(-12.25, -10.01, 1.23)).to.equal(false);
        });

        it('should ignore the upper bound if it is undefined or not provided', function() {
            expect(sanitizer.isValidNumber(-1, -55, undefined)).to.equal(true);
            expect(sanitizer.isValidNumber(1.34, 0, undefined)).to.equal(true);
            expect(sanitizer.isValidNumber(4, 2.21)).to.equal(true);
            expect(sanitizer.isValidNumber(3.3, 3)).to.equal(true);
        });

        it('should still fail if provided with something that is not a number', function() {
            expect(sanitizer.isValidNumber("hell0")).to.equal(false);
            expect(sanitizer.isValidNumber({}, 1, 4)).to.equal(false);
            expect(sanitizer.isValidNumber([], 4)).to.equal(false);
            expect(sanitizer.isValidNumber(false, 3, 9)).to.equal(false);
        });

        it('will return true if just given a single number', function() {
            expect(sanitizer.isValidNumber(1.1)).to.equal(true);
            expect(sanitizer.isValidNumber(6)).to.equal(true);
        });
    });

    describe('#isBoolean', function () {
        it('will return true if it is provided a boolean', function() {
            expect(sanitizer.isBoolean(false)).to.equal(true);
            expect(sanitizer.isBoolean(true)).to.equal(true);
        });

        it('will return false if it is provided anything but a boolean', function() {
            expect(sanitizer.isBoolean(0)).to.equal(false);
            expect(sanitizer.isBoolean(1)).to.equal(false);
            expect(sanitizer.isBoolean("")).to.equal(false);
            expect(sanitizer.isBoolean([])).to.equal(false);
            expect(sanitizer.isBoolean({})).to.equal(false);
            expect(sanitizer.isBoolean("hell0 w0r1d")).to.equal(false);
        });
    });

    describe('#isString', function() {
        it('will return true if provided any string', function() {
            expect(sanitizer.isString("")).to.equal(true);
            expect(sanitizer.isString("Hello World")).to.equal(true);
            expect(sanitizer.isString('')).to.equal(true);
            expect(sanitizer.isString('single tick strings rule')).to.equal(true);
            expect(sanitizer.isString(`template strings are also rad`)).to.equal(true);
        });

        it('will return false if provided with any other primitive', function() {
            expect(sanitizer.isString(0)).to.equal(false);
            expect(sanitizer.isString(1.1)).to.equal(false);
            expect(sanitizer.isString({})).to.equal(false);
            expect(sanitizer.isString([])).to.equal(false);
            expect(sanitizer.isString(false)).to.equal(false);
        });
    });

    describe('#isValidString', function() {
        it('should take a regex and return true if the argument string matches it', function() {
            expect(sanitizer.isValidString("hello", /hello/)).to.equal(true);
            expect(sanitizer.isValidString("abbbbc", /ab*c/)).to.equal(true);
        });

        it('should return false if anything other than a regex is passed as the second argument', function() {
            expect(sanitizer.isValidString("blah", "blah")).to.equal(false);
            expect(sanitizer.isValidString("hello", {})).to.equal(false);
            expect(sanitizer.isValidString("hello", [])).to.equal(false);
            expect(sanitizer.isValidString("hello", 12)).to.equal(false);
            expect(sanitizer.isValidString("hello", 5.4)).to.equal(false);
        });

        it('should return true if the no second argument is provided and the first argument is a string', function () {
            expect(sanitizer.isValidString("hello")).to.equal(true);
            expect(sanitizer.isValidString("hello", undefined)).to.equal(true);
            expect(sanitizer.isValidString("something else")).to.equal(true);
        });

        it('should return false if the first argument is not a string', function() {
            expect(sanitizer.isValidString(1, /hello/)).to.equal(false);
            expect(sanitizer.isValidString(2.3, /hello/)).to.equal(false);
            expect(sanitizer.isValidString({}, /hello/)).to.equal(false);
            expect(sanitizer.isValidString([], /hello/)).to.equal(false);
            expect(sanitizer.isValidString({neat: 'property'}, /hello/)).to.equal(false);
        });
    });

    describe('#isValidUID()', function() {
        it('should return false if the argument is not a string', function() {
            expect(sanitizer.isValidUID(1)).to.equal(false);
            expect(sanitizer.isValidUID({})).to.equal(false);
            expect(sanitizer.isValidUID([])).to.equal(false);
            expect(sanitizer.isValidUID(3.3)).to.equal(false);
            expect(sanitizer.isValidUID({property: 'value'})).to.equal(false);
        });

        it('should return false if the input string is not a valid UID', function() {
            expect(sanitizer.isValidUID('neat-o')).to.equal(false);
            expect(sanitizer.isValidUID('this is a super long string and I hope that is long enough')).to.equal(false);
            expect(sanitizer.isValidUID('')).to.equal(false);
            expect(sanitizer.isValidUID('31charactersaaaaaaaaaaaaaaaaaaa')).to.equal(false);
        });

        it('should return true for a valid UID', function() {
            expect(sanitizer.isValidUID('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).to.equal(true);
            expect(sanitizer.isValidUID('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab')).to.equal(true);
            expect(sanitizer.isValidUID('ff923023bbbea35dcdefcba098456123')).to.equal(true);
        });
    });

    describe('#isObject()', function() {
        it('should return true if the input is an object', function() {
            expect(sanitizer.isObject({})).to.equal(true);
            expect(sanitizer.isObject([])).to.equal(true);
            expect(sanitizer.isObject({prop: 'val'})).to.equal(true);
            expect(sanitizer.isObject([1, 2, 3])).to.equal(true);
            expect(sanitizer.isObject(new RegExp('/hello/'))).to.equal(true);
        });

        it('should return false if the input is not an object', function() {
            expect(sanitizer.isObject(1.67)).to.equal(false);
            expect(sanitizer.isObject(0)).to.equal(false);
            expect(sanitizer.isObject(true)).to.equal(false);
            expect(sanitizer.isObject("string")).to.equal(false);
        });
    });

    describe('#isDate', function() {
        it('should return true for any date format', function() {
            expect(sanitizer.isDate("Jan 1, 2018")).to.equal(true);
            expect(sanitizer.isDate("September 6, 2014")).to.equal(true);
            expect(sanitizer.isDate("1/1/2018")).to.equal(true);
            expect(sanitizer.isDate("1/1/1970")).to.equal(true);
            expect(sanitizer.isDate("1997-03-27")).to.equal(true); // this is the preferred ISO-standard
        });

        it('should return false if provided a string that does not evaluate to a Date', function() {
            expect(sanitizer.isDate("hello")).to.equal(false);
            expect(sanitizer.isDate("September 66, 1970")).to.equal(false);
            expect(sanitizer.isDate("1/1/notadate")).to.equal(false);
            expect(sanitizer.isDate("notadate1/1/2018")).to.equal(false);
            expect(sanitizer.isDate("notadate0-03-27")).to.equal(false);
            expect(sanitizer.isDate("notadate-03-27")).to.equal(false);
            expect(sanitizer.isDate(1)).to.equal(false);
            expect(sanitizer.isDate(10000.45)).to.equal(false);
            expect(sanitizer.isDate({})).to.equal(false);
            expect(sanitizer.isDate([])).to.equal(false);
        });
    });

    describe('#isValidDate()', function() {
        it('should return true if between the start and end date', function() {
            expect(sanitizer.isValidDate("2018-1-1", "2017-12-31", "2018-1-2")).to.equal(true);
            expect(sanitizer.isValidDate("2017-3-3", "1975-3-4", "2019-1-1")).to.equal(true);

            // it can also take other date formats... but we prefer the ISO standard as it's more predictable
            expect(sanitizer.isValidDate("3/3/2017", "3/2/2016", "7/11/3000")).to.equal(true);
            expect(sanitizer.isValidDate("Jan 15, 2018", "Sept 20, 2013", "May 22, 2019"));
            expect(sanitizer.isValidDate("February 26, 1995", "July 4, 1776", "August 22, 2020"));
        });

        it('should return false if presented with a date outside of the interval', function() {
            expect(sanitizer.isValidDate("2019-4-5", "2020-5-5", "2022-6-7")).to.equal(false);
            expect(sanitizer.isValidDate("2030-04-10", "1970-06-07", "2025-05-05")).to.equal(false);
        });

        it('should return false if the start date is after the end date', function() {
            expect(sanitizer.isValidDate("2018-1-1", "2019-12-31", "2018-1-2")).to.equal(false);
            expect(sanitizer.isValidDate("2017-3-3", "2020-3-4", "2019-1-1")).to.equal(false);
        });

        it('should return true if ahead of the start date and the third argument is undefined', function() {
            expect(sanitizer.isValidDate("2018-1-1", "2017-12-31", undefined)).to.equal(true);
            expect(sanitizer.isValidDate("2017-3-3", "1975-3-4", undefined)).to.equal(true);
            expect(sanitizer.isValidDate("1977-04-01", "1960-01-01")).to.equal(true); // even if the third argument isn't given
        });

        it('should return false if provided an invalid date as the first argument', function() {
            expect(sanitizer.isValidDate('invalid!')).to.equal(false);
            expect(sanitizer.isValidDate("thisisnotadate", "2017-12-31", "2018-1-1")).to.equal(false);
        });
    });

    describe('#isArray()', function() {
        it('shuold return false if a non=array is passed to it', function() {
            expect(sanitizer.isArray(1)).to.equal(false);
            expect(sanitizer.isArray(true)).to.equal(false);
            expect(sanitizer.isArray(4.4)).to.equal(false);
            expect(sanitizer.isArray({})).to.equal(false);
            expect(sanitizer.isArray("a string")).to.equal(false);
        });

        it('should return true if an array is passed as the first argument', function() {
            expect(sanitizer.isArray([])).to.equal(true);
            expect(sanitizer.isArray([1, 2, 3])).to.equal(true);
            expect(sanitizer.isArray(["a", "string", "array"])).to.equal(true);
            expect(sanitizer.isArray([{an: "interesting"}, {object:"array"}])).to.equal(true);
        });

        it('should return true if the second argument matches the length of the array', function() {
            expect(sanitizer.isArray([], 0)).to.equal(true);
            expect(sanitizer.isArray([1, 2, 3], 3)).to.equal(true);
            expect(sanitizer.isArray(["check", "it", "out", "ma"], 4)).to.equal(true);
            expect(sanitizer.isArray([{}, {}, new RegExp('/hello/'), {}], 4)).to.equal(true);
        });

        it('should return false if the length argument does not match the length of the array', function() {
            expect(sanitizer.isArray([], 1)).to.equal(false);
            expect(sanitizer.isArray([22222, "nice"], 0)).to.equal(false);
            expect(sanitizer.isArray([5, 6, 7], 4)).to.equal(false);
            expect(sanitizer.isArray(["hellooooo", "world"], 10000)).to.equal(false);
        });

        it('should return false if second argument is not a number', function() {
            expect(sanitizer.isArray(['my', 'string', 'array'], "yolo")).to.equal(false);
            expect(sanitizer.isArray(['my', 'string', 'array'], false)).to.equal(false);
            expect(sanitizer.isArray(['my', 'string', 'array'], true)).to.equal(false);
            expect(sanitizer.isArray(['my', 'string', 'array'], {})).to.equal(false);
            expect(sanitizer.isArray(['my', 'string', 'array'], [])).to.equal(false);
        })
    });
});