//routes of billing
const Router = require('koa-router');
const news = new Router();
const newsCtrl = require('./news.ctrl');

news.get('/getNewsDataAll', newsCtrl.getNewsDataAll);
news.get('/getNewsData/:page', newsCtrl.getNewsData);
news.get('/getNewsItem/:id', newsCtrl.getNewsItem);

news.post('/addNews', newsCtrl.addNews);
news.post('/updateNews/:id', newsCtrl.updateNews);

module.exports = news;
