"use strict";

let inherits = require('util').inherits;
let IterableDBObject = require('./IterableDBObject');
let MCError = require('../common/MCError');
let mailer = require('../mailer/Mailer');

function PasswordReset() {
    IterableDBObject.apply(this);

    const table = 'Password_Reset';
    let self = this;

    this.user_id = null;
    this.email_str = null;
    this.req_date = null;
    this.code = null;

    let nullCore = {USER_ID: null, EMAIL_STR: null, REQ_DATE: null, id: null};

    this.setQueryBy = function(qb) {
        const allowed = ['user_id', 'email_str', 'req_date', 'id'];
        return self.super_setQueryBy(qb, allowed);
    };

    this.query = function() {
        self.orderBy = 'ORDER BY REQ_DATE DESC';
        return self.super_query(table);
    };

    this.get = function(id) {
        return self.super_get(table, id);
    };

    this.update = function() {
        return self.super_update(table, getAll(), self.id);
    };

    function getAll() {
        return {USER_ID: self.user_id, REQ_DATE: self.req_date, EMAIL_STR: self.email_str};
    }

    this.delete = function(id) {
        return self.super_delete(table, id);
    };

    this.create = function(user_id, req_date, email_str) {
        return new Promise(function (resolve, reject) {
             let code = self.generate().slice(0, 6);
             user_id = user_id ? user_id : self.user_id;
             req_date = req_date ? req_date : self.req_date;
             email_str = email_str ? email_str : self.email_str;

             if (self.anyUndefinedOrNull(user_id, req_date, email_str))
                 return reject(new MCError('all arguments must be defined to CREATE Password Reset', 'EXT'));

             let a = self.escapeAll({user_id: user_id, req_date: req_date, email_str: email_str, code: code});
             let _id = self.generateEscaped();
             const q = `INSERT INTO Password_Reset (USER_ID, REQ_DATE, EMAIL_STR, CODE, id) VALUES ` +
                 `(${a.user_id}, ${a.req_date}, ${a.email_str}, ${a.code}, ${_id})`;
             self.db.query(q).then(function() {
                    self._setInternalValues({USER_ID: user_id, REQ_DATE: req_date, EMAIL_STR: email_str,
                        id: _id.slice(1, _id.length - 1), CODE: code});

                 mailer.sendPasswordRecovery(email_str, code);
                 resolve();
             }).catch(function(e) {
                 reject(new MCError('Internal error CREATing Password Reset', 'INT', e));
             });
        });
    };

    /**
     * Deletes all of the password reset requests by a user.
     * To be used after a user has completed a password reset.
     * @param user_id
     * @returns {*}
     */
    this.cleanup = function(user_id) {
        return self.deleteAll(table, "user_id", user_id);
    };

    this._setInternalValues = function(o) {
        if (typeof o !== "object" || JSON.stringify(o) === "{}")
            return self._setInternalValues(nullCore);

        self.email_str = o.EMAIL_STR;
        self.user_id = o.USER_ID;
        self.req_date = o.REQ_DATE;
        self.code = o.CODE;
        self.id = o.id;
    };
}

inherits(PasswordReset, IterableDBObject);

module.exports = PasswordReset;
