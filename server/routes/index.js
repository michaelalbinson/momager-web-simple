'use strict';


module.exports = (app) => {
    require('./plumbing')(app);
    require('./client')(app);
};
