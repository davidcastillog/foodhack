const { Schema, model } = require("mongoose");

const RecipeSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            min: [3, "Name must be at least 3 characters"],
            max: [50, "Name must be at most 50 characters"],
            validate: {
                validator: (name) => {
                    return /^[a-zA-Z0-9 ]+$/.test(name);
                },
                message: "Name must contain only letters, numbers, and spaces"
            }
        },
        ingredients:
                {
                    type: String,
                    required: [true, "Ingredients is required"],
                },
        instructions: {
            type: String,
            min: [3, "Instructions must be at least 3 characters"],
            max: [2000, "Instructions must be at most 2000 characters"],
            required: [true, "Instructions are required"],
        },
        images:
            [
                {
                    type: String,
                    default: "https://res.cloudinary.com/davidcastillog/image/upload/v1641310320/foodhack/recipes_wykajc.png",
                    minlength: 1,
                },
            ],
        cookTime: {
            type: Number,
            validate: {
                validator: Number.isInteger,
                message: "Cook time must be an integer number (Ex. 1, 2, 3, etc.)"
            }
        },
        prepTime: {
            type: Number,
            required: [true, "Prep time is required"],
            min: [1, "Prep time must be at least 1"],
            validate: {
                validator: Number.isInteger,
                message: "Prep time must be an integer number (Ex. 1, 2, 3, etc.)"
            }
        },
        totalTime: {
            type: Number,
            required: [true, "Total time is required"],
        },
        servings: {
            type: Number,
            required: [true, "Servings is required"],
            min: [1, "Servings must be at least 1"],
            validate: {
                validator: Number.isInteger,
                message: "Servings must be an integer number (Ex. 1, 2, 3, etc.)"
            }
        },
        countryOfOrigin: {
            type: String,
            min: [3, "Country of origin must be at least 3 characters"],
            max: [50, "Country of origin must be at most 50 characters"],
            default: "",
        },
        mealType: {
            type: String,
            required: [true, "Meal type is required"],
            enum: ["Breakfast", "Lunch", "Dinner", "Dessert", "Salad"],
        },
        tags:
            [
                {
                    type: String,
                    validate: {
                        validator: (value) => {
                            return /^[a-zA-Z0-9_.-]*$/.test(value);
                        },
                        message: "Tags must be alphanumeric (Ex. 'vegan', 'gluten-free', etc.)"
                    },
                    required: [true, "Tags are required"],
                },
            ],
        _user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        _reviews:
            [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Review",
                },  // This is an array of review ids
            ],
        averageRating: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Recipe = model("Recipe", RecipeSchema);
module.exports = Recipe;