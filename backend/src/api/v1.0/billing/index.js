//routes of billing
const Router = require('koa-router');
const billing = new Router();
const billingCtrl = require('./billing.ctrl');

billing.post('/callbackXsolla', billingCtrl.callbackXsolla);
billing.post('/getBalanceByDisplayName/:displayName' , billingCtrl.getBalanceByDisplayName);
billing.post('/getBalanceById/:id' , billingCtrl.getBalanceById);

billing.post('/deductCoin',billingCtrl.deductCoin);

billing.get('/getChargeItems', billingCtrl.getChargeItems);

billing.post('/getPaymentToken', billingCtrl.getPaymentToken);
billing.get('/getChargeHistory/:id', billingCtrl.getChargeHistory);
billing.get('/getDeductHistory/:id', billingCtrl.getDeductHistory);

module.exports = billing;
