const router = require("express").Router();

router.get("/create-recipe", (req, res, next) =>{
    res.render("recipe/create-recipe")
})

router.get("/edit-recipe", (req, res, next) =>{
    res.render("recipe/edit-recipe")
})

router.get("/:id", (req, res, next) =>{
    res.render("recipe/recipe")
})


module.exports = router;