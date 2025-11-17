/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User management and authentication endpoints
 */
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Email and password required" });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: "User already exists" });

        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and return JWT
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            message: "Login successful",
            token,
            email: user.email,
            isPremium: user.isPremium,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
