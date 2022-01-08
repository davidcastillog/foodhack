const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Upload = require("../helpers/multer")

// Create a new recipe and save it to user's recipes
router.get("/create", (req, res,next) => {
    res.render("recipe/create-recipe");
});

router.post("/create", Upload.array("image"), async (req, res, next) => {
    try {
        const { name, ingredients, instructions, cookTime, prepTime, totalTime, servings, mealType,...rest } = req.body;
        const user = await req.session.user._id
        console.log(user)
        const recipe = await Recipe.create({
            name,
            ingredients,
            instructions,
            cookTime,
            prepTime,
            totalTime,
            servings,
            mealType,
            _user: user,
        });
        res.redirect("/");
    } catch (error) {
        next(error);
    }
});


// Edit a recipe a user is author of and is logged in
router.get("/edit/:id", async (req, res, next) => {
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

router.post("/:id/edit", Upload.array("image"), async (req, res, next) => {
    try {
        const { name, ingredients, instructions, cookTime, prepTime, totalTime, servings, ...rest } = req.body;
        const images = req.files.map(file => file.path);
        const recipe = await Recipe.findById(req.params.id);
        recipe.name = name;
        recipe.ingredients = ingredients;
        recipe.instructions = instructions;
        recipe.images = images;
        recipe.cookTime = cookTime;
        recipe.prepTime = prepTime;
        recipe.totalTime = totalTime;
        recipe.servings = servings;
        await recipe.save();
        res.redirect(`/recipe/${req.params.id}`);
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

module.exports = router;