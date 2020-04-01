"use strict";

const Session = require('../../../db/baseModels/Session');
const User = require('../../../db/baseModels/User');
const PasswordReset = require('../../../db/baseModels/PasswordReset');
const Mailer = require('../../../db/mailer/Mailer');
const DefaultResponse = require('../../util/DefaultResponse');


module.exports = (app) => {
    app.put('/plumbing/auth/forgot-password', function createNewPasswordRequest(req, res) {
        let pr;
        const u = new User();
        u.setQueryBy('email');
        u.email = req.body.email;
        u.query().then(() => {
            pr = new PasswordReset();
            return pr.create(u.id, new Date(), u.email);
        }).then(() => {
            Mailer.sendPasswordRecovery(u.email, pr.code);
            res.send(DefaultResponse.success);
        }).catch((e) => {
            console.error(e.toString());
            res.send(DefaultResponse.failure);
        })
    });

    app.post('/plumbing/auth/forgot-password', function workOnPasswordRequest(req, res) {
        let stage = req.body.stage;
        let processingPromise;
        if (typeof stage !== "number")
            return res.send(DefaultResponse.failure);

        if (stage === 2)
            processingPromise = checkEmailCode;
        else if (stage === 3)
            processingPromise = resetPassword;
        else
            return Promise.reject();

        processingPromise(req.body).then((result) => {
            res.send(result);
        }).catch((e) => {
            console.error(e.toString());
            res.send(DefaultResponse.failure);
        });
    });
};

function checkEmailCode(body) {
    return new Promise((resolve, reject) => {
        let code = body.code;
        let pr = new PasswordReset();
        pr.email_str = body.email;
        pr.setQueryBy('email_str');
        pr.query().then(() => {
            if (pr.code === code)
                resolve(DefaultResponse.success);
            else
                reject();
        }).catch((e) => {
            if (e)
                console.error(e.toString());

            reject();
        });
    });
}

function resetPassword(body) {
    return new Promise((resolve, reject) => {
        let s;
        let newPassword = body.secret;
        if (newPassword.length < 6)
            return reject('PASSWORD MUST BE AT LEAST 6 CHARACTERS');

        // Verify again that we have the code...
        let code = body.code;
        let pr = new PasswordReset();
        let u;
        pr.email_str = body.email;
        pr.setQueryBy('email_str');
        pr.query().then(() => {
            if (pr.code !== code)
                return reject();

            // if we have the code and passwords, let's reset the password
            u = new User();
            u.email = body.email;
            u.setQueryBy('email');
            return u.query();
        }).then(() => {
            return u.updatePassword(u.email, newPassword);
        }).then(() => {
            s = new Session();
            return s.create(u.id, true);
        }).then(() => {
            let pr = new PasswordReset();
            pr.setQueryBy('user_id');
            pr.user_id = u.id;
            pr.cleanup(u.id);
            resolve({success: true, session_id: s.id, user_id: u.id, expires: s.getExpires(), userData: u.unloadSafeData()});
        }).catch((e) => {
            if (e)
                console.error(e.toString());

            reject();
        });
    });
}
