const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

const getUserById=async(id)=>{
    // console.log("in the service: getUserById");
    const result= await User.findOne({"_id":id});
    return result;

}

/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail=async(email)=>{
    const result=await User.findOne({"email":email});
    return result;
}

/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */
const createUser=async(userBody)=>{
 
/*
1. Either isEmailTaken will resturn "result" meaning true, and if condition will run, or false(ie undefined)
2. The ApiError class defined in src/utils/ApiError.js lets you respond back to the client with an error response as shown below
    {
        "code": 400,  
        "message": "\"\"userId\"\" must be a valid mongo id",  
        "stack": "Optionally shown if there’s a error stack trace"  
    }
*/
if(await User.isEmailTaken(userBody.email)){
    throw new ApiError(httpStatus.OK, "Email already taken");
  }


  if(!userBody.name){
   throw new ApiError(httpStatus.BAD_REQUEST,"Email is not allowed to be empty")
  }
  if(!userBody.email){
   throw new ApiError(httpStatus.BAD_REQUEST,"Name field is required");
  }
  if(!userBody.password){
   throw new ApiError(httpStatus.BAD_REQUEST,"Password field is required");
  }


// hashing the password
  const salt=await bcrypt.genSalt();
  const hashedPassword=await bcrypt.hash(userBody.password, salt);
  let user= await User.create({...userBody, password:hashedPassword});


  return user;
}

// TODO: CRIO_TASK_MODULE_CART - Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
 const getUserAddressById = async (id) => {

  //{email: 1, address: 1}: This is the projection parameter. It specifies which fields should be returned in the result. 
  //Here, email: 1 means include the email field, and address: 1 means include the address field.
  const user= await User.findOne({"_id":id},{email:1,address:1});
  return user;
};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
 const setAddress = async (user, newAddress) => {
    user.address = newAddress;
    await user.save();
  
    return user.address;
  };
  
module.exports={getUserById,getUserByEmail, createUser, getUserAddressById, setAddress};

