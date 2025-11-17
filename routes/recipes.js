/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: Manage recipes
 */
const express = require("express");
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe.js");
const authenticate = require("../middleware/authMiddleware.js");
const User = require("../models/User.js");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * @swagger
 * /recipes/search:
 *   get:
 *     summary: Search recipes by keyword
 *     tags: [Recipes]
 */
router.get("/search", authenticate, async (req, res) => {
    const q = req.query.q || "";

    const results = await Recipe.find({
        userId: req.userId,
        $or: [
            { title: { $regex: q, $options: "i" } },
            { text: { $regex: q, $options: "i" } },
        ],
    });

    res.json(results);
});

/**
 * @swagger
 * /recipes:
 *   get:
 *     summary: Get all recipes for the logged-in user
 *     tags: [Recipes]
 */
router.get("/", authenticate, async (req, res) => {
    const filter = { userId: req.userId };
    if (String(req.query.favorite).toLowerCase() === "true") {
        filter.favorite = true;
    }
    const recipes = await Recipe.find(filter);
    res.json(recipes);
});


/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 */
router.get("/:id", authenticate, async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid recipe ID format" });
    }

    const recipe = await Recipe.findOne({ _id: id, userId: req.userId });

    if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(recipe);
});

/**
 * @swagger
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 */
router.post("/", authenticate, async (req, res) => {
    const { title, text, imageUrl } = req.body;

    if (!title || !text) {
        return res.status(400).json({ error: "Title and text required" });
    }

    const newRecipe = new Recipe({
        userId: req.userId,
        title,
        text,
        imageUrl: imageUrl || "",
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
});

/**
 * @swagger
 * /recipes/{id}:
 *   put:
 *     summary: Update an existing recipe
 *     tags: [Recipes]
 */
router.put("/:id", authenticate, async (req, res) => {
    const { title, text, imageUrl } = req.body;

    const updated = await Recipe.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { title, text, imageUrl },
        { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Recipe not found" });

    res.json(updated);
});

/**
 * @swagger
 * /recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 */
router.delete("/:id", authenticate, async (req, res) => {
    const deleted = await Recipe.deleteOne({
        _id: req.params.id,
        userId: req.userId,
    });

    if (!deleted.deletedCount)
        return res.status(404).json({ error: "Recipe not found" });

    res.json({ message: "Recipe deleted" });
});

/**
 * @swagger
 * /recipes/{id}/export:
 *   get:
 *     summary: Export recipe as JSON, text, or HTML
 *     tags: [Recipes]
 */
router.get("/:id/export", authenticate, async (req, res) => {
    const { format } = req.query;
    const recipe = await Recipe.findOne({
        _id: req.params.id,
        userId: req.userId,
    });

    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    switch (format) {
        case "json":
            res.json(recipe);
            break;
        case "text":
            res.type("text/plain").send(`${recipe.title}\n\n${recipe.text}`);
            break;
        case "html":
            res.type("text/html").send(`<h1>${recipe.title}</h1><p>${recipe.text}</p>`);
            break;
        default:
            res.status(400).json({ error: "Invalid format" });
    }
});

/**
 * @swagger
 * /recipes/smart:
 *   post:
 *     summary: Generate an AI-assisted recipe (Premium feature)
 *     tags: [Recipes]
 */
router.post("/smart", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(401).json({ error: "Unauthorized" });
        if (!user.isPremium)
            return res.status(403).json({ error: "Premium feature only" });

        const existing = await Recipe.find({ userId: req.userId });
        const userPrompt = req.body.prompt?.trim() || "";

        const context =
            "Create a unique, creative recipe inspired by these existing ones but NEVER put markdown in the title section. Markdown in the recipe body is encouraged. Keep the title as concise as possible, 4-5 words MAXIMUM:\n\n" +
            existing.map((r) => `${r.title}: ${r.text}`).join("\n\n");

        const prompt = userPrompt ? `${context}\n\nUser prompt: ${userPrompt}` : context;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful recipe generation assistant.",
                },
                { role: "user", content: prompt },
            ],
        });

        const output = response.choices?.[0]?.message?.content?.trim();
        if (!output) throw new Error("No content returned from LLM");

        const [titleLine, ...body] = output.split("\n").filter(Boolean);
        const title = titleLine.replace(/^#+\s*/, "").slice(0, 100);
        const text = body.join("\n").trim();

        const newRecipe = new Recipe({
            userId: req.userId,
            title: title || "AI-Generated Recipe",
            text: text || "Content generated by RecipeVault Smart Add feature.",
            imageUrl: "smartadd.png", 
            createdAt: new Date(),
        });


        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        console.error("Smart Add Error:", err);
        res.status(500).json({ error: "Error generating AI recipe" });
    }
});

// Toggle favorite
router.patch("/:id/favorite", authenticate, async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findOne({ _id: id, userId: req.userId });
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });

    recipe.favorite = !recipe.favorite;
    await recipe.save();
    res.json({ id: recipe._id, favorite: recipe.favorite });
});

// Get favorites only (or use ?favorite=true on /recipes)
router.get("/favorites/list", authenticate, async (req, res) => {
    const list = await Recipe.find({ userId: req.userId, favorite: true });
    res.json(list);
});

module.exports = router;
