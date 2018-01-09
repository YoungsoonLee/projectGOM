import { observable, action } from "mobx";
import axios from "axios";

import * as NewsAPI from '../lib/api/news';

// store at news
export default class NewsState {
    @observable newsItems;
    @observable newsitem;
    @observable pages;
    @observable errorFlash;
    
    constructor() {
        this.newsItems = [];
        this.pages = {
            "page": 1,
            "pageSize": 20,
            "rowCount": 0,
            "pageCount": 0
        };
        this.item = null;
        this.errorFlash = null;
    }

    @action setNewsData(news) {
        this.newsItems = news;
    }
    
    @action setPage(page) {
        this.pages = page;
        //console.log(this.page);
    }


    @action async fetchNewsData() {
        let news = null;
        
        try{
            news = await NewsAPI.getNewsData(this.pages);
        }catch(e){
            //this.errorFlash = err.response.data.message;
            console.log(e);
        }

        if(news) {
            //console.log(news.data.data);
            this.setNewsData(news.data.data);
            this.setPage(news.data.page);
        }else{
            //this.errorFlash = 'Something wrong to get items. try agin.';
        }
    }

    @action async fetchNewsItem(id) {
        let item = null;

        try{
            item = await NewsAPI.getNewsItem(id);
        }catch(err){
            this.errorFlash = err.response.data.message;
        }

        if(item) {
            //console.log(item.data);
            this.newsitem = item.data;
        }else{
            this.errorFlash = "News not founded.";
        }
    }
}
