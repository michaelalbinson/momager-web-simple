'use strict';

const DefaultResponse = {};

DefaultResponse.success = {
    success: true,
};

DefaultResponse.failure = {
    success: false,
    reason: 'unknown'
};

module.exports = DefaultResponse;
