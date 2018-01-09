//routes of auth

const Router = require('koa-router');
const base = new Router();
const baseCtrl = require('./base.ctrl');

base.get('/healthyCheck', baseCtrl.healthyCheck);
base.post('/healthyCheck', baseCtrl.healthyCheck);

module.exports = base;
