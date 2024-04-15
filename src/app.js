const express = require("express");

// Middleware for compressing HTTP responses, see notes below
const compression = require("compression");
//Middleware for enabling Cross-Origin Resource Sharing (CORS).
const cors = require("cors");
const httpStatus = require("http-status");
const routes = require("./routes/v1");
const { errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const { jwtStrategy } = require("./config/passport");
const helmet = require("helmet");
const passport = require("passport");

const app = express();

// set security HTTP headers - https://helmetjs.github.io/
app.use(helmet());

// parse json request body
app.use(express.json());

//it used to parse incoming request bodies encoded in URL-encoded format, see notes below
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// TODO: CRIO_TASK_MODULE_AUTH - Initialize passport and add "jwt" authentication strategy
app.use(passport.initialize());
passport.use("jwt",jwtStrategy);  //passport.use(strategy_name,stretagy_used);

// Reroute all API request starting with "/v1" route
app.use("/v1", routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    // console.log("koi or route hai");
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// handle error
app.use(errorHandler);

module.exports = app;


/*
Notes:

A.) why do we need compress the http responses:
    1.Reduced Bandwidth Usage: Compressing responses reduces the amount of data transferred between the server and the client.
    2.Faster Page Load Times: Smaller response sizes lead to faster page load times. 

B.) Why we are using: app.use(express.urlencoded({ extended: true }));
    The express.urlencoded() middleware in Express.js is used to parse incoming request bodies encoded in URL-encoded format. URL-encoded data is typically 
    sent from HTML forms using the application/x-www-form-urlencoded content type.

    Here's how it works:

    1. Middleware Integration: When you use app.use(express.urlencoded({ extended: true })), you're telling Express to use the express.urlencoded() middleware for every incoming request.
    2. Parsing URL-encoded Data: This middleware parses incoming request bodies containing URL-encoded data and makes it available in req.body object.
    3. Extended Option: The extended option determines how the URL-encoded data is parsed. When extended is set to true, the values can be any data type (not just strings), 
    allowing for more complex data structures to be parsed. If extended is set to false, only strings and arrays can be parsed.

C.) Helmet is a collection of middleware functions that help secure Express applications by setting various HTTP headers. 
    These headers can help protect your application from common vulnerabilities such as cross-site scripting (XSS).
*/
