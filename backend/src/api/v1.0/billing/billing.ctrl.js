const Joi = require('joi');
const sha1 = require('node-sha1');
const { 
    XSOLLA_SECRET_KEY: XSOLLA_SECRET_KEY,
    REDIS_URL: REDIS_URL
  } = process.env;

const redis = require('redis').createClient(REDIS_URL);

const cache = require('lib/cache');

const axios = require('axios');
const moment = require('moment');

const log = require('lib/log');

const bookshelf = require('db');
const User = require('db/models/User');
const UserWallet = require('db/models/UserWallet');
const PaymentTry = require('db/models/PaymentTry');
const PaymentTransaction = require('db/models/PyamentTransaction');
const ServiceGateway = require('db/models/ServiceGateway');
const UserDeductHistory = require('db/models/UserDeductHistory');
const PaymentItems = require('db/models/PaymentItems');

const XsollaAPI = require('lib/xsolla');
  
exports.callbackXsolla = async (ctx) => {
    // get header Authorization, args.Authorization.replace("Signature ", "")
    const { authorization } = ctx.request.header;
    const { body } = ctx.request;

    signature = authorization.replace("Signature ", "");
    notification_type = body.notification_type;

    //check signature
    if(!signature) {
        ctx.status = 400;
        ctx.body = {
            'error': {
                'code': 'INVALID_SIGNATURE_SIGNATURE_NULL',
                'message': 'INVALID_SIGNATURE_SIGNATURE_NULL'
            }
        }
        return;
    }

    // check signature
    let hashedData = sha1(JSON.stringify(body) + XSOLLA_SECRET_KEY );
    
    // logging
    log.info('[CALLBACK XSOLLA]', notification_type, signature, hashedData, JSON.parse(JSON.stringify(body)));
    //console.log('notification_type: ', notification_type);
    //console.log('get signature: ', signature);
    //console.log('hashed: ', hashedData);
    //console.log('receiveData: ', JSON.parse(JSON.stringify(body)));

    if(hashedData !== signature){
        ctx.status = 401;
        ctx.body = {
            'error': {
                'code': 'INVALID_SIGNATURE',
                'message': 'INVALID_SIGNATURE'
            }
        }
        return;
    }

    // check user
    let existing = null;
    try{
        //returned model
        existing = await User.findById(body.user.id); 
    }catch(e){
        log.error('[CALLBACK XSOLLA]', '[findById]', body.user.id, e.message);
        ctx.status = 500;
        ctx.body = {
            'error': {
                'code': 'INVALID_USER',
                'message': 'INVALID_USER'
            }
        }
        return;
    }

    if(!existing) {
        ctx.status = 401;
        ctx.body = {
            'error': {
                'code': 'INVALID_USER',
                'message': 'INVALID_USER'
            }
        }
        return;
    }
    
    // check notification_type == 'payment':
    if(notification_type === 'payment') {
        let paymentData = JSON.parse(JSON.stringify(body));

        //check payment try
        let paymentTry = null;
        try{
            //returned model
            paymentTry = await PaymentTry.checkPaymentTry(
                    paymentData.transaction.external_id,    //pid
                    paymentData.user.id,                    //user_id
                    paymentData.purchase.total.amount);     //amount
            
        }catch(e){
            log.error('[CALLBACK XSOLLA]', '[checkPaymentTry]', paymentData.transaction.external_id, paymentData.user.id, paymentData.purchase.total.amount, e.message);

            ctx.status = 500;   //bad request
            ctx.body = {
                'error': {
                    'code': 'INVALID_PAYTRY_DATA',
                    'message': 'INVALID_PAYTRY_DATA'
                }
            }
            return;
        }
        
        if(!paymentTry) {
            ctx.status = 400;   //bad request
            ctx.body = {
                'error': {
                    'code': 'INVALID_PAYTRY_DATA',
                    'message': 'INVALID_PAYTRY_DATA'
                }
            }
            return;
        }else{

            const paymentTryJSON = paymentTry.toJSON();

            //logging before charging db
            // TODO: logging
            log.info('[CALLBACK XSOLLA]','[CHARGE]', 
                        paymentData.transaction.external_id, 
                        paymentData.transaction.id, 
                        paymentData.user.id, 
                        paymentTryJSON.item_id,
                        paymentTryJSON.item_name,
                        paymentTryJSON.pg_id,
                        paymentTryJSON.currency,
                        paymentTryJSON.price,
                        paymentTryJSON.amount
                    );
            /*
            console.log('external_id: ', paymentData.transaction.external_id);
            console.log('transaction_id: ', paymentData.transaction.id);
            console.log('user_id: ', paymentData.user.id);
            console.log('paymentTry.item_id: ', paymentTryJSON.item_id);
            console.log('paymentTry.item_name: ', paymentTryJSON.item_name);
            console.log('paymentTry.pg_id: ', paymentTryJSON.pg_id);
            console.log('paymentTry.currency: ', paymentTryJSON.currency);
            console.log('paymentTry.price: ', paymentTryJSON.price);
            console.log('paymentTry.amount: ', paymentTryJSON.amount);
            */

            const chargeData = {
                pid: paymentData.transaction.external_id,   //pid
                transaction_id: paymentData.transaction.id,
                user_id: paymentData.user.id,
                item_id: paymentTryJSON.item_id,
                item_name: paymentTryJSON.item_name,
                pg_id: paymentTryJSON.pg_id,
                currency: paymentTryJSON.currency,
                price: paymentTryJSON.price,
                amount: paymentTryJSON.amount
            }

            // charging
            // insert payment_transaction and user_wallet and send redis pub
            let userWallet = null;
            try {
                // returned model
                userWallet = await PaymentTransaction.makeCharge(chargeData);
                log.info('[CALLBACK XSOLLA]', '[makeCharge]', JSON.stringify(chargeData), JSON.stringify(cuserWallet));
            } catch (e) {
                // logging
                log.error('[CALLBACK XSOLLA]', '[makeCharge]', JSON.stringify(chargeData), e.message);

                ctx.status = 500;   //bad request
                ctx.body = {
                    'error': {
                        'code': 'ERROR_MAKE_PAYTRANSACTION',
                        'message': 'ERROR_MAKE_PAYTRANSACTION'
                    }
                }
                return;
            }

            if(!userWallet) {
                ctx.status = 400;   //bad request
                ctx.body = {
                    'error': {
                        'code': 'ERROR_MAKE_PAYTRANSACTION',
                        'message': 'ERROR_MAKE_PAYTRANSACTION'
                    }
                }
                return;
            }

            //set redis for read balance
            redis.set(userWallet.user_id, userWallet.balance);
            /* for redis test
            redis.get(userWallet.user_id, function(err, reply) {
                console.log('test redis: ',reply);
            });
            */

            //pub redis for auto reload balance on menu
            //redis.publish('payment', JSON.stringify({user_id: userWallet.user_id, balance: userWallet.balance}) );
            redis.publish('payment', JSON.stringify({type: 'BALANCE', payload: {user_id: userWallet.user_id, balance: userWallet.balance } }) );
        }
    }

    // success valid user and purchase
    ctx.body = {
        200: 'charge okay'
    };
}


//  POST /billing/getBalanceByDisplayName/{displayName}
exports.getBalanceByDisplayName = async (ctx) => {
    const { displayName } = ctx.params;
    // get token with access_token param
    let userWallet = null;
    try{
        //returned model
        user = await User.findByDisplayName(displayName);
        userWallet = await UserWallet.getBalanceById(user.get('id'));

    }catch(e){
        log.error('[GETBALANCE BY DISPLAYNAME]', '[findByDisplayName]', displayName, e.message);
        ctx.status = 500; // bad request
        ctx.body = {
            message: 'Exception getBalanceByDisplayName. No user found.'
        }
        return;
    }

    if(!userWallet) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'User Wallet does not exists.'
        }
        return;
    }

    userWalletJSON = userWallet.toJSON();
    ctx.body = {
        user_id: userWalletJSON.user_id,
        balance: userWalletJSON.balance
    };
} 


//  POST /billing/getBalanceById/{id}
exports.getBalanceById = async (ctx) => {
    const { id } = ctx.params;
    // get token with access_token param
    let userWallet = null;
    try{
        //returned model
        userWallet = await UserWallet.getBalanceById(id);

    }catch(e){
        log.error('[GETBALANCE BY ID]', '[getBalanceById]', id, e.message);
        ctx.status = 500; // bad request
        ctx.body = {
            message: 'Exception getBalanceByDisplayName. No user found.'
        }
        return;
    }

    if(!userWallet) {
        ctx.status = 400; // bad request
        ctx.body = {
            message: 'User Wallet does not exists.'
        }
        return;
    }

    userWalletJSON = userWallet.toJSON();
    ctx.body = {
        user_id: userWalletJSON.user_id,
        balance: userWalletJSON.balance
    };
} 

// POST
// TODO: !!! more consider. performance up for all checking...(aysnc.paralle ??? )
// TODO: !!! reduce makeDeduct time
exports.deductCoin = async (ctx) => {
    /***
     * Inputs
     *  user_id : 
     *  service_id :  
     *  access_token : 
     *  external_id : 각 게임 서비스 고유의 트랜잭션 ID
     *  item_name : 각 게임 서비스의 아이템 구매시의 해당 아이템 이름.(조회, 통계, 추적용)
     *  item_id : 각 게임 서비스의 아이템 구매시의 해당 아이템 ID.(조회, 통계, 추적용)
     *  item_amount : 차감 해야 될 cyber coin 양.
     * 
     *  TODO: user's ip
     * 
     * Outputs
     *  external_id : 각 게임 서비스 고유의 트랜잭션 ID
     *  deduct_id : cyber coin 차감 후 발생 한 고유한 트랜잭션 ID
     *  message : SUCCESS
     */
    const { body } = ctx.request;

    // logging all input params 
    log.info('[DEDUCT COIN]','[INPUTS]', JSON.stringify(body));

    // check input params
    const schema = Joi.object({
        user_id: Joi.string().required(), 
        service_id: Joi.string().required(),
        access_token: Joi.string().required(),
        external_id: Joi.string().required(),
        item_name: Joi.string().required(),
        item_id: Joi.string().required(),
        item_amount: Joi.string().required()
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

    // check valiad access_token
    //     - call /api/v1.0/auth/isValidToken/{token}
    let decoededToken = null;
    try{
        decoededToken = await axios.post('http://localhost:4000/api/v1.0/auth/isValidToken/'+ body.access_token);
    }catch(e) {
        // logging to error
        log.error('[DEDUCT COIN]','[decoededToken]', body.user_id, body.service_id, e.message );
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception deductCoin isValidServiceId.'
        }
        return;
    }

    if(!decoededToken || decoededToken.data.code !== 200 ){
        msg = 'Token has expired'
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }
        log.error('[DEDUCT COIN]','[decoededToken]', body.user_id, body.service_id, msg );
        return;
    }

    //logging
    log.info('[DEDUCT COIN]','[decodedToken]', body.user_id, body.service_id, JSON.stringify(decoededToken.data) );
    
    // check service_id
    let isValidServiceId = null;
    try{
        isValidServiceId = await ServiceGateway.isValidServiceId(body.service_id);
    }catch(e){
        // logging
        log.error('[DEDUCT COIN]','[isValidServiceId]', body.user_id, body.service_id, e.message );
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception deductCoin isValidServiceId.'
        }
        return;
    }

    if(!isValidServiceId) {
        msg = 'service_id is not valid.';
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[isValidServiceId]', body.user_id, body.service_id, msg );

        return;
    }

    // check external_id each service_id
    let isExistsexternalId = null;
    try{
        isExistsexternalId = await UserDeductHistory.isExistsExternalId(body.service_id, body.external_id);
    }catch(e){
        // logging
        log.error('[DEDUCT COIN]','[isExistsexternalId]', body.user_id, body.service_id, body.external_id, e.message );
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception deductCoin isExistsexternalId.'
        }
        return;
    }

    if(isExistsexternalId) {
        msg = 'already exists external_id.';
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[isExistsexternalId]', body.user_id, body.service_id, body.external_id, msg );

        return;
    }

    //load user_id from token
    const user_id = decoededToken.data.user._id;
    if (user_id !== body.user_id) {
        msg = 'user_id is wrong'
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[decoededToken]', user_id, body.user_id, JSON.stringify(decoededToken.data), msg );

        return;
    }

    if(!user_id) {
        msg = 'user_id is null'
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[decoededToken]', JSON.stringify(decoededToken.data), msg );

        return;
    }

    // check balance in wallet (low balance)
    let userWallet = null;
    try{
        //return model
        userWallet = await UserWallet.getBalanceById(user_id);
    }catch(e){
        // logging
        log.error('[DEDUCT COIN]','[userWallet]', user_id, e.message );
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception deductCoin getBalanceById.'
        }
        return;
    }

    if(!userWallet) {
        msg = 'user is null';
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[userWallet]', user_id, msg );

        return;
    }

    const userWalletJSON = userWallet.toJSON();
    if( parseInt(userWalletJSON.balance) < parseInt(body.item_amount)) {
        ctx.status = 401; // Forbidden
        msg = 'Low balance. You need more '+ String(parseInt(body.item_amount)-parseInt(userWalletJSON.balance)) +' balance'
        ctx.body = {
            message: msg
        }

        //logging
        log.info('[DEDUCT COIN]','[Low Balance]', user_id, userWalletJSON.balance, body.item_amount, msg);

        return;
    }

    // check amount_after_used in paytransaction
    let deduct_paytransaction = null;
    try{
        // returned model
        deduct_paytransaction = await PaymentTransaction.getDeductPaytransaction(user_id);
    }catch(e){
        //logging
        log.info('[DEDUCT COIN]','[deduct_paytransaction]', e.message);
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception deductCoin getDeductPaytransaction.'
        }
        return;
    }

    if(!deduct_paytransaction) {
        msg = 'paytransaction is null';
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[deduct_paytransaction]', user_id, msg );

        return;
    }

    
    let deduct_paytransactionJSON = deduct_paytransaction.toJSON();
    // one more check
    if(parseInt(deduct_paytransactionJSON.amount_after_used)===0) {
        msg = 'paytransaction amount_after_used is 0';
        ctx.status = 401; // Forbidden
        ctx.body = {
            message: msg
        }

        log.error('[DEDUCT COIN]','[deduct_paytransaction.amount_after_used]', JSON.stringify(deduct_paytransactionJSON), msg );

        return;
    }

    // logic
    let deduct_free = 0;
    let deduct_paid = 0;
    let makeDeduct = null;

    try {
        if ( parseInt(deduct_paytransactionJSON.amount_after_used) > parseInt(body.item_amount) ) {
            // 해당 paytransaction의 amount_after_used의 amount가 구매 item의 amount 보다 크면, 바로 duduct
            // logging data
            let log_data = {
                'user_id': user_id,
                'item_amount': body.item_amount,
                'service_id': body.service_id,
                'item_id': body.item_id,
                'item_name': body.item_name,
                'pid': deduct_paytransactionJSON.pid,
                'paytransaction_amount': deduct_paytransactionJSON.amount,
                'update_before_amount_after_used': deduct_paytransactionJSON.amount_after_used,
            }
            // deduct logging
            log.info('[DEDUCT COIN]','[makeDeduct]', JSON.stringify(log_data) );

            if( parseInt(deduct_paytransactionJSON.price) == 0 ) {
                //set deduct_free
                deduct_free = deduct_free + parseInt(body.item_amount)
            }else{
                //set deduct_paid
                deduct_paid = deduct_paid + parseInt(body.item_amount)
            }

            //calculate
            let deducted_amount_after_used = Math.abs(parseInt(deduct_paytransactionJSON.amount_after_used) - parseInt(body.item_amount));
            let deducted_balance = parseInt(userWalletJSON.balance) - parseInt(body.item_amount);

            // TODO: 
            // i think need sync for looping
            // so, using async ?? um....
            makeDeduct = null;
            try{
                // update amount_after_used in paytransaction
                // update user_wallet
                makeDeduct = await PaymentTransaction.makeDeduct(user_id, deduct_paytransactionJSON.pid, deducted_amount_after_used, deducted_balance);
                //console.log('result: ', makeDeduct);

                //update userWalletJSON
                userWalletJSON.balance = makeDeduct.balance;
                userWalletJSON.updated_at = makeDeduct.updated_at;

            }catch(e){
                log.error('[DEDUCT COIN]','[makeDeduct]', user_id, deduct_paytransactionJSON.pid, deducted_amount_after_used, deducted_balance, e.message );
                ctx.status = 500; // internal server error
                ctx.body = {
                    message: 'Exception deductCoin makeDeduct.'
                }
                return;
            }

        }else{
            // 해당 paytransaction의 amount_after_used의 amount가 구매 item의 amount 보다 작으면...
            // next paytransaction을 가져오면서 looping 처리 한다.
            let next_amount = parseInt(body.item_amount);
            let step = 1;

            //loop
            while ( next_amount !== 0 ){
                // logging data
                let log_data = {
                    'user_id': user_id,
                    'item_amount': body.item_amount,
                    'service_id': body.service_id,
                    'item_id': body.item_id,
                    'item_name': body.item_name,
                    'pid': deduct_paytransactionJSON.pid,
                    'next_amount': next_amount,
                    'paytransaction_amount': deduct_paytransactionJSON.amount,
                    'update_before_amount_after_used': deduct_paytransactionJSON.amount_after_used,
                }

                if ( next_amount < parseInt(deduct_paytransactionJSON.amount_after_used) ){
                    
                    log_data['update_after_amount_after_used'] = Math.abs(parseInt(deduct_paytransactionJSON.amount_after_used) - parseInt(next_amount) );
                    
                    // deduct logging
                    log.info('[DEDUCT COIN]','[makeDeduct]', JSON.stringify(log_data) );

                    let deduct_history = parseInt(next_amount);
                    if ( deduct_paytransactionJSON.price === 0 ) {
                        deduct_free = deduct_free + deduct_history;
                    }else{
                        deduct_paid = deduct_paid + deduct_history;
                    }

                    //calculate
                    let deducted_amount_after_used = Math.abs(parseInt(deduct_paytransactionJSON.amount_after_used) - parseInt(next_amount));
                    let deducted_balance = parseInt(userWalletJSON.balance) - parseInt(next_amount);

                    // TODO: 
                    // i think need sync for looping
                    // so, using async ?? um....
                    //let makeDeduct = null;
                    try{
                        // update amount_after_used in paytransaction
                        // update user_wallet
                        makeDeduct = await PaymentTransaction.makeDeduct(user_id, deduct_paytransactionJSON.pid, deducted_amount_after_used, deducted_balance);
                        //console.log('result: ', makeDeduct);
                        
                        //update userWalletJSON
                        userWalletJSON.balance = makeDeduct.balance;
                        userWalletJSON.updated_at = makeDeduct.updated_at;
                        
                    }catch(e){
                        log.error('[DEDUCT COIN]','[makeDeduct]',user_id, deduct_paytransactionJSON.pid, deducted_amount_after_used, deducted_balance, e.message );
                        ctx.status = 500; // internal server error
                        ctx.body = {
                            message: 'Exception deductCoin makeDeduct.'
                        }
                        return;
                    }

                    next_amount = 0;  //break loop

                }else{
                    
                    log_data['update_after_amount_after_used'] = 0;

                    // logging
                    log.info('[DEDUCT COIN]','[makeDeduct]', JSON.stringify(log_data) );

                    let deduct_history = parseInt(deduct_paytransactionJSON.amount_after_used);
                    if ( deduct_paytransactionJSON.price === 0 ) {
                        deduct_free = deduct_free + deduct_history;
                    }else{
                        deduct_paid = deduct_paid + deduct_history;
                    }

                    // !!! important, save next_amount before update amount_after_used
                    next_amount = Math.abs(parseInt(next_amount) - parseInt(deduct_paytransactionJSON.amount_after_used));

                    //calculate
                    let deducted_amount_after_used = 0;
                    let deducted_balance = parseInt(userWalletJSON.balance) - parseInt(deduct_history);

                    // TODO: 
                    // i think need sync for looping
                    // so, using async ?? um....
                    makeDeduct = null;
                    try{
                        // update amount_after_used in paytransaction
                        // update user_wallet
                        makeDeduct = await PaymentTransaction.makeDeduct(user_id, deduct_paytransactionJSON.pid, deducted_amount_after_used, deducted_balance);
                        //console.log('result: ', makeDeduct);

                        //update userWalletJSON
                        userWalletJSON.balance = makeDeduct.balance;
                        userWalletJSON.updated_at = makeDeduct.updated_at;

                    }catch(e){
                        log.error('[DEDUCT COIN]','[makeDeduct]',user_id, deduct_paytransactionJSON.pid, deducted_amount_after_used, deducted_balance, e.message );
                        ctx.status = 500; // internal server error
                        ctx.body = {
                            message: 'Exception deductCoin makeDeduct.'
                        }
                        return;
                    }

                    // get next paytransaction for loop
                    try{
                        // returned model
                        deduct_paytransaction = await PaymentTransaction.getDeductPaytransaction(user_id);
                    }catch(e){
                        log.error('[DEDUCT COIN]','[makeDeduct.next_deduct_paytransaction]', user_id, e.message );
                        ctx.status = 500; // internal server error
                        ctx.body = {
                            message: 'Exception deductCoin next_getDeductPaytransaction.'
                        }
                        return;
                    }

                    deduct_paytransactionJSON = deduct_paytransaction.toJSON();
                    // one more check
                    if(parseInt(deduct_paytransactionJSON.amount_after_used)===0) {
                        msg = 'next paytransaction amount_after_used is 0';
                        ctx.status = 401; // Forbidden
                        ctx.body = {
                            message: msg
                        }

                        log.error('[DEDUCT COIN]','[next deduct_paytransaction.amount_after_used]', JSON.stringify(deduct_paytransactionJSON), msg );

                        return;
                    }

                    step = step + 1;
                }
            }

        }
    }catch(e){
        log.error('[DEDUCT COIN]','[mainLogic]', e.message);
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception deductCoin mainLogic'
        }
    }
    
    // insert deduct history
    let deductHistory = {
        'deduct_id': '',
        'user_id': user_id,
        'service_id': body.service_id,
        'external_id': body.external_id,
        'item_id': body.item_id,
        'item_name': body.item_name,
        'item_amount': body.item_amount,
        'deduct_by_free': deduct_free,
        'deduct_by_paid': deduct_paid,
        'used_at': moment().format('YYYY-MM-DD HH:mm:ss.mm')
    };

    // logging deduct histoty
    // TODO: think transaction !!!
    let deduct_tranx= await UserDeductHistory.makeDeductHistory(deductHistory);
    log.info('[DEDUCT COIN]','[deductHistory]', JSON.stringify(deduct_tranx) );
    
    // updated wallet info
    log.info('[DEDUCT COIN]','[updated wallet]', JSON.stringify(makeDeduct) );

    //set redis for read balance
    redis.set(makeDeduct.user_id, makeDeduct.balance);
    /*
    redis.get(userWallet.user_id, function(err, reply) {
        console.log('test redis: ',reply);
    });
    */

    //pub redis for auto reload balance on menu
    //redis.publish('payment', JSON.stringify({user_id: userWallet.user_id, balance: userWallet.balance}) );
    redis.publish('payment', JSON.stringify({type: 'BALANCE', payload: {user_id: makeDeduct.user_id, balance: makeDeduct.balance } }) );

    // success valid user and purchase
    ctx.body = {
        ...deduct_tranx
    };
}

exports.getChargeItems = async (ctx) => {
    //redis.del('chargeItems');
    /* for redis test
    redis.get('chargeItems', function(err, reply) {
        console.log('test redis: ',reply);
    });
    */

    // do not try...catch for reading db when error
    let chargeItems = null;
    //try{
        chargeItems = await cache.get('chargeItems');
    //}catch(e){
        //log.error('[GET CHARGE ITEMS FROM CACHE ERROR]', e)
    //}

    log.info('[GET CHARGEITEMS FROM REDIS]', chargeItems);

    if (chargeItems) {
        ctx.body = {
            chargeItems
        };
        return;
    }else{
        let data = null;
        try{
            data = await PaymentItems.getChargeItems();
        }catch(e){
            //console.log(e);
            log.error('[GET CHARGEITEMS]', e.message)
        }

        log.info('[GET CHARGEITEMS FROM DB]', data);

        if(data) {
            await cache.set('chargeItems', data);

            ctx.body = {
                chargeItems: [...data.toJSON()]
            };
            return;
        }else{
            log.error('[GET CHARGE ITEMS]', '[nullData]');
            ctx.status = 500;
            ctx.body = {
                message: 'Something wrong to get charge items form db'
            };
            return;
        }
    }

    /*
    let data = null;
    try{
        data = await PaymentItems.getChargeItems();
    }catch(e){
        console.log(e);
    }
    
    //console.log(data.toJSON());
    log.info('[GET CHARGE ITEMS]', data.toJSON());

    //pub redis
    redis.set('chargeItems', JSON.stringify(data.toJSON()) );
    */

    // test
    /*
    redis.get('chargeItems', function(err, reply) {
        console.log('test redis: ',reply);
    });
    */ 
}


exports.getPaymentToken = async (ctx) => {
    const { body } = ctx.request;

    //console.log(body.user_id, body.item_id);
    const schema = Joi.object({
        user_id: Joi.string().required(), 
        item_id: Joi.number().required()
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

    const { user_id, item_id } = body;

    let user = null;
    try {
        // returned model
        user = await User.findById(user_id);
    } catch (e) {
        log.error('[GET PAYMENTTOKEN]','[findById]', user_id, e.message);
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception getPaymentToken findById'
        }
        return;
    }

    if(!user) {
        // 유저가 존재하지 않거나
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'user does not exists.'
        }
        return;
    }

    let paymentItem = null;
    try{
        //returned model
        paymentItem = await PaymentItems.findByItemId(item_id);
    }catch(e) {
        log.error('[GET PAYMENTTOKEN]','[findByItemId]', item_id, e.message);
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception getPaymentToken findByItemId'
        }
        return;
    }

    if(!paymentItem) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'payment item does not exists'
        }
        return;
    }

    //console.log(paymentItem);

    //savePaymentTry
    let paymentTry = null;
    try{
        paymentTry = await PaymentTry.savePaymentTry(user_id, paymentItem.toJSON());
    }catch(e){
        log.error('[GET PAYMENTTOKEN]','[savePaymentTry]', user_id, paymentItem.toJSON(), e.message);
        ctx.status = 500; // internal server error
        ctx.body = {
            message: 'Exception getPaymentToken savePaymentTry'
        }
        return;
    }

    //check sendbox
    var mode = '';
    if (process.env.XSOLLA_SANDBOX) {
        mode = 'sandbox';
    }

    //TODO: try...catch ???

    var url = process.env.XSOLLA_ENDPOINT + process.env.XSOLLA_MERCHANT_ID + '/token';

    var sdata = {
        user: {
            id: {
                value: user.get('id'),
                hidden: true
            },
            email: {
                value: user.get('email'),
                allow_modify: false,
                hidden: true
            },
            country: {
                value: 'US'
            },
            name: {
                value: user.get('name'),
                hidden: false
            }
        },
        settings: {
            project_id: 24380,
            external_id: paymentTry.pid,
            mode: mode,
            //payment_widget: 'giftcard',
            language: 'en',
            currency: 'USD',
            ui: {
                size: 'medium'
                //theme: 'dark'
            }
        },
        purchase: {
            checkout: {
                currency: 'USD',
                amount: paymentTry.price
            },
            description: {
                value: paymentTry.item_name
            }
        },
        custom_parameters: {
            pid: paymentTry.pid
        }
    };

    var headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Basic ' + process.env.XSOLLA_BASE64
    };

    let getPaymentToken = null
    try{
        getPaymentToken = await XsollaAPI.getPaymentTokenFromXsolla(url, headers, sdata);
    }catch(e){
        log.error('[GET PAYMENTTOKEN]','[getPaymentTokenFromXsolla]', url, headers, sdata, e.message);

        ctx.status = 500; // Forbidden
        ctx.body = {
            message: 'Exception getPaymentToken getPaymentTokenFromXsolla.'
        }
        return;
    }
    
    if(!getPaymentToken) {

        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'No payment token found from xsolla'
        }
        return;
    }

    ctx.body = {
        token: getPaymentToken.token,
        mode
    }

}

exports.getChargeHistory = async (ctx) => {
    const { id } = ctx.params;

    let user = null;
    try {
        // returned model
        user = await User.findById(id);
    } catch (e) {
        log.error('[GET CHARGEHISTORY]','[findById]', id, e.message);
        ctx.status = 500; // bad request
        ctx.body = {
            message: 'Exception getChargeHistory findById.'
        }
        return;
    }

    if(!user) {
        // 유저가 존재하지 않거나
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'user does not exists.'
        }
        return;
    }

    let chargeHistory = null;
    try{
        // returned JSON
        chargeHistory = await PaymentTransaction.getChargeHistory(id);
    }catch(e){
        log.error('[GET CHARGEHISTORY]','[getChargeHistory]', id, e.message);
        ctx.status = 500; // bad request
        ctx.body = {
            message: 'Exception getChargeHistory PaymentTransaction.getChargeHistory.'
        }
        return;
    }

    if(!chargeHistory) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'No charge data.'
        }
        return;
    }

    ctx.body = chargeHistory
    return;

}


exports.getDeductHistory = async (ctx) => {
    const { id } = ctx.params;

    let user = null;
    try {
        // returned model
        user = await User.findById(id);
    } catch (e) {
        log.error('[GET DEDUCTHISTORY]','[findById]', id, e.message);
        ctx.status = 500; // bad request
        ctx.body = {
            message: 'Exception getDeductHistory findById.'
        }
        return;
    }

    if(!user) {
        // 유저가 존재하지 않거나
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'user does not exists.'
        }
        return;
    }

    let deductHistory = null;
    try{
        // returned JSON
        deductHistory = await UserDeductHistory.getDeductHistory(id);
    }catch(e){
        log.error('[GET DEDUCTHISTORY]','[getDeductHistory]', id, e.message);
        ctx.status = 500; // bad request
        ctx.body = {
            message: 'Exception getDeductHistory UserDeductHistory.getDeductHistory.'
        }
        return;
    }

    if(!deductHistory) {
        ctx.status = 403; // Forbidden
        ctx.body = {
            message: 'No charge data.'
        }
        return;
    }

    ctx.body = deductHistory
    return;

}