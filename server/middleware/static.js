'use strict';

const express = require('express');
const path = require('path');


module.exports = (app) => {
    app.use('/favicon.ico', express.static(path.join(__dirname, '../../client/assets/logo.png')));
    app.use('/css', express.static(path.join(__dirname, '../../client/css')));
    app.use('/js', express.static(path.join(__dirname, '../../client/js')));
    app.use('/assets', express.static(path.join(__dirname, '../../client/assets')));
};
