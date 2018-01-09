const redis = require('redis');
const testredis = redis.createClient();

//pub redis for auto reload balance on menu
testredis.publish('payment', JSON.stringify({type: 'BALANCE', payload: {user_id: 885534354, balance: 9797 } }) );
