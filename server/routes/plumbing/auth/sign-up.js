"use strict";

const DefaultResponse = require('../../util/DefaultResponse');
const Session = require('../../../db/baseModels/Session');
const User = require('../../../db/baseModels/User');


module.exports = (app) => {
    app.put('/plumbing/auth/sign-up', (req, res) => {
        if (req.body.session)
            return res.send('User already exists and is logged in, no need to create a new one.');

        createUser(req.body).then((o) => {
            res.send({ success: true, user_id: o.user.id, session_id: o.session.id });
        }).catch((e) => {
            console.error(e.toString());
            res.send(DefaultResponse.failure);
        });
    });
};

function createUser(requestBody) {
    return new Promise((resolve, reject) => {
        // TODO: Authentication
        let user = new User();
        let session = null;
        user.create(requestBody.email, requestBody.password, requestBody.userData.fName,
            requestBody.userData.lName, requestBody.userData.address,
            requestBody.userData.date_of_birth).then(() => {
                session = new Session();
                return session.create(user.id, false);
        }).then(() => {
            resolve({ user, session });
        }).catch(reject);
    });
}
