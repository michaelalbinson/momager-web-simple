'use strict';


module.exports = (app) => {
    app.get('/', (req, res) => {
        res.render('index', {
            scripts: []
        });
    });

    require('./article')(app);
    require('./dashboard')(app);
    require('./sign-in')(app);
    require('./sign-up')(app);
    require('./skill')(app);
};
