const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

// GET signup page
router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
});

// POST signup page
router.post("/signup", async (req, res, next) => {
    try {
        const { username, password, email, firstName, lastName,...rest } = req.body;
        const findUsername = await User.findOne({ username });

        // Check if user already exists
        if (findUsername) {
             res.render("/auth/signup", { errorMessage: "Username already exists" });
             return;
        }

        // Validate empty fields
        if (!username || !password) {
            res.render("auth/signup", { errorMessage: "Please fill out all required fields (username and password" });
            return;
        }
        // Validate password length (min 6 characters)
        const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!regex.test(password)) {
            res.render("/auth/signup", { errorMessage: "Password must be at least 6 characters and contain at least one uppercase letter, one lower case letter, one number"});
            return;
        }

        // Hash password
        const salt = await bcrypt.genSaltSync(10);
        const passHash = await bcrypt.hashSync(password, salt);

        // Create new user
        const user = await User.create({
            username,
            password: passHash,
            email,
            firstName,
            lastName,
            ...rest
        });

        // Log user in
        req.session.user = user;

        // Redirect to home page
        res.redirect("/home");

    } catch (error) {
        next(error);
    }
});

// GET login page
router.get("/login", (req, res, next) => {
    res.render("auth/login");
});

// POST login page validations and login user if credentials are correct
router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Validate empty fields
        if (!username || !password) {
            res.render("auth/login", { errorMessage: "Please fill out all required fields (username and password" });
            return;
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            res.render("auth/login", { errorMessage: "Username does not exist" });
            return;
        }

        // Check if password is correct (compare hashed password with input password)
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            res.render("auth/login", { errorMessage: "Incorrect password" });
            return;
        }

        // If credentials are correct, store user in session
        req.session.user = user;

        // Redirect to home page
        res.redirect("/home");

    } catch (error) {
        next(error);
    }
});

// GET logout page
router.get("/logout", (req, res, next) => {
    req.session.destroy();
    res.redirect("/login");
});

// PROFILE PAGE ROUTES

// GET profile page
router.get("/profile", (req, res, next) => {
    res.render("auth/profile");
});

// POST profile page
router.post("/profile", (req, res, next) => {
    res.render("auth/profile");
});

// GET edit profile page
router.get("/edit-profile", (req, res, next) => {
    res.render("auth/edit-profile");
});

// POST edit profile page
router.post("/edit-profile", (req, res, next) => {
    res.render("auth/edit-profile");
});

module.exports = router;
