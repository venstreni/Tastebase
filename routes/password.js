// routes/password.js
const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const User = require("../models/User.js");
const PasswordReset = require("../models/PasswordReset.js");

dotenv.config();

const router = express.Router();

/**
 * @swagger
 * /auth/forgot:
 *   post:
 *     summary: Send password reset link
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Reset email sent if user exists
 */
router.post("/forgot", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "No account with that email" });

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min expiration
        await PasswordReset.create({ userId: user._id, token, expiresAt });

        // Transport (Gmail example — use app password)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click this link to reset your password: ${resetLink}`,
        });

        res.json({ message: "Password reset email sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error sending reset email" });
    }
});


/**
 * @swagger
 * /auth/reset/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post("/reset", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const record = await PasswordReset.findOne({ token });
        if (!record) return res.status(400).json({ error: "Invalid or expired token" });
        if (record.expiresAt < Date.now())
            return res.status(400).json({ error: "Token expired" });

        const user = await User.findById(record.userId);
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        await PasswordReset.deleteOne({ token });

        res.json({ message: "Password successfully reset" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error resetting password" });
    }
});

module.exports = router;
