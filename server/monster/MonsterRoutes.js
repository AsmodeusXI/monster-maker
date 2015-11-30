'use strict';

const MonsterSvc = require('./MonsterSvc');

module.exports = function(app) {
    app.get('/api/monsters', MonsterSvc.getMonsters);
    app.post('/api/monsters', MonsterSvc.postMonsters);
    app.delete('/api/monsters/:monster_id', MonsterSvc.deleteMonster);
}
