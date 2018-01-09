const Router = require('koa-router');
const user = new Router();
const userCtrl = require('./user.ctrl');

user.post('/emailConfirm/:confirm_token', userCtrl.emailConfirm);
user.post('/resendEmailConfirm/:email', userCtrl.resendEmailConfirm);
user.post('/forgotPassword/:email', userCtrl.forgotPassword);
user.post('/isValidResetPasswordToken/:reset_token', userCtrl.isValidResetPasswordToken);
user.post('/resetPassword', userCtrl.resetPassword);
user.post('/getProfile/:id', userCtrl.getProfile);
user.post('/updateProfile', userCtrl.updateProfile);

module.exports = user;