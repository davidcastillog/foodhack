const router = require("express").Router();
const User = require("../models/User.model");
const {isLoggedOut} = require("../utils/auth")

// GET home page verify if user is logged in
router.get("/", isLoggedOut, (req, res, next) => {
  res.render("index");
});

module.exports = router;