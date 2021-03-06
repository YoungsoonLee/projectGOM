import { observable, action } from "mobx";
import axios from "axios";
import validator from 'validator';
import waterfall from 'async/waterfall';

import * as AuthAPI from '../lib/api/auth';
import * as UserAPI from '../lib/api/user';
import storage from '../lib/storage';
import social from '../lib/social';
import redirect from '../lib/redirect';

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
  @observable viewFlash;
  @observable errorFlash;
  @observable successFlash;
  @observable profileEmail;

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
      displayname: '',
      email: '',
      password: ''
    }

    this.loggedInUserInfo = {
      _id: '',
      displayname: '',
      gravatar: '',
      balance: '0',
      gravatar: '',
    }

    this.error = null;
    this.viewFlash = false;
    this.errorFlash = null;
    this.successFlash = null;
    this.profileEmail = null;

    this.items = [];
    this.item = {};
    this.testval = "Cobbled together by ";

    //get a balance with ws ???
  }

  @action setInitUserInfo() {
    this.userInfo.displayname = '';
    this.userInfo.email = '';
    this.userInfo.password = '';

    this.error = null;
    this.viewFlash = false;
    this.errorFlash = null;
    this.successFlash = null;

    this.profileEmail = null;

    this.authModalMode = 'SIGNIN';
    this.signupStep = 1;
  }

  @action async setInitLoggedInUserInfo() {
    storage.remove('___GOM___');

    this.authenticated = false;
    this.loggedInUserInfo._id = '';
    this.loggedInUserInfo.displayname = '';
    this.loggedInUserInfo.gravatar = '';
    this.loggedInUserInfo.balance = '0';
    this.loggedInUserInfo.gravatar = '';
  }

  @action changeAuthModalMode() {
    if(this.authModalMode === 'SIGNIN'){
      this.authModalMode = 'SIGNUP';
      this.signupStep = 1;
    }else{
      this.authModalMode = 'SIGNIN';
    }

    this.userInfo.displayname = '';
    this.userInfo.email = '';
    this.userInfo.password = '';

    this.error = null;
    this.errorFlash = null;
    this.successFlash = null;
    
    this.profileEmail = null;
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

  @action setError(msg) {
    this.error = msg;
  }

  // check displayName dup
  @action async checkDisplayName() {
    //validate
    if ( 
        !(validator.isLength(this.userInfo.displayname, {min:3, max: 15})) || 
         (validator.contains(this.userInfo.displayname, ' ')) || 
        !(validator.isAlphanumeric(this.userInfo.displayname))
        ){
      this.setError('a displayname has 3~15 letters/numbers without space.');
    }else{
      this.setError(null);
    }

    if(!this.error) {

      try{
        let { data } = await AuthAPI.checkDisplayName(this.userInfo.displayname);
        //data = await AuthAPI.checkDisplayName(this.userInfo.displayName);
        this.setError(null);
        this.setSignupStep(2) // move to next step
      } catch(error) {
        console.log(error.response.data)
        this.setError('already exists a displayname.');
      }
        
      /*
      let { data } = await AuthAPI.checkDisplayName(this.userInfo.displayName);
      console.log(data)
      console.log(data.code)

      if(data.exists){
        this.setError('already exists a displayname.');
      }else{
        this.setError(null);
        this.setSignupStep(2) // move to next step
      }
      */
    }

  }

  // localSignup
  @action async localRegister(history, lastLocation) {
    // validation
    if ( 
        !(validator.isLength(this.userInfo.displayname, {min:4, max: 16})) || 
        (validator.contains(this.userInfo.displayname, ' ')) || 
        !(validator.isAlphanumeric(this.userInfo.displayname))
        ){
      this.setError('A displayname has 4~16 letters/numbers without space.');
    }else if(!validator.isEmail(this.userInfo.email)) {
      this.setError('Please input a valid email address.');
    }else if ( !(validator.isLength(this.userInfo.password, {min:8, max: undefined})) || (validator.contains(this.userInfo.password, ' ')) ){
      this.setError('The password must be at least 8 characters long without space.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      //let data = null;
      let respData = null;
      try{
        // call backend
        respData = await AuthAPI.localRegister({...this.userInfo});

        // set init userinfo
        this.setInitUserInfo();

        // make cookie
        storage.set('___GOM___', respData.data.data);

        // login
        this.authenticate();

        // redirect to home
        redirect.set(history,lastLocation);

        // flash message
        this.successFlash = 'Welcome ! ' + respData.data.data.displayname;

      }catch(err){
        if (err.response.data) {
          this.setError(err.response.data.message);
        }else{
          this.setError(err);
        }
      }
    }
  }

  // localLogin
  @action async localLogin(history, lastLocation) {
    console.log("call login");

    /*
    if(!validator.isEmail(this.userInfo.email)) {
      this.setError('please input a valid email address.');
    }else 
    */
   if ( 
      !(validator.isLength(this.userInfo.displayname, {min:3, max: 15})) || 
      (validator.contains(this.userInfo.displayname, ' ')) || 
      !(validator.isAlphanumeric(this.userInfo.displayname))
      ){
      this.setError('a displayname has 3~15 letters/numbers without space.');
    }else if ( !(validator.isLength(this.userInfo.password, {min:8, max: undefined})) || (validator.contains(this.userInfo.password, ' ')) ){
      this.setError('The password must be at least 8 characters long without space.');
    }else{
      this.setError(null);
    }

    if(!this.error) {
      
      //let data = null;
      let respData = null;
      try{

        respData = await AuthAPI.localLogin({displayname: this.userInfo.displayname, password: this.userInfo.password});
        
        this.setInitUserInfo();
        //console.log(respData.data.data);
        //console.log(JSON.stringify(respData.data.data))
        storage.set('___GOM___', respData.data.data);

        this.authenticate();
        redirect.set(history,lastLocation);

      }catch(err){
        //console.log(err);
        if (err.response.data) {
          this.setError(err.response.data.message);
        }else{
          this.setError(err);
        }
      }
    }

  }

  // socialAuth
  @action async socialAuth(provider, history, lastLocation) {
    //console.log('socialAuth lastLocation: ', lastLocation.pathname);

    if(this.authModalMode === 'SIGNUP') {
      if(!this.error) {
        social[provider]().then((accessToken)=>{
          AuthAPI.socialRegister({ 
            displayname: this.userInfo.displayname, 
            provider: provider, 
            accessToken: accessToken,
          }).then((response)=>{
            //console.log(response.data);
            this.setInitUserInfo();

            storage.set('___GOM___', response.data);
            redirect.set(history,lastLocation);
            this.authenticate(); // !! important after redirect

          }).catch((err)=>{
            if (err.response.data) {
              this.setError(err.response.data.message);
            }else{
              this.setError(err);
            }
          });
    
        }).catch((err)=>{
            this.setError('somthing wrong with '+provider+'. try again after a few minutes.');
        });
      }
    }else{
      this.setInitUserInfo(); //!!!

      if(!this.error) {
        social[provider]().then((accessToken)=>{
          AuthAPI.socialAuth({ 
            provider: provider, 
            accessToken: accessToken,
          }).then((response)=>{
            storage.set('___GOM___', response.data);
            redirect.set(history,lastLocation);
            this.authenticate(); // !! important after redirect

          }).catch((err)=>{
            if (err.response.data) {
              this.setError(err.response.data.message);
            }else{
              this.setError(err);
            }
          });
    
        }).catch((err)=>{
            this.setError('somthing wrong with '+provider+'. try again after a few minutes.');
        });
      }
    }
  }

  @action async authenticate() {
    //check auth
    //TODO: think ! check GOM or not
    let cookieInfo = null;
    cookieInfo = storage.get('___GOM___');

    //if ( storage.get('___GOM___') ) {
    if ( cookieInfo ) {
      let auth = null;
      try{
        auth = await AuthAPI.checkLoginStatus(cookieInfo.token);
        console.log('auth: ', auth);
        console.log('auth: ', auth.data);
      }catch(e){
        //console.log('exception check: ', e.message);
        await this.setInitLoggedInUserInfo();
      }

      if(!auth) {
        await this.setInitLoggedInUserInfo()
      }else{
        //storage.set('___GOM___', auth.data);
        
        this.authenticated = true;
        this.loggedInUserInfo._id = auth.data.user.uid;
        this.loggedInUserInfo.displayName = auth.data.user.displayname;
        this.loggedInUserInfo.balance = auth.data.balance.toString();
        this.loggedInUserInfo.gravatar = auth.data.pciture;
      }
    }else{
      console.log('no gom');
      await this.setInitLoggedInUserInfo();
    }
  }

  @action async logout(history) {
    //check auth\
    let { data } = await AuthAPI.logout();
    await this.authenticate();
    this.setInitUserInfo();
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
    }catch(err){
      this.errorFlash = err.response.data.message;
    }

    //console.log(data);

    if(!data) {
      this.errorFlash = 'token is invalid or has expired. try resend again.';
      history.push('/unemail_confirm');
    }else{
      this.successFlash = 'email confirm success.'
      history.push('/');
      /*
      if(this.loggedInUserInfo.authenticate) {
        history.push('/');
      }else{
        history.push('/login');
      }
      */
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
        this.setInitUserInfo();
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
        this.setInitUserInfo();
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
        this.setInitUserInfo();
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
        this.setInitUserInfo();
      }catch(err){
        //console.log(err);
        this.errorFlash = err.response.data.message;
      }
      
      if(data) {
        this.setInitUserInfo();
        this.successFlash = 'Password is changed. please re-sign in.'
        let { data } = await AuthAPI.logout();
        await this.authenticate();
        history.push('/login');
      }
    }
  }

}
