const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: [true, "Username already exists"],
      required: [true, "Username is required"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      unique: [true, "Email already exists"],
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "https://res.cloudinary.com/davidcastillog/image/upload/v1641310729/foodhack/chef_k0lq89.png",
    },
    bio: {
      type: String,
      default: "",
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