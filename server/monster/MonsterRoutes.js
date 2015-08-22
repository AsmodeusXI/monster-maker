'use strict';

const MonsterSvc = require('./MonsterSvc');

module.exports = function(app) {
    app.get('/api/monster', MonsterSvc.getMonsters);
    app.post('/api/monster', MonsterSvc.postMonsters);
    app.delete('/api/monster/:monster_id', MonsterSvc.deleteMonster);
}
