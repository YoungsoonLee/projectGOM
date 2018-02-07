const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');
const bookshelf = require('db');
const uid = require('rand-token').uid;

const UserWallet = require('db/models/UserWallet');
const UserToken = require('db/models/UserToken');
const token = require('lib/token');

var User = bookshelf.Model.extend({
    tableName: 'users',
    //hasTimestamps: true,
    //hasTimestamps: ['created_at', 'updated_at'],
    wallet: function() {
        return this.hasOne(UserWallet);
    },

    initialize: function() {
        this.on('saving', this.hashPassword, this);
    },

    hashPassword: function(model, attrs, options) {
        var password = options.patch ? attrs.password : model.get('password');
        if (!password) {
            return;
        }
        return new Promise(function(resolve, reject) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(password, salt, null, function(err, hash) {
                    if (options.patch) {
                        attrs.password = hash;
                    }
                    model.set('password', hash);
                    resolve();
                });
            });
        });
    },

    comparePassword: function(password) {
        var model = this;
        return new Promise(function(resolve, reject) {
            bcrypt.compare(password, model.get('password'), function(err, isMatch) {
                if (err) reject(err);
                resolve(isMatch);
            });
        });

        /*
        bcrypt.compare(password, model.get('password'), function(err, isMatch) {
            done(err, isMatch);
        });
        */
    },

    getAccessToken: function(jwtToken, ip_address) {
        return new Promise(
            (resolve, reject) => {
                new UserToken().save(
                        {
                            user_id: this.get('id'), 
                            token: jwtToken,
                            hashed: token.getAccessToken(jwtToken),
                            ip_address: ip_address,
                            created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm'),
                            expired_at: moment().add(7, 'days').format('YYYY-MM-DDTHH:mm:ss.mm')
                        }
                    ).then((access_token)=>{
                        resolve(access_token.toJSON())
                    }).catch((err)=>{
                        reject(err)
                    });
            }
          );
    },

    //hidden: ['password', 'password_reset_expires'],

    virtuals: {
        gravatar: function() {
            if (!this.get('email')) {
                return 'https://gravatar.com/avatar/?s=200&d=retro';
            }
            var md5 = crypto
                .createHash('md5')
                .update(this.get('email'))
                .digest('hex');
            return 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';
        },

        generateToken: function() {
            const _id = this.get('id');
            const displayName = this.get('name');

            return token.generateToken({
                user: {
                  _id,
                  displayName
                }
              }, 'user');
        }
    }

},{
    //stat methods
    findById: function(id) {
        //return model
        return  this.where({ id: id }).first();

        /*
        return this.forge().query({ where:{ id: id} }).fetch().then((user)=>{
            return user.toJSON();
        }).catch((err)=>{return null;});
        */
    },

    findByEmailOrDisplayName: function ({displayName, email}) {
        return this.where({name: displayName}).orWhere({email: email}).first();
        /*
        return this.forge().query({ where:{ email: email} , orWhere:{name:displayName}}).fetch().then((user)=>{
            return user.toJSON();
        }).catch((err)=>{return null;});
        */
    },

    findByDisplayName: function (displayName) {
        return this.where({name: displayName}).first();
    },

    findByEmail: function(email) {
        return  this.where({ email: email }).first();
        /*
        return this.forge().query({ where:{ email: email} }).fetch().then((user)=>{
            return user;
        }).catch((err)=>{return null;});
        */
    },

    findSocialId: function(provider, provider_id) {
        return  this.where({ provider: provider, provider_id: provider_id }).first();
    },

    localRegister: function({displayName, email, password}){
        return new Promise(function(resolve, reject) {
            bookshelf.transaction(function(trx) {
                var picture = new User({email: email});
                // save is insert
                // User({}) is update
                new User().save(
                    {
                        name: displayName,
                        email: email,
                        password: password,
                        confirm_reset_token: uid(32),
                        confirm_reset_expires: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss.mm'),
                        picture: picture.gravatar,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }
                ).then(function(user) {
                    new UserWallet().save({
                        user_id: user.get('id'),
                        balance: 0,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }).then(function(user_wallet) {
                        resolve(user.toJSON());
                    }).catch(function(err) {
                        // TODO: logging
                        trx.rollback();
                        reject(null);
                    })
                }).catch(function(err) {
                    // TODO: logging
                    console.log('err: ', err)
                    trx.rollback();
                    reject(null);
                });
            });
        });
    },

    socialRegister: function({displayName, email, provider, provider_id, accessToken}){
        
        return new Promise(function(resolve, reject) {
            bookshelf.transaction(function(trx) {
                var picture = new User({email: email});
                // save is insert
                // User({}) is update
                new User().save(
                    {
                        name: displayName,
                        email: email,
                        confirmed: true,
                        //confirm_reset_token: uid(32),
                        //confirm_reset_expires: moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss.mm'),
                        picture: picture.gravatar,
                        provider: provider,
                        provider_id: provider_id,
                        provider_access_token: accessToken,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }
                ).then(function(user) {
                    new UserWallet().save({
                        user_id: user.get('id'),
                        balance: 0,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }).then(function(user_wallet) {
                        resolve(user.toJSON());
                    }).catch(function(err) {
                        // TODO: logging
                        trx.rollback();
                        reject(null);
                    })
                }).catch(function(err) {
                    // TODO: logging
                    console.log('err: ', err)
                    trx.rollback();
                    reject(null);
                });
            });
        });
    },

    socialUpdate: function(id, provider, provider_id, provider_access_token) {
        return new Promise(function(resolve, reject) {
                new User({ id: id })
                    .save({
                        provider: provider,
                        provider_id: provider_id,
                        provider_access_token: provider_access_token
                    })
                    .then((user)=>{
                        resolve(user.toJSON());
                    })
                    .catch((err)=>{
                        console.log('[socialUpdate] update social error: ', err);
                        reject(null);
                    });
        });
    },

    findByConfirmToken: function (confirm_token) {
        return this.where({confirm_reset_token: confirm_token}).first();
    },

    findByResetToken: function (reset_token) {
        return this.where({password_reset_token: reset_token}).first();
    },

    emailConfirm: function(id) {
        return new Promise(function(resolve, reject) {
            new User({id: id}).fetch().then((user)=>{
                user.set('confirmed', true);
                user.set('confirm_reset_token', null);
                user.set('confirm_reset_expires', null);
                user.set('updated_at', moment().format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.save(user.changed, {patch: true}).then(function() {
                    resolve(user.toJSON());
                }).catch(function(err) {
                    console.log('[emailConfirm] save update email confirm error: ', err);
                    reject(null);
                });
            }).catch((err)=>{
                console.log('[emailConfirm] fetch update email confirm error: ', err);
                reject(null);
            });
        });
    },
    // not use
    /*
    isValidRestPassword: function(id) {
        return new Promise(function(resolve, reject) {
            new User({id: id}).fetch().then((user)=>{
                user.set('password_reset_token', null);
                user.set('password_reset_expires', null);
                user.set('updated_at', moment().format('YYYY-MM-DD hh:mm:ss'));
                user.save(user.changed, {patch: true}).then(function() {
                    resolve(user.toJSON());
                }).catch(function(err) {
                    console.log('[password_reset_expires] save update password reset token confirm error: ', err);
                    reject(null);
                });
            }).catch((err)=>{
                console.log('[password_reset_expires] fetch update password reset token confirm error: ', err);
                reject(null);
            });
        });
    },
    */

    resetPassword: function(id, password) {
        return new Promise(function(resolve, reject) {
            new User({id: id}).fetch().then((user)=>{
                user.set('password', password);
                user.set('password_reset_token', null);
                user.set('password_reset_expires', null);
                user.set('updated_at', moment().format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.save(user.changed, {patch: true}).then(function() {
                    resolve(user.toJSON());
                }).catch(function(err) {
                    console.log('[reset password] save update reset password error: ', err);
                    reject(null);
                });
            }).catch((err)=>{
                console.log('[reset password] fetch reset password error: ', err);
                reject(null);
            });
        });
    },
    updateProfile: function(id, password) {
        return new Promise(function(resolve, reject) {
            new User({id: id}).fetch().then((user)=>{
                user.set('password', password);
                user.set('updated_at', moment().format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.save(user.changed, {patch: true}).then(function() {
                    resolve(user.toJSON());
                }).catch(function(err) {
                    console.log('[update Profile] save update reset password error: ', err);
                    reject(null);
                });
            }).catch((err)=>{
                console.log('[update Profile] fetch reset password error: ', err);
                reject(null);
            });
        });
    },
    resendEmailConfirm: function(id) {
        return new Promise(function(resolve, reject) {
            new User({id: id}).fetch().then((user)=>{
                user.set('confirmed', false);
                user.set('confirm_reset_token', uid(32));
                user.set('confirm_reset_expires', moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.set('updated_at', moment().format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.save(user.changed, {patch: true}).then(function() {
                    resolve(user.toJSON());
                }).catch(function(err) {
                    console.log('[emailConfirm] save resend email confirm error: ', err);
                    reject(null);
                });
            }).catch((err)=>{
                console.log('[emailConfirm] fetch resend email confirm error: ', err);
                reject(null);
            });

        });
    },

    forgotPassword: function(id) {
        return new Promise(function(resolve, reject) {
            new User({id: id}).fetch().then((user)=>{
                user.set('password_reset_token', uid(32));
                user.set('password_reset_expires', moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.set('updated_at', moment().format('YYYY-MM-DDTHH:mm:ss.mm'));
                user.save(user.changed, {patch: true}).then(function() {
                    resolve(user.toJSON());
                }).catch(function(err) {
                    console.log('[forgotPassword] save password reset token error: ', err);
                    reject(null);
                });
            }).catch((err)=>{
                console.log('[forgotPassword] fetch forgotPassword error: ', err);
                reject(null);
            });

        });
    },

    adminRegister: function({displayName, email, password}){
        return new Promise(function(resolve, reject) {
            bookshelf.transaction(function(trx) {
                var picture = new User({email: email});
                // save is insert
                // User({}) is update
                new User().save(
                    {
                        name: displayName,
                        email: email,
                        password: password,
                        confirmed: true,
                        permission: 'admin:default',
                        //confirm_reset_token: uid(32),
                        //confirm_reset_expires: moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss.mm'),
                        picture: picture.gravatar,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }
                ).then(function(user) {
                    new UserWallet().save({
                        user_id: user.get('id'),
                        balance: 0,
                        created_at: moment().format('YYYY-MM-DDTHH:mm:ss.mm')
                    }).then(function(user_wallet) {
                        resolve(user);
                    }).catch(function(err) {
                        // TODO: logging
                        trx.rollback();
                        reject(null);
                    })
                }).catch(function(err) {
                    // TODO: logging
                    console.log('err: ', err)
                    trx.rollback();
                    reject(null);
                });
            });
        });
    },

});

module.exports = User;
