'use strict';

const componentResolver = require('../../comonent-registry').componentResolver;


module.exports = (app) => {
    app.get('/sign-up', (req, res) => {
        res.render('sign-up', {
            title: 'Momager | Sign up',
            scripts: componentResolver('forms/mom-sign-up.js')
        });
    });
};
