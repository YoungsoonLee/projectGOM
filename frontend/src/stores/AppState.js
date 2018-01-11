import { observable, action } from "mobx";
import axios from "axios";
import validator from 'validator';
import waterfall from 'async/waterfall';

import * as AuthAPI from '../lib/api/auth';
import * as UserAPI from '../lib/api/user';
import storage from '../lib/storage';
import social from '../lib/social';

// store at auth and app
export default class AppState {
  @observable authenticated;
  @observable authenticating;

  @observable authModalMode;
  @observable signupStep;

  //signin & signup info
  @observable userInfo;
  @observable error;
  @observable loggedInUserInfo;
  @observable errorFlash;
  @observable successFlash;
  @observable profileEmail;

  //for payhistpory
  @observable historyMode;

  @observable items;
  @observable item;
  @observable testval;

  constructor() {
    this.authenticated = false;
    this.authenticating = false;

    this.authModalMode = 'SIGNIN';
    this.signupStep = 1;

    /*
    this.userInfo.displayName = '';
    this.userInfo.email = '';
    this.userInfo.password = '';
    */

    //for signup and login
    this.userInfo = {
      displayName: '',
      email: '',
      password: ''
    }

    this.loggedInUserInfo = {
      _id: '',
      displayName: '',
      gravatar: '',
      balance: '0',
      gravatar: '',
    }

    this.error = null;
    this.errorFlash = null;
    this.successFlash = null;
    this.profileEmail = null;

    this.historyMode = 'charge';

    this.items = [];
    this.item = {};
    this.testval = "Cobbled together by ";

    //get a balance with ws ???
  }

  @action setHistoryMode(mode) {
    this.historyMode = mode;
  }

  @action setInitUserInfo() {
    this.userInfo.displayName = '';
    this.userInfo.email = '';
    this.userInfo.password = '';
    this.error = null;
    this.errorFlash = null;
    this.successFlash = null;
    this.profileEmail = null;
  }

  @action async setInitLoggedInUserInfo() {
    storage.remove('___GOM___');

    this.authenticated = false;
    this.loggedInUserInfo._id = '';
    this.loggedInUserInfo.displayName = '';
    this.loggedInUserInfo.gravatar = '';
    this.loggedInUserInfo.balance = '0';
    this.loggedInUserInfo.gravatar = '';
  }

  @action changeAuthModalMode() {

    this.setInitUserInfo();

    if(this.authModalMode === 'SIGNIN'){
      this.authModalMode = 'SIGNUP';
      this.signupStep = 1;
    }else{
      this.authModalMode = 'SIGNIN';
    }

  }

  @action setInitModal() {
    this.authModalMode = 'SIGNIN';
    this.signupStep = 1;
    this.setInitUserInfo();
  }

  @action setInitSignupStep() {
    this.signupStep = 1;
    this.setInitUserInfo();
  }

  @action setSignupStep(step) {
    this.signupStep = step;
    //console.log(this.signupStep);
  }

  // check displayName dup
  @action async checkDisplayName() {
    //validate
    if ( 
        !(validator.isLength(this.userInfo.displayName, {min:3, max: 15})) || 
         (validator.contains(this.userInfo.displayName, ' ')) || 
        !(validator.isAlphanumeric(this.userInfo.displayName))
        ){
      this.setError('a displayname has 3~15 letters/numbers without space.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      let { data } = await AuthAPI.checkDisplayName(this.userInfo.displayName);
      if(data.exists){
        this.setError('already exists a displayname.');
      }else{
        this.setError(null);
        this.setSignupStep(2) // move to next step
      }
    }

  }

  // localSignup
  @action async localRegister(history) {

    if(!validator.isEmail(this.userInfo.email)) {
      this.setError('please input a valid email address.');
    }else if ( !(validator.isLength(this.userInfo.password, {min:8, max: undefined})) || (validator.contains(this.userInfo.password, ' ')) ){
      this.setError('The password must be at least 8 characters long without space.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      let data = null;
      try{
        data = await AuthAPI.localRegister({...this.userInfo});
        storage.set('___GOM___', data);
        this.authenticate();
        history.push('/');

      }catch(e){
        //console.log('1', e.response.data.message);
        this.setError(e.response.data.message);
      }
    }
  }

  // localLogin
  @action async localLogin(history) {

    if(!validator.isEmail(this.userInfo.email)) {
      this.setError('please input a valid email address.');
    }else if ( !(validator.isLength(this.userInfo.password, {min:8, max: undefined})) || (validator.contains(this.userInfo.password, ' ')) ){
      this.setError('The password must be at least 8 characters long without space.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      
      let data = null;
      try{
        data = await AuthAPI.localLogin({email: this.userInfo.email, password: this.userInfo.password});

        storage.set('___GOM___', data);
        this.authenticate();

        //history.goBack();
        //for forum...temp
        if(document.referrer === 'http://localhost:4567/'){
          history.push('/');
        }else{
          history.goBack();
        }

      }catch(e){
        //console.log('1',data.response);
        this.setError(e.response.data.message);
      }
    }
  }

  // socialAuth
  @action async socialAuth(provider, history) {
    //console.log('socialAuth: ', history);

    if(this.authModalMode === 'SIGNUP') {
      if(!this.error) {
        social[provider]().then((accessToken)=>{
          AuthAPI.socialRegister({ 
            displayName: this.userInfo.displayName, 
            provider: provider, 
            accessToken: accessToken,
          }).then((response)=>{
            //console.log(response.data);

            storage.set('___GOM___', response.data);
            
            //for forum...temp
            if(document.referrer === 'http://localhost:4567/'){
              history.push('/');
            }else{
              history.goBack();
            }

            //history.goBack();
            this.authenticate(); // !! important after redirect

          }).catch((err)=>{
            //console.log(err.response.data.message);
            this.setError(err.response.data.message);
          });
    
        }).catch((err)=>{
            //console.log('error: ', err);
            this.setError('somthing wrong with '+provider+'. try again after a few minutes.');
        });
      }
    }else{
      this.setInitUserInfo();

      if(!this.error) {
        social[provider]().then((accessToken)=>{
          AuthAPI.socialLogin({ 
            provider: provider, 
            accessToken: accessToken,
          }).then((response)=>{
            //console.log(response.data);
            storage.set('___GOM___', response.data);
            
            //for forum...temp
            if(document.referrer === 'http://localhost:4567/'){
              history.push('/');
            }else{
              history.goBack();
            }

            //history.goBack();
            this.authenticate(); // !! important after redirect

          }).catch((err)=>{
            this.setError(err.response.data.message);
          });
    
        }).catch((err)=>{
            this.setError('somthing wrong with '+provider+'. try again after a few minutes.');
        });
      }
    }
  }

  @action setError(msg) {
    this.error = msg;
  }

  @action async authenticate() {
    //check auth
    //console.log('check auth start');

    if ( storage.get('___GOM___') ) {
      let auth = null;
      try{
        auth = await AuthAPI.checkLoginStatus();
        //console.log('auth: ', auth);
      }catch(e){
        //console.log('exception check: ', e.message);
        await this.setInitLoggedInUserInfo();
      }

      if(!auth) {
        //console.log('1');
        await this.setInitLoggedInUserInfo()
      }else{
        //console.log('2');
        storage.set('___GOM___', auth.data);
        
        this.authenticated = true;
        this.loggedInUserInfo._id = auth.data.user._id;
        this.loggedInUserInfo.displayName = auth.data.user.displayName;
        this.loggedInUserInfo.balance = auth.data.balance.toString();
        this.loggedInUserInfo.gravatar = auth.data.gravatar;
      }
    }else{
      console.log('no gom');
      await this.setInitLoggedInUserInfo();
    }
  }

  @action async logout(history) {
    //check auth
    let { data } = await AuthAPI.logout();
    await this.authenticate();
    history.push('/');
    
    /*
    if(!data) {
      await this.setInitLoggedInUserInfo()
      //history.push('/login');
      history.push('/');
    }
    */
  }

  @action async emailConfirm(confirm_token, history) {
    let data = null;
    try{ 
      data = await UserAPI.emailConfirm(confirm_token);
      //console.log(data);
    }catch(e){
      //console.log(e);
      this.errorFlash = 'token is invalid or has expired. try resend again.';
    }
    
    if(!data) {
      history.push('/unemail_confirm');
    }else{
      this.successFlash = 'email confirm succeed. please SIGN IN.'
      history.push('/login');
    }
  }

  @action async resendConfirmEmail() {
    //console.log(this.userInfo.email);

    if(!validator.isEmail(this.userInfo.email)) {
      this.setError('please input a valid email address.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      let data = null;
      try{ 
        data = await UserAPI.resendEmailConfirm(this.userInfo.email);
        //console.log(data);
      }catch(err){
        //console.log(err);
        this.setError(err.response.data.message);
      }
      
      if(data) {
        this.successFlash = 'resend confirm email succeed.'
      }
    }
  }

  @action async forgotPassword(){
    if(!validator.isEmail(this.userInfo.email)) {
      this.setError('please input a valid email address.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      let data = null;
      try{ 
        data = await UserAPI.forgotPassword(this.userInfo.email);
        //console.log(data);
      }catch(err){
        //console.log(err);
        this.setError(err.response.data.message);
      }
      
      if(data) {
        this.successFlash = 'send password reset token to yor email. please check your email inbox or spam box.'
      }
    }
  }

  @action async isValidResetPasswordToken(token, history) {
    let data = null;
    try{ 
      data = await UserAPI.isValidResetPasswordToken(token);
      //console.log(data);
    }catch(err){
      //console.log(err);
      //this.setError(err.response.data.message);
      this.errorFlash = err.response.data.message;
      history.push('/forgot_password');
    }
    
    if(data) {
      this.successFlash = 'Reset Token is valid.'
    }
  }

  @action async resetPassword(reset_token, confirmPassword, history) {
    //validate
    //console.log(confirmPassword);
    //console.log(this.userInfo.password);

    if ( !(validator.isLength(this.userInfo.password, {min:8, max: undefined})) || (validator.contains(this.userInfo.password, ' ')) ){
      this.setError('The password must be at least 8 characters long without space.');
    }else if ( !(validator.isLength(confirmPassword, {min:8, max: undefined})) || (validator.contains(confirmPassword, ' ')) ){
      this.setError('The confirm password must be at least 8 characters long without space.');
    }else if(this.userInfo.password !== confirmPassword){
      this.setError('Password does not match.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      let data = null;
      try{ 
        data = await UserAPI.resetPassword(reset_token, this.userInfo.password);
        //console.log(data);
      }catch(err){
        //console.log(err);
        this.errorFlash = err.response.data.message;
      }
      
      if(data) {
        this.setInitUserInfo();
        this.successFlash = 'Password is changed. please SIGN IN.'
        history.push('/login');
      }
    }
  }

  @action async getProfile(history) {
    this.setInitUserInfo();
    await this.authenticate();

    //console.log('getProfile: ', this.loggedInUserInfo._id);

    if(!this.loggedInUserInfo._id) {
      this.errorFlash = 'Need login first';
      //go to login
      history.push('/login');
    }else{

      let profile = null;
      try{
        
        profile = await UserAPI.getProfile(this.loggedInUserInfo._id);
      }catch(err){
        //console.log(err);
        //this.error = err.response.data.message;
        this.setError(err.response.data.message);
      }

      if(profile){
        this.profileEmail = profile.data.email;
        //this.loggedInUserInfo._id = profile.data._id;
        //this.loggedInUserInfo.displayName = profile.data.displayName;
      }else{
        //this.error = 'Something wrong to get profile.';
        this.setError('Something wrong to get profile.');
      }
    }
  }


  @action async updateProfile(confirmPassword, history) {

    if ( !(validator.isLength(this.userInfo.password, {min:8, max: undefined})) || (validator.contains(this.userInfo.password, ' ')) ){
      this.setError('The password must be at least 8 characters long without space.');
    }else if ( !(validator.isLength(confirmPassword, {min:8, max: undefined})) || (validator.contains(confirmPassword, ' ')) ){
      this.setError('The confirm password must be at least 8 characters long without space.');
    }else if(this.userInfo.password !== confirmPassword){
      this.setError('Password does not match.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      let data = null;
      try{ 
        data = await UserAPI.updateProfile(this.loggedInUserInfo._id, this.userInfo.password);
        //console.log(data);
      }catch(err){
        //console.log(err);
        this.errorFlash = err.response.data.message;
      }
      
      if(data) {
        this.setInitUserInfo();
        this.successFlash = 'Password is changed. please re-sign in.'
        this.logout(history);
        //history.push('/login');
      }
    }
  }

  /* moved to billingState
  // this is to payment history.
  // this is in here not billingState.
  // because, need to loggedInUserInfo._id
  @action async fetchPaymentHistory(history) {
      await this.authenticate();

      if(!this.loggedInUserInfo._id) {
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

            $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getChargeHistory/'+this.loggedInUserInfo._id);
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

              $("#tabulator-1").tabulator("setData", 'http://localhost:4000/api/v1.0/billing/getDeductHistory/'+this.loggedInUserInfo._id);
              $("#tabulator-1").tabulator("redraw", true);
          }
      }
      
  }
  */


  async fetchData(pathname, id) {
    let { data } = await axios.get(
      `https://jsonplaceholder.typicode.com${pathname}`
    );
    //console.log(data);
    data.length > 0 ? this.setData(data) : this.setSingle(data);
  }

  @action setData(data) {
    this.items = data;
  }

  @action setSingle(data) {
    this.item = data;
  }

  @action clearItems() {
    this.items = [];
    this.item = {};
  }

}
