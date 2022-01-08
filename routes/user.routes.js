const router = require("express").Router();
const User = require("../models/User.model");

// GET profile page

router.get("/profile", async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id).populate("posts");
        res.render("user/profile", { user });
    } catch (error) {
        next(error);
    }
});

// Edit profile

router.get("/profile/edit", async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id);
        res.render("user/edit-profile", { user });
    } catch (error) {
        next(error);
    }
});

router.post("/edit-profile", async (req, res, next) => {
    try {
        const { username, email, firstName, lastName, ...rest } = req.body;
        const user = await User.findByIdAndUpdate(req.session.user._id, {
            username,
            email,
            firstName,
            lastName,
            ...rest
        });
        req.session.user = user;
        res.redirect("/profile");
    } catch (error) {
        next(error);
    }
});

module.exports = router;