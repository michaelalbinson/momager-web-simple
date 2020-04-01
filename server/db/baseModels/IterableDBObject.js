"use strict";

let inherits = require('util').inherits;
let DBObject = require('./DBObject');
let MCError = require('../common/MCError');

function IterableDBObject() {
    DBObject.apply(this);

    // never directly access these properties. They are made public to be inheritable by child classes.
    this._queried = false;
    this._rows = [];
    this._idx = -1;

    let self = this;

    /**
     * It is suggested that your child class inherit and implement this method to dump pertinent information and ids to
     * an array that can be sent elsewhere.
     * @returns {array}
     */
    this.dump = function() {return [];};

    /**
     * Shifts to the next index of the internal rows iff there are a series of rows to be iterated through.
     * @returns {boolean}
     */
    this.next = function() {
        if (!self.hasNext())
            return false;

        self._idx += 1;
        this._setInternalValues(self._rows[self._idx]);
        return true;
    };

    /**
     *
     * @return {*}
     */
    this.getCurrentRow = function() {
        return self._rows[self._idx];
    };

    /**
     * Determines if there is another row that can be iterated over.
     * @returns {boolean}
     */
    this.hasNext = function() {
        if (!self._queried)
            return false;

        return self._idx < self._rows.length - 1;
    };

    /**
     * Resets the row index to 0.
     */
    this.resetIndex = function() {
        self._idx = -1;
    };

    this.count = function() {
        return this._rows.length;
    };

    /**
     * @override
     * @param table
     * @param allowNoResults
     * @returns {Promise<any>}
     */
    this.super_query = function(table, allowNoResults) {
        return new Promise(function(resolve, reject) {
            self.resetIndex();
            if (!self._tableExists(table))
                return reject(new MCError('Table must be defined in order to QUERY', 'EXT'));

            if (self[self._queryBy.toLowerCase()] === null ||
                self[self._queryBy.toLowerCase()] === undefined)
                return reject(new MCError(`The queryBy value must be set to QUERY ${table}`, 'EXT'));

            const val = self.escape(self[self._queryBy.toLowerCase()]);
            let q = `SELECT * FROM ${table} WHERE ${self._queryBy.toLowerCase()}=${val}`;
            if (self.orderBy)
                q += " " + self.orderBy;

            self.db.query(q).then(function(rows) {
                self._queried = true;
                if (rows.length < 1 && !allowNoResults)
                    return reject(new MCError('No matching rows found on the table ' + table, 'EXT'));

                self._rows = rows;

                // the initial index is still set to 0 to maintain a consistent interface across classes
                self._setInternalValues(rows[0]);
                resolve();
            }).catch(function(err) {
                self._rows = [];
                reject(new MCError(`Internal error while trying to QUERY ${table}`, 'INT', err));
            });
        });
    };

    /**
     * @param query
     * @param allowNoResults
     * @returns {Promise<any>}
     */
    this.simple_query = function(query, allowNoResults) {
        return new Promise(function(resolve, reject) {
            self.resetIndex();
            if (typeof query !== "string")
                return reject(new MCError('Query must be a string to QUERY', 'EXT'));

            self.db.query(query).then(function(rows) {
                self._queried = true;
                if (rows.length < 1 && !allowNoResults)
                    return reject(new MCError('No matching rows found matching compound query', 'EXT'));

                self._rows = rows;

                // the initial index is still set to 0 to maintain a consistent interface across classes
                self._setInternalValues(rows[0]);
                resolve();
            }).catch(function(err) {
                self._rows = [];
                reject(new MCError(`Internal error while trying to execute compound QUERY`, 'INT', err));
            });
        });
    };

    /**
     * @param table
     * @param deleteBy
     * @param val
     * @return {*}
     */
    this.deleteAll = function(table, deleteBy, val) {
        return new Promise(function(resolve, reject) {
            val = self.escape(val);
            let query = `DELETE FROM ${table} WHERE ${deleteBy}=${val}`;
            self.db.query(query).then(function() {
                resolve();
            }).catch(function () {
                reject();
            });
        })
    };

    this.updateAll = function(table, setCol, setVal, col, val) {
        return new Promise(function(resolve, reject) {
            const query = `UPDATE ${table} SET ${setCol}=${setVal} WHERE ${col}=${self.escape(val)}`;
            self.db.query(query).then(function () {
                resolve();
            }).catch(function () {
                reject();
            });
        });
    }
}

inherits(IterableDBObject, DBObject);

module.exports = IterableDBObject;
