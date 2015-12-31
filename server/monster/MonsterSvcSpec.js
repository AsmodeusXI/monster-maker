'use strict';

/* EXTERNAL DEPENDENCIES */
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Bluebird = require('bluebird');
require('sinon-as-promised')(Bluebird);
var expect = chai.expect;
var _ = require('lodash');
var mongoose = require('mongoose');
chai.use(sinonChai);

/* INTERNAL DEPENDENCIES */
var MonsterSvc = require('./MonsterSvc');
var Monster = require('./Monster').Monster;

describe('MonsterSvc', function () {
    describe('#getMonsters', function () {

        let monsterList = [
            {name: 'monster1'},
            {name: 'monster2'}
        ];
        let _find,
            _json,
            _error,
            _res = null;

        beforeEach(function () {
            _find = sinon.stub(Monster, 'find');
            _json = sinon.spy();
            _error = sinon.spy();
            _res = {
                json: _json,
                send: _error
            }
        });

        afterEach(function () {
            Monster.find.restore();
        });

        it('should correctly call \"res.json\" on the result of \"Monster.find\" when getMonsters(...) is called', function testGetMonsterCall() {
            _find.resolves(monsterList);
            MonsterSvc.getMonsters(null, _res);
            expect(_find).to.be.calledWith({});
            return _find().then(function () {
                expect(_json).to.be.calledWith(monsterList);
            });
        });

        it('should correctly send an error on \"res.send\" when \"Monster.find\" returns an error', function testGetMonsterError() {
            _find.rejects('This Failure!');
            MonsterSvc.getMonsters(null, _res);
            expect(_find).to.be.calledWith({});
            return _find().catch(function () {
                expect(_error).to.be.calledWith(new Error('This Failure!'));
            });
        });
    });

    describe('#getMonsterById', function () {

        let testMonsterId = 1;
        let testMonster = {
            _id: 1,
            name: 'Goblin',
            hp: 30
        };
        let _findById,
            _json,
            _error,
            _res,
            _req = null;

        beforeEach(function () {
            _findById = sinon.stub(Monster, 'findById');
            _json = sinon.spy();
            _error = sinon.spy();
            _req = {
                params: {
                    monster_id: testMonsterId
                }
            }
            _res = {
                json: _json,
                send: _error
            }
        });

        afterEach(function () {
            Monster.findById.restore();
        });

        it('should correctly call \"res.json\" on the result of \"Monster.find\" when getMonsterById(...) is called', function testGetMonsterByIdCall() {
            _findById.resolves(testMonster);
            MonsterSvc.getMonsterById(_req, _res);
            expect(_findById).to.be.calledWith(1);
            return _findById().then(function () {
                expect(_json).to.be.calledWith(testMonster);
            });
        });

        it('should correctly send an error on \"res.send\" when \"Monster.find\" returns an error', function testGetMonsterByIdFailure() {
            _findById.rejects('This is an error!');
            MonsterSvc.getMonsterById(_req, _res);
            expect(_findById).to.be.calledWith(1);
            return _findById().catch(function () {
                expect(_error).to.be.calledWith(new Error('This is an error!'));
            });
        });
    });

    describe('#postMonster', function () {

        let testMonster = {
            body: {
                name: 'Goblin',
                type: 'Humanoid',
                hp: 20,
                exp: 100
            }
        };
        let testMonsterResponse = {
            name: 'Goblin',
            type: 'Humanoid',
            hp: 20,
            exp: 100
        };
        let _create,
            _json,
            _error,
            _res = null;

        beforeEach(function () {
            _create = sinon.stub(Monster, 'create');
            _json = sinon.spy();
            _error = sinon.spy();
            _res = {
                json: _json,
                send: _error
            }
        });

        afterEach(function () {
            Monster.create.restore();
        });

        it('should correctly call \"res.json\" on the result of \"Monster.create\" when postMonsters(...) is called', function testPostMonsterCall() {
            _create.resolves(testMonsterResponse);
            MonsterSvc.postMonsters(testMonster, _res);
            expect(_create).to.be.calledWith(testMonsterResponse);
            return _create().then(function () {
                expect(_json).to.be.calledWith(testMonsterResponse);
            });
        });

        it('should correctly call \"res.send\" when \"Monster.create\" sends an error after postMonsters(...) is called', function testPostMonsterError() {
            _create.rejects('Test Failure!');
            MonsterSvc.postMonsters(testMonster, _res);
            expect(_create).to.be.calledWith(testMonsterResponse);
            return _create().catch(function () {
                expect(_error).to.be.calledWith(new Error('Test Failure!'));
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
            save: null
        };
        let testNewMonster = {
            _id: '8675309',
            hp: 55,
            name: 'newName',
            save: null
        };
        let _findById,
            _req,
            _res,
            _json,
            _error,
            _save = null;

        beforeEach(function () {
            _findById = sinon.stub(Monster, 'findById');
            _json = sinon.spy();
            _error = sinon.spy();
            _save = sinon.spy();
            testOldMonster.save = _save;
            testNewMonster.save = _save;
            _req = {
                params: testParams,
                body: testUpdate
            };
            _res = {
                json: _json,
                send: _error
            };
        });

        afterEach(function () {
            Monster.findById.restore();
        });

        it('should correctly call \"res.json\" when \"Monster.findById\" completes after updateMonster(...) is called', function testUpdateMonsterCall() {
            _findById.resolves(testOldMonster);
            MonsterSvc.updateMonster(_req, _res);
            expect(_findById).to.be.calledWith('8675309');
            return _findById().then(function () {
                expect(_save).to.be.called;
            }).then(function () {
                expect(_json).to.be.calledWith(testNewMonster);
            });
        });

        it('should correctly call \"res.send\" when \"Monster.findById\" sends an error after updateMonster(...) is called', function testUpdateMonsterFail() {
            _findById.rejects('This update failed!');
            MonsterSvc.updateMonster(_req, _res);
            expect(_findById).to.be.calledWith('8675309');
            return _findById().catch().catch(function () {
                expect(_error).to.be.calledWith(new Error('This update failed!'));
            });
        });
    });

    describe('#deleteMonster', function () {

        let testParams = {
            monster_id: '8675309'
        };
        let _findByIdAndRemove,
            _req,
            _res,
            _json,
            _error = null;

        beforeEach(function () {
            _findByIdAndRemove = sinon.stub(Monster, 'findByIdAndRemove');
            _json = sinon.spy();
            _error = sinon.spy();
            _res = {
                json: _json,
                send: _error
            };
            _req = {
                params: testParams
            };
        });

        afterEach(function () {
            Monster.findByIdAndRemove.restore();
        });

        it('should correctly call \"res.json\" when \"Monster.findByIdAndRemove\" completes after deleteMonster(...) is called', function testDeleteMonsterCall() {
            _findByIdAndRemove.resolves();
            MonsterSvc.deleteMonster(_req, _res);
            expect(_findByIdAndRemove).to.be.calledWith('8675309');
            return _findByIdAndRemove().then().then(function () {
                expect(_json).to.be.calledWith({message: 'Deleted monster with id 8675309'});
            });
        });

        it('should correctly call \"res.send\" when \"Monster.findByIdAndRemove\" errors after deleteMonster(...) is called', function testDeleteMonsterError() {
            _findByIdAndRemove.rejects('A deleting problem!');
            MonsterSvc.deleteMonster(_req, _res);
            expect(_findByIdAndRemove).to.be.calledWith('8675309');
            return _findByIdAndRemove().catch().catch(function () {
                expect(_error).to.be.calledWith(new Error('A deleting problem!'));
            });
        });
    });
});
