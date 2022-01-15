const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");
const Upload = require("../helpers/multer")
const {isLoggedOut} = require("../utils/auth")


// Check user is logged in and Create a new recipe and save it to user's recipes
router.get("/create", isLoggedOut, async (req, res,next) => {
    try {
        const user = await User.findById(req.session.user._id);
        res.render("recipe/create-recipe", { user });
    } catch (error) {
        next(error);
    }
});

router.post("/create", Upload.array("images"), async (req, res, next) => {
    try {
        const { name, ingredients, instructions, cookTime, prepTime, totalTime, servings, mealType, countryOfOrigin, tags,...rest } = req.body;
        const user = await req.session.user._id
        const images = req.files.map(file=> file.path)
        if(!user) {
            res.redirect("/login");
        }
        const recipe = await Recipe.create({
            name,
            ingredients,
            instructions,
            cookTime,
            prepTime,
            totalTime,
            servings,
            mealType,
            countryOfOrigin,
            images,
            tags,
            _user: user,
        });
        res.redirect("/");
    } catch (error) {
        next(error);
    }
});

// Edit a recipe a user is author of and is logged in
router.get("/edit/:id", isLoggedOut, async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            res.redirect("/");
        }
        if (recipe._user.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        res.render("recipe/edit-recipe", { recipe });
    } catch (error) {
        next(error);
    }
});

router.post("/edit/:id", Upload.array("images"), async (req, res, next) => {
    try {
        const { name, ingredients, instructions, cookTime, prepTime, totalTime, servings, mealType, countryOfOrigin, tags,...rest } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        let images
        if (req.files) {
            images = req.files.map(file => file.path);
        } else {
            images = recipe.images
        }
        recipe.name = name;
        recipe.ingredients = ingredients;
        recipe.instructions = instructions;
        recipe.cookTime = cookTime;
        recipe.prepTime = prepTime;
        recipe.totalTime = totalTime;
        recipe.servings = servings;
        recipe.mealType = mealType;
        recipe.images = images;
        recipe.countryOfOrigin = countryOfOrigin;
        recipe.tags = tags;
        await recipe.save();
        res.redirect(`/recipe/${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

// Delete a recipe user is author of and is logged in as findByIdAndDelete
router.get("/delete/:id", isLoggedOut, async (req, res, next) => {
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
router.get("/recipe-list", async (req, res, next) => {
    try {
        const recipes = await Recipe.find({});
        res.render("recipe/recipe-list", { recipes });
    } catch (error) {
        next(error);
    }
});

// View a recipe and its reviews
router.get("/:id", async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        const reviews = await Review.find({ recipe: req.params.id });
        res.render("recipe/recipe", { recipe, reviews });
    } catch (error) {
        next(error);
    }
});

// View all recipes from a user and its reviews
router.get("/user/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const recipes = await Recipe.find({ _user: req.params.id });
        const reviews = await Review.find({ _user: req.params.id });
        res.render("recipe/user-recipes", { user, recipes, reviews });
    } catch (error) {
        next(error);
    }
});

// Get a random recipe
router.get("/random", async (req, res, next) => {
    try {
        const recipes = await Recipe.find({});
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        res.redirect(`/recipe/${randomRecipe._id}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;