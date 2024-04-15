const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

/**
 * Custom callback function implementation to verify callback from passport
 * - If authentication failed, reject the promise and send back an ApiError object with
 * --- Response status code - "401 Unauthorized"
 * --- Message - "Please authenticate"
 *
 * - If authentication succeeded,
 * --- set the `req.user` property as the user object corresponding to the authenticated token
 * --- resolve the promise
 */
//basically this verify callback function is returning another function.
const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  
  // agar "err" ya "info" ya "no user" recieved to throw error, remember "done" function used during jwt stretagy formmation
  if(err || info || !user){
    return reject(new ApiError(httpStatus.UNAUTHORIZED,"Please authenticate"));
  }

  //when the token send is belonging to a different user and id provided in params is of some other user.
  // log user and req.params to check: perform below in user controller
  // if(user._id!==req.params.userId){
  //   return reject(new ApiError(httpStatus.FORBIDDEN));
  // }

  req.user=user;
  resolve();
};

/**
 * Notes:
 * 1. Auth middleware to authenticate using Passport "jwt" strategy with sessions disabled and a custom callback function
 * 2. The verification of JWT tokens might involve asynchronous operations such as database lookups or cryptographic operations. 
 *    Using passport.authenticate within a promise allows handling these asynchronous tasks in a structured manner.
 */
const auth = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false }, //Options object indicating that session support should be disabled (since JWTs are stateless): they do not rely on server-side session management.
    //  below custom function performs verification of the JWT token and resolves or rejects a Promise based on the result.

      verifyCallback(req, resolve, reject) //
    )(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;

/*
Notes:
1.  passport.authenticate(ABC,EFG,verifyCallback(req, resolve, reject))(req, res, next);

    -In simpler terms, this line is executing the verifyCallback function with the provided arguments (req, resolve, reject), 
      and then immediately invoking the resulting function with the arguments (req, res, next). It's a way of chaining function calls together.
    -passport.authenticate() returns another middleware function.

2. When Passport.js attempts to authenticate a request using the JWT strategy, it internally invokes the callback function provided to passport.authenticate.
    Passport.js passes three arguments to this callback function: err, user, and info.

  -err: Represents any error that occurred during the authentication process. If there was no error, err will be null.
  -user: Represents the authenticated user object. If authentication was successful, user will contain the user details retrieved from the JWT token or database.
  -info: Contains additional information about the authentication process.

3. why we are doing method chaining (without dot operator too):
   passport.authenticate(...., verifyCallback(req, resolve, reject))(req, res, next);

   -Because we need to use a controller function inside the passport.authenticate that will handle the control eg: pass the control to 
   next middleware or return response directly from here (maybe in case if authentication fails). So to mimic that we have done it.

   -According to the passport.js documentation:

   app.post('/profile', passport.authenticate('jwt', { session: false }),
   //our controller to control the flow
    function(req, res) {
        res.send(req.user.profile);
    }
    );

*/



