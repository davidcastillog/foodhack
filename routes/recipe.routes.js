const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");

// Create a new recipe

router.get("/create", async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.render("recipe/create-recipe", { user });
    } catch (error) {
        next(error);
    }
});

router.post("/create", async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const newRecipe = new Recipe(req.body);
        newRecipe.user = user;
        await newRecipe.save();
        res.redirect("/recipe");
    } catch (error) {
        next(error);
    }
});

// Edit a recipe

router.get("/edit/:id", async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        res.render("recipe/edit-recipe", { recipe });
    } catch (error) {
        next(error);
    }
});

router.post("/edit/:id", async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        recipe.title = req.body.title;
        recipe.description = req.body.description;
        recipe.ingredients = req.body.ingredients;
        recipe.directions = req.body.directions;
        await recipe.save();
        res.redirect("/recipe");
    } catch (error) {
        next(error);
    }
});

// Delete a recipe user is author of and is logged in as
router.get("/delete/:id", async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (recipe.user.toString() === req.user._id.toString()) {
            await recipe.remove();
        }
        res.redirect("recipe/recipe-list");
    } catch (error) {
        next(error);
    }
});

// View all recipes
router.get("/", async (req, res, next) => {
    try {
        const recipes = await Recipe.find({});
        res.render("recipe/recipe-list", { recipes });
    } catch (error) {
        next(error);
    }
});

// View a recipe
router.get("/:id", async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        res.render("recipe/recipe", { recipe });
    } catch (error) {
        next(error);
    }
});

// View all recipes from a user
router.get("/user/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const recipes = await Recipe.find({ user: user._id });
        res.render("user/recipe-list", { recipes, user });
    } catch (error) {
        next(error);
    }
});