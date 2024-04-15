// (Strategy: JwtStrategy)--> In this case, Strategy is being renamed to JwtStrategy. 
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { tokenTypes } = require("./tokens");
const { User } = require("../models");
// const { extra } = require("http-status");

// TODO: CRIO_TASK_MODULE_AUTH - Set mechanism to retrieve Jwt token from user request
/**
 * These config options are required
 * Option 1: jwt secret environment variable set in ".env"
 * Option 2: mechanism to fetch jwt token from request Authentication header with the "bearer" auth scheme
 */
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

// TODO: CRIO_TASK_MODULE_AUTH - Implement verify callback for passport strategy to find the user whose token is passed
/**
 * Logic to find the user matching the token passed
 * - If payload type isn't `tokenTypes.ACCESS` return an Error() with message, "Invalid token type" in the callback function
 * - Find user object matching the decoded jwt token
 * - If there's a valid user, return the user in the callback function
 * - If user not found, return `false` in the user field in the callback function
 * - If the function errs, return the error in the callback function
 *
 * @param payload - the payload the token was generated with
 * @param done - callback function
 * structure of payload recieved:
 *
    payload:  {
      sub: '65d27a93f9f08b2c08d91de7',
      type: 'access',
      exp: 1708307155,
      iat: 1708292755.477
    }
 */
const jwtVerify = async (payload, done) => {

   // check out the "payload" sent to user from token.service.js, that same will be recived back from the user
   try
   {

    console.log(payload);
  // If payload type isn't `tokenTypes.ACCESS` return an Error
  if(payload.type!== tokenTypes.ACCESS){
    return done(new Error("Invalid Token Type"),false);
  }

  if(payload.time>payload.exp){
    return done(new Error("Token expired, please re-login"),false);
  }

  const user= await User.findById(payload.sub);
  if(!user){
    return done(null,false);
  }
  done(null,user);
}
  catch(error){
    return done(error,false);
  }

};

// TODO: CRIO_TASK_MODULE_AUTH - Uncomment below lines of code once the "jwtVerify" and "jwtOptions" are implemented
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};

/*
Notes:
1. The passport-jwt module provides a strategy for Passport.js, which is a popular authentication middleware for Node.js applications. 
    Passport.js allows you to authenticate requests using various strategies, and passport-jwt specifically enables JWT (JSON Web Token) authentication.

2. JwtStrategy is a class provided by passport-jwt for verifying JWTs (JSON Web Tokens) issued by your application. When a protected route is accessed, 
    Passport.js can use JwtStrategy to verify the JWT provided by the client.

3. ExtractJwt is an object provided by passport-jwt for extracting JWTs from incoming requests.

4. The function passed as a parameter to JwtStrategy is a verification callback function. This function is called by Passport when it needs to verify the JWT extracted from an incoming request.
  -The verification callback function takes three arguments: payload, done, and optionally info.
  -The payload argument contains the decoded JWT payload (claims), which typically includes information about the authenticated user.
  -The done function is a callback function that is called to indicate the outcome of the verification process. 
    It done function must be invoked with either an error (if authentication fails) or a user object (if authentication succeeds).

5. Done function
  -done(null, user): Call this when authentication is successful. Passes the authenticated user object to the next middleware.
  -done(null, false): Call this when authentication fails (e.g., user not found). Indicates authentication failure to Passport.
  -done(error,false): Call this when an error occurs during authentication. Passes the error to Passport to handle it appropriately.

*/
