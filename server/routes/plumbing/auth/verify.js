"use strict";

const DefaultResponse = require('../../util/DefaultResponse');


module.exports = (app) => {
    app.get('/plumbing/auth/verify', (req, res) => {
        // TODO: VERIFY A USER'S ACCOUNT
        res.send(DefaultResponse.success);
    });
};
