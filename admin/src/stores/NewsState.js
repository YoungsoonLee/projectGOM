import { observable, action } from "mobx";
import axios from "axios";

import * as BillingAPI from '../lib/api/news';

// store at billing
export default class NewsState {

  constructor() {
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
                {title:"No", formatter:"rownum", align:"center", width:100},
                {title:"Date", field:"transaction_at", align:"left", formatter:function(cell, formatterParams){
                        var value = cell.getValue();
                        return moment(value).format('YYYY-MM-DD HH:mm:ss')
                    }
                },
                {title:"Transaction Id", field:"pid", align:"left"},
                {title:"Item Name", field:"item_name"},
                {title:"Price", field:"price",align:"left", formatter:function(cell, formatterParams){
                        var value = cell.getValue();
                        return numeral(value).format('$ 0,0.0');
                    }
                },
                {title:'Amount of <i aria-hidden="true" class="diamond icon"></i>', field:"amount",align:"left" , formatter:function(cell, formatterParams){
                        var value = cell.getValue();
                        //return '<i class="fa fa-diamond" aria-hidden="true"></i> '+numeral(value).format('0,0');
                        return '<i aria-hidden="true" class="diamond icon"></i> '+numeral(value).format('0,0');
                    }
                },
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

        $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getChargeHistory/885534354');
        $("#tabulator-1").tabulator("redraw", true);
        
    }

}
