const moment = require('moment');
const jwt = require('jsonwebtoken');
const log = require('lib/log');

module.exports.setCookie = async function(ctx, access_token, user) {
    let cookieExpireTime = null;

    if(String(user.permission).search('admin') >= 0 ) {
        //console.log('isAdmin: true', user.name, user.permission);
        log.info('[ADMIN COOKIE]', user.name, user.permission);
        cookieExpireTime = 1000 * 60 * 60 * 3 // 3 hours
    }else{
        log.info('[USER COOKIE]', user.name, user.permission);
        cookieExpireTime = 1000 * 60 * 60 * 24 * 7   // 7days
    }

    // configure accessToken to httpOnly cookie
    ctx.cookies.set('access_token', access_token, {
        httpOnly: true,
        maxAge: cookieExpireTime
    });

    //set cookie for forum
    var ftoken = jwt.sign({
        id: user.id,
        username: user.name,
        picture: user.picture
    }, process.env.JWT_SECRET);
    
    if(ctx.cookies.get('connect.sid-f')) {
        ctx.cookies.set('connect.sid-f', null, {
            maxAge: 0,
            httpOnly: true
        });
    }
    if(ctx.cookies.get('express.sid')) {
        ctx.cookies.set('express.sid', null, {
            maxAge: 0,
            httpOnly: true
        });
    }

    const cookieExpirationDate = new Date(moment().format('YYYY-MM-DD HH:mm:ss.mm'));
    const cookieExpirationDays = 7; //7days
    cookieExpirationDate.setDate(cookieExpirationDate.getDate() + cookieExpirationDays);

    ctx.cookies.set('connect.sid-f', ftoken, {
        httpOnly: true,
        //expires: cookieExpirationDate
        maxAge: cookieExpireTime
    }); 

};

module.exports.removeCookie = async function(ctx) {
    ctx.cookies.set('access_token', null, {
        maxAge: 0,
        httpOnly: true
    });

    //clear forum cookie 
    ctx.cookies.set('connect.sid-f', null, {
        maxAge: 0,
        httpOnly: true
    });

    //clear forum cookie express.sid
    ctx.cookies.set('express.sid', null, {
        maxAge: 0,
        httpOnly: true
    });
}