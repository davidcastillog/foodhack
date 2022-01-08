const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");

// Create a new review for a recipe and update Average Rating
router.get("/create", (req, res, next) => {
    res.render("review/create-review");
});

router.post("/:id/review", async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        const user = await User.findById(req.session.user._id);
        const review = await Review.create({
            rating,
            title,
            comment,
            _recipe: recipe,
            _user: user,
        });
        recipe.reviews.push(review);
        recipe.averageRating =
            (recipe.averageRating * recipe.reviews.length + rating) /
            (recipe.reviews.length + 1);
        await recipe.save();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

// Delete a review a user is author of and is logged in
router.get("/delete/:id", async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            res.redirect("/");
        }
        if (review._user.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        const recipe = await Recipe.findById(review._recipe);
        recipe.reviews.pull(review._id);
        recipe.save();
        review.remove();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;