const router = require("express").Router();
const User = require("../models/User.model");

// GET profile page if logged in and redirect to login if not logged in
router.get("/profile", async (req, res, next) => {
    try {
        if (!req.session.user) {
            res.redirect("/login");
        }
        const user = await User.findById(req.session.user._id);
        res.render("user/profile", { user });
    } catch (error) {
        next(error);
    }
});

// Edit profile page if logged in and redirect to login if not logged in
router.get("/profile/edit", async (req, res, next) => {
    try {
        if (!req.session.user) {
            res.redirect("/login");
        } else {
            const user = await User.findById(req.session.user._id);
            res.render("user/edit-profile", { user });
        }
    } catch (error) {
        next(error);
    }
});

router.post("/edit-profile", async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName, bio, ...rest } = req.body;
        const user = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
        user.username = username;
        user.email = email;
        user.password = password;
        user.firstName = firstName;
        user.lastName = lastName;
        user.bio = bio;
        await user.save();
        res.redirect("/user/profile");
    } catch (error) {
        next(error);
    }
});

module.exports = router;