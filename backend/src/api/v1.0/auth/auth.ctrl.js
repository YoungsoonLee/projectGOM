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

exports.localRegister = async (ctx) => {
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
        log.error('[LOCAL REGISTER]','[findByEmailOrDisplayName]', displayName, email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception localregister findByEmailOrDisplayName'
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
        user = await User.localRegister({
            displayName, email, password
          });
        log.info('[LOCAL REGISTER]','[NEW USER]', JSON.stringify(user));

    } catch (e) {
        log.error('[LOCAL REGISTER]','[localRegister]', displayName, email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception localRegister localregister.'
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

    //send confirm email
    const transporter = await sendmail.getTransporter();
    const mailOptions = await sendmail.getMailOptions('confirm', user.confirm_reset_token, user);
    transporter.sendMail(mailOptions, (err) => {
        if (err) log.error('[LOCAL REGISTER]','[SEND EMAIL]', JSON.stringify(user), err);
    });
}

// using web
exports.localLogin = async (ctx) => {
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
        log.error('[LOCAL LOGIN]','[findByEmail]', email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception localLogin findByEmail.'
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

    // TODO: 게임의 로그인 방식 따라 변경 할 필요가 있다.
    if(user.get('provider')) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'email belongs to a '+user.get('provider')+'. use sign in with '+user.get('provider')+'.'
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

//using game servers
exports.gameLogin = async (ctx) => {
    const { body } = ctx.request;

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(30),
        // TODO: user's ip
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
        // returned model
        user = await User.findByEmail(email);
    } catch (e) {
        log.error('[GAME LOGIN]','[findByEmail]', email, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception gameLogin findByEmail.'
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

    // TODO: 게임쪽 소셜 계정 처리를 어떻게 할 것인가? 정리 필요.
    if(user.get('provider')) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'email belongs to a '+user.get('provider')+'. register password in my profile menu through our web site first.'
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

    // make token
    let token = null
    try{
        token = await user.generateToken;
    }catch(e){
        log.error('[GAME LOGIN]','[generateToken]' , e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception gameLogin generateToken.'
        }
        return;
    }

    // save token & get access_token (hashed)
    let access_token = null
    try{
        access_token = await user.getAccessToken(token);
    }catch(e){
        log.error('[GAME LOGIN]','[getAccessToken]' , token, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception gameLogin getAccessToken.'
        }
        return;
    }

    // TODO: set cookie for forum ???
    // TODO: save user_login_history
    
    const returnData = {
        'access_token': access_token.hashed,    // !!! give the hashed token. different web !!!
        'created_at': access_token.created_at,
        'displayName': user.toJSON().name,
        '_id': user.toJSON().id
    }

    // send hashed Token for commnunicate after login game client
    ctx.body = {
        ...returnData
    };
}

//  POST /auth/isValidToken/{access_token}
exports.isValidToken = async (ctx) => {
    const { access_token } = ctx.params;
    // get token with access_token param
    let userToken = null;
    try{
        //returned model
        userToken = await UserToken.findByAccessToken(access_token);

    }catch(e){
        log.error('[IS VALIDTOKEN]','[findByAccessToken]', access_token, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception isValidToken findByAccessToken.'
        }
        return;
    }
    
    // check userToken
    if(!userToken) {
        ctx.status = 400; // Forbidden
        ctx.body = {
            message: 'Token does not exist.' //bad request
        }
        return;
    }

    // verify jwt token
    let decoded = null;
    try{

        decoded = await userToken.decodeToken(userToken.toJSON().token);

    }catch(e){
        log.error('[IS VALIDTOKEN]','[decodeToken]', userToken.toJSON().token, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception isValidToken decodeToken.'
        }
        return;
    }

    // check expire date
    if(decoded.exp < (Date.now() / 1000) ) {
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: 'Token has expired'
        }
        return;
    }
    
    ctx.body = {
        ...decoded,
        message: 'Token is valid',
        code: 200
    };
}

exports.checkDisplayName = async (ctx) => {
    const { displayName } = ctx.params;
  
    if(!displayName) {
        ctx.status = 400;
        ctx.body = {
                message: 'displayName is null'
            }
        return;
    }
  
    try {
      const account = await User.findByDisplayName(displayName);
      ctx.body = {
        exists: !!account
      };
    } catch (e) {
        log.error('[CHECK DISPLAYNAME]','[findByDisplayName]', displayName, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception checkDisplayName findByDisplayName.'
        }
        return;
    }
  };


exports.check = async (ctx) => {
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

      await exists.wallet().first().then((wallet)=>{
        balance = wallet.get('balance');
      });

      gravatar = exists.get('picture');

    } catch (e) {
        log.error('[CHECK]','[findById]', user._id, e.message);

        //ctx.status = 400; // bad request
        ctx.status = 500; // Internal server error
        ctx.body = {
            message: 'Exception check findById.'
        }
        return;
    }

    ctx.body = {
        user,
        balance,
        gravatar
    };
}

//social register
exports.socialRegister = async (ctx) => {
    const { body } = ctx.request;
    const { provider } = ctx.params;
  
    // check schema
    const schema = Joi.object({
      displayName: Joi.string().regex(/^[a-zA-Z0-9]{3,15}$/).required(),
      accessToken: Joi.string().required()
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
  
    const { 
      displayName,
      accessToken
    } = body;
  
    // get social info
    let profile = null;
    try {
      profile = await getProfile(provider, accessToken);
    } catch (e) {
        log.error('[SOCIAL REGISTER]','[getProfile]', provider, accessToken, e.message);

        ctx.status = 403; 
        ctx.body = {
            message: 'Error get profile from provider'
        }
        return;
    }

    if(!profile) {
        ctx.status = 403;
        ctx.body = {
            message: 'No profile found'
        }

        return;
    }
    
    const { 
      email, 
      id: provider_id
    } = profile;
  
    // check email (+1 time)
    if(profile.email) {
      // will check only email exists
      // service allows social accounts without email .. for now
      try {
        //returned model
        const exists = await User.findByEmail(profile.email);
        if(exists) {
            ctx.status = 409;
            ctx.body = {
                message: 'this provider email belongs to another account.'
            }

            return;
        }
      } catch (e) {
            log.error('[SOCIAL REGISTER]','[findByEmail]', profile.email, e.message);

            ctx.status = 500; 
            ctx.body = {
                message: 'Exception socialRegister findByEmail.'
            }
            return;
      }
    } 
  
    // check displayName existancy
    try {
      const exists = await User.findByDisplayName(displayName);
      if(exists) {
            ctx.status = 409;
            ctx.body = {
                message: 'already exists displayname.'
            }

            return;
      }
    } catch (e) {
        log.error('[SOCIAL REGISTER]','[findByDisplayName]', displayName, e.message);

        ctx.status = 500; 
        ctx.body = {
            message: 'Exception socialRegister findByDisplayName.'
        }
        return;
    }
  
    // create user account
    let user = null;
    try {
        //returned JSON
        //console.log('1', provider_id)

        user = await User.socialRegister({
            displayName,
            email,
            provider,
            provider_id,
            accessToken
        });

        log.info('[SOCIAL REGISTER]','[NEW USER]', JSON.stringify(user));

    } catch (e) {
        log.error('[SOCIAL REGISTER]','[newUser]', displayName, email, provider, provider_id, accessToken, e.message);

        ctx.status = 500; 
        ctx.body = {
            message: 'Exception socialRegister new user.'
        }
        return;
    }
    
    try {
        // if your web use this as backend, you should return jwtoken.
        const access_token = await user.generateToken;

        // set cookie
        cookie.setCookie(ctx, access_token, user );

        // TODO: insert user_login_history

        //get balance
        let gravatar = user.picture;

        ctx.body = {
            displayName,
            _id: user.id,
            balance: 0,
            gravatar
        };

        return;

    } catch (e) {
        log.error('[SOCIAL REGISTER]','[generateToken]', e.message);

        ctx.status = 500; 
        ctx.body = {
            message: 'Exception socialRegister generateToken.'
        }
        return;
    }
  };

//socail login
exports.socialLogin = async (ctx) => {
    const schema = Joi.object().keys({
      accessToken: Joi.string().required()
    });
  
    const result = Joi.validate(ctx.request.body, schema);
  
    // 스키마 검증 실패
    if(result.error) {
        ctx.status = 400;
        ctx.body = {
            message: result.error.details[0].message
        }
        return;
    }
  
    const { provider } = ctx.params;
    const { accessToken } = ctx.request.body;
  
    // get social info
    let profile = null;
    try {
      profile = await getProfile(provider, accessToken);
    } catch (e) {
        log.error('[SOCIAL LOGIN]','[getProfile]',provider, accessToken, e.message);

        ctx.status = 403; 
        ctx.body = {
            message: 'Error get profile from provider. try again after a few minutes.'
        }
        return;
    }
  
    if(!profile) {
        ctx.status = 403;
        ctx.body = {
            message: 'No profile found. You should register a '+provider+' first.'
        }

        return;
    }
  
    const { id, email } = profile;
  
    // check acount existancy  
    let user = null;
    try {
        //returned model
        user = await User.findSocialId(provider, id);
    } catch (e) {
        log.error('[SOCIAL LOGIN]','[findSocialId]', provider, id, e.message);
        ctx.status = 500;
        ctx.body = {
            message: 'Exception socialLogin findSocialId.'
        }
        return;
    }
    
    //already registered provider
    if(user) {
      // set user status
      try {
            // if your web use this as backend, you should return jwtoken.
            const access_token = await user.generateToken;

            // set cookie
            cookie.setCookie(ctx, access_token, user.toJSON());
            
            //TODO: insert user_login_history

        } catch (e) {

            log.error('[SOCIAL LOGIN]','[generateToken]', e.message);
            ctx.status = 500;
            ctx.body = {
                message: 'Exception socialLogin generateToken.'
            }
            return;
        }

        ctx.body = {
            displayName: user.get('name'),
            _id: user.get('id')
        };

        return;
    }
  
    //already have another provide or local account. to merge
    if(!user && profile.email) {

        let duplicated = null;
        try {
            //returned model
            duplicated = await User.findByEmail(email);

        } catch (e) {

            log.error('[SOCIAL LOGIN]','[findByEmail]', email, e.message);
            ctx.status = 500;
            ctx.body = {
                message: 'Exception socialLogin findByEmail.'
            }
            return;
        }
        
        // if there is a duplicated email, merges the user account
        if(duplicated) {
            try {

                await User.socialUpdate(duplicated.get('id'), provider, profile.id, accessToken);

            } catch (e) {

                log.error('[SOCIAL LOGIN]','[socialUpdate]',duplicated.get('id'), provider, profile.id, accessToken, e.message);
                ctx.status = 500;
                ctx.body = {
                    message: 'Exception socialLogin socialUpdate.'
                }
                return;
            }


            try {
                // if your web use this as backend, you should return jwtoken.
                const access_token = await duplicated.generateToken;

                // set cookie
                cookie.setCookie(ctx, access_token, duplicated.toJSON());

                // TODO: insert user_login_history
                
            } catch (e) {
                log.error('[SOCIAL LOGIN]','[generateToken]', e.message);
                ctx.status = 500;
                ctx.body = {
                    message: 'Exception socialLogin generateToken.'
                }
                return;
            }

            ctx.body = {
                displayName: duplicated.get('name'),
                _id: duplicated.get('id')
            };

            return;
        }
    }
    
    // i think not use this
    if(!user) {
        ctx.status = 400;   // bad request
        ctx.body = {
            message: 'You should use SIGN UP first.'
        }
        return;
    }
    
  };

exports.logout = (ctx) => {
    cookie.removeCookie(ctx);

    ctx.status = 204;
};
