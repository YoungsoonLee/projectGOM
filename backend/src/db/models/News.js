const moment = require('moment');
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

    getNewsDataAll: function() {

        return News.query(qb => {
            qb.select('*');
        }).orderBy('created_at', 'DESC').fetchAll().then(raw => {
            //console.log(raw.pagination);
            //console.log(raw.toJSON());
            return raw;
        });
    },

    getNewsItem: function(id) {
        return  this.where({ id: id }).first();
    },
    addNews: function({category, title, authour, data}) {
        return new Promise(function(resolve, reject) {
                new News().save(
                    {
                        category: category,
                        title: title,
                        subject: data,
                        authour: authour,
                        is_active: true,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }
                ).then(function(news) {
                    resolve(news.toJSON());
                }).catch(function(err) {
                    reject(null);
                });
        });
    },
    updateNews: function({id, category, title, authour, data}) {
        return new Promise(function(resolve, reject) {
                new News({id}).save(
                    {
                        category: category,
                        title: title,
                        subject: data,
                        authour: authour,
                        is_active: true,
                        updated_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }
                ).then(function(news) {
                    resolve(news.toJSON());
                }).catch(function(err) {
                    reject(null);
                });
        });
    }
});

module.exports = News;
