const Joi = require('joi');
const bookshelf = require('db');
const User = require('db/models/User');
const UserToken = require('db/models/UserToken');
const { getProfile } = require('lib/social');
const moment = require('moment');

const log = require('lib/log');
const sendmail = require('lib/mail');

const jwt = require('jsonwebtoken');
const cookie = require('lib/cookie');

// admin register
exports.adminRegister = async (ctx) => {
    const { body } = ctx.request;

    const schema = Joi.object({
        displayName: Joi.string().regex(/^[a-zA-Z0-9]{3,15}$/).required(), // 3 ~ 15 letters
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30),
        // TODO: ip
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

    const { displayName, email, password } = body;
    
    /* 아이디 / 이메일 중복처리 구현 */
    let existing = null;
    try {
        //returned model
        existing = await User.findByEmailOrDisplayName({displayName, email});
    } catch (e) {
        log.error('[ADMIN REGISTER]','[findByEmailOrDisplayName]', displayName, email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception adminRegister findByEmailOrDisplayName'
        }
        return;
    }

    if(existing) {
        // 중복되는 아이디/이메일이 있을 경우
        ctx.status = 409; // Conflict
        // 어떤 값이 중복되었는지 알려줍니다

        const existingJSON = existing.toJSON();
        ctx.body = {
            //key: existing.email === ctx.request.body.email ? 'email' : 'displayname',
            message: existing.email === ctx.request.body.email ? 'email is already exists.' : 'displayname is already exists.'
        };
        return;
    }

    // 계정 생성
    let user = null;
    try {
        // returned JSON
        user = await User.adminRegister({
            displayName, email, password
          });
        log.info('[ADMIN REGISTER]','[NEW USER]', JSON.stringify(user));

    } catch (e) {
        log.error('[ADMIN REGISTER]','[adminRegister]', displayName, email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception adminRegister adminRegister.'
        }
        return;
    }

    // if your web use this as backend, you should return jwtoken.
    const accessToken = await user.generateToken;
    
    // set cookie
    cookie.setCookie(ctx, accessToken, user);

    // TODO: insert user_login_history

    ctx.body = {
        displayName,
        _id: user.id
    };
    
}

// using web
exports.adminLogin = async (ctx) => {
    const { body } = ctx.request;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30),
        // TODO: ip
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

    const { email, password } = body;

    let user = null;
    try {
        // 이메일로 계정 찾기
        // returned model
        user = await User.findByEmail(email);
    } catch (e) {
        log.error('[ADMIN LOGIN]','[findByEmail]', email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception adminLogin findByEmail.'
        }
        return;
    }

    if(!user) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'user does not exists.'
        }
        return;
    }

    
    if(user.get('permission').search('admin') < 0) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'Yoe are not a staff.'
        }
        return;
    }

    let isMatch = await user.comparePassword(password);
    if(!isMatch) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'password does not match.'
        }
        return;
    }

    // if your web use this as backend, you should return jwtoken.
    const accessToken = await user.generateToken;

    // set cookie
    cookie.setCookie(ctx, accessToken, user.toJSON());

    // TODO: save user_login_history

    ctx.body = {
        _id: user.get('id'),
        displayName: user.get('name')
    };
}


exports.checkAdmin = async (ctx) => {
    const { user } = ctx.request;
  
    if(!user) {
        ctx.status = 400;
        ctx.body = {
                message: 'user is null'
            }
        return;
    }

    let balance = 0;
    let gravatar = '';

    try {
      const exists = await User.findById(user._id);

      if(!exists) {
        // invalid user, clear cookie
        cookie.removeCookie();

        ctx.status = 401;
        ctx.body = {
            message: 'invalid user'
        }
        return;
      }

      if(exists.get('permission').search('admin') < 0) {
          // invalid user, clear cookie
        cookie.removeCookie();

        ctx.status = 401;
        ctx.body = {
            message: 'invalid user.(not a staff)'
        }
        return;
      }

      await exists.wallet().first().then((wallet)=>{
        balance = wallet.get('balance');
      });

      gravatar = exists.get('picture');

    } catch (e) {
        log.error('[CHECK ADMIN]','[findById]', user._id, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception checkAdmin findById.'
        }
        return;
    }

    ctx.body = {
        user,
        balance,
        gravatar
    };
}