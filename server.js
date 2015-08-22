'use strict';

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
    var db = require('./config/db');
    var mongoose = require('mongoose');
    mongoose.connect(db.url);

    // File Location Setup
    app.use('/', express.static(__dirname));

    // Domain-specific routes
    require('./server/monster/MonsterRoutes')(app);

    // Default route
    app.get('*', function(req,res) {
        res.send('Hello world!');
    });

    // App startup
    app.listen('8080');
}
module.exports();
