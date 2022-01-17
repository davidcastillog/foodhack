const router = require("express").Router();
const User = require("../models/User.model");
const {isLoggedOut} = require("../utils/auth")

// GET home page verify if user is logged in
router.get("/", async (req, res, next) => {
    try {
      // If user isn't logged in, render index page
      if (!req.session.user) {
        res.render("index");
      } else {
        const user = await User.findById(req.session.user._id);
        res.render("index", { user });
      }
    } catch (error) {
      next(error);
    }
});

module.exports = router;