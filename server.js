// server.js - Week 3 update

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());

// path to JSON file used for persistence
const DATA_FILE = path.join(__dirname, 'recipes.json');

// helper: load recipes from disk
function loadRecipes() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// helper: save recipes to disk
function saveRecipes(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// load initial recipes
let recipes = loadRecipes();

// simple logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CRUD endpoints

// GET all recipes
app.get('/api/recipes', (req, res) => {
  res.json(recipes);
});

// GET single recipe by id
app.get('/api/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

// POST new recipe
app.post('/api/recipes', (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) return res.status(400).json({ error: 'Title and text are required.' });

  const newRecipe = {
    id: recipes.length ? recipes[recipes.length - 1].id + 1 : 1,
    title,
    text,
    createdAt: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  saveRecipes(recipes);
  res.status(201).json(newRecipe);
});

// PUT update existing recipe
app.put('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const recipeIndex = recipes.findIndex(r => r.id === id);
  if (recipeIndex === -1) return res.status(404).json({ error: 'Recipe not found' });

  const { title, text } = req.body;
  if (!title && !text) return res.status(400).json({ error: 'Provide at least one field to update.' });

  const updatedRecipe = { ...recipes[recipeIndex], ...req.body, updatedAt: new Date().toISOString() };
  recipes[recipeIndex] = updatedRecipe;
  saveRecipes(recipes);
  res.json(updatedRecipe);
});

// DELETE recipe
app.delete('/api/recipes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const newRecipes = recipes.filter(r => r.id !== id);
  if (newRecipes.length === recipes.length) return res.status(404).json({ error: 'Recipe not found' });

  recipes = newRecipes;
  saveRecipes(recipes);
  res.status(204).end();
});

// global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
