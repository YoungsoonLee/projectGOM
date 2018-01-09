var bookshelf = require('db');

var ServiceGateway = bookshelf.Model.extend({
    tableName: 'service_gateway',
    idAttribute: 'service_id'
},{
    //stat methods
    isValidServiceId: function(service_id) {
       return this.where({ service_id: service_id, closed_at: null}).first();
    }
});

module.exports = ServiceGateway;
