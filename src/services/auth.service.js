const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");

/**
 * Login with username and password
 * - Utilize userService method to fetch user object corresponding to the email provided
 * - Use the User schema's "isPasswordMatch" method to check if input password matches the one user registered with (i.e, hash stored in MongoDB)
 * - If user doesn't exist or incorrect password,
 * throw an ApiError with "401 Unauthorized" status code and message, "Incorrect email or password"
 * - Else, return the user object
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user= await userService.getUserByEmail(email);
  // since isPasswordMatch is a static schema function hence it can be called for the instance of the schema (ie. for the model created using schema)
  if(!user || !await user.isPasswordMatch(password)){
    throw new ApiError(httpStatus.UNAUTHORIZED,"Incorrect email or password");

  } 
  else{
    return user;
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
};
