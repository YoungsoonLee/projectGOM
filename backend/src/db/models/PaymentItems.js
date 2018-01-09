var bookshelf = require('db');

var PaymentItems = bookshelf.Model.extend({
    tableName: 'payment_items',
    idAttribute: 'item_id'
},{
    //stat methods
    getChargeItems: function () {
        return  this.where('price','>', 0 ).whereNull('closed_at').get();
    },

    findByItemId: function(item_id) {
        return this.where('item_id','=', item_id).where('price','>',0).whereNull('closed_at').first();
    }
});

module.exports = PaymentItems;
