// server.js
// basic RESTful service for the "recipes" resource

const express = require('express');
const app = express();
app.use(express.json());

// array to act as a simple database
let recipes = [];

/**
 * GET /api/recipes
 * Retrieve all recipes
 */
app.get('/api/recipes', (req, res) => {
  res.json(recipes);
});

/**
 * POST /api/recipes
 * Create a new recipe
 * Expected JSON body: { title: string, text: string }
 */
app.post('/api/recipes', (req, res) => {
  const { title, text } = req.body;

  // basic validation
  if (!title || !text) {
    return res
      .status(400)
      .json({ error: 'Both title and text are required.' });
  }

  // create a new recipe object with a simple unique id
  const newRecipe = {
    id: recipes.length + 1,
    title,
    text,
    createdAt: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
});

// start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
