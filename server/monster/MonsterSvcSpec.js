'use strict';

/* EXTERNAL DEPENDENCIES */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
require('sinon-as-promised');
const expect = chai.expect;
const _ = require('lodash');
const mongoose = require('mongoose');
chai.use(sinonChai);

/* INTERNAL DEPENDENCIES */
const MonsterSvc = require('./MonsterSvc');
const RealmshaperUserSvc = require('../realmshaper-user/RealmshaperUserSvc')
const Monster = require('./Monster').Monster;

describe('MonsterSvc', function () {

  let _find,
  _findOne,
  _findOneAndRemove,
  _create,
  _json,
  _send,
  _req,
  _res,
  _save,
  _validateUser = null;

  let testUser = {
    _id: 'test-user-id',
    local: {
      token: 'test-token'
    }
  };

  beforeEach(function () {
    _validateUser = sinon.stub(RealmshaperUserSvc, 'validateUser');
    _json = sinon.spy();
    _send = sinon.spy();
    _res = {
      json: _json,
      send: _send
    };
  });

  afterEach(function () {
    RealmshaperUserSvc.validateUser.restore();
  });

  describe('#getMonsters', function () {

    let monsterList = [
      {name: 'monster1', userId: 'test-user-id'},
      {name: 'monster2', userId: 'not-test-id'}
    ];
    let testUserMonsterList = [
      {name: 'monster1', userId: 'test-user-id'}
    ];

    beforeEach(function () {
      _find = sinon.stub(Monster, 'find');
      _req = {
        get: function (headerName) {
          if(headerName === 'rs-user-token') {
            return 'test-token';
          } else {
            return null;
          }
        }
      };
    });

    afterEach(function () {
      Monster.find.restore();
    });

    it('should validate the user and only return monsters related to that user', function testGetMonsterCall() {
      _validateUser.withArgs('test-token').resolves(testUser);
      _find.withArgs({'userId': 'test-user-id'}).resolves(testUserMonsterList);
      MonsterSvc.getMonsters(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_find).to.be.calledWith({'userId': 'test-user-id'});
        return _find({'userId': 'test-user-id'}).then(function () {
          expect(_json).to.be.calledWith(testUserMonsterList);
        });
      });
    });

    it('should prompt a login when the user fails validation', function testValidationFailure() {
      _validateUser.withArgs('test-token').rejects('Validation Failure!');
      MonsterSvc.getMonsters(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').catch(function () {
        expect(_send).to.be.calledWith(new Error('Validation Failure!'));
      });
    });

    it('should fail when no Monsters can be found for the given userId', function testGetMonsterError() {
      _validateUser.withArgs('test-token').resolves(testUser);
      _find.withArgs({'userId': 'test-user-id'}).rejects('This Failure!');
      MonsterSvc.getMonsters(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_find).to.be.calledWith({'userId': 'test-user-id'});
        return _find({'userId': 'test-user-id'}).catch(function () {
          expect(_send).to.be.calledWith(new Error('This Failure!'));
        });
      });
    });
  });

  describe('#getMonsterById', function () {

    let testMonster = {
      _id: '1',
      name: 'Goblin',
      hp: 30,
      userId: 'test-user-id'
    };

    beforeEach(function () {
      _find = sinon.stub(Monster, 'find');
      _req = {
        params: {
          monster_id: testMonster._id
        },
        get: function (headerName) {
          if(headerName === 'rs-user-token') {
            return 'test-token';
          } else {
            return null;
          }
        }
      };
    });

    afterEach(function () {
      Monster.find.restore();
    });

    it('should validate the user and return a monster with a specific id if that user owns it', function testGetMonsterByIdCall() {
      _find.withArgs({_id: '1', userId: 'test-user-id'}).resolves(testMonster);
      _validateUser.withArgs('test-token').resolves(testUser);
      MonsterSvc.getMonsterById(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_find).to.be.calledWith({_id: '1', userId: 'test-user-id'});
        return _find({_id: '1', userId: 'test-user-id'}).then(function () {
          expect(_json).to.be.calledWith(testMonster);
        });
      });
    });

    it('should error correctly if user validation fails', function testGetMonsterByIdValidationFailure() {
      _validateUser.withArgs('test-token').rejects('Validation Failure!');
      MonsterSvc.getMonsterById(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').catch(function () {
        expect(_send).to.be.calledWith(new Error('Validation Failure!'));
      });
    });

    it('should error correctly if the user does not possess the desired monster', function testGetMonsterByIdFailure() {
      _find.withArgs({_id: '1', userId: 'test-user-id'}).rejects('This is an error!');
      _validateUser.withArgs('test-token').resolves(testUser);
      MonsterSvc.getMonsterById(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_find).to.be.calledWith({_id: '1', userId: 'test-user-id'});
        return _find({_id: '1', userId: 'test-user-id'}).catch(function () {
          expect(_send).to.be.calledWith(new Error('This is an error!'));
        });
      });
    });
  });

  describe('#postMonster', function () {

    let testMonster = {
      name: 'Goblin',
      type: 'Humanoid',
      hp: 20,
      exp: 100
    };
    let testMonsterResponse = {
      name: 'Goblin',
      type: 'Humanoid',
      hp: 20,
      exp: 100,
      userId: 'test-user-id'
    };

    beforeEach(function () {
      _create = sinon.stub(Monster, 'create');
      _req = {
        get: function (headerName) {
          if(headerName === 'rs-user-token') {
            return 'test-token';
          } else {
            return null;
          }
        },
        body: testMonster
      };
    });

    afterEach(function () {
      Monster.create.restore();
    });

    it('should add a validated user id to the test monster', function testPostMonsterCall() {
      _validateUser.withArgs('test-token').resolves(testUser);
      _create.withArgs(testMonsterResponse).resolves(testMonsterResponse);
      MonsterSvc.postMonsters(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_create).to.be.calledWith(testMonsterResponse);
        return _create(testMonsterResponse).then(function (data) {
          expect(data.userId).to.equal(testMonsterResponse.userId);
          expect(_json).to.be.calledWith(testMonsterResponse);
        });
      });
    });

    it('should correctly fail if there is a validation error', function testPostMonsterValidationError() {
      _validateUser.withArgs('test-token').rejects('Validation Error!');
      MonsterSvc.postMonsters(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').catch(function () {
        expect(_send).to.be.calledWith(new Error('Validation Error!'));
      });
    });

    it('should correctly fail if there is a posting error', function testPostMonsterCreationError() {
      _validateUser.withArgs('test-token').resolves(testUser);
      _create.withArgs(testMonsterResponse).rejects('Test Failure!');
      MonsterSvc.postMonsters(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_create).to.be.calledWith(testMonsterResponse);
        return _create(testMonsterResponse).catch(function () {
          expect(_send).to.be.calledWith(new Error('Test Failure!'));
        });
      });
    });
  });

  describe('#updateMonster', function () {

    let testParams = {
      monster_id: '8675309'
    };
    let testUpdate = {
      name: 'newName',
      hp: 55
    };
    let testOldMonster = {
      _id: '8675309',
      hp: 20,
      name: 'oldName',
      save: null,
      userId: 'test-user-id'
    };
    let testNewMonster = {
      _id: '8675309',
      hp: 55,
      name: 'newName',
      save: null,
      userId: 'test-user-id'
    };

    beforeEach(function () {
      _findOne = sinon.stub(Monster, 'findOne');
      _save = sinon.spy();
      testOldMonster.save = _save;
      testNewMonster.save = _save;
      _req = {
        params: testParams,
        body: testUpdate,
        get: function (headerName) {
          if(headerName === 'rs-user-token') {
            return 'test-token';
          } else {
            return null;
          }
        }
      };
    });

    afterEach(function () {
      Monster.findOne.restore();
    });

    it('should only update a monster created by the given user', function testUpdateMonsterCall() {
      _findOne.withArgs({_id: '8675309', userId: 'test-user-id'}).resolves(testOldMonster);
      _validateUser.withArgs('test-token').resolves(testUser);
      MonsterSvc.updateMonster(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_findOne).to.be.calledWith({_id: '8675309', userId: 'test-user-id'});
        return _findOne({_id: '8675309', userId: 'test-user-id'})
        .then(function () {
          expect(_save).to.be.called;
        })
        .then(function () {
          expect(_json).to.be.calledWith(testNewMonster);
        });
      });
    });

    it('should provide an accurate validation error', function testUpdateValidationFail() {
      _validateUser.withArgs('test-token').rejects('Validation Error!');
      MonsterSvc.updateMonster(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').catch(function () {
        expect(_send).to.be.calledWith(new Error('Validation Error!'));
      });
    });

    it('should provide an accurate error when it cannot find a monster', function testUpdateMonsterFail() {
      _findOne.withArgs({_id: '8675309', userId: 'test-user-id'}).rejects('This update failed!');
      _validateUser.withArgs('test-token').resolves(testUser);
      MonsterSvc.updateMonster(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_findOne).to.be.calledWith({_id: '8675309', userId: 'test-user-id'});
        return _findOne({_id: '8675309', userId: 'test-user-id'})
        .catch().catch(function () {
          expect(_send).to.be.calledWith(new Error('This update failed!'));
        });
      });
    });
  });

  describe('#deleteMonster', function () {

    let testParams = {
      monster_id: '8675309'
    };
    let testMonsterToDelete = {
      _id: '8675309',
      name: 'Goblin',
      type: 'Humanoid',
      hp: 20,
      exp: 100,
      userId: 'test-user-id'
    };

    beforeEach(function () {
      _findOneAndRemove = sinon.stub(Monster, 'findOneAndRemove');
      _req = {
        params: testParams,
        get: function (headerName) {
          if(headerName === 'rs-user-token') {
            return 'test-token';
          } else {
            return null;
          }
        }
      };
    });

    afterEach(function () {
      Monster.findOneAndRemove.restore();
    });

    it('should only ever delete a monster owned by the given user', function testDeleteMonsterCall() {
      _validateUser.withArgs('test-token').resolves(testUser);
      _findOneAndRemove.withArgs({_id: '8675309', userId: 'test-user-id'}).resolves();
      MonsterSvc.deleteMonster(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_findOneAndRemove).to.be.calledWith({_id: '8675309', userId: 'test-user-id'});
        return _findOneAndRemove({_id: '8675309', userId: 'test-user-id'}).then().then(function () {
          expect(_json).to.be.calledWith({message: 'Deleted monster with id 8675309'});
        });
      });
    });

    it('should fail accurately when there is a validation problem', function testValidateInDeleteError() {
      _validateUser.withArgs('test-token').rejects('Validation Error!');
      MonsterSvc.deleteMonster(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').catch(function () {
        expect(_send).to.be.calledWith(new Error('Validation Error!'));
      });
    })

    it('should fail appropriately when there is a deleting problem', function testDeleteMonsterError() {
      _validateUser.withArgs('test-token').resolves(testUser);
      _findOneAndRemove.withArgs({_id: '8675309', userId: 'test-user-id'}).rejects('A deleting problem!');
      MonsterSvc.deleteMonster(_req, _res);
      expect(_validateUser).to.be.calledWith('test-token');
      return _validateUser('test-token').then(function () {
        expect(_findOneAndRemove).to.be.calledWith({_id: '8675309', userId: 'test-user-id'});
        return _findOneAndRemove({_id: '8675309', userId: 'test-user-id'}).catch().catch(function () {
          expect(_send).to.be.calledWith(new Error('A deleting problem!'));
        });
      });
    });
  });
});
