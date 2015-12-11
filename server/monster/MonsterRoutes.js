'use strict';

const MonsterSvc = require('./MonsterSvc');

module.exports = function(app) {
    app.get('/api/monsters', MonsterSvc.getMonsters);
    app.get('/api/monsters/:monster_id', MonsterSvc.getMonsterById);
    app.post('/api/monsters', MonsterSvc.postMonsters);
    app.put('/api/monsters/:monster_id', MonsterSvc.updateMonster);
    app.delete('/api/monsters/:monster_id', MonsterSvc.deleteMonster);
}
