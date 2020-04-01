"use strict";

let DBObject = require('./DBObject');
let MCError = require('../common/MCError');
let inherits = require('util').inherits;

let User = require('./User');

/**
 * Maybe todos: multi-row query parsing ,querying above, below or between dates
 */

function Session(userID, id) {
    DBObject.call(this); // inherit the base

    let self = this;
    const table = "Session";
    let _expires = new Date(); // DATE: should be kept as a date as an object property and converted to a string when needed

    this.id = id;
    this.user_id = userID;
    this.long_expire = false;

    const searchableFields = {
        expires: "date",
        id: "uid",
        user_id: "uid"
        // no searching by long_expires
    };

    let _queryBy = "id";

    /**
     *
     * @param option {string}
     * @returns {boolean}
     */
    this.setQueryBy = function(option) {
        if ((typeof option !== "string") || !(option.toLowerCase() in searchableFields))
            return false;

        _queryBy = option;
        return true;
    };

    this.create = function(userID, shouldExpire) {
        return new Promise(function(resolve, reject) {
            if (typeof userID !== "string" || typeof shouldExpire !== "boolean")
                return reject(new MCError('Not enough input arguments to CREATE for Session', 'EXT'));

            let _uid = self.escape(userID);
            let id = self.generate();
            let _id = self.escape(id);
            let expiry = new Date(shouldExpire ? getSessionTimeout(true) : getSessionTimeout());
            let _expiry = self.escape(expiry);

            const CREATE = `INSERT INTO Session (id, user_id, expires) VALUES (${_id}, ${_uid}, ${_expiry})`;

            self.db.query(CREATE).then(function() {
                self._setInternalValues({id: id, EXPIRES: expiry, USER_ID: userID});
                resolve();
            }).catch(function(err) {
                reject(new MCError('Unable to CREATE session.', 'INT', err));
            });
        });
    };

    this.query = function() {
        return new Promise(function(resolve, reject) {
            let q = generateQuery();
            if (queryValueIsMissing())
                return reject(new MCError('Selected query value must be instantiated before calling QUERY ', 'EXT'));

            self.db.query(q).then(function(rows) {
                if (rows.length < 1)
                    return reject(new MCError('No Session records found in Query', "EXT"));

                self._setInternalValues(rows[0]);
                resolve();
            }).catch(function(err) {
                reject(new MCError("Internal error executing session query", "INT", err));
            });
        });
    };

    function queryValueIsMissing() {
        return (_queryBy === 'id' && !self.id) || (_queryBy === 'expires' && !_expires) || (_queryBy === 'user_id' && !self.user_id);
    }

    function generateQuery() {
        let q = "SELECT * FROM Session WHERE";
        if (_queryBy === 'id')
            q += ` id=${self.escape(self.id)}`;
        else if (_queryBy === 'expires')
            q += ` EXPIRES=${self.escape(_expires)}`;
        else
            q += ` USER_ID=${self.escape(self.user_id)}`;

        return q;
    }

    this.get = function(id) {
        return self.super_get(table, id);
    };

    this.delete = function(id) {
        return self.super_delete(table, id);
    };

    /**
     * Update is currently an alias of .refresh as there is no current use case for updating other fields on the Session
     * table.
     * @returns {Promise<any>}
     */
    this.update = function() {
        return self.refresh()
    };

    this.toString = function() {
        if (!self.user_id)
            return "An uninitialized Session object.";

        return "Session Object expiring at " + _expires.toISOString() + ' belonging to user with ID: ' + self.user_id;
    };

    this._setInternalValues = function(row) {
        if (typeof row !== "object")
            return self._setInternalValues({});

        self.id = row.id;
        self.setExpires(row.EXPIRES);
        self.user_id = row.USER_ID;
        self.long_expire = row.LONG_EXPIRE === 1 || row.LONG_EXPIRE === true;
    };

    /**
     * Session-only
     */

    this.getAndRefresh = function(id) {
        return new Promise(function(resolve, reject) {
            self.get(id).then(function() {
                return self.refresh();
            }).then(function() {
                resolve(self.getExpires());
            }).catch(function(e) {
                reject(e);
            });
        });
    };

    this.refresh = function() {
         return new Promise(function(resolve, reject) {
             if (_expires - 0 > new Date() - 0 + 5*60*1000) // if the date is more than five minutes away
                 return resolve(); // no change will be made

             if (_expires - 0 < new Date() - 0)
                 return self.delete(self.id).then(function() {
                     reject(new MCError("Session timed out", "EXT"));
                 }).catch(function(err) {
                     reject(err);
                 });

             let d = getSessionTimeout(self.long_expire);
             const q = `UPDATE Session SET EXPIRES=${self.escape(d)} WHERE id=${self.escape(self.id)}`;

             self.db.query(q).then(function() {
                self.setExpires(d);
                resolve();
             }).catch(function(err) {
                 reject(new MCError("Error refreshing Session date.", "INT", err));
             });
         });
    };

    /**
     *
     * @param sid
     * @return {Promise}
     */
    this.getUserFromSessionID = function(sid) {
        return new Promise(function(resolve, reject) {
            sid = sid ? sid : self.sid;

            let u;
            if (!sid || typeof sid !== "string" || sid.length !== 32)
                return reject(new MCError('Session ID must be a valid session uid'));

            self.get(sid).then(function() {
                u = new User();
                return u.get(self.user_id);
            }).then(function () {
                resolve(u);
            }).catch(function(e) {
                reject(e);
            });
        });
    };

    /**
     * Datetimes are a bit more finicky, so this function allows for a bit more streamlined interface for setting dates.
     * @param d
     * @returns {Date}
     */
    this.setExpires = function(d) {
        if (!d)
            return _expires = new Date();

        if (d.constructor.name !== "Date")
            return _expires = new Date(d);

        _expires = d;
    };

    this.getExpires = function() {
        return _expires
    };

    /**
     * PRIVATE FUNCTIONS
     */
    /**
     * Returns a new timeout date one hour from the current time. The normal amount of time before signing out a user
     * due to inactivity.
     * @returns {Date}
     */
    function getSessionTimeout(isLong) {
        if (isLong)
            return new Date(new Date() - 0 + 30*24*60*60*1000); // one month from current time

        return new Date(new Date() - 0 + 60*60*1000); // one hour from the current time
    }
}

inherits(Session, DBObject);

module.exports = Session;
