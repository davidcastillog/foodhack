const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: [true, "Username already exists"],
      required: [true, "Username is required"],
      trim: true,
      minlength: [1, "Username must be at least 1 characters long"],
      maxlength: [20, "Username must be at most 20 characters long"],
      validate: {
        validator: (username) => {
          return /^[a-zA-Z0-9]+$/.test(username);
        },
        message: "Username can only contain letters and numbers"
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"]
    },
    firstName: {
      type: String,
      min: [2, "First name must be at least 2 characters"],
      max: [50, "First name must be at most 50 characters"],
      validation: {
        validator: (firstName) => {
          return /^[a-zA-Z0-9 ]+$/.test(firstName);
        },
        message: "First name must contain only letters, numbers, and spaces"
      }
    },
    lastName: {
      type: String,
      min: [2, "Last name must be at least 2 characters"],
      max: [50, "Last name must be at most 50 characters"],
      validation: {
        validator: (lastName) => {
          return /^[a-zA-Z0-9 ]+$/.test(lastName);
        },
        message: "Last name must contain only letters, numbers, and spaces"
      }
    },
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/davidcastillog/image/upload/v1641310729/foodhack/chef_k0lq89.png",
    },
    bio: {
      type: String,
      min: [2, "Bio must be at least 2 characters"],
      max: [250, "Bio must be at most 250 characters"],
      default: "Love to cook and share my recipes with others!",
    },
    _recipes:
      [
        {
          type: Schema.Types.ObjectId,
          ref: "Recipe",
        },  // This is an array of recipe ids
      ],
    _favorites:
      [
        {
          type: Schema.Types.ObjectId,
          ref: "Recipe",
        },  // This is an array of favorites recipe ids
      ],
    _reviews:
      [
        {
          type: Schema.Types.ObjectId,
          ref: "Review",
        },  // This is an array of review ids
      ],
    _following:
      [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },  // This is an array of user ids this user is following
      ],
    _followers:
      [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },  // This is an array of user ids followers of this user
      ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
module.exports = User;