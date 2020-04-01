//
//  handlebarsConfig.js
//
//  Written by Michael Albinson 1/25/20
//
//  Setup the handlebars templating environment
//

"use strict";

const handlebars = require('express-handlebars');


module.exports = (app) => {
    const hbs = handlebars.create({
        helpers: {},
        defaultLayout: 'main'
    });

    app.engine('handlebars', hbs.engine);
    app.set('view engine', 'handlebars');
};
