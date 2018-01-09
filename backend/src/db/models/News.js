var bookshelf = require('db');
bookshelf.plugin('pagination');

var News = bookshelf.Model.extend({
    tableName: 'news'
    //hasTimestamps: ['created_at', 'updated_at']
}, {
    //static methos
    getNewsData: function() {
        return News.query(qb => {
            qb.select('*');
        }).orderBy('created_at', 'DESC').fetchPage({page: 1, pageSize: 20}).then(raw => {
            //console.log(raw.pagination);
            //console.log(raw.toJSON());
            return raw;
        });
    },

    getNewsItem: function(id) {
        return  this.where({ id: id }).first();
    } 
});

module.exports = News;
