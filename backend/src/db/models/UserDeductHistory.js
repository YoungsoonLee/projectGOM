var bookshelf = require('db');
var randomize = require('randomatic');

var UserDeductHistory = bookshelf.Model.extend({
    tableName: 'user_deduct_history',
    idAttribute: 'deduct_id'
},{
    //stat methods
    isExistsExternalId: function(service_id, external_id){
        return this.where({ service_id: service_id, external_id: external_id}).first();
    },

    makeDeductHistory: function(deductHistory){
        // make deduct_id
        var deduct_id = 'D'+randomize('0', 12).toString();
        deductHistory.deduct_id = deduct_id;

        return new Promise(
            (resolve, reject) => {
                new UserDeductHistory().save(deductHistory).then((dtranx)=>{
                        //console.log(dtranx.toJSON());
                        resolve(dtranx.toJSON());
                    }).catch((err)=>{
                        console.log('err: ', err);
                        reject(err)
                    });
            }
          );
    },

    getDeductHistory: function(user_id) {
        return  this.where({ user_id: user_id }).orderBy('-used_at').get();
    }
});

module.exports = UserDeductHistory;
