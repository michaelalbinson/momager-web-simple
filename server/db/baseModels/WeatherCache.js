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
        return new Promise(function(resolve, reject) {
            const id = self.generate();
            const date = new Date();
            const stringified = JSON.stringify(data);
            const escaped = self.escapeAll({ id, city, state, lat, lon, stringified, date });

            const CREATE =
                `INSERT INTO ${table} (id, city, state, lat, lon, data, date) VALUES 
                (${escaped.id}, ${escaped.city}, ${escaped.state}, ${escaped.lat}, ${escaped.lon}, 
                ${escaped.stringified}, ${escaped.date})`;

            self.db.query(CREATE).then(function() {
                self._setInternalValues({id, city, state, lat, lon, data, date});
                resolve();
            }).catch(function(err) {
                reject(new MCError('Unable to CREATE session.', 'INT', err));
            });
        });
    };

    this.query = function(opts) {
        const ONE_HOUR = 1000*60*60;
        return new Promise(function(resolve, reject) {
            let q;
            if (opts.lat && opts.lon) {
                q = `SELECT * FROM ${table} WHERE LAT=${opts.lat} AND LON=${opts.lon}`
            } else if (opts.city && opts.state) {
                q = `SELECT * FROM ${table} WHERE CITY=${opts.city} AND STATE=${opts.state}`
            } else {
                return reject('NO DATA TO SEARCH WITH');
            }

            self.db.query(q).then(function(rows) {
                // if we didn't get a result but have the lat/lon
                // get the weather data, cache it and return it
                if (rows.length < 1 && opts.lat && opts.lon) {
                    createNewCache(opts).then(resolve).catch(reject);
                    return;
                }

                // if more than 3 hours have passed and the cache is requested, refresh the cache
                if (Math.abs(rows[0].DATE - new Date()) > ONE_HOUR) {
                    self.id = rows[0].id;
                    self.delete(rows[0].id).then(() => createNewCache(opts))
                        .then(resolve).catch(reject);
                    return;
                }

                self._setInternalValues(rows[0]);
                resolve();
            }).catch(function(err) {
                reject(new MCError("Internal error executing session query", "INT", err));
            });
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
        return new Promise((resolve, reject) => {
            getWeatherData(opts.lat, opts.lon).then((data) => {
                return self.create(opts.city, opts.state, opts.lat, opts.lon, data);
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject(err);
            });
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
}

inherits(WeatherCache, DBObject);

module.exports = WeatherCache;
