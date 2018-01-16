var bookshelf = require('db');
bookshelf.plugin('pagination');

var News = bookshelf.Model.extend({
    tableName: 'news'
    //hasTimestamps: ['created_at', 'updated_at']
}, {
    //static methos
    getNewsData: function(page) {
        if (!page) page = 1;

        return News.query(qb => {
            qb.select('*');
        }).orderBy('created_at', 'DESC').fetchPage({page: page, pageSize: 20}).then(raw => {
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
