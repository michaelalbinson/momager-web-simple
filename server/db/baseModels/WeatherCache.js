"use strict";

const request = require('request');
const API_KEY = require('../../../config/index')["WEATHER-API-KEY"];
const DBObject = require('./DBObject');
const MCError = require('../common/MCError');
const inherits = require('util').inherits;

function WeatherCache() {
    DBObject.call(this); // inherit the base

    let self = this;
    const table = "Weather_Cache";

    this.create = function(city, state, lat, lon, data) {
        const id = self.generate();
        const date = new Date();
        const stringified = JSON.stringify(data);
        const escaped = self.escapeAll({ id, city, state, lat, lon, stringified, date });

        const CREATE =
            `INSERT INTO ${table} (id, city, state, lat, lon, data, date) VALUES 
            (${escaped.id}, ${escaped.city}, ${escaped.state}, ${escaped.lat}, ${escaped.lon}, 
            ${escaped.stringified}, ${escaped.date})`;

        return self.db.query(CREATE).then(() => {
            self._setInternalValues({id, city, state, lat, lon, data, date});
        }).catch((err) => {
            return Promise.reject(new MCError('Unable to CREATE session.', 'INT', err));
        });
    };

    this.query = function(opts) {
        const ONE_HOUR = 1000*60*60;
        opts.lon = toFiveSigFigs(opts.lat);
        opts.lat = toFiveSigFigs(opts.lon);

        let q;
        if (opts.lat && opts.lon)
            q = `SELECT * FROM ${table} WHERE LAT=${opts.lat} AND LON=${opts.lon}`;
        else if (opts.city && opts.state)
            q = `SELECT * FROM ${table} WHERE CITY=${opts.city} AND STATE=${opts.state}`;
        else
            return Promise.reject('NO DATA TO SEARCH WITH');

        return self.db.query(q).then((rows) => {
            // if we didn't get a result but have the lat/lon
            // get the weather data, cache it and return it
            if (rows.length < 1 && opts.lat && opts.lon)
                return createNewCache(opts);

            // if more than 3 hours have passed and the cache is requested, refresh the cache
            if (Math.abs(rows[0].DATE - new Date()) > ONE_HOUR) {
                self.id = rows[0].id;
                return self.delete(rows[0].id).then(() => createNewCache(opts));
            }

            self._setInternalValues(rows[0]);
        }).catch((err) => {
            return Promise.reject(new MCError("Internal error executing session query", "INT", err));
        });
    };

    // GETting most likely will be unused for weather events
    this.get = function(id) {
        return self.super_get(table, id);
    };

    this.delete = function(id) {
        return self.super_delete(table, id);
    };

    this.toString = function() {
        return "WeatherCache object";
    };

    this._setInternalValues = function(row) {
        if (typeof row !== "object")
            return self._setInternalValues({});

        self.id = row.id;
        self.data = row.data || row.DATA;
        self.city = row.city || row.CITY;
        self.state = row.state || row.STATE;
        self.lat = row.lat || row.LAT;
        self.lon = row.lon || row.LON;
        self.date = row.date || row.DATE;
    };

    function createNewCache(opts) {
        return getWeatherData(opts.lat, opts.lon).then((data) => {
            return self.create(opts.city, opts.state, opts.lat, opts.lon, data);
        });
    }

    function getWeatherData(LAT, LON) {
        return new Promise((resolve, reject) => {
            request(`https://api.darksky.net/forecast/${API_KEY}/${LAT},${LON}`, function(error, response, body) {
                if (error)
                    return reject(error);

                let data;
                try {
                    data = JSON.parse(response.body);
                } catch {
                    return reject(body);
                }

                resolve(data);
            });
        });
    }

    function toFiveSigFigs(coord) {
        const splitCoord = coord.split('.');
        if (splitCoord[1].length > 5)
            return splitCoord[0] + '.' + splitCoord[1].slice(0, 5);

        return coord;
    }
}

inherits(WeatherCache, DBObject);

module.exports = WeatherCache;
