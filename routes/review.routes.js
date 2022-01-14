const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");
const {isLoggedOut} = require("../utils/auth")

// Create a new review for a recipe and update Average Rating
router.get("/create/:id", isLoggedOut, async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            res.redirect("/");
        }
        const user = await User.findById(req.session.user._id);
        res.render("review/create-review", { recipe, user });
    } catch (error) {
        next(error);
    }
});

router.post("/create/:id/", async (req, res, next) => {
    try {
        const { title, comment, rating, ...rest  } = req.body;
        const recipe = await Recipe.findById(req.params.id);
        const user = await User.findById(req.session.user._id);
        if (!recipe) {
            res.redirect("/");
        }
        const review = await Review.create({
            title,
            comment,
            rating,
            _recipe: recipe,
            _user: user,
        });
        // Push review to recipe's reviews
        recipe._reviews.push(review);
        // Update average rating
        recipe.averageRating = ((recipe.averageRating + review.rating) / (recipe._reviews.length)).toFixed(2);
        await recipe.save();
        // Push review to user's reviews
        user._reviews.push(review);
        await user.save();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

// Delete a review a user is author of and is logged in and Update Average Rating
router.get("/delete/:id", isLoggedOut, async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            res.redirect("/");
        }
        if (review._user._id.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        const recipe = await Recipe.findById(review._recipe._id);

        // Update Average Rating of recipe
        if (recipe.averageRating > 0) {
            recipe.averageRating = ((recipe.averageRating - review.rating) / (recipe._reviews.length)).toFixed(2);
        } else {
            recipe.averageRating = 0;
        }
        // Delete the review from the recipe array
        recipe._reviews.splice(recipe._reviews.indexOf(review._id), 1);
        await recipe.save();
        await review.remove();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

// View all reviews a user author of and is logged in
router.get("/user/:id", isLoggedOut, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.redirect("/login");
        }
        const reviews = await Review.find({ _user: user._id }).populate("_recipe");
        if (reviews.length === 0) {
            res.redirect("/user/profile");
        }
        res.render("user/reviews", { reviews, user });
    } catch (error) {
        next(error);
    }
});

module.exports = router;