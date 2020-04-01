'use strict';

const componentResolver = require('../../comonent-registry').componentResolver;


module.exports = (app) => {
    app.get('/sign-in', (req, res) => {
        res.render('sign-in', {
            title: 'Momager | Sign in',
            scripts: componentResolver('forms/mom-login.js')
        });
    });
};
