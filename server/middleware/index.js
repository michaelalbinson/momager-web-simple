'use strict';

const bp = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const GlobalUtilities = require('../util/GlobalUtilities');


module.exports = (app) => {
    //////////////////////////////////////////////////////////
    // Verify the API key of the incoming request
    /////////////////////////////////////////////////////////
    require('./handlebars-config')(app);

    app.use(helmet());
    app.use((req, res, next) => {
        res.setHeader("Content-Security-Policy", "default-src: 'self'; script-src 'self' api.ipify.org; style-source: 'self'");
        next();
    });

    app.use(bp.json());
    app.use(cookieParser(GlobalUtilities.getCookieKey(), { httpOnly: true }));
    app.use(getUserSession);
    app.use(logRoute);

    require('./static')(app);
};

function getUserSession(req, res, next) {
    req.session = req.body.session;
    next();
}

function logRoute(req, res, next) {
    let url = req.url;
    if (url.includes('/css') || url.includes('/js') || url.includes('/assets'))
        return next();

    console.log("HTTP 1.1/" + req.method +" to:" + req.url);
    next();
}
