import { observable, action } from "mobx";
import axios from "axios";
import validator from 'validator';

import * as NewsAPI from '../lib/api/news';

// store at billing
export default class NewsState {
    @observable title;
    @observable category;
    @observable newsitem;
    @observable errorFlash;

    constructor() {
        this.title = null;
        this.category = null;

        this.newsitem = null;
        this.errorFlash = null;
    }

    @action setTitle(title){
        this.title = title;
    }

    @action setCategory(category) {
        this.category = category;
    }

    @action async addNews(data, history) {

        if ( 
            !(validator.isLength(this.title, {min:3})) || 
            !(validator.isLength(this.category, {min:3})) 
            ){
          this.errorFlash = 'category or tile has minimum 3 letters.';
        }else if ( !(validator.isLength(data, {min:9})) ){
            this.errorFlash = 'contents is null';
        }else{
          this.errorFlash = null;
        }
    
        if(!this.errorFlash) {

            let returnData = null;
            try{
                var sdata = {
                    title: this.title,
                    category: this.category,
                    authour: 'youngtip',        //TODO: set authour
                    data: data
                }
                //console.log(sdata);

                returnData = await NewsAPI.addNews(sdata);
            }catch(err){
                console.log(err)
            }

            history.push('/news');
        }

    }

    @action async updateNews(data, history) {
        if ( 
            !(validator.isLength(this.newsitem.title, {min:3})) || 
            !(validator.isLength(this.newsitem.category, {min:3})) 
            ){
          this.errorFlash = 'category or tile has minimum 3 letters.';
        }else if ( !(validator.isLength(data, {min:9})) ){
            this.errorFlash = 'contents is null';
        }else{
          this.errorFlash = null;
        }
    
        if(!this.errorFlash) {
            let returnData = null;
            try{
                var sdata = {
                    title: this.newsitem.title,
                    category: this.newsitem.category,
                    authour: 'youngtip',        //TODO: set authour
                    data: data
                }
                //console.log(sdata);

                returnData = await NewsAPI.updateNews(this.newsitem.id, sdata);
            }catch(err){
                console.log(err)
            }

            history.push('/news');
        }
        
    }

    @action async deleteNews(history) {
        let returnData = null;
        try{
            returnData = await NewsAPI.deleteNews(this.newsitem.id);
        }catch(err){
            console.log(err)
        }

        history.push('/news');
    }

    // this is to payment history.
    @action async fetchNews(history) {

        $("#tabulator-1").tabulator({});
        $("#tabulator-1").tabulator("destroy");

        $("#tabulator-1").tabulator({
            layout:"fitColumns",
            height:549, // set height of table, this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
            responsiveLayout:true,
            pagination:"local",
            paginationSize:10,
            //movableColumns:true,
            placeholder:"No Data Available", //display message to user on empty table
            columns:[ //Define Table Columns
                //{title:"No", field:"no" , width:100},
                {title:"Id", field:"id", align:"center", width:70},
                {title:"Date", field:"created_at", align:"left", width:150, formatter:function(cell, formatterParams){
                        var value = cell.getValue();
                        return moment(value).format('YYYY-MM-DD HH:mm:ss')
                    }
                },
                {title:"Category", field:"category", align:"left", width:150, headerFilter:true},
                {title:"Title", field:"title", headerFilter:"input", width:300},
                {title:"Subject", field:"subject", headerFilter:"input"},
                {title:"Authour", field:"authour", width:100, headerFilter:"input"}
            ],
            rowClick:function(e, row){
                //e - the click event object
                //row - row component
                //console.log(e);
                //console.log(row.row.data.id);
                history.push('/detail_news/'+row.row.data.id);
                //row.toggleSelect(); //toggle row selected state on row click
            },
        });
        
        /*
        $("#example-table").tabulator({
            ajaxResponse:function(url, params, response){
                //url - the URL of the request
                //params - the parameters passed with the request
                //response - the JSON object returned in the body of the response.

                return response.tableData; //return the tableData peroperty of a response json object
            },
        });
        */
        
        $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/news/getNewsDataAll');
        $("#tabulator-1").tabulator("redraw", true);
        
    }

    @action async fetchNewsItem(id) {
        let item = null;

        try{
            item = await NewsAPI.getNewsItem(id);
        }catch(err){
            this.errorFlash = err.response.data.message;
        }

        if(item) {
            this.newsitem = item.data;
            //console.log('newsState: ', this.newsitem);
            
        }else{
            this.errorFlash = "News not founded.";
        }
    }

}
