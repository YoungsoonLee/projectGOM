const bookshelf = require('db');
const moment = require('moment');

const UserWallet = require('./UserWallet');

var PaymentTransaction = bookshelf.Model.extend({
    tableName: 'payment_transaction',
    idAttribute: 'pid'
},{
    /**
     * const chargeData = {
                pid: paymentData.transaction.external_id,   //pid
                transaction_id: paymentData.transaction.id,
                user_id: paymentData.user.id,
                item_id: paymentTryJSON.item_id,
                item_name: paymentTryJSON.item_name,
                pg_id: paymentTryJSON.pg_id,
                currency: paymentTryJSON.currency,
                price: paymentTryJSON.price,
                amount: paymentTryJSON.amount
            }
     * 
     */
    makeCharge: function(chargeData){
        return new Promise(function(resolve, reject) {
            bookshelf.transaction(function(trx) {
                new PaymentTransaction().save({
                    pid: chargeData.pid,
                    transaction_id: chargeData.transaction_id,
                    user_id: chargeData.user_id,
                    item_id: chargeData.item_id,
                    item_name: chargeData.item_name,
                    pg_id: chargeData.pg_id,
                    currency: 'USD',
                    price: chargeData.price,
                    amount: chargeData.amount,
                    transaction_at: moment().format('YYYY-MM-DD HH:mm:ss.mm'),
                    amount_after_used: chargeData.amount,
                }).then(function(payment) {
                    //console.log('payment user_id: ', payment.get('user_id'));
                    
                    new UserWallet({user_id: payment.get('user_id')}).fetch().then((curWallet)=>{
                        //console.log('curBalance1: ', curWallet);
                        if(curWallet) {
                            curWallet.set('balance', parseInt(curWallet.get('balance'))+parseInt(payment.get('amount')));
                            curWallet.save().then((newWallet)=>{
                                resolve(newWallet.toJSON());
                            }).catch((err)=>{
                                // TODO: logging
                                console.log('[makeCharge] update user wallet err: ', err);
                                trx.rollback();
                                reject(null);
                            })
                        }else{
                            new UserWallet().save({
                                user_id: payment.get('user_id'),
                                balance: parseInt(payment.get('amount')),
                                created_at: moment().format('YYYY-MM-DD HH:mm:ss.mm')
                            }).then(function(newWallet) {
                                resolve(newWallet.toJSON());
                            }).catch(function(err) {
                                // TODO: logging
                                console.log('[makeCharge] make user wallet err: ', err);
                                trx.rollback();
                                reject(null);
                            })
                        }
                    }).catch((err)=>{
                        // TODO: logging
                        console.log('[makeCharge] get user wallet err: ', err);
                        trx.rollback();
                        reject(null);
                    })

                }).catch(function(err) {
                    // TODO: logging
                    console.log('err: ', err)
                    trx.rollback();
                    reject(null);
                });
            });
        });
    },

    getDeductPaytransaction: function(user_id){
        return this.where('user_id','=',user_id).andWhere('amount_after_used','<>',0).orderBy('transaction_at').first();
    },

    // callback hell
    makeDeduct: function(user_id, pid, deducted_amount_after_used, deducted_balance) {
        return new Promise(function(resolve, reject) {
            bookshelf.transaction(function(trx) {
                new PaymentTransaction({ pid: pid })
                    .save({amount_after_used:deducted_amount_after_used})
                    .then(()=>{
                        new UserWallet({ user_id: user_id })
                            .save({ balance: deducted_balance, updated_at: moment().format('YYYY-MM-DD HH:mm:ss.mm') })
                            .then((newWallet)=>{
                                resolve(newWallet.toJSON());
                            })
                            .catch((err)=>{
                                console.log('[makeDeduct] update user wallet err: ', err);
                                trx.rollback();
                                reject(null);
                            });
                    })
                    .catch((err)=>{
                        console.log('[makeDeduct] update paytransaion error: ', err);
                        trx.rollback();
                        reject(null);
                    });
            });
        });
    },

    getChargeHistory: function(user_id) {
        return  this.where({ user_id: user_id }).orderBy('-transaction_at').get();
        /*
        return //new Promise(function(resolve, reject) {
            this.forge().query(qb => {
                qb.select('*');
                qb.where('user_id','=', user_id);
            }).orderBy('-transaction_at')
            .fetchAll().then(raw => {
                console.log(raw.toJSON());
                //logger.verbose(req.url, 'get ajax payment history  ', req.user.id)
                return raw.toJSON();
                //resolve(raw.toJSON());
            }).catch(function(err) {
                console.log('[getChargeHistory] get chargehistory error: ', err);
                return null;
            });
        //});
        */
    },

    
});

module.exports = PaymentTransaction;
