const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");

/**
 * Generate jwt token
 * - Payload must contain fields
 * --- "sub": `userId` parameter
 * --- "type": `type` parameter
 *
 * - Token expiration must be set to the value of `expires` parameter
 *
 * @param {ObjectId} userId - Mongo user id
 * @param {Number} expires - Token expiration time in seconds since unix epoch
 * @param {string} type - Access token type eg: Access, Refresh
 * @param {string} [secret] - Secret key to sign the token, defaults to config.jwt.secret
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  
  const payload={
    sub:userId,
    type:type,
    exp:expires,
    iat:Date.now()/1000 //time in seconds when token is created
  }

  //creating the signature which will actaully represent the JWT token
  const jwtToken=jwt.sign(payload,secret);
  return jwtToken;

};

/**
 * Generate auth token
 * - Generate jwt token
 * - Token type should be "ACCESS"
 * - Return token and expiry date in required format
 *
 * @param {User} user
 * @returns {Promise<Object>}
 *
 * Example response:
 * "access": {
 *          "token": "eyJhbGciOiJIUzI1NiIs...",
 *          "expires": "2021-01-30T13:51:19.036Z"
 * }
 */
const generateAuthTokens = async (user) => {
  
  /*
  1. Date.now(): returns the number of milliseconds since January 1, 1970. Divie it by 1000 to convert into seconds.
  2. config.jwt.accessExpirationMinutes*60: 24 minutes * 60 = converted into seconds again.
  3. expiration: (time right now + 4 hours) --> so that we can make our token expire after 4 hours
  */

  const expiration=Math.floor(Date.now()/1000)+config.jwt.accessExpirationMinutes*60; //in seconds
  const GeneratedToken= generateToken(user._id,expiration,tokenTypes.ACCESS);

  //here {} is used to return an object with its key-value pairs
  return{
    access:{
      token:GeneratedToken,
      expires:new Date(expiration*1000) //Date constructor takes input in miliseconds.
    }
  }
};

module.exports = {
  generateToken,
  generateAuthTokens,
};
