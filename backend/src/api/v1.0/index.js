const Router = require('koa-router');
const base = require('./base');
const auth = require('./auth');
const billing = require('./billing');
const user = require('./user');
const news = require('./news');


const api = new Router();

api.use('/base', base.routes());
api.use('/auth', auth.routes());
api.use('/billing', billing.routes());
api.use('/user', user.routes());
api.use('/news', news.routes());


module.exports = api;
