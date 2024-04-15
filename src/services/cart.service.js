const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart= await Cart.findOne({"email":user.email});

  //can not send a response from here, but can throw error only.
  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
  }
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart= await Cart.findOne({"email":user.email});

   //when no cart found for user, create a new cart
  if(!cart){
    try{
      // console.log("creating an empty cart");
        cart=await Cart.create({
        "email": user.email,
        "cartItems": [],
        "paymentOption": config.default_payment_option,
    });
    //save krna is important
    await cart.save();
    }
    catch(e){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"User cart creation failed");
    }
  }
 
        //if productId is already added
    if(cart.cartItems.some((item)=> item.product._id==productId))
    {
      throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart");
    }
  


 

//if productId is not there in the products collections
const product=await Product.findById({"_id":productId});
if(!product){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
}

//finally add the product, utilize the cart found for the user in the beginning, we use write like this also: 
// cart.cartItems.push({product,quantity});

cart.cartItems.push({
  "product":product,
"quantity":quantity
});

await cart.save();
return cart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const cart= await Cart.findOne({"email":user.email});

  //when no cart found for user
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product");
  }

  //search for productId in products collections of db, if not found throw error
  const product_found=await Product.findById({"_id":productId});
  if(!product_found){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }

//find the index of product to update, also check if index found or not
const Index_of_Product=cart.cartItems.findIndex((item)=>{ 
    console.log("item.product._id: ",item.product._id);
  console.log("productId: ",productId);
  return item.product._id==productId
});
  //this will automatically return the index of  the item for which the given condition is true

  // return(item.product._id===productId);


console.log(Index_of_Product)

if(Index_of_Product===-1){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
}


// finally update, refer the user structure defined in cart controller, findOneAndUpdate could also be used
cart.cartItems[Index_of_Product].quantity=quantity;
await cart.save();

return cart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const cart= await Cart.findOne({"email":user.email});

   //when no cart found for user
   if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product");
  }

  //find the index of product to delete, also check if index found or not
const Index_of_Product=cart.cartItems.findIndex((item)=>{
  // no need to stricktly compare two items (use "==" not "===")
  return(item.product._id==productId);
})

if(Index_of_Product===-1){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
}

//finally delete
cart.cartItems.splice(Index_of_Product,1);

await cart.save();
// return cart;

};


module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
};




/*
Notes:
A.) Splice() method:

const fruits = ["Banana", "Orange", "Apple", "Mango"];
fruits.splice(2, 0, "Lemon", "Kiwi");

The first parameter (2) defines the position where new elements should be added (spliced in).
The second parameter (0) defines how many elements should be removed.
The rest of the parameters ("Lemon" , "Kiwi") define the new elements to be added.
The splice() method returns an array with the deleted items.

B.) Some() method:

const ages = [3, 10, 18, 20];

ages.some((age) => {
  return age > 18;
});

The some() method executes the callback function once for each array element.
The some() method returns true (and stops) if the function returns true for one of the array elements.
The some() method returns false if the function returns false for all of the array elements.
The some() method does not execute the function for empty array elements.

*/