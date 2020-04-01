"use strict";


module.exports = (app) => {
    ///////////////////////
    // CALENDAR TEST ENDPOINT
    ///////////////////////
    app.get('/plumbing/calendar', (req, res) => {
        res.send("calendar index");
    });

    require('./event')(app);
};
