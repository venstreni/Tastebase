// models/Recipe.js
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        text: { type: String, required: true },
        imageUrl: { type: String, default: "/images/default-thumb.png" },
        favorite: { type: Boolean, default: false }  
    },
    { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);
