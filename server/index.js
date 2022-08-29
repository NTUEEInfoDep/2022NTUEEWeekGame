const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const api = require("./api");

const { MONGO_HOST, MONGO_DBNAME, MONGO_PASSWORD, MONGO_USERNAME, MONGO_PORT } = process.env;
const port = process.env.PORT || 4000;
// console.log(`mongodb://${MONGO_USERNAME}:${ MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`);

mongoose.connect(
    `mongodb://${MONGO_HOST}/${MONGO_DBNAME}`,
    // `mongodb://${MONGO_USERNAME}:${ MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((res)=>console.log("mongo db connection created")).catch((err)=>console.log(err));

const db = mongoose.connection;

db.on("error", (err)=> console.log(err));
db.once('open', ()=>{
    const app = express();
    app.use('/api', api);

    app.listen(port, () =>{
        console.log(`Example app listening on port ${port}!`);
    })
})
