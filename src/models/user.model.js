const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require("bcryptjs");

// When 'trim: true' is set for a string field in Mongoose schema, 
// it ensures that any leading or trailing whitespace characters in the input data are removed before saving the data to the database.
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase:true,
      validate(value)
      {
        if(!validator.isEmail(value))
        {
          throw new Error("Invalid Email")
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        // regex is used to match if (1 digit + 1 alphabate) is there in entered password(value) or not
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default:config.default_wallet_money
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  // Creates createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */


/*
Notes:

1. baiscally this function is the part of schema and hence the model, you can access it by ModelNmae.isEmailTaken(email);

2. In Mongoose, static methods are methods that are associated with the model itself rather than instances of the model.
Static methods are defined on the schema using the statics keyword. They can be invoked directly on the model without needing to create an instance of the model.
In this case, isEmailTaken is a static method defined on the userSchema, allowing you to call it directly on the User model (User.isEmailTaken(email)).
*/
userSchema.statics.isEmailTaken = async function (email) {
   
  // here, "this" represents the model itself (from which this function is called) created from the schema
  const result=await this.findOne({email:email});
  return result;
};

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */

 userSchema.methods.isPasswordMatch = async function (password) {
  // compared the incoming and the save password in the DB, this saved password is hashed using salt and bcrypt
  return bcrypt.compare(password, this.password);
};



/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */

const User=mongoose.model("User",userSchema);

module.exports={User};
