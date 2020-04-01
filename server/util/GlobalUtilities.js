/**
 * GlobalUtilities.js
 *
 * Written by Michael Albinson 1/11/20
 *
 * A utility class of functions that are useful throughout the platform
 */

'use strict';

const GlobalUtilities = {
    isProduction: () => {
        return process.env.NODE_ENV === 'production'
    },
    getPort: () => {
        return process.env.PORT || 8086
    },
    getCookieKey: () => {
        return process.env.COOKIE_KEY || "ampu-signing-secret";
    }
};

module.exports = GlobalUtilities;
