const axios = require('axios');

module.exports = (function () {

    function getPaymentTokenFromXsolla(url, headers, sdata) {
        return axios({method: 'POST', url: url, headers: headers, data: sdata}).then(
          response => response.data
        );
      };
      
    return {
        getPaymentTokenFromXsolla
      };
})();