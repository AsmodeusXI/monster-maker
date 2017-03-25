'use strict';

require('babel-polyfill');

module.exports = function() {
    // Express Setup
    const express = require('express');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());

    // MongoDB Setup
    var config = null;
    if(process.env.NODE_ENV === 'production') {
      config = require('./../monster-maker/production')[process.env.NODE_ENV];
    } else {
      config = require('./config/default')[process.env.NODE_ENV || 'local'];
    }
    var mongoose = require('mongoose');
    mongoose.connect(config.dbUrl);

    // File Location Setup
    app.use('/', express.static(__dirname));

    // Domain-specific routes
    require('./server/monster/MonsterRoutes')(app);

    // Default route
    app.get('*', function(req,res) {
        res.send(config.message);
    });

    // App startup
    app.listen(config.port);
}

module.exports();
