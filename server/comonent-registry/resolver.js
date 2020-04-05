'use strict';


const registry = require('./registry');

const depTreeCache = {};

module.exports = function componentResolver(top) {
    if (depTreeCache[top])
        return depTreeCache[top];

    let dependencies = [];
    if (typeof top !== 'string')
        return [];

    const resolveNextDependency = (dep) => {
        dependencies.push(dep);
        const nextDep = registry[dep];
        if (nextDep.length > 0) {
            for (let dependency of nextDep)
                resolveNextDependency(dependency);
        }
    };

    const unique = (a) => {
        const seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    };

    resolveNextDependency(top);

    // the lowest dependencies are the ones that must be loaded first
    dependencies = dependencies.reverse();
    dependencies = unique(dependencies);
    const iconLinkIdx = dependencies.indexOf('icon-link.js');
    if (iconLinkIdx !== -1)
        dependencies.splice(iconLinkIdx, 1);

    depTreeCache[top] = dependencies;
    return dependencies;
};
