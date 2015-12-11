'use strict';

/* EXTERNAL DEPENDENCIES */
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
require('sinon-as-promised');
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
        let stubMonsterFind,
            jsonSpy,
            errorSpy,
            testRes = null;

        beforeEach(function () {
            stubMonsterFind = sinon.stub(Monster, 'find');
            jsonSpy = sinon.spy();
            errorSpy = sinon.spy();
            testRes = {
                json: jsonSpy,
                send: errorSpy
            }
        });

        afterEach(function () {
            Monster.find.restore();
        });

        it('should correctly call \"res.json\" on the result of \"Monster.find\" when getMonsters(...) is called', function testGetMonsterCall() {
            stubMonsterFind.resolves(monsterList);
            MonsterSvc.getMonsters(null, testRes);
            expect(stubMonsterFind).to.be.calledWith({});
            return stubMonsterFind().then(function () {
                expect(jsonSpy).to.be.calledWith(monsterList);
            });
        });

        it('should correctly send an error on \"res.send\" when \"Monster.find\" returns an error', function testGetMonsterError() {
            stubMonsterFind.rejects('This Failure!');
            MonsterSvc.getMonsters(null, testRes);
            expect(stubMonsterFind).to.be.calledWith({});
            return stubMonsterFind().catch(function () {
                expect(errorSpy).to.be.calledWith(new Error('This Failure!'));
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

        let stubMonsterFind,
            jsonSpy,
            errorSpy,
            testRes,
            testReq = null;

        beforeEach(function () {
            stubMonsterFind = sinon.stub(Monster, 'findById');
            jsonSpy = sinon.spy();
            errorSpy = sinon.spy();
            testReq = {
                params: {
                    monster_id: testMonsterId
                }
            }
            testRes = {
                json: jsonSpy,
                send: errorSpy
            }
        });

        afterEach(function () {
            Monster.findById.restore();
        });

        it('should correctly call \"res.json\" on the result of \"Monster.find\" when getMonsterById(...) is called', function testGetMonsterByIdCall() {
            stubMonsterFind.resolves(testMonster);
            MonsterSvc.getMonsterById(testReq, testRes);
            expect(stubMonsterFind).to.be.calledWith(1);
            return stubMonsterFind().then(function () {
                expect(jsonSpy).to.be.calledWith(testMonster);
            });
        });

        it('should correctly send an error on \"res.send\" when \"Monster.find\" returns an error', function testGetMonsterByIdFailure() {
            stubMonsterFind.rejects('This is an error!');
            MonsterSvc.getMonsterById(testReq, testRes);
            expect(stubMonsterFind).to.be.calledWith(1);
            return stubMonsterFind().catch(function () {
                expect(errorSpy).to.be.calledWith(new Error('This is an error!'));
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

        let stubMonsterCreate,
            jsonSpy,
            errorSpy,
            testRes = null;

        beforeEach(function () {
            stubMonsterCreate = sinon.stub(Monster, 'create');
            jsonSpy = sinon.spy();
            errorSpy = sinon.spy();
            testRes = {
                json: jsonSpy,
                send: errorSpy
            }
        });

        afterEach(function () {
            Monster.create.restore();
        });

        it('should correctly call \"res.json\" on the result of \"Monster.create\" when postMonsters(...) is called', function testPostMonsterCall() {
            stubMonsterCreate.resolves(testMonsterResponse);
            MonsterSvc.postMonsters(testMonster, testRes);
            expect(stubMonsterCreate).to.be.calledWith(testMonsterResponse);
            return stubMonsterCreate().then(function () {
                expect(jsonSpy).to.be.calledWith(testMonsterResponse);
            });
        });

        it('should correctly call \"res.send\" when \"Monster.create\" sends an error after postMonsters(...) is called', function testPostMonsterError() {
            stubMonsterCreate.rejects('Test Failure!');
            MonsterSvc.postMonsters(testMonster, testRes);
            expect(stubMonsterCreate).to.be.calledWith(testMonsterResponse);
            return stubMonsterCreate().catch(function () {
                expect(errorSpy).to.be.calledWith(new Error('Test Failure!'));
            });
        });
    });

    describe('#updateMonster', function () {

        let testParams = {
            monster_id: 1
        };
        let testUpdate = {
            name: 'newName',
            hp: 55
        };
        let testOldMonster = {
            _id: '8675309',
            name: 'oldName',
            hp: 20,
            save: null
        };
        let testNewMonster = {
            _id: '8675309',
            name: 'newName',
            hp: 55,
            save: null
        };
        let stubMonsterFindById,
            testReq,
            testRes,
            jsonSpy,
            errorSpy,
            saveSpy = null;

        beforeEach(function () {
            stubMonsterFindById = sinon.stub(Monster, 'findById');
            jsonSpy = sinon.spy();
            errorSpy = sinon.spy();
            saveSpy = sinon.spy();
            testOldMonster.save = saveSpy;
            testNewMonster.save = saveSpy;
            testReq = {
                params: testParams,
                body: testUpdate
            };
            testRes = {
                json: jsonSpy,
                send: errorSpy
            };
        });

        afterEach(function () {
            Monster.findById.restore();
        });

        it('should correctly call \"res.json\" when \"Monster.findById\" when updateMonster(...) is called', function testUpdateMonsterCall() {
            stubMonsterFindById.resolves(testOldMonster);
            MonsterSvc.updateMonster(testReq, testRes);
            expect(stubMonsterFindById).to.be.calledWith(1);
            return stubMonsterFindById().then(function () {
                expect(saveSpy).to.be.called();
                expect(jsonSpy).to.be.calledWith(testNewMonster);
            });
        });

        it('should correctly call \"res.send\" when \"Monster.findById\" sends an error after updateMonster(...) is called', function testUpdateMonsterFail() {
            stubMonsterFindById.rejects('This update failed!');
        });
    });
});
