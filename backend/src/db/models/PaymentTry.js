var bookshelf = require('db');
var randomize = require('randomatic');
var moment = require('moment');
const log = require('lib/log');

var PaymentTry = bookshelf.Model.extend({
    tableName: 'payment_try',
    idAttribute: 'pid'
},{
    //stat methods
    checkPaymentTry: function (pid, user_id, price) {
        // bookshelf-eloquent 
        // return model
        return  this.where({ pid: pid, user_id: user_id, price: price }).first();
        
    },
    savePaymentTry: function(user_id, item) {
        return new Promise(function(resolve, reject) {
                var pid = 'P'+randomize('0', 12).toString();

                new PaymentTry().save({
                    pid: pid,
                    user_id: user_id,
                    item_id: item.item_id,
                    item_name: item.item_name,
                    pg_id: item.pg_id, //xsolla
                    price: item.price,
                    amount: item.amount,
                    tried_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                }).then(function(payTryData) {
                    //done(null, payTryData.toJSON());
                    resolve(payTryData.toJSON());
                }).catch(function(err) {
                    log.error('[DB][getPaymentToken]', err);
                    reject(null);
                });
        });
    }
});

module.exports = PaymentTry;
