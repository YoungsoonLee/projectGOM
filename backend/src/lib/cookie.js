const moment = require('moment');
const jwt = require('jsonwebtoken');

module.exports.setCookie = async function(ctx, access_token, user) {
    // configure accessToken to httpOnly cookie
    ctx.cookies.set('access_token', access_token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7   // 7days
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
        expires: cookieExpirationDate
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