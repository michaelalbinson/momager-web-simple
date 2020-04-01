'use strict';


module.exports = (app) => {
    app.get('/topic/:topic/:article', (req, res) => {
        res.send('Hello!');
    });
};
