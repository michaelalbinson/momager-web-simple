"use strict";

let nodemailer = require('nodemailer');
let mailerConfig = require("../../../config/index").mailer;

function Mailer() {
    let self = this;

    let smtpConfig = {
        host: mailerConfig.host,
        port: mailerConfig.port,
        secure: true,
        auth: {
            user: mailerConfig.user,
            pass: mailerConfig.password
        }
    };

    let transporter = nodemailer.createTransport(smtpConfig);

    this.send = function(receiver, subject, message) {
        let mailOptions = {
            from: '"HeadPulse No-Reply" <' + mailerConfig.address + '>',
            to: receiver,
            subject: subject,
            html: message
        };

        if (!mailerConfig["allow-sending"])
            return;

        transporter.sendMail(mailOptions, mailCallback);
    };

    this.sendPasswordRecovery = function(email, code) {
        if (!email)
            return false;

        let subject = "Password Recovery Request";
        let messageHTML =
            `<h1>HeadPulse Password Recovery Message</h1>
            <p>Use this code to recover your password: <b>${code}</b></p>`;

        self.send(email, subject, messageHTML);
    };

    // TODO: decide email
    this.sendAthleteRequestAccepted = function(athlete) {
        if (!athlete)
            return false;

        let subject = "Password Recovery Request";
        let messageHTML =
            `<h1>HeadPulse Password Recovery Message</h1>
            <p>Use this code to recover your password: <b></b></p>`;

        self.send(null, subject, messageHTML);
    };

    // TODO: decide email
    this.sendAthleteRequestDeclined = function(athleteID) {
        if (!athleteID)
            return false;

        let subject = "Password Recovery Request";
        let messageHTML =
            `<h1>HeadPulse Password Recovery Message</h1>
            <p>Use this code to recover your password: <b></b></p>`;

        self.send(null, subject, messageHTML);
    };

    function mailCallback(error) {
        if (error)
            console.error(error);
    }

    // @private The transporter is exposed for testing purposes only
    this._transporter = transporter;
}

module.exports = new Mailer();

