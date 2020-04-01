'use strict';


module.exports = (app) => {
    require('./middleware')(app);
    require('./routes')(app);
};
