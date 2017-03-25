'use strict';

const Monster = require('./Monster').Monster;
const RealmshaperUserSvc = require('../realmshaper-user/RealmshaperUserSvc');
const _ = require('lodash');

module.exports = {
  getMonsters: validateUserAndRespond(getMonsters),
  getMonsterById: validateUserAndRespond(getMonsterById),
  postMonsters: validateUserAndRespond(addMonster),
  updateMonster: validateUserAndRespond(updateMonster),
  deleteMonster: validateUserAndRespond(removeMonster)
}

function validateUserAndRespond(promiseResponseFromRequest) {
  return function(req, res) {
    let rsUserToken = req.get('rs-user-token');
    return RealmshaperUserSvc.validateUser(rsUserToken)
    .then(function (user) {
      return promiseResponseFromRequest(req, user)
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.send(err);
      });
    })
    .catch(function (err) {
      res.send(err);
    });
  };
}

function getMonsters(req, user) {
  return Monster.find({userId: user._id});
}

function getMonsterById(req, user) {
  return Monster.find({'_id': req.params.monster_id, 'userId': user._id});
}

function addMonster(req, user) {
  let newMonster = req.body;
  newMonster['userId'] = user._id;
  return Monster.create(newMonster);
}

function updateMonster(req, user) {
  return Monster.findOne({'_id': req.params.monster_id, 'userId': user._id})
  .then(function (monster) {
    _.assign(monster, req.body);
    monster.save();
    return monster;
  });
}

function removeMonster(req, user) {
  return Monster.findOneAndRemove({'_id': req.params.monster_id, 'userId': user._id})
  .then(function () {
    return { message: "Deleted monster with id " + req.params.monster_id };
  });
}
