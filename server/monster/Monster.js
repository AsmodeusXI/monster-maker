'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let monsterSchema = new Schema({
    name: String,
    type: String,
    hp: Number,
    exp: Number
});

let Monster = mongoose.model('monster', monsterSchema);

module.exports = {
    Monster: Monster
};
