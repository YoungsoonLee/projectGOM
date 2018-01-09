//routes of billing
const Router = require('koa-router');
const news = new Router();
const newsCtrl = require('./news.ctrl');

news.get('/getNewsData/:page', newsCtrl.getNewsData);
news.get('/getNewsItem/:id', newsCtrl.getNewsItem);

module.exports = news;
