'use strict';

const rp = require('request-promise');
const config = require('../../config/default')[process.env.NODE_ENV || 'local'];

module.exports = {
    validateUser: validateUser
}

function validateUser(token) {
    let options = {
        'method': 'GET',
        'uri': `${config.rsUrl}/permitted-users`,
        'json': true,
        'headers': {
            'rs-user-token': token
        }
    };
    return rp(options);
}
