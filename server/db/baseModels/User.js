"use strict";

const DBObject = require('./DBObject');
const inherits = require('util').inherits;
const PasswordManager = require('../crypt/PasswordManager');
const MCError = require('../common/MCError');


function User(id, email) {
    DBObject.call(this);

    const tableName = "User";
    let self = this;
    const nullCore = {
        id: null,
        EMAIL: null,
        FNAME: null,
        LNAME: null,
        ADDRESS: null,
        DATE_OF_BIRTH: null,
        VERIFIED: false,
        USER_SETTINGS: null,
    };

    self.email = email;
    self.id = id;

    /**
     *
     * @param option {string}
     * @returns {boolean}
     */
    this.setQueryBy = function(option) {
        const allowed = ['id', 'email'];
        return self.super_setQueryBy(option, allowed);
    };

    this._setInternalValues = function(row) {
        if (typeof row !== "object")
            return self._setInternalValues(nullCore);

        self.id = row.id;
        self.email = row.EMAIL;
        self.fName = row.FNAME;
        self.lName = row.LNAME;
        self.address = typeof row.ADDRESS === 'string' ? JSON.parse(row.ADDRESS) : row.ADDRESS;
        self.date_of_birth = row.DATE_OF_BIRTH;
        self.verified = row.VERIFIED;
        self.user_settings = typeof row.USER_SETTINGS === 'string' ? JSON.parse(row.USER_SETTINGS) : row.USER_SETTINGS;
    };

    /**
     *
     * @returns {Promise<any>}
     */
    this.query = function() {
        return new Promise(function(resolve, reject) {
            const qb = self._queryBy;
            if (!self[qb])
                return reject(new MCError("Invalid query option selected", "EXT"));

            let val = (qb === "id") ? self.id : ((qb === "type") ? self.type : self.email);
            val = self.escape(val);
            const q =  `SELECT * FROM User WHERE ${qb}=${val}`;
            self.db.query(q).then(function(row) {
                if (row.length < 1)
                    return reject(new MCError("No rows matching user found.", "EXT"));

                self._setInternalValues(row[0]);
                resolve();
            }).catch(function() {
                reject(new MCError("Query failed for unknown reason", "INT"));
            });
        })
    };

    /**
     *
     * @param email
     * @param password
     * @param fName
     * @param lName
     * @param address
     * @param dateOfBirth
     * @returns {Promise<any>}
     */
    this.create = function(email, password, fName, lName, address, dateOfBirth) {
        return new Promise(function(resolve, reject) {
            if (!password || !email || !fName || !lName || !dateOfBirth)
                return reject(new MCError("Received too few function arguments.", "EXT"));

            if (typeof address === 'object') {
                address = JSON.stringify(address);
            }

            const id = self.generate();
            let _id = self.escape(id);
            let _email = self.escape(email);
            let _fName = self.escape(fName);
            let _lName = self.escape(lName);
            let _addr = self.escape(address);
            let _dob = self.escape(dateOfBirth);

            const hashPassNSalt = PasswordManager.hashAndSalt(password);

            const q = `INSERT INTO User (id, password, salt, email, fName, lName, address, date_of_birth) VALUES (${_id}, `
                    + `'${hashPassNSalt.passwordHash}', '${hashPassNSalt.salt}', ${_email}, ${_fName}, ${_lName}, `
                    + `${_addr}, ${_dob})`;

            self.db.query(q).then(function() {
                self._setInternalValues({id: id, EMAIL: email, FNAME: fName, LNAME: lName, DATE_OF_BIRTH: dateOfBirth,
                    ADDRESS: address});
                resolve(true);
            }).catch(function(err) {
                reject(new MCError("Error creating new User. Please try again later", "INT", err));
            });
        });
    };

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    this.get = function(id) {
        return this.super_get(tableName, id);
    };

    /**
     *
     * @param id
     * @returns {Promise<any>}
     */
    this.delete = function(id) {
        return this.super_delete(tableName, id);
    };

    this.unloadSafeData = function() {
        return {
            id: self.id,
            fName: self.fName,
            lName: self.lName ,
            date_of_birth: self.date_of_birth,
            email: self.email,
            address: self.address,
            verified: self.verified,
            user_settings: self.user_settings,
        }
    };

    /**
     * Update the User record. In this case we only allow a change in user email or password, but no other part may be
     * changed.
     * @param email
     * @param lastPass
     * @param updatePassword
     * @param newPass
     * @returns {Promise<any>}
     */
    this.update = function(email, lastPass, updatePassword, newPass) {
        return new Promise(function(resolve, reject) {
            if (updatePassword) {
                self.updatePassword(email, lastPass, newPass).then(function() {
                    resolve();
                }).catch(function() {
                    reject(new MCError('Unable to update password.', 'INT'));
                });
            }
            else {
                self.updateEmail(email, lastPass, newPass).then(function() {
                    resolve();
                }).catch(function() {
                    reject(new MCError('Unable to update email', 'INT'));
                })
            }
        });
    };

    this.updateUserData = function(fName, lName, date_of_birth, address, user_settings) {
        return new Promise((resolve, reject) => {
            if (self.anyUndefinedOrNull({ fName, lName, date_of_birth, address, user_settings }))
                return reject(new MCError('All fields must be defined to UPDATE User'));

            if (typeof address === 'object') {
                address = JSON.stringify(address);
            }

            if (typeof user_settings === 'object') {
                user_settings = JSON.stringify(user_settings);
            }




            const escaped = self.escapeAll({ id: self.id, fName, lName, date_of_birth: new Date(date_of_birth), address, user_settings });
            const q = `UPDATE User SET fName=${escaped.fName}, lName=${escaped.lName}, 
                date_of_birth=${escaped.date_of_birth}, address=${escaped.address}, 
                USER_SETTINGS=${escaped.user_settings} WHERE id=${escaped.id}`

            self.db.query(q).then((rows) => {
                self._setInternalValues(rows[0]);
                resolve();
            }).catch(reject);
        });
    };

    /**
     * USER SPECIFIC FUNCTIONS
     */

    /**
     *
     * @param email
     * @param pass
     * @returns {Promise<any>}
     */
    this.authenticate = function(email, pass) {
        return new Promise(function(resolve, reject) {
            email = self.escape(email);

            const q1 = `SELECT * FROM User WHERE email=${email}`;
            self.db.query(q1).then(function(row) {
                if (row.length < 1)
                    return reject(new MCError('Failed to find a User to compare to.', 'EXT'));

                let r = row[0];
                if (PasswordManager.compareHashAndSalt(pass, r.SALT, r.PASSWORD)) {
                    // If we successfully authenticate the user, the user object can safely keep the id, email and type references
                    self._setInternalValues(row[0]);
                    resolve(true);
                }
                else
                    reject(new MCError("Unable to authenticate user, bad credentials", "EXT"));

            }).catch(function(err) {
                reject(err);
            });
        })
    };

    /**
     *
     * @param email
     * @param newPass
     * @returns {Promise<any>}
     */
    this.updatePassword = function(email, newPass) {
        let e = new Encryptor();
        return new Promise(function(resolve, reject) {
            let newP = e.hashAndSalt(newPass);
            const passQ = `UPDATE User SET password='${newP.passwordHash}', salt='${newP.salt}'` +
                                `WHERE id=${self.escape(self.id)}`;

            self.db.query(passQ).then(function() {
                resolve();
            }).catch(function(err) {
                reject(new MCError('Error in password update query', 'EXT', err));
            });
        });
    };

    /**
     *
     * @param email
     * @param pass
     * @param newEmail
     * @returns {Promise<any>}
     */
    this.updateEmail = function(email, pass, newEmail) {
        return new Promise(function(resolve, reject) {
            self.authenticate(email, pass).then(function() {
                if (!newEmail)
                    return reject(new MCError('A new email must be supplied to change emails'));

                let _newEmail = self.escape(newEmail);
                const emQ = `UPDATE User SET email=${_newEmail} WHERE id=${self.escape(self.id)}`;

                self.db.query(emQ).then(function() {
                    self.email = newEmail;
                    resolve();
                }).catch(function(err) {
                    reject(new MCError('Error connecting with database to update email.', 'INT', err));
                });
            }).catch(function(err) {
                reject(err);
            });
        });
    };
}

inherits(User, DBObject);

module.exports = User;
