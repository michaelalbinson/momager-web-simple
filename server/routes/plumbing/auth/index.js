"use strict";


module.exports = (app) => {
    ///////////////////////
    // AUTH TEST ENDPOINT
    ///////////////////////
    app.get('/plumbing/auth', (req, res) => {
        res.send({message: "auth index"});
    });

    require('./session')(app);
    require('./sign-up')(app);
    require('./forgot-password')(app);
    require('./user')(app);
    require('./verify')(app);
};
