
//routes of auth

const Router = require('koa-router');
const adminAuth = new Router();
const adminAuthCtrl = require('./auth.ctrl');

adminAuth.post('/register/admin', adminAuthCtrl.adminRegister);
adminAuth.post('/login/admin', adminAuthCtrl.adminLogin);

module.exports = adminAuth;
