const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");

// Create a new review for a recipe and add it to the user's reviews array
router.get("/:recipeId/new", async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.recipeId);
        const user = await User.findById(req.session.userId);
        const review = await Review.create({
            recipe: recipe._id,
            user: user._id,
            rating: req.query.rating,
            comment: req.query.comment
        });
        user.reviews.push(review._id);
        await user.save();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (err) {
        res.redirect("/");
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { recipeId, rating, comment } = req.body;
        const user = await User.findById(req.user._id);
        const recipe = await Recipe.findById(recipeId);
        const review = await Review.create({
            user: user._id,
            recipe: recipe._id,
            rating,
            comment
        });
        user.reviews.push(review._id);
        await user.save();
    } catch (error) {
        next(error);
    }
});

module.exports = router;