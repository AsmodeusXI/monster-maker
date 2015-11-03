/* This is how I know it worked */

'use strict';

var mongoose = require('mongoose');
module.exports = mongoose.model('Monster', {
    name: String,
    type: String,
    hp: Number,
    exp: Number
});
