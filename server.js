const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const recipeRoutes = require("./routes/recipes.js");
const upgradeRoutes = require("./routes/upgrade.js");
const passwordRoutes = require("./routes/password.js");
const swaggerDocs = require("./swagger.js");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("docs"));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/upgrade", upgradeRoutes);
app.use("/api/auth", passwordRoutes);

// Swagger integration
swaggerDocs(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
