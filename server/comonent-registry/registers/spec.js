'use strict';


const specRegistry = {
    'spec/dash/mom-date-liner.js': [],
    'spec/dash/mom-main-search.js': [],
    'spec/dash/mom-weather-line.js': [
        'spec/util/WeatherLookup.js'
    ],
    'spec/util/WeatherLookup.js': [],
    'spec/mom-article.js': [
        'spec/mom-topic-card.js'
    ],
    'spec/mom-dashboard.js': [
        'spec/dash/mom-date-liner.js',
        'spec/dash/mom-weather-line.js',
        'spec/mom-topic-card.js',
        'spec/dash/mom-main-search.js'
    ],
    'spec/mom-skill-set.js': [
        'spec/mom-topic-card.js'
    ],
    'spec/mom-topic-card.js': []
};

module.exports = specRegistry;
