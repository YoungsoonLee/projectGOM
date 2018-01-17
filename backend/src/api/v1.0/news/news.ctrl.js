const Joi = require('joi');
const log = require('lib/log');

const bookshelf = require('db');
const News = require('db/models/News');
const he = require('he');

exports.getNewsDataAll = async (ctx) => {

    let news = null;
    try{
        // returned model
        news = await News.getNewsDataAll();
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

    newsJSON = news.toJSON()
    ctx.body = newsJSON
}

exports.getNewsData = async (ctx) => {
    const { page } = ctx.params;
    //console.log(page);

    let news = null;
    try{
        // returned model
        news = await News.getNewsData(page);
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

    //console.log('1');
    //console.log('2: ', he.encode(JSON.stringify(news.toJSON())))

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

exports.addNews = async (ctx) => {
    const { body } = ctx.request;

    const schema = Joi.object({
        category: Joi.string().required(),
        title: Joi.string().required(),
        data: Joi.string().min(4),
        authour: Joi.string().required()
      });

    const result = Joi.validate(body, schema);
    
    // 스키마 검증 실패
    if(result.error) {
        ctx.status = 400;
        ctx.body = {
            message: result.error.details[0].message
        }
        return;
    }

    const { category, title, authour, data } = body;

    //save news
    let news = null;
    try {
        // returned JSON
        news = await News.addNews({
            category, title, authour, data
          });
        log.info('[ADD NEWS]',JSON.stringify(news));

    } catch (e) {
        log.error('[ADD NEWS]','[addNews]', category, title, authour, data, e);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception addNews. '+ e
        }
        return;
    }

    ctx.body = news;
}