const router = require("express").Router();
const User = require("../models/User.model");
const Recipe = require("../models/Recipe.model");
const Review = require("../models/Review.model");

// Create a new review for a recipe and update Average Rating
router.get("/create/:id", async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            res.redirect("/");
        }
        res.render("review/create-review", { recipe });
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
        recipe._reviews.push(review);
        recipe.averageRating = ((recipe.averageRating + review.rating) / (recipe._reviews.length)).toFixed(2);
        await recipe.save();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

// Edit a review a user is author of and is logged in and Update Average Rating
router.get("/edit/:id", async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            res.redirect("/");
        }
        if (req.session.user._id.toString() !== review._user._id.toString()) {
            res.redirect("/");
        }
        const recipe = await Recipe.findById(review._recipe._id);
        const user = await User.findById(req.session.user._id);
        res.render("review/edit-review", { review, recipe, user });
    } catch (error) {
        next(error);
    }
});

router.post("/edit/:id", async (req, res, next) => {
    try {
        const { title, comment, rating, ...rest  } = req.body;
        const review = await Review.findById(req.params.id);
        const recipe = await Recipe.findById(review._recipe);
        if (!review) {
            res.redirect("/");
        }
        if (review._user.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        review.title = title;
        review.comment = comment;
        review.rating = rating;
        recipe.name = name;
        await review.save();
        recipe.averageRating = ((recipe.averageRating - review.rating) + rating) / (recipe._reviews.length);
        await recipe.save();
        res.redirect(`/recipe/${recipe._id}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;