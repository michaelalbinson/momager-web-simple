'use strict';


module.exports = (app) => {
    require('./auth')(app);
    require('./budget')(app);
    require('./calendar')(app);
    require('./email')(app);
    require('./weather')(app);
};
