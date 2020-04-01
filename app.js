"use strict";

const express = require('express');

const app = express();

const host = require('./config/index').host;

require('./server')(app);

app.listen(host);

console.log(`momager-core listening on port ${host}`);
