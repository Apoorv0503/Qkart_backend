const express = require("express");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const cartRoute = require("./cart.route");

const router = express.Router();
/*
1. router.use(path, middleware) is used to mount middleware functions at a specified path, 
    jbki router.get() is used to handle particular type of http request at a path
*/
router.use("/users",userRoute);
router.use("/auth",authRoute);

// TODO: CRIO_TASK_MODULE_AUTH - Reroute all API requests beginning with the `/v1/auth` route to Express router in auth.route.js 
router.use("/products", productRoute);
router.use("/cart", cartRoute);

module.exports = router;
