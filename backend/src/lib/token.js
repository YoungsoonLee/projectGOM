const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { 
  JWT_SECRET: secret,  
  DOMAIN: domain,
  HASH_SECRET: hashSecret
} = process.env;

function generateToken(payload, subject) {
  return new Promise(
    (resolve, reject) => {
      jwt.sign(payload, secret, {
        issuer: domain,
        expiresIn: '7d',
        subject
      }, (error, token) => {
        if(error) reject(error);
        resolve(token);
      });
    }
  );
}

function decodeToken(token) {
  return new Promise(
    (resolve, reject) => {
      jwt.verify(token, secret, (error, decoded) => {
        if(error) reject(error);
        resolve(decoded);
      });
    }
  );
}

function getAccessToken(token) {
  return crypto.createHmac('sha384', hashSecret).update(token).digest('hex');
}


exports.generateToken = generateToken;
exports.decodeToken = decodeToken;
exports.getAccessToken = getAccessToken;