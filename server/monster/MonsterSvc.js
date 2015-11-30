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

function addMonster(req) {
    return Monster.create(req.body);
}

function removeMonster(req) {
    return Monster.remove({_id: req.params.monster_id}).then(
        function () {
            return {
                message: "Deleted user with id " + req.params.monster_id
            };
        });
}

exports.getMonsters = createResponder(getMonsters);
exports.postMonsters = createResponder(addMonster);
exports.deleteMonster = createResponder(removeMonster);
