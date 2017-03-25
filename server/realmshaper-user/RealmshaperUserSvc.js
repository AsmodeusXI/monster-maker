'use strict';

const rp = require('request-promise');

module.exports = {
  validateUser: validateUser
}

function validateUser(token) {
  var config = null;
  if(process.env.NODE_ENV === 'production') {
    config = require('/home/bitnami/apps/config/monster-maker/production')[process.env.NODE_ENV];
  } else {
    config = require('./config/default')[process.env.NODE_ENV || 'local'];
  }

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
