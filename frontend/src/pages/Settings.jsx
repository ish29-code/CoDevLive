import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
    getSettings,
    updateSettings,
    setup2FA,
    verify2FA,
} from "../api/settingsApi";

import {
    Sun,
    Moon,
    LogOut,
    Trash2,
    Shield,
    Bell,
    Palette,
    User,
    Lock,
    Globe,
    Sliders,
    Database,
} from "lucide-react";

export default function Settings() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    /* ================= STATE ================= */
    const [settings, setSettings] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [otp, setOtp] = useState("");

    /* ================= LOAD SETTINGS ================= */
    useEffect(() => {
        if (!user) return;

        const loadSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
            } catch (err) {
                toast.error("Failed to load settings");
            }
        };

        loadSettings();
    }, [user]);

    /* ================= LOADER ================= */
    if (loading || !settings) return <Loader />;

    /* ================= AUTH GUARD ================= */
    if (!user) {
        navigate("/authpage", { replace: true });
        return null;
    }

    /* ================= HELPERS ================= */
    const saveSetting = async (payload, successMsg) => {
        try {
            const updated = await updateSettings(payload);
            setSettings(updated);
            toast.success(successMsg);
        } catch {
            toast.error("Update failed");
        }
    };

    /* ================= 2FA ================= */
    const handleEnable2FA = async () => {
        try {
            const res = await setup2FA();
            setQrCode(res.qrCode);
        } catch {
            toast.error("Failed to setup 2FA");
        }
    };

    const handleVerify2FA = async () => {
        try {
            await verify2FA(otp);
            toast.success("Two-Factor Authentication enabled");
            setQrCode(null);
            setOtp("");
            saveSetting({ twoFA: { enabled: true } }, "2FA enabled");
        } catch {
            toast.error("Invalid OTP");
        }
    };

    /* ================= ACTIONS ================= */
    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    const handleDeleteAccount = () => {
        toast.error("Account deletion is not enabled yet");
    };

    const handlePasswordChange = () => {
        toast.info("Password reset link sent to your email");
    };

    /* ================= UI ================= */

    return (
        <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)]">
            <div className="max-w-4xl mx-auto bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] rounded-2xl shadow-xl p-8 space-y-10">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <User className="text-[var(--accent)]" />
                    <h1 className="text-2xl font-bold">Settings</h1>
                </div>

                {/* ================= APPEARANCE ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Palette className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Appearance</h2>
                    </div>

                    <div className="flex items-center justify-between border rounded-xl p-4">
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className="text-sm opacity-70">Light / Dark mode</p>
                        </div>

                        <Button variant="ghost" onClick={toggleTheme}>
                            {theme === "light" ? (
                                <Sun className="text-yellow-500" />
                            ) : (
                                <Moon className="text-orange-400" />
                            )}
                        </Button>
                    </div>
                </section>

                {/* ================= ACCOUNT ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Account</h2>
                    </div>

                    <div className="border rounded-xl p-4 space-y-2">
                        <p><span className="font-medium">Name:</span> {user.name || "N/A"}</p>
                        <p><span className="font-medium">Email:</span> {user.email || "N/A"}</p>
                    </div>

                    <Button variant="outline" onClick={handlePasswordChange} className="w-full">
                        Change Password
                    </Button>
                </section>

                {/* ================= NOTIFICATIONS ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Bell className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Notifications</h2>
                    </div>

                    <div className="border rounded-xl p-4 space-y-4">
                        <label className="flex justify-between cursor-pointer">
                            <span>Email Notifications</span>
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={() =>
                                    saveSetting(
                                        { emailNotifications: !settings.emailNotifications },
                                        "Email notifications updated"
                                    )
                                }
                            />
                        </label>

                        <label className="flex justify-between cursor-pointer">
                            <span>Product Updates</span>
                            <input
                                type="checkbox"
                                checked={settings.productUpdates}
                                onChange={() =>
                                    saveSetting(
                                        { productUpdates: !settings.productUpdates },
                                        "Product updates updated"
                                    )
                                }
                            />
                        </label>
                    </div>
                </section>

                {/* ================= PRIVACY ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Lock className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Privacy</h2>
                    </div>

                    <div className="border rounded-xl p-4 flex justify-between">
                        <span>Public Profile</span>
                        <input
                            type="checkbox"
                            checked={settings.publicProfile}
                            onChange={() =>
                                saveSetting(
                                    { publicProfile: !settings.publicProfile },
                                    "Privacy updated"
                                )
                            }
                        />
                    </div>
                </section>

                {/* ================= SECURITY (2FA) ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Security</h2>
                    </div>

                    <div className="border rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Two-Factor Authentication</span>
                            {!settings.twoFA?.enabled && (
                                <Button variant="outline" onClick={handleEnable2FA}>
                                    Enable
                                </Button>
                            )}
                        </div>

                        {qrCode && (
                            <>
                                <img src={qrCode} alt="QR Code" className="w-40 mx-auto" />
                                <input
                                    className="border p-2 w-full"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <Button className="w-full" onClick={handleVerify2FA}>
                                    Verify OTP
                                </Button>
                            </>
                        )}
                    </div>
                </section>

                {/* ================= ACCESSIBILITY ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Sliders className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Accessibility</h2>
                    </div>

                    <div className="border rounded-xl p-4 flex justify-between">
                        <span>Reduce Motion</span>
                        <input
                            type="checkbox"
                            checked={settings.reduceMotion}
                            onChange={() =>
                                saveSetting(
                                    { reduceMotion: !settings.reduceMotion },
                                    "Accessibility updated"
                                )
                            }
                        />
                    </div>
                </section>

                {/* ================= LANGUAGE ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Globe className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Language</h2>
                    </div>

                    <select
                        value={settings.language}
                        onChange={(e) =>
                            saveSetting(
                                { language: e.target.value },
                                `Language set to ${e.target.value}`
                            )
                        }
                        className="w-full border rounded-xl p-3 bg-transparent"
                    >
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Hindi</option>
                    </select>
                </section>

                {/* ================= DATA ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Database className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Your Data</h2>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toast.info("Data export coming soon")}
                    >
                        Download Account Data
                    </Button>
                </section>

                {/* ================= DANGER ZONE ================= */}
                <section className="space-y-4 settings-card">
                    <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>

                    <div className="flex flex-col gap-3">
                        <Button onClick={handleLogout} variant="outline">
                            <LogOut className="mr-2" size={18} />
                            Logout
                        </Button>

                        <Button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="mr-2" size={18} />
                            Delete Account
                        </Button>
                    </div>
                </section>

            </div>
        </div>
    );
}
