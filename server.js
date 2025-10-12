// server.js
// RESTful API for managing recipes with JSON file persistence

import fs from "fs";
import express from "express";

const app = express();
app.use(express.json());

const DATA_FILE = "recipes.json";

/**
 * Helper function: safely load recipes from JSON file.
 */
function loadRecipes() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading recipes.json:", err);
    return [];
  }
}

/**
 * Helper function: save recipes array back to file.
 */
function saveRecipes(recipes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(recipes, null, 2));
}

/**
 * Initialize recipes from file.
 */
let recipes = loadRecipes();

/**
 * GET /api/recipes
 * Retrieve all recipes
 */
app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

/**
 * GET /api/recipes/:id
 * Retrieve a single recipe by ID
 */
app.get("/api/recipes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return res.status(404).json({ error: "Recipe not found" });
  }

  res.json(recipe);
});

/**
 * POST /api/recipes
 * Create a new recipe
 * Expected JSON body: { title: string, text: string }
 */
app.post("/api/recipes", (req, res) => {
  const { title, text } = req.body;

  if (!title || !text) {
    return res.status(400).json({ error: "Both title and text are required." });
  }

  const newRecipe = {
    id: recipes.length ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
    title,
    text,
    createdAt: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  saveRecipes(recipes);

  res.status(201).json(newRecipe);
});

/**
 * PUT /api/recipes/:id
 * Update an existing recipe
 */
app.put("/api/recipes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, text } = req.body;

  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return res.status(404).json({ error: "Recipe not found" });

  if (title) recipe.title = title;
  if (text) recipe.text = text;
  recipe.updatedAt = new Date().toISOString();

  saveRecipes(recipes);
  res.json(recipe);
});

/**
 * DELETE /api/recipes/:id
 * Delete a recipe
 */
app.delete("/api/recipes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = recipes.findIndex(r => r.id === id);

  if (index === -1) return res.status(404).json({ error: "Recipe not found" });

  const deleted = recipes.splice(index, 1)[0];
  saveRecipes(recipes);

  res.json({ message: "Recipe deleted", deleted });
});

/**
 * Start the server
 */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
