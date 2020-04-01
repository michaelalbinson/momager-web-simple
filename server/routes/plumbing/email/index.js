"use strict";


module.exports = (app) => {
    ///////////////////////
    // CALENDAR TEST ENDPOINT
    ///////////////////////
    app.get('/plumbing/email', (req, res) => {
        res.send({ message: "email index" });
    });

    app.get('/plumbing/email/availability', (req, res) => {
        res.send({ message: 'availability index' });
    });
};
