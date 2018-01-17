import { observable, action } from "mobx";
import axios from "axios";

import * as NewsAPI from '../lib/api/news';

// store at billing
export default class NewsState {
    @observable title;
    @observable category;

    constructor() {
        this.title = '';
        this.category = '';
    }

    @action setTitle(title){
        this.title = title;
    }

    @action setCategory(category) {
        this.category = category;
    }

    @action async addNews(data, history) {
        let returnData = null;
        try{
            var sdata = {
                title: this.title,
                category: this.category,
                authour: 'youngtip',        //TODO: set authour
                data: data
            }
            console.log(sdata);

            returnData = NewsAPI.addNews(sdata);
        }catch(err){
            console.log(err)
        }
    }

    // this is to payment history.
    @action async fetchNews() {

            $("#tabulator-1").tabulator({});
            $("#tabulator-1").tabulator("destroy");

            $("#tabulator-1").tabulator({
                layout:"fitColumns",
                height:511, // set height of table, this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
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
                    {title:"Category", field:"category", align:"left", width:100, headerFilter:true},
                    {title:"Title", field:"title", headerFilter:"input"},
                    {title:"Subject", field:"subject", headerFilter:"input"},
                    {title:"Authour", field:"authour", width:100, headerFilter:"input"}
                ],
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

}
