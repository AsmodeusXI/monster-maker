'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let monsterSchema = new Schema({
    name: String,
    type: String,
    hp: Number,
    exp: Number,
    userId: String
});

let Monster = mongoose.model('Monster', monsterSchema);

module.exports = {
    Monster: Monster
};
