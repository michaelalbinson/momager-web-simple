'use strict';

const contentResolver = require('../../content').contentResolver;
const componentResolver = require('../../comonent-registry').componentResolver;


module.exports = (app) => {
    app.get('/dashboard', (req, res) => {
        contentResolver.getTopics().then((allTopics) => {
            res.render('dashboard', {
                scripts: componentResolver('spec/mom-dashboard.js'),
                topics: JSON.stringify(allTopics),
                title: 'Momager | Dashboard'
            })
        });
    });
};
