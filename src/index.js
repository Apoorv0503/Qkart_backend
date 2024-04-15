const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");

let server;

mongoose.connect(`${config.mongoose.url}`,config.mongoose.options)
.then(()=>{
    console.log("MongoDB connected to DB at:",config.mongoose.url);
    server= app.listen(config.port,()=>{
        console.log("app is listening on the port: ",config.port);
    });
})
.catch((e)=>console.log("Failed to connect to DB", e));


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

/*
NOTES-
1. The "server" variable stores the instance of the server created by app.listen.
    This instance is necessary if you want to perform any operations on the server later, 
    such as closing the server.


*/
