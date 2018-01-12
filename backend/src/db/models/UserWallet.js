const bookshelf = require('db');
const User = require('db/models/User');

var UserWallet = bookshelf.Model.extend({
    tableName: 'user_wallet',
    idAttribute: 'user_id'
},{
    //static methods

    //returned model
    getBalanceById: function(user_id) {
        let userWallet = this.where({ user_id: user_id }).first();

        if(!userWallet){
            this.createWallet(user_id);
        }

        return userWallet;
    },
    
    // user is not a constructor
    // because user has saving option
    /*
    getBalanceByDisplayName: function(displayName) {
       console.log(displayName);
        return new Promise(
            (resolve, reject) => {
                new User({name: displayName}).fetch().then((user)=>{
                    console.log(user);
                    resolve(user);
                }).catch((err)=>{
                    console.log('err getBalanceByDisplayName: ', err);
                    reject(null);
                });
            });
    },
    */
    createWallet: function(user_id) {
        return new Promise(function(resolve, reject) {
            new UserWallet.save({
                user_id: user_id,
                balance: 0,
                created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
            }).then(function(userWallet) {
                resolve(userWallet);
            }).catch(function(err) {
                // TODO: logging
                reject(null);
            })
        });
    }
});

module.exports = UserWallet;
