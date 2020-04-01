"use strict";

const DefaultResponse = require('../../util/DefaultResponse');
const Session = require('../../../db/baseModels/Session');
const User = require('../../../db/baseModels/User');


module.exports = (app) => {
    app.post('/plumbing/auth/user', (req, res) => {
        if (!req.body.sessionKey)
            return res.send(DefaultResponse.failure);

        let user;
        let session = new Session();
        session.get(req.body.sessionKey).then(() => {
            user = new User();
            return user.get(session.user_id);
        }).then(() => {
            return user.updateUserData(req.body.fName, req.body.lName, req.body.date_of_birth,
                req.body.address, req.body.user_settings);
        }).then(() => {
            res.send(DefaultResponse.success);
        }).catch((err) => {
            if (err)
                console.error(err.toString());

            res.send(DefaultResponse.failure);
        });
    });
};
