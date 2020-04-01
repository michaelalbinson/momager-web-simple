"use strict";

const DefaultResponse = require('../../util/DefaultResponse');
const Session = require('../../../db/baseModels/Session');
const User = require('../../../db/baseModels/User');


module.exports = (app) => {
    // Create a session
    app.post('/plumbing/auth/session', function login(req, res) {
        let u = new User();
        let s = new Session();
        u.authenticate(req.body.email, req.body.secret).then(() => {
            return s.create(u.id, req.body.shouldExpire);
        }).then(() => {
            res.send({success: true, session_id: s.id, user_id: u.id, expires: s.getExpires(), userData: u.unloadSafeData()});
        }).catch((e) => {
            console.error(e.toString());
            res.send(DefaultResponse.failure);
        });
    });

    /**
     * Refresh a session
     */
    app.put('/plumbing/auth/session', function refreshSession(req, res) {
        if (!req.body.sid)
            return res.send(DefaultResponse.failure);

        let s = new Session();
        s.getAndRefresh(req.body.sid).then((end) => {
            res.send({sessionEnd: end});
        }).catch(() => {
            res.send(DefaultResponse.failure);
        });
    });

    // DELETE a session
    app.delete('/plumbing/auth/session', function logout(req, res) {
        let sid = req.body.sid;
        if (!sid)
            return res.send(DefaultResponse.failure);

        let s = new Session();
        s.get(sid).then(() => {
            return s.delete(s.id);
        }).then(() => {
            res.send(DefaultResponse.success);
        }).catch((err) => {
            console.error(err.toString());
            res.send(DefaultResponse.failure);
        });
    });
};
