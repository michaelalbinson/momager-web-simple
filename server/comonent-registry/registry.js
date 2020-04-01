'use strict';


const registers = require('./registers');

/**
 * Build the registry based by merging the individual registers into a single object when the module is loaded
 */
const registry = {};
Object.assign(registry, registers.base);
Object.assign(registry, registers.forms);
Object.assign(registry, registers.inputs);
Object.assign(registry, registers.spec);

module.exports = registry;
