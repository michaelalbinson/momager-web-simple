'use strict';


const specRegistry = {
    'spec/mom-article.js': [
        'spec/mom-topic-card.js'
    ],
    'spec/mom-dashboard.js': [
        'spec/dash/mom-date-liner.js',
        'spec/dash/mom-weather-line.js',
        'spec/mom-topic-card.js',
        'spec/dash/mom-main-search.js'
    ],
    'spec/dash/mom-date-liner.js': [],
    'spec/mom-skill-set.js': [
        'spec/mom-topic-card.js'
    ],
    'spec/dash/mom-main-search.js': [],
    'spec/mom-topic-card.js': [],
    'spec/dash/mom-weather-line.js': []
};

module.exports = specRegistry;
