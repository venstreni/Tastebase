/**
 * @swagger
 * tags:
 *   name: Premium
 *   description: Manage user premium status
 */
const express = require("express");
const authenticate = require("../middleware/authMiddleware.js");
const User = require("../models/User.js");


const router = express.Router();

/**
 * @swagger
 * /upgrade:
 *   post:
 *     summary: Upgrade user to premium
 *     tags: [Premium]
 *     responses:
 *       200:
 *         description: User upgraded successfully
 */
router.post("/", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.isPremium = true;
        user.premiumExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
        await user.save();

        res.json({ message: "Account upgraded to Premium!", expires: user.premiumExpires });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error upgrading account" });
    }
});

router.get("/profile", authenticate, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
        email: user.email,
        isPremium: user.isPremium,
        premiumExpires: user.premiumExpires
    });
});


module.exports = router;
