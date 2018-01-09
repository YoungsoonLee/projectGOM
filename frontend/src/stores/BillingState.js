import { observable, action } from "mobx";
import axios from "axios";

import * as BillingAPI from '../lib/api/billing';

// store at billing
export default class BillingState {
  @observable chagrgeItems;
  @observable errorFlash;
  @observable successFlash;
  @observable historyMode;

  constructor() {
    this.chagrgeItems = [];
    this.errorFlash = null;
    this.successFlash = null;
    this.historyMode = 'charge';
  }

  @action setHistoryMode(mode) {
    this.historyMode = mode;
  }

  @action setChagrgeItems(items) {
    this.chagrgeItems = items;
    //console.log(this.chagrgeItems);
    //console.log('1: ', this.chagrgeItems[0]);
  }

  @action async fetchChagrgeItems() {
      let data = null;
      try{
        data = await BillingAPI.getChargeItems();
      }catch(e){
        this.errorFlash = err.response.data.message;
      }

      if(data) {
        //console.log(data.data.chargeItems);
        this.setChagrgeItems(data.data.chargeItems);
      }else{
        this.errorFlash = 'Something wrong to get items. try agin.';
      }
  }

  async openPay(user_id, item_id, history) {
        //-------
        var complete = false;
        var waiting = false;
        var failed = false;
        var invoice;

        var success_url = 'http://localhost:3000/payment/history'

        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = '//static.xsolla.com/embed/paystation/1.0.7/widget.min.js';

        s.addEventListener(
            'load',
            function(e) {
                XPayStationWidget.on('close', function() {
                    //complete
                    //if (complete) window.location.href = success_url //+'?trx_id='+transactionId;
                    if (complete) history.push('/payment/history'); //+'?trx_id='+transactionId;
                    if (failed) window.location.href = '';
                });

                XPayStationWidget.on(
                    'status-invoice status-delivering status-troubled status-done',
                    function(event, data) {
                        console.log(arguments[0].type);
                        
                        if (arguments[0].type == 'status-done') {
                            complete = true;
                            //transactionId = data.paymentInfo.invoice; //set invoce to transactionId
                        }

                        if (arguments[0].type == 'status-delivering')
                            waiting = true;
                        if (arguments[0].type == 'status-troubled') failed = true;
                    }
                );
            },
            false
        );

        var head = document.getElementsByTagName('head')[0];
        head.appendChild(s);

        //--------
        //console.log(user_id, item_id);

        //check inputs
        if( (!user_id) || (!item_id) ) {
            //this.errorFlash = 'You should sign in first.'
            //go to login
            history.push('/login');
        }else{
            var options = {
                access_token: '',
                lightbox: {
                    spinnerColor: '#cccccc',
                    closeByClick: false,
                    closeByKeyboard: false
                },
                sandbox: false
            };
    
            let paymentToken = null;
            try{
                paymentToken = await BillingAPI.getPaymentToken({user_id, item_id});
            }catch(err) {
                this.errorFlash = err.response.data.message;
            }
    
            if(!paymentToken) {
                this.errorFlash = 'something wrong. please try again.'
            }else{
                options.access_token = paymentToken.data.token;
    
                if (paymentToken.data.mode === 'sandbox') {
                    options.sandbox = true;
                }
                console.log(options.sandbox);
                XPayStationWidget.init(options);
    
                document.getElementById('buyXsolla').click();
            }
        }
    }

  // this is to payment history.
  @action async fetchPaymentHistory(appState, history) {
        //console.log('billingState');
        await appState.authenticate();

        if(!appState.loggedInUserInfo._id) {
            //this.setError('need login first');
            //go to login
            this.errorFlash = 'Need login first';
            //go to login
            history.push('/login');

        }else{
            //console.log('fetchHistory');

            if(this.historyMode === 'charge') {
            $("#tabulator-1").tabulator({});
            $("#tabulator-1").tabulator("destroy");

            $("#tabulator-1").tabulator({
                layout:"fitColumns",
                height:511, // set height of table, this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                responsiveLayout:true,
                //pagination:"local",
                //paginationSize:20,
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

            $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getChargeHistory/'+appState.loggedInUserInfo._id);
            $("#tabulator-1").tabulator("redraw", true);
            }else{
            $("#tabulator-1").tabulator({});
                $("#tabulator-1").tabulator("destroy");
                //$("#tabulator-1").remove();

                $("#tabulator-1").tabulator({
                    layout:"fitColumns",
                    height:511, // set height of table, this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
                    responsiveLayout:true,
                    //pagination:"local",
                    //paginationSize:20,
                    //movableColumns:true,
                    placeholder:"No Data Available", //display message to user on empty table
                    columns:[ //Define Table Columns
                        //{title:"No", field:"no" , width:100},
                        {title:"No", formatter:"rownum", align:"center", width:150},
                        {title:"Date", field:"used_at", align:"left", formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                return moment(value).format('YYYY-MM-DD HH:mm:ss')
                            }
                        },
                        {title:"Used Id", field:"deduct_id", align:"left"},
                        {title:"Item Name", field:"item_name"},
                        {title:'Amount of <i aria-hidden="true" class="diamond icon"></i>', field:"item_amount",align:"left" , formatter:function(cell, formatterParams){
                                var value = cell.getValue();
                                //return '<i class="fa fa-diamond" aria-hidden="true"></i> '+numeral(value).format('0,0');
                                return '<i aria-hidden="true" class="diamond icon"></i> '+numeral(value).format('0,0');
                            }
                        },
                    ],
                });

                $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getDeductHistory/'+appState.loggedInUserInfo._id);
                $("#tabulator-1").tabulator("redraw", true);
            }
        }
    }

    //test
    @action async TestGetProfile(appState) {
        appState.setInitUserInfo();
        await appState.authenticate();

        console.log('test getProfile: ', appState.loggedInUserInfo._id);

    }
}
