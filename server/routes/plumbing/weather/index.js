"use strict";

const WeatherCache = require('../../../db/baseModels/WeatherCache');


module.exports = function(app) {
    app.get('/plumbing/weather', (req, res) => {
        if (!req.query)
            return res.send({ success: false, message: 'Data is required to get weather data' });

        const wc = new WeatherCache();
        wc.query({ lat: req.query.LAT, lon: req.query.LON, city: req.query.city, state: req.query.state }).then(() => {
            res.send({ success: true, data: wc.data });
        }).catch((err) => {
            console.error(err.toString());
            res.send({ success: false });
        });
    });
};
