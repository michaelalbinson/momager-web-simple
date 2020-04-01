"use strict";

let DBObject = require('./DBObject');
let inherits = require('util').inherits;
let MCError = require('../common/MCError');
let User = require('./User');
let Mailer = require('../mailer/Mailer');


function VerificationKey(user_id, key) {
    DBObject.call(this);

    const self = this;
    let _queryBy = "id";
    const tableName = "Verification_Key";

    self.user_id = user_id;
    self.user_key = key;

    const nullCore = {
        id: null,
        USER_ID: null,
        USER_KEY: null
    };

    this.setQueryBy = function(option) {
        const allowed = ['user_id', 'user_key'];
        return self.super_setQueryBy(option, allowed);
    };

    this._setInternalValues = function(row) {
        if (typeof row !== "object")
            return self._setInternalValues(nullCore);

        self.id = row.id;
        self.user_id = row.USER_ID || row.user_id;
        self.user_key = row.USER_KEY || row.user_key;
    };

    this.get = function(id) {
        return this.super_get(tableName, id);
    };

    this.query = function() {
        return new Promise(function(resolve, reject) {
            let value = self[_queryBy];
            if (!value)
                return reject(new MCError('Invalid query option selected'));

            value = self.escape(value);
            const query = `SELECT * FROM User WHERE ${_queryBy}=${value}`;
            self.db.query(query).then(function(row) {

            })
        });
    };

    this.create = function(user_id) {
        return new Promise(function(resolve, reject) {
            if (!user_id)
                return reject(new MCError('User id must be defined to CREATE Verification Key', 'EXT'));

            const id = self.generate();
            const _id = self.escape(id);
            const _user_id = self.escape(user_id);
            const user_key = self.generate();
            const _key = self.escape(user_key);

            const query = `INSERT INTO Verification_Key VALUES (id, user_id, user_key) VALUES (${_id}, ${_user_id}, ${_key})`;

            // first check and see if there's a user for the user id, otherwise we can't create the key
            let u = new User(user_id);
            u.get(user_id).then(function() {
                // if we have a user, insert the new verification key
                return self.db.query(query);
            }).then(function() {
                self._setInternalValues({ id, user_id, user_key });
                // new Mailer().send(); SEND EMAIL TO USER
                resolve(true);
            }).catch(function(err) {
                reject(err);
            });
        });
    };

    // no updating verification keys

    this.delete = function(id) {
        return this.super_delete(tableName, id);
    };
}

inherits(VerificationKey, DBObject);

module.exports = User;
