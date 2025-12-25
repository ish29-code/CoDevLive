import Settings from "../models/Settings.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

/* ================= GET SETTINGS ================= */
export const getSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        let settings = await Settings.findOne({ userId });

        // ✅ Auto-create settings if not exists
        if (!settings) {
            settings = await Settings.create({ userId });
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= UPDATE SETTINGS ================= */
export const updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;

        const settings = await Settings.findOneAndUpdate(
            { userId },
            { $set: req.body },
            { new: true, upsert: true } // 🔥 THIS IS CRITICAL
        );

        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= SETUP 2FA ================= */
export const setup2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const email = req.user.email;

        // Generate secret
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `CoDevLive (${email})`,
        });

        // Generate QR
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        // Save secret (NOT enabled yet)
        await Settings.findOneAndUpdate(
            { userId },
            {
                userId,
                twoFA: {
                    enabled: false,
                    secret: secret.base32,
                },
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            qrCode,
            message: "Scan QR and verify OTP",
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to setup 2FA" });
    }
};

/* ================= VERIFY 2FA ================= */
export const verify2FA = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;

        if (!otp) {
            return res.status(400).json({ message: "OTP is required" });
        }

        const settings = await Settings.findOne({ userId });

        if (!settings || !settings.twoFA?.secret) {
            return res.status(400).json({ message: "2FA not initialized" });
        }

        const verified = speakeasy.totp.verify({
            secret: settings.twoFA.secret,
            encoding: "base32",
            token: otp,
            window: 1, // ⏱ allow small time drift
        });

        if (!verified) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        settings.twoFA.enabled = true;
        await settings.save();

        res.status(200).json({
            message: "Two-factor authentication enabled successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "2FA verification failed" });
    }
};