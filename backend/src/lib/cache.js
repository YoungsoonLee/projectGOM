const {  REDIS_URL: REDIS_URL} = process.env;
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);


module.exports = (function() {
  const client = redis.createClient(REDIS_URL);
  
  return {
    get client() {
      return client;
    },
    set(key, value ) {
        /*
        if(exp) {
            return client.setAsync(key, JSON.stringify(value), 'EX', exp);
        }
        */
        return client.setAsync(key, JSON.stringify(value));
    },
    get(key) {
      return client.getAsync(key).then(data => {
        if(!data) return null;
        return JSON.parse(data);
      });
    }
  };
})();