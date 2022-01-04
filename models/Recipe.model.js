const { Schema, model } = require("mongoose");

const RecipeSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        ingredients:
            [
                {
                    type: String,
                    required: [true, "Ingredients is required"],
                },
            ],
        instructions: {
            type: String,
            required: [true, "Instructions are required"],
        },
        images:
            [
                {
                    type: String,
                    default: "https://res.cloudinary.com/davidcastillog/image/upload/v1641310320/foodhack/recipes_wykajc.png"
                },
            ],
        cookTime: {
            type: Number,
            required: [true, "Cook time is required"],
        },
        prepTime: {
            type: Number,
            required: [true, "Prep time is required"],
        },
        totalTime: {
            type: Number,
            required: [true, "Total time is required"],
        },
        servings: {
            type: Number,
            required: [true, "Servings is required"],
        },
        tags:
            [
                {
                    type: String,
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