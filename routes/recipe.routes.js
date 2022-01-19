const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");
const Upload = require("../helpers/multer")
const {isLoggedOut} = require("../utils/auth")

// Create a new recipe
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
        const { name, ingredients, instructions, cookTime, prepTime, totalTime, servings, mealType, cuisineType, tags,...rest } = req.body;
        const user = await User.findById(req.session.user._id);
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
            cuisineType,
            images,
            tags,
            _user: user,
        });
        // Push recipe to user's recipes
        user._recipes.push(recipe);
        await user.save();
        res.redirect("/recipe/" + recipe._id);
    } catch (error) {
        next(error);
    }
});

// Edit a recipe a user is author of and is logged in
router.get("/edit/:id", isLoggedOut, async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        const user = await User.findById(req.session.user._id);
        if (!recipe) {
            res.redirect("/");
        }
        if (recipe._user.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        res.render("recipe/edit-recipe", { recipe, user });
    } catch (error) {
        next(error);
    }
});

router.post("/edit/:id", Upload.array("images"), async (req, res, next) => {
    try {
        const { name, ingredients, instructions, cookTime, prepTime, totalTime, servings, mealType, cuisineType, tags,...rest } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        let images
        if (req.files.length) {
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
        recipe.cuisineType = cuisineType;
        recipe.tags = tags;
        await recipe.save();
        res.redirect(`/recipe/${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

// Delete a recipe user is author of and is logged in
router.get("/delete/:id", isLoggedOut, async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            res.redirect("/");
        }
        if (recipe._user.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        await recipe.remove();
        // Remove recipe from user's recipes
        const user = await User.findById(req.session.user._id);
        user._recipes.pull(recipe);
        await user.save();
        res.redirect(`/recipe/user/${req.session.user._id}`);
    } catch (error) {
        next(error);
    }
});

// View all recipes and its reviews
router.get("/recipe-list", async (req, res, next) => {
    try {
        if (!req.session.user) {
        const recipes = await Recipe.find({});
        const reviews = await Review.find({});
        res.render("recipe/recipe-list", { recipes, reviews });
        } else {
            const user = await User.findById(req.session.user._id);
            const recipes = await Recipe.find({});
            const reviews = await Review.find({});
            res.render("recipe/recipe-list", { recipes, reviews, user });
        }
    } catch (error) {
        next(error);
    }
});

// Search recipes by name, ingredients, meal type and country of origin
router.post("/search", async (req, res, next) => {
    try {
        if (!req.session.user) {
        const { search } = req.body;
        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { ingredients: { $regex: search, $options: "i" } },
                { mealType: { $regex: search, $options: "i" } },
                { cuisineType: { $regex: search, $options: "i" } },
            ],
        });
        if (recipes.length) {
            res.render("recipe/recipe-list", { recipes });
        } else {
            res.render("recipe/recipe-list", { recipes, errorMessage: "No results found! But you can create one! :D" });
        }
    } else {
        const { search } = req.body;
        const user = await User.findById(req.session.user._id);
        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { ingredients: { $regex: search, $options: "i" } },
                { mealType: { $regex: search, $options: "i" } },
                { cuisineType: { $regex: search, $options: "i" } },
            ],
        });
        if (recipes.length) {
            res.render("recipe/recipe-list", { recipes, user });
        } else {
            res.render("recipe/recipe-list", { recipes, user, errorMessage: "No results found! But you can create one! :D" });
        }
    }
    } catch (error) {
        next(error);
    }
});

// View all recipes filtered by name, ingredients, meal type and country of origin
router.get("/search/:query", async (req, res, next) => {
    try {
        if (!req.session.user) {
        const recipes = await Recipe.find({
            $or: [
                { name: { $regex: req.params.query, $options: "i" } },
                { ingredients: { $regex: req.params.query, $options: "i" } },
                { mealType: { $regex: req.params.query, $options: "i" } },
                { cuisineType: { $regex: req.params.query, $options: "i" } },
            ],
        });
        const reviews = await Review.find({});
        res.render("recipe/recipe-list", { recipes, reviews });
        } else {
            const user = await User.findById(req.session.user._id);
            const recipes = await Recipe.find({
                $or: [
                    { name: { $regex: req.params.query, $options: "i" } },
                    { ingredients: { $regex: req.params.query, $options: "i" } },
                    { mealType: { $regex: req.params.query, $options: "i" } },
                    { cuisineType: { $regex: req.params.query, $options: "i" } },
                ],
            });
            const reviews = await Review.find({});
            res.render("recipe/recipe-list", { user, recipes, reviews });
        }
    } catch (error) {
        next(error);
    }
});

// View all recipes a user is author of and is logged in and its reviews
router.get("/user/:id", isLoggedOut, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const recipes = await Recipe.find({ _user: req.params.id })
        const reviews = await Review.find({ _user: req.params.id });
        res.render("user/recipe-list", { user, recipes, reviews });
    } catch (error) {
        next(error);
    }
});

// Layout Menu items

// Get a random recipe
router.get("/random", async (req, res, next) => {
    try {
        const recipes = await Recipe.find();
        const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
       res.redirect(`/recipe/${randomRecipe._id}`);
    } catch (error) {
        next(error);
    }
});

// View top 10 best averageRating recipes
router.get("/top10", async (req, res, next) => {
    try {
        if (!req.session.user) {
            const recipes = await Recipe.find({}).sort({ averageRating: -1 }).limit(10);
            const reviews = await Review.find({});
            res.render("recipe/recipe-list", { recipes, reviews });
        } else {
            const recipes = await Recipe.find({}).sort({ averageRating: -1 }).limit(10);
            const reviews = await Review.find({});
            const user = await User.findById(req.session.user._id);
            res.render("recipe/recipe-list", { recipes, reviews, user });
        }
    } catch (error) {
        next(error);
    }
});

// View 20 random recipes
router.get("/random20", async (req, res, next) => {
    try {
        if (!req.session.user) {
            const recipes = await Recipe.find({})
            const randomRecipes = [];
            for (let i = 0; i < 20; i++) {
                const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                randomRecipes.push(randomRecipe);
            }
            const reviews = await Review.find({});
            res.render("recipe/recipe-list", { recipes: randomRecipes, reviews });
        } else {
            const recipes = await Recipe.find({})
            const randomRecipes = [];
            for (let i = 0; i < 20; i++) {
                const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                randomRecipes.push(randomRecipe);
            }
            const reviews = await Review.find({});
            const user = await User.findById(req.session.user._id);
            res.render("recipe/recipe-list", { recipes: randomRecipes, reviews, user });
        }
    } catch (error) {
        next(error);
    }
});

// View a recipe its reviews and its author
router.get("/:id", async (req, res, next) => {
    try {
        if (!req.session.user) {
            const recipe = await Recipe.findById(req.params.id).populate("_user");
            const reviews = await Review.find({ _recipe: req.params.id }).populate("_user");
            res.render("recipe/recipe", { recipe, reviews });
        } else {
            const recipe = await Recipe.findById(req.params.id).populate("_user");
            const reviews = await Review.find({ _recipe: req.params.id }).populate("_user");
            const user = await User.findById(req.session.user._id);
            res.render("recipe/recipe", { recipe, reviews, user });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;