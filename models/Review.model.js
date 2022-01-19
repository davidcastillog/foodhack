const { Schema, model } = require("mongoose");

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min : [1, "Rating must be at least 1"],
            max : [5, "Rating must be at most 5"],
            validate: {
                validator: Number.isInteger,
                message: "Rating must be an integer from 1 to 5"
            }
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            min: [3, "Title must be at least 3 characters"],
            max: [50, "Title must be at most 50 characters"],
        },
        comment: {
            type: String,
            required: [true, "Comment is required"],
            min: [3, "Comment must be at least 3 characters"],
            max: [2000, "Comment must be at most 2000 characters"],
        },
        _user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        _recipe: {
            type: Schema.Types.ObjectId,
            ref: "Recipe",
        },
    },
    {
        timestamps: true,
    }
);

const Review = model("Review", reviewSchema);
module.exports = Review;