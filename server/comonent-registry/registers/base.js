'use strict';


const baseRegistry = {
    'base/app-footer.js': [],
    'base/app-header.js': [],
    'base/app-page.js': [
        'base/app-footer.js',
        'base/app-header.js'
    ],
    'base/icon-link.js':[]
};

module.exports = baseRegistry;
