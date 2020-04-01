"use strict";

let inherits = require('util').inherits;

function A() {
    this.hello = "world";

    this.callA = function() {
        console.log("called A!")
    }
}

function B() {
    A.apply(B);

    this.hello = "hello from B";

    this.callB = function() {
        console.log("called B!")
    }
}

inherits(B, A);

/**
 * Properties only (no functions)
 */
function C() {
    this.hello = "world";
    this.neat = "o";
}

function D() {
    C.apply(this);

    this.hello = "love it";
    this.betterThanC = "yep";
}

inherits(D, C);

module.exports = {
    A: A,
    B: B,
    D: D
};