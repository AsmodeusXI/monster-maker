'use strict';

var mongoose = require('mongoose');
module.exports = mongoose.model('Monster', {
    name: String,
    type: String,
    hp: Number,
    exp: Number
});
