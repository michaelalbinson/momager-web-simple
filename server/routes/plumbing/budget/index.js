"use strict";


module.exports = (app) => {
    ///////////////////////
    // BUDGET TEST ENDPOINT
    ///////////////////////
    app.get('/plumbing/budget', (req, res) => {
        res.send("budget index");
    });

    app.put('/plumbing/budget', (req, res) => {

    });

    app.post('/plumbing/budget', (req, res) => {

    });
};
