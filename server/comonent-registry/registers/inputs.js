'use strict';


const inputRegistry = {
    'inputs/mom-company-input.js': [
        'inputs/mom-asset-bullet.js'
    ],
    'inputs/mom-form.js': [
        'inputs/mom-form-section.js'
    ],
    'inputs/mom-form-section.js': [
        'inputs/mom-company-input.js',
        'inputs/mom-input.js',
        'inputs/mom-text-area.js',
        'inputs/mom-user-input.js',
        'inputs/mom-select.js'
    ],
    'inputs/mom-input.js': [
        'inputs/mom-input-core.js',
        'inputs/limit-widget.js'
    ],
    'inputs/mom-asset-bullet.js': [
        'inputs/mom-input-core.js'
    ],
    'inputs/mom-input-core.js': [],
    'inputs/mom-text-area.js': [
        'inputs/mom-input-core.js',
        'inputs/limit-widget.js'
    ],
    'inputs/mom-select.js': [
        'inputs/mom-input-core.js',
    ],
    'inputs/mom-user-input.js': [
        'inputs/mom-asset-bullet.js'
    ],
    'inputs/limit-widget.js': []
};

module.exports = inputRegistry;
