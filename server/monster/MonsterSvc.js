'use strict';

const Monster = require('./Monster');

const getMonsters = function (req,res) {
    const promise = Monster.find({});
    promise.then(
        function resolve(monsters) { res.json(monsters); },
        function reject(err) { res.send(err); }
    );
};

const postMonsters = function (req,res) {
    let newMonster = {
        name: req.body.name,
        type: req.body.type,
        hp: req.body.hp,
        exp: req.body.exp
    };
    const promise = Monster.create(newMonster);
    promise.then(
        function resolve(monster) { res.json(monster); },
        function reject(err) { res.send(err); }
    );
}

const deleteMonster = function(req,res) {
    let toRemove = { _id: req.params.monster_id };
    const promise = Monster.remove(toRemove);
    promise.then(function (err) {
        if (err) { res.send(err); }
    });
}

exports.getMonsters = getMonsters;
exports.postMonsters = postMonsters;
exports.deleteMonster = deleteMonster;
