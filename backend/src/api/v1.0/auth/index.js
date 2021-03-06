//routes of auth

const Router = require('koa-router');
const auth = new Router();
const authCtrl = require('./auth.ctrl');

auth.post('/register/local', authCtrl.localRegister);
auth.post('/register/:provider(facebook|google)', authCtrl.socialRegister);

auth.post('/login/local', authCtrl.localLogin);
auth.post('/login/:provider(facebook|google)', authCtrl.socialLogin);

auth.post('/login/game', authCtrl.gameLogin);

auth.post('/isValidToken/:access_token', authCtrl.isValidToken);

auth.get('/exists/displayName/:displayName', authCtrl.checkDisplayName);
//exists email??
auth.get('/check', authCtrl.check);

auth.post('/logout', authCtrl.logout);

module.exports = auth;
