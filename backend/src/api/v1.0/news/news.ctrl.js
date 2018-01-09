const log = require('lib/log');

const bookshelf = require('db');
const News = require('db/models/News')

exports.getNewsData = async (ctx) => {
    const { page } = ctx.params;
    //console.log(page);

    let news = null;
    try{
        // returned model
        news = await News.getNewsData();
    }catch(e){
        log.error('[GET NEWS]', '[getNewsData]', e.message);
        ctx.status = 500; //bad request
        ctx.body = {
            message: e.message
        }
        return;
    }

    if (!news) {
        ctx.status = 400; //bad request
        ctx.body = {
            message: "News not found."
        }
        return;
    }

    ctx.body = {
        data: news.toJSON(),
        page: news.pagination
    }
}


exports.getNewsItem = async (ctx) => {
    const { id } = ctx.params;

    let item = null;
    try{
        // returned model
        item = await News.getNewsItem(id);
    }catch(e){
        //console.log(e);
        log.error('[GET NEWS]', '[getNewsItem]', id, e.message);
        ctx.status = 500; //bad request
        ctx.body = {
            message: e.message
        }
        return;
    }

    if (item) {
        itemJSON = item.toJSON();
    }else{
        ctx.status = 400; //bad request
        ctx.body = {
            message: "New item not found."
        }
        return;
    }

    ctx.body = {
        ...itemJSON
    }
}