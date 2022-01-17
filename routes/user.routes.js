const router = require("express").Router();
const User = require("../models/User.model");
const Upload = require("../helpers/multer");
const Review = require("../models/Review.model");
const Recipe = require("../models/Recipe.model");
const bcrypt = require("bcryptjs");

// GET profile page from user if logged in and redirect to login if not logged in
router.get("/profile", async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id);
        res.render("user/profile", { user });
    } catch (error) {
        next(error);
    }
});

// Edit profile page if is the user's profile and is logged in. Update profile picture and redirect to profile page
router.get("/edit", async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
        if (user._id.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        res.render("user/edit-profile", { user });
    } catch (error) {
        next(error);
    }
});

router.post("/edit", Upload.single("profilePic"), async (req, res, next) => {
    try {
        const { username, email, firstName, lastName, bio,...rest } = req.body;
        const user = await User.findById(req.session.user._id);
        let profilePic
        if (req.file) {
            profilePic = req.file.path;
        } else {
            profilePic = user.profilePic
        }
        user.username = username;
        user.email = email;
        user.firstName = firstName;
        user.lastName = lastName;
        user.bio = bio;
        user.profilePic = profilePic;
        await user.save();
        res.redirect(`/user/${user.username}`);
    } catch (error) {
        next(error);
    }
});

// Change user password if is the user's profile and is logged in and redirect to login if not logged in
router.get("/change-password", async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
        if (user._id.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        res.render("user/change-password", { user });
    } catch (error) {
        next(error);
    }
});

router.post("/change-password", async (req, res, next) => {
    try {
        const { password, newPassword, newPassword2 } = req.body;
        const user = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
        if (user._id.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        if (password === newPassword) {
            res.render("/user/change-password"), {
                error: "New password must be different from the old one"
            };
        }
        if (newPassword !== newPassword2) {
            res.render("user/change-password", {
                user,
                error: "Passwords do not match"
            });
        } else {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.render("user/change-password", {
                    user,
                    error: "Incorrect password"
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(newPassword, salt);
                await User.findByIdAndUpdate(user._id, { $set: { password: hash } });
                res.redirect("/user/profile");
            }
        }
    } catch (error) {
        next(error);
    }
});

// List all favorite recipes of a user
router.get("/:username/favorites", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate("_favorites");
        if (!user) {
            res.redirect("/login");
        }
        res.render("user/favorites", { user });
    } catch (error) {
        next(error);
    }
});

// Save a recipe to user's favorites
router.get("/:username/favorites/:recipeId", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const recipe = await Recipe.findById(req.params.recipeId);
        if (!user) {
            res.redirect("/login");
        }
        if (user._id.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        // if is already favorite redirect to favorites page
        if (user._favorites.includes(recipe._id)) {
            res.redirect(`/user/${user.username}/favorites`);
        } else {
        user._favorites.push(recipe);
        await user.save();
        res.redirect(`/user/${user.username}/favorites`);
        }
    } catch (error) {
        next(error);
    }
});

// Remove a recipe from user's favorites
router.get("/favorites/:recipeId/remove", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.session.user.username });
        const recipe = await Recipe.findById(req.params.recipeId);
        if (!user) {
            res.redirect("/login");
        }
        if (user._id.toString() !== req.session.user._id.toString()) {
            res.redirect("/");
        }
        user._favorites.pull(recipe);
        await user.save();
        res.redirect(`/user/${user.username}/favorites`);
    } catch (error) {
        next(error);
    }
});

// Get Profile page by username and populate user's recipes
router.get("/:username", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate("_recipes");
        res.render("user/profile", { user });
    } catch (error) {
        next(error);
    }
});

// Follow a user save it to user's following list and save it to user's followers list
router.get("/:username/follow", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const follower = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
        // If user profile is the same as logged in user not allow to follow
        if (user.toString() === follower.username.toString()) {
            res.redirect(`/user/${user.username}`);
        }
        // If user is already following redirect to profile page
        if (follower._following.includes(user._id)) {
            res.redirect(`/user/${user.username}`);
        } else {
            follower._following.push(user._id);
            user._followers.push(follower._id);
            await user.save();
            await follower.save();
            res.redirect(`/user/${user.username}`);
        }
    } catch (error) {
        next(error);
    }
});

// Unfollow a user remove it from user's following list and remove it from user's followers list
router.get("/:username/unfollow", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const follower = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
        // if is not following redirect to profile page
        if (!user._followers.includes(follower._id)) {
            res.redirect(`/user/${user.username}`);
        } else {
            // Remove user from user's followers list
            user._followers.pull(follower);
            await user.save();
            // Remove user from user's following list
            follower._following.pull(user);
            await follower.save();
            res.redirect(`/user/${user.username}`);
        }
    } catch (error) {
        next(error);
    }
});

// Get user's followers list
router.get("/:username/followers", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate("_followers");
        if (!user) {
            res.redirect("/login");
        }
        res.render("user/followers", { user });
    } catch (error) {
        next(error);
    }
});

// Get user's following list
router.get("/:username/following", async (req, res, next) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate("_following");
        if (!user) {
            res.redirect("/login");
        }
        res.render("user/following", { user });
    } catch (error) {
        next(error);
    }
});

module.exports = router;