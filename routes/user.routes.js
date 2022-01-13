const router = require("express").Router();
const User = require("../models/User.model");
const Upload = require("../helpers/multer");
const bcrypt = require("bcryptjs");

// GET profile page from user if logged in and redirect to login if not logged in
router.get("/profile", async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            res.redirect("/login");
        }
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
        if (req.files) {
            profilePic = req.files.profilePic.path;
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
        res.redirect('/user/profile');
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

module.exports = router;