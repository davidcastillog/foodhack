// ℹ️ Gets access to environment variables/settings
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
const express = require("express");

// Handles the handlebars
const hbs = require("hbs");

// ℹ️ Creates the server
const app = express();

// ℹ️ Gets access to environment variables/settings
require("./config/session.config")(app);

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const projectName = "foodhack";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

// ℹ️ Sets the view engine to handlebars
app.locals.title = `${capitalized(projectName)}`;

// Handling routes
const index = require("./routes/index");
const auth = require("./routes/auth.routes");
// const recipe = require("./routes/recipe.routes");
// const review = require("./routes/review.routes");
// const user = require("./routes/user.routes");

// Register the routes
app.use("/", index);
app.use("/", auth);
// app.use("/recipe", recipe);
// app.use("/review", review);
// app.use("/user", user);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;