var bookshelf = require('db');
const token = require('lib/token');

var UserToken = bookshelf.Model.extend({
    tableName: 'user_tokens',
    //jwt.verify
    decodeToken: function(jwtToken) {
        return new Promise(function(resolve, reject) {
            token.decodeToken(jwtToken).then((token)=>{
                resolve(token);
            }).catch((err)=>{
                reject(err);
            });
        });
    },

    hidden: ['expired_at', 'user_id'],
},{
    //stat methods
    findByAccessToken: function (access_token) {
        return  this.where({ hashed: access_token }).first();
        /*
        return this.forge().query({ where:{ hashed: access_token} }).fetch().then((userToken)=>{
            return userToken;
        }).catch((err)=>{return null;});
        */
    },
});

module.exports = UserToken;
