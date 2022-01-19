const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");
const {isLoggedOut} = require("../utils/auth");

// Create a new review for a recipe and update Average Rating
router.get("/create/:id", isLoggedOut, async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate("_user");
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
        const recipe = await Recipe.findById(req.params.id).populate("_user");
        const user = await User.findById(req.session.user._id);
        const review = await Review.create({
            title,
            comment,
            rating,
            _recipe: recipe,
            _user: user,
        });
        // Update average rating
        recipe.averageRating = ((recipe.averageRating * recipe._reviews.length + review.rating) / (recipe._reviews.length + 1)).toFixed(2);
        // Push review to recipe's reviews
        recipe._reviews.push(review);
        await recipe.save();
        // Push review to user's reviews
        user._reviews.push(review);
        await user.save();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

// Delete a review a user is author of and is logged in.
router.get("/delete/:id", isLoggedOut, async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        const recipe = await Recipe.findById(review._recipe);
        const user = await User.findById(req.session.user._id);
        if (!review) {
            res.redirect("/");
        }
        if (review._user._id.toString() !== user._id.toString()) {
            res.redirect("/");
        }
        // Remove review from recipe's reviews
        recipe._reviews.splice(recipe._reviews.indexOf(review._id), 1);
        await recipe.save();
        // Remove review from user's reviews
        user._reviews.splice(user._reviews.indexOf(review._id), 1);
        await user.save();
        // Remove review from database
        await review.remove();
        // Access the recipe's reviews array and sum all the ratings to get the average rating
        const reviews = await Review.find({ _recipe: recipe._id });
        let sum = 0;
        reviews.forEach(review => {
            sum += review.rating;
        });
        recipe.averageRating = (sum / reviews.length).toFixed(2);
        await recipe.save();
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
            res.redirect(`/user/${user.username}`);
        }
        res.render("user/reviews", { reviews, user });
    } catch (error) {
        next(error);
    }
});

module.exports = router;