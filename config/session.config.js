const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

module.exports = (app) => {
    app.use(session({
        secret:process.env.SECRET,
        resave:true,
        saveUninitialized:false,
        cookie:{
            httpOnly:true,
            maxAge:1000*60*60*24*7
        },
        store: new MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost/foodhack'
        })
    }));
}