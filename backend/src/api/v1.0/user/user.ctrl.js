const Joi = require('joi');
const bookshelf = require('db');
const User = require('db/models/User');
const moment = require('moment');

const log = require('lib/log');
const sendmail = require('lib/mail');

exports.emailConfirm = async (ctx) => {
    const { confirm_token } = ctx.params;

    if(!confirm_token){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'confirm_token is null'
        }
        return;
    }

    let user = null;
    try{
        user = await User.findByConfirmToken(confirm_token);
    }catch(e) {
        log.error('[EMAIL CONFIRM]', '[findByConfirmToken]', confirm_token, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion emailConfirm findByConfirmToken'
        }
        return;
    }

    if(!user) {
        // 유저가 존재하지 않거나
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'token is invalid or has expired. try get token again.'
        }
        return;
    }

    userJSON = user.toJSON();
    //if( moment(userJSON.confirm_reset_expires).format('YYYY-MM-DD hh:mm:ss') < moment().format('YYYY-MM-DD hh:mm:ss')) {
    if( userJSON.confirm_reset_expires.toISOString().substring(0, userJSON.confirm_reset_expires.toISOString().indexOf('.')) < moment().format('YYYY-MM-DDTHH:mm:ss')) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'email confirmation token is invalid or has expired. Resend confirmation email token.'
        }
        return;
    }

    try {
        await User.emailConfirm(userJSON.id);
    } catch (e) {
        log.error('[EMAIL CONFIRM]', '[emailConfirm]', userJSON.id, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion emailConfirm emailConfirm'
        }
        return;
    }

    ctx.body = {
        displayName: userJSON.name,
        _id: userJSON.id
    };

    return;
}

exports.resendEmailConfirm = async (ctx) => {
    const { email } = ctx.params;

    if(!email){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'email is null'
        }
        return;
    }

    let user = null;
    try{
        user = await User.findByEmail(email);
    }catch(e) {
        log.error('[RESEND EMAILCONFIRM]', '[findByEmail]', email, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion resendEmailConfirm findByEmail'
        }
        return;
    }
    
    if(!user) {
        // 유저가 존재하지 않거나
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'the email does not exists.'
        }
        return;
    }

    userJSON = user.toJSON();
    if(userJSON.confirmed) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'this email is already confirmed.'
        }
        return;
    }

    if(userJSON.provider) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'this email belongs to the '+userJSON.provider+'. do not need eamil confirm.'
        }
        return;
    }

    let resend_user = null;
    try {
        //return JSON
        resend_user = await User.resendEmailConfirm(userJSON.id);
    } catch (e) {
        log.error('[RESEND EMAILCONFIRM]', '[resendEmailConfirm]', userJSON.id, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion resendEmailConfirm resendEmailConfirm'
        }
        return;
    }

    ctx.body = {
        displayName: resend_user.name,
        _id: resend_user.id
    };

    //send confirm email
    const transporter = await sendmail.getTransporter();
    const mailOptions = await sendmail.getMailOptions('confirm', resend_user.confirm_reset_token, resend_user);
    transporter.sendMail(mailOptions, (err) => {
        if (err) log.error('[RESEND EMAILCONFIRM]', '[sendEmail]', JSON.stringify(resend_user), err);
    });

}

exports.forgotPassword = async (ctx) => {
    const { email } = ctx.params;

    if(!email){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'email is null'
        }
        return;
    }

    let user = null;
    try{
        user = await User.findByEmail(email);
    }catch(e) {
        log.error('[FORGOT PASSWORD]', '[findByEmail]', email, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion forgotPassword findByEmail'
        }
        return;
    }
    
    if(!user) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'the email does not exists.'
        }
        return;
    }

    /* can hava a password provider
    userJSON = user.toJSON();
    if(userJSON.provider) {
        // 유저가 존재하지 않거나
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'this email belongs to the '+userJSON.provider+'. do not need eamil confirm.'
        }
        return;
    }
    */

    let reset_user = null;
    try {
        //return JSON
        reset_user = await User.forgotPassword(user.get('id'));
    } catch (e) {
        log.error('[FORGOT PASSWORD]', '[forgotPassword]', user.get('id'), e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion forgotPassword forgotPassword'
        }
        return;
    }

    ctx.body = {
        displayName: reset_user.name,
        _id: reset_user.id
    };

    //send confirm email
    const transporter = await sendmail.getTransporter();
    const mailOptions = await sendmail.getMailOptions('reset_password', reset_user.password_reset_token, reset_user);
    transporter.sendMail(mailOptions, (err) => {
        if (err) log.error('[FORGOT PASSWORD]', '[sendEmail]', JSON.stringify(reset_user), err);
    });
}

exports.isValidResetPasswordToken = async (ctx) => {
    const { reset_token } = ctx.params;

    if(!reset_token){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'reset_token is null'
        }
        return;
    }

    let user = null;
    try{
        // returned model
        user = await User.findByResetToken(reset_token);
    }catch(e) {
        log.error('[ISVALID RESET PASSWORDTOKEN]', '[findByResetToken]', reset_token, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion forgotPassword forgotPassword'
        }
        return;
    }

    if(!user) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'token is invalid or has expired. try get token again.'
        }
        return;
    }

    userJSON = user.toJSON();
    /* test
    now = moment().format('YYYY-MM-DDTHH:mm:ss');
    console.log('1: ', userJSON.password_reset_expires);
    console.log('1-1: ', userJSON.password_reset_expires.toISOString().substring(0, userJSON.password_reset_expires.toISOString().indexOf('.')));
    console.log('2: ', moment().format('YYYY-MM-DDTHH:mm:ss'));
    console.log('3: ', String(now));
    console.log('4: ', moment(userJSON.password_reset_expires).format('YYYY-MM-DDTHH:mm:ss'));
    console.log('5: ', moment(new Date(String(userJSON.password_reset_expires))));
    if( userJSON.password_reset_expires.toISOString().substring(0, userJSON.password_reset_expires.toISOString().indexOf('.')) < moment().format('YYYY-MM-DDTHH:mm:ss')) {
        console.log('userJSON.password_reset_expires < now');
    }else{
        console.log('userJSON.password_reset_expires > now');
    }
    */

    //if( moment(userJSON.password_reset_expires).format('YYYY-MM-DDTHH:mm:ss.mm') < moment().format('YYYY-MM-DDTHH:mm:ss.mm')) {
    if( userJSON.password_reset_expires.toISOString().substring(0, userJSON.password_reset_expires.toISOString().indexOf('.')) < moment().format('YYYY-MM-DDTHH:mm:ss')) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'Password reset token is invalid or has expired.'
        }
        return;
    }
    
    ctx.body = {
        displayName: userJSON.name,
        _id: userJSON.id
    };

    return;
}

exports.resetPassword = async (ctx) => {
    const { body } = ctx.request;

    const schema = Joi.object({
        reset_token: Joi.string().required(),
        password: Joi.string().min(6).max(30),
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

    const { reset_token, password } = body;

    if(!password){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'password is null'
        }
        return;
    }

    let user = null;
    try{
        // returned model
        user = await User.findByResetToken(reset_token);
    }catch(e) {
        log.error('[RESET PASSWORD]', '[findByResetToken]', reset_token, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion resetPassword forgotPassword'
        }
        return;
    }

    if(!user) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'token is invalid or has expired. try get token again.'
        }
        return;
    }

    userJSON = user.toJSON();
    //if( moment(userJSON.password_reset_expires).format('YYYY-MM-DD hh:mm:ss') < moment().format('YYYY-MM-DD hh:mm:ss')) {
    if( userJSON.password_reset_expires.toISOString().substring(0, userJSON.password_reset_expires.toISOString().indexOf('.')) < moment().format('YYYY-MM-DDTHH:mm:ss')) {
        //email confirmation token is invalid or has expired. Resend confirmation email again through your profile.
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'Password reset token is invalid or has expired.'
        }
        return;
    }

    try {
        await User.resetPassword(userJSON.id, password);
    } catch (e) {
        log.error('[RESET PASSWORD]', '[restPassword]', userJSON.id, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion resetPassword restPassword'
        }
        return;
    }

    ctx.body = {
        displayName: userJSON.name,
        _id: userJSON.id
    };

    return;
}

exports.getProfile = async (ctx) => {
    const { id } = ctx.params;

    if(!id){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'id is null'
        }
        return;
    }

    let user = null;
    try {
        // returned model
        user = await User.findById(id);
    } catch (e) {
        log.error('[GET PROFILE]', '[findById]', id, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion getProfile findById'
        }
        return;
    }

    if(!user) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'User does not exists.'
        }
        return;
    }

    let maskedEmail = user.get('email');
    let mask = '';
    for(i=0;i<maskedEmail.indexOf('@')-1;i++){
        mask += '*';
    }

    maskedEmail = maskedEmail.substring(0,1)+mask+maskedEmail.substring(maskedEmail.indexOf('@'),maskedEmail.lenght);
    //console.log(maskedEmail);

    ctx.body = {
        _id: user.get('id'),
        displayName: user.get('name'),
        email: maskedEmail
    }

}


exports.updateProfile = async (ctx) => {
    //currently, just update password
    const { body } = ctx.request;

    const schema = Joi.object({
        id: Joi.string().required(),
        password: Joi.string().min(6).max(30),
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

    const { id, password } = body;

    if(!password){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'password is null'
        }
        return;
    }

    if(!id){
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'id is null'
        }
        return;
    }

    let user = null;
    try{
        // returned model
        user = await User.findById(id);
    }catch(e) {
        log.error('[UPDATE PROFILE]', '[findById]', id, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion updateProfile findById'
        }
        return;
    }

    if(!user) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'id is invalid.'
        }
        return;
    }

    userJSON = user.toJSON();

    /* comments. allow to set password social account
    if(userJSON.provider) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'this email belongs to the '+userJSON.provider+'. do not need change password.'
        }
        return;
    }
    */

    try {
        await User.updateProfile(userJSON.id, password);
    } catch (e) {
        log.error('[UPDATE PROFILE]', '[updateProfile]', userJSON.id, e.message);
        ctx.status = 500;   // bad request
        ctx.body = {
            message: 'Excaprion updateProfile updateProfile'
        }
        return;
    }

    ctx.body = {
        displayName: userJSON.name,
        _id: userJSON.id
    };

    return;
}