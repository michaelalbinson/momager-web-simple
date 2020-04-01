"use strict";

const db = require('../db/DatabaseInterface');
const uid = require('../uuidUtil').generate;
const escape = require('mysql').escape;
const MCError = require('../common/MCError');
const tables = require('../../../config/tables.json');

function DBObject() {
    /**
     * Helper objects and functions useful to have for all sub-classes
     */
    this.db = db;
    this.generate = uid;
    this.escape = escape;

    /**
     * Generates an escaped 32 char sequence
     * @returns {string|*}
     */
    this.generateEscaped = function() {
        return self.escape(self.generate());
    };

    /**
     * All sub-classes must implement the following methods
     */
    this.get = null;
    this.create = null;
    this.delete = null;
    this.update = null;
    this.query = null;

    this._setInternalValues = function(arg) {return arg};
    this.setQueryBy = function(arg) {return arg};

    /**
     * All sub-classes must have the 'id' property
     */

    this.id = null;
    this._queryBy = 'id';

    /**
     * Helper "super" methods that allow for a reduction in the amount of code that needs to be written.
     * These should NOT be overridden.
     */
    let self = this;

    /**
     *
     * @param table {string}
     * @param id {string}
     * @returns {Promise<any>}
     */
    this.super_get = function(table, id) {
        return new Promise(function(resolve, reject) {
            if (!self._tableExists(table))
                return reject(new MCError(`Invalid table '${table}' passed to GET`, 'EXT'));

            if ((typeof self.id !== "string") && (typeof id !== "string"))
                return reject(new MCError(`An ID must be provided to GET a row on the '${table}' table`, 'EXT'));

            if (!id)
                id = self.id;

            const q = `SELECT * FROM ${table} WHERE id=${self.escape(id)}`;
            self.db.query(q).then(function(row) {
                if (row.length < 1)
                    return reject(new MCError(`No matching entry on ${table} found in GET`, 'EXT'));

                self._setInternalValues(row[0]);
                resolve();
            }).catch(function(err) {
                reject(new MCError(`An error occurred while trying to GET a row on the '${table}' table.`, 'INT', err));
            });
        });
    };

    /**
     *
     * @param table {string}
     * @param id {string}
     * @returns {Promise<any>}
     */
    this.super_delete = function(table, id) {
        return new Promise(function(resolve, reject) {
            if (!self._tableExists(table))
                return reject(new MCError(`Invalid table '${table}' passed to DELETE`, 'EXT'));

            if ((typeof self.id !== "string") || (typeof id !== "string") || (self.id !== id))
                return reject(new MCError(`The internal and parameter ID must match to DELETE a row on the '${table}'`
                    + ' table', 'EXT'));

            const q = `DELETE FROM ${table} WHERE id=${self.escape(self.id)}`;
            self.db.query(q).then(function() {
                self._setInternalValues();
                resolve();
            }).catch(function(err) {
                reject(new MCError(`An error occurred while trying to DELETE a row on the '${table}' table.`, 'INT', err));
            });
        });
    };

    /**
     * A very unopinionated update function.
     *
     * Make sure any validation is done prior to sending in any parameters because all this function will do is escape
     * provided values.
     *
     * @param table {string}
     * @param serializable {object}
     * @param id {string}
     * @returns {Promise<any>}
     */
    this.super_update = function(table, serializable, id) {
        return new Promise(function(resolve, reject) {
            if (typeof table !== "string" || typeof serializable !== "object" || typeof id !== "string")
                return reject(new MCError(`All three function parameters must be of the correct type to UPDATE ${table}`));

            if (!self._tableExists(table))
                return reject(new MCError(`Invalid table '${table}' passed to UPDATE`, 'EXT'));

            serializable = self.escapeAll(serializable);
            let kv = self.getKVPairs(serializable);
            let _id = self.escape(id);
            const q = `UPDATE ${table} SET ${kv} WHERE id=${_id}`;
            self.db.query(q).then(function() {
                resolve();
            }).catch(function(err) {
                self._setInternalValues();
                reject(new MCError(`Internal error while trying to UPDATE the ${table} entry.`, 'INT', err));
            })
        });
    };

    this.super_setQueryBy = function(qb, types) {
        if (typeof qb !== "string" || qb === "")
            return null;

        if (types.constructor.name !== "Array")
            throw new Error('Second argument must be an array');

        if (!(types.includes(qb.toLowerCase()) || types.includes(qb.toUpperCase())))
            return null;

        self._queryBy = qb.toLowerCase();
        return self._queryBy;
    };

    this.super_query = function(table, orderBy) {
        return new Promise(function(resolve, reject) {
            orderBy = orderBy ? orderBy : '';

            if (!self._tableExists(table))
                return reject(new MCError('Table must be defined in order to QUERY', 'EXT'));

            if (self[self._queryBy.toLowerCase()] === null ||
                self[self._queryBy.toLowerCase()] === undefined)
                return reject(new MCError(`The queryBy value must be set to QUERY ${table}`, 'EXT'));

            const val = self.escape(self[self._queryBy.toLowerCase()]);
            self._queryBy = self._queryBy.toLowerCase() === 'id' ? 'id' : self._queryBy.toUpperCase();
            // limit the query to return one row. To return more, you must inherit from IterableDBObject
            const q = `SELECT * FROM ${table} WHERE ${self._queryBy}=${val} ${orderBy} LIMIT 1`;

            self.db.query(q).then(function(rows) {
                self._setInternalValues(rows[0]);
                resolve();
            }).catch(function(err) {
                reject(new MCError(`Internal error while trying to QUERY ${table}`, 'INT', err));
            });
        });
    };

    /**
     * Determines if any of the passed in arguments are undefined or null
     * @param serializable {object}
     * @returns {boolean}
     */
    this.anyUndefinedOrNull = function(serializable) {
        if (serializable === undefined || serializable === null)
            return true;

        if (typeof serializable === "object")
            return objectHasNullKey(serializable);

        let argument;
        for (let arg in arguments) {
            // noinspection JSUnfilteredForInLoop (no need for hasOwnProperty check here)
            argument = arguments[arg];
            if (argument === null || argument === undefined)
                return true;
        }

        return false;
    };

    /**
     *
     * @param o {object}
     * @returns {boolean}
     */
    function objectHasNullKey(o) {
        for(let key in o) {
            if (!o.hasOwnProperty(key))
                continue;

            if (o[key] === null)
                return true;
        }

        return false;
    }

    /**
     *
     * @param a {*}
     */
    this.escapeAll = function(a) {
        let out = {};
        for (let key in a) {
            if (!a.hasOwnProperty(key))
                continue;

            out[key] = self.escape(a[key])
        }

        return out;
    };

    this.getKVPairs = function(serializable) {
        let kvPairs = "";
        let count = 0;
        let keyCount = Object.keys(serializable).length;
        for (let key in serializable) {
            count++;
            if (!serializable.hasOwnProperty(key))
                continue;

            if (keyCount - 1 < count)
                kvPairs += ` ${key}=${serializable[key]}`;
            else
                kvPairs += ` ${key}=${serializable[key]},`
        }
        return kvPairs;
    };

    /**
     * Internal helper functions
     */

    this._tableExists = function(table_name) {
        return table_name in tables;
    }
}

module.exports = DBObject;
