'use strict';


const registers = require('./registers');
const albinsonium = require('../../../../client/albinsonium/registry').albinsoniumRegistry;

/**
 * Build the registry based by merging the individual registers into a single object when the module is loaded
 */
const registry = {};
Object.assign(registry, registers.forms);
Object.assign(registry, registers.inputs);
Object.assign(registry, registers.spec);

// append all of the custom inputs as requirements for the form section
Object.keys(registers.inputs).forEach((key) => {
    albinsonium['/alb-js/inputs/alb-form-section.js'].push(key);
});
Object.assign(registry, albinsonium);

module.exports = registry;
