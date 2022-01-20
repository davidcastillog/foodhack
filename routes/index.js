const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");
const {isLoggedOut} = require("../utils/auth")

// Index route with 12 random recipes to display on the home page
router.get("/", async (req, res, next) => {
    try {
      // If user isn't logged in, render index page
      if (!req.session.user) {
        const recipes = await Recipe.find({}).populate("_user");
        const randomRecipes = [];
        for (let i = 0; i < 12; i++) {
            const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
            randomRecipes.push(randomRecipe);
        }
        const reviews = await Review.find({});
        res.render("index", { recipes: randomRecipes, reviews });
      } else {
        const recipes = await Recipe.find({}).populate("_user");
        const randomRecipes = [];
        for (let i = 0; i < 12; i++) {
            const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
            randomRecipes.push(randomRecipe);
        }
        const reviews = await Review.find({});
        const user = await User.findById(req.session.user._id);
        res.render("index", { recipes: randomRecipes, reviews, user });
    }
    } catch (error) {
      next(error);
    }
});

module.exports = router;