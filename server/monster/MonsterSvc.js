'use strict';

const Monster = require('./Monster').Monster;

function createResponder(promiseResponseFromRequest) {
    return function(req, res) {
        return promiseResponseFromRequest(req).then(
            function resolve(data) { res.json(data); },
            function reject(err) { res.send(err); }
        );
    }
}

function getMonsters() {
    return Monster.find({});
}

function getMonsterById(req) {
    return Monster.findById(req.params.monster_id);
}

function addMonster(req) {
    return Monster.create(req.body);
}

function updateMonster(req) {
    return Monster.findById(req.params.monster_id)
        .then(function (monster) {
            _.assign(monster, req.body);
            monster.save();
            return monster;
        });
}

function removeMonster(req) {
    return Monster.findByIdAndRemove(req.params.monster_id).then(function () {
        return { message: "Deleted monster with id " + req.params.monster_id };
    });
}

exports.getMonsters = createResponder(getMonsters);
exports.getMonsterById = createResponder(getMonsterById);
exports.postMonsters = createResponder(addMonster);
exports.updateMonster = createResponder(updateMonster);
exports.deleteMonster = createResponder(removeMonster);
