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
import { deleteAccount } from "../api/userApi";

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
    const { user, logout, loading, resetPassword } = useAuth();
    const navigate = useNavigate();

    /* ================= STATE ================= */
    const [settings, setSettings] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [otp, setOtp] = useState("");
    const [disableMode, setDisableMode] = useState(false);



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
    const refreshSettings = async () => {
        const fresh = await getSettings();
        setSettings(fresh);
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
            await refreshSettings();
        } catch {
            toast.error("Invalid OTP");
        }
    };




    /* ================= ACTIONS ================= */
    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
    };

    const handleDeleteAccount = async () => {
        const confirm = window.confirm(
            "⚠️ This will permanently delete your account and all data.\n\nAre you sure?"
        );

        if (!confirm) return;

        try {
            await deleteAccount();

            toast.success("Account deleted successfully");

            // 🔥 CLEAR SESSION
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // 🔁 REDIRECT
            navigate("/authpage", { replace: true });
        } catch (err) {
            toast.error(err.message || "Failed to delete account");
        }
    };

    const handlePasswordChange = async () => {
        if (!user?.email) {
            toast.error("Email not found for this account");
            return;
        }

        try {
            await resetPassword(user.email);
            toast.success("Password reset link sent to your email");
        } catch (err) {
            console.error(err);
            toast.error("Failed to send password reset email");
        }
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
                <section className="space-y-4 settings-card group">
                    <div className="flex items-center gap-2">
                        <Palette className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Appearance</h2>
                    </div>

                    <div
                        onClick={toggleTheme}
                        className="
      flex items-center justify-between
      border rounded-xl p-5 cursor-pointer
      transition-all duration-300 ease-out
      hover:shadow-lg hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]
    "
                    >
                        {/* LEFT */}
                        <div className="space-y-1">
                            <p className="font-medium">Theme</p>
                            <p className="text-sm opacity-70">
                                {theme === "light"
                                    ? "Light mode is active"
                                    : "Dark mode is active"}
                            </p>
                        </div>

                        {/* RIGHT ICON */}
                        <div
                            className="
        w-11 h-11 flex items-center justify-center
        rounded-full transition-all duration-300
        group-hover:rotate-12 group-hover:scale-110
        bg-[var(--muted)]
      "
                        >
                            {theme === "light" ? (
                                <Sun className="text-yellow-500" />
                            ) : (
                                <Moon className="text-orange-400" />
                            )}
                        </div>
                    </div>
                </section>

                {/* ================= ACCOUNT ================= */}
                <section className="space-y-4 settings-card group">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Account</h2>
                    </div>

                    {/* ACCOUNT INFO CARD */}
                    <div
                        className="
      border rounded-xl p-5 space-y-4
      transition-all duration-300 ease-out
      hover:shadow-lg hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]
    "
                    >
                        {/* USER INFO */}
                        <div className="space-y-2">
                            <p className="text-sm opacity-70">Profile Information</p>

                            <div className="flex justify-between items-center">
                                <span className="font-medium">Name</span>
                                <span className="opacity-80">{user?.name || user?.fullName || "N/A"}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-medium">Email</span>
                                <span className="opacity-80">{user.email || "N/A"}</span>
                            </div>
                        </div>

                        {/* DIVIDER */}
                        <div className="border-t" />

                        {/* PASSWORD SECTION */}
                        <details className="group/details">
                            <summary
                                className="
          flex items-center justify-between cursor-pointer
          font-medium list-none
        "
                            >
                                <span>Change Password</span>
                                <span className="transition-transform group-open/details:rotate-180">
                                    ⌄
                                </span>
                            </summary>

                            {/* PASSWORD CONTENT */}
                            <div className="pt-4 space-y-3">
                                <p className="text-sm opacity-70">
                                    A password reset link will be sent to your registered email.
                                </p>

                                <Button
                                    variant="outline"
                                    onClick={handlePasswordChange}
                                    className={`w-full cursor-pointer text-sm rounded-full ${theme === "light" ? "bg-yellow-200 text-yellow-900 border border-yellow-200" : "bg-orange-100 text-orange-700 border border-orange-300"}`}
                                >
                                    Send Password Reset Email
                                </Button>
                            </div>
                        </details>
                    </div>
                </section>


                {/* ================= NOTIFICATIONS ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Bell className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Notifications</h2>
                    </div>

                    <div
                        className="border rounded-xl p-5 space-y-5 transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]"
                    >

                        {/* EMAIL NOTIFICATIONS */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm opacity-70">
                                    Get important alerts & security updates
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                className="accent-[var(--accent)] scale-125 cursor-pointer"
                                checked={settings.emailNotifications}
                                onChange={() =>
                                    saveSetting(
                                        { emailNotifications: !settings.emailNotifications },
                                        settings.emailNotifications
                                            ? "Email notifications disabled"
                                            : "Email notifications enabled"
                                    )
                                }
                            />
                        </div>

                        <hr className="border-[var(--border)]" />

                        {/* PRODUCT UPDATES */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">Product Updates</p>
                                <p className="text-sm opacity-70">
                                    New features, improvements & announcements
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                className="accent-[var(--accent)] scale-125 cursor-pointer"
                                checked={settings.productUpdates}
                                onChange={() =>
                                    saveSetting(
                                        { productUpdates: !settings.productUpdates },
                                        settings.productUpdates
                                            ? "Product updates disabled"
                                            : "Product updates enabled"
                                    )
                                }
                            />
                        </div>

                        {/* STATUS FOOTER */}
                        <div className="text-xs opacity-60 pt-2">
                            You can change notification preferences anytime
                        </div>
                    </div>
                </section>


                {/* ================= PRIVACY ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Lock className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Privacy</h2>
                    </div>

                    <div
                        className="border rounded-xl p-5 space-y-4 transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]"
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium">Public Profile</p>
                                <p className="text-sm opacity-70">
                                    Control who can view your profile and activity
                                </p>
                            </div>

                            {/* STATUS BADGE */}
                            {settings.publicProfile ? (
                                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                    Public
                                </span>
                            ) : (
                                <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                                    Private
                                </span>
                            )}
                        </div>

                        <hr className="border-[var(--border)]" />

                        {/* TOGGLE */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm opacity-80">
                                {settings.publicProfile
                                    ? "Your profile is visible to other users"
                                    : "Only you can see your profile"}
                            </p>

                            <input
                                type="checkbox"
                                className="accent-[var(--accent)] scale-125 cursor-pointer"
                                checked={settings.publicProfile}
                                onChange={() =>
                                    saveSetting(
                                        { publicProfile: !settings.publicProfile },
                                        settings.publicProfile
                                            ? "Profile set to private"
                                            : "Profile set to public"
                                    )
                                }
                            />
                        </div>

                        {/* FOOTER INFO */}
                        <div className="text-xs opacity-60 pt-2">
                            You can change this anytime. Your data is never shared without consent.
                        </div>
                    </div>
                </section>


                {/* ================= SECURITY (2FA) ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Shield className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Security</h2>
                    </div>

                    <div className="border rounded-xl p-5 space-y-4 transition-all duration-300 ease-out
      hover:shadow-lg hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]">


                        {/* STATUS */}
                        <div className="flex items-center justify-between ">
                            <div>
                                <p className="font-medium">Two-Factor Authentication</p>
                                <p className="text-sm opacity-70">
                                    Protect your account with an authenticator app
                                </p>
                            </div>

                            {settings.twoFA?.enabled ? (
                                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                                    Enabled
                                </span>
                            ) : (
                                <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                                    Disabled
                                </span>
                            )}
                        </div>

                        {/* ENABLE BUTTON */}
                        {!settings.twoFA?.enabled && !qrCode && (
                            <Button variant="outline" onClick={handleEnable2FA} className={`text-sm rounded-full ${theme === "light" ? "bg-yellow-200 text-yellow-900 border border-yellow-200" : "bg-orange-100 text-orange-700 border border-orange-300"}`}>
                                Enable 2FA
                            </Button>
                        )}

                        {/* ENABLE FLOW */}
                        {qrCode && (
                            <div className="space-y-4 pt-4 border-t">

                                <div className="text-sm opacity-80 space-y-1">
                                    <p>1️⃣ Install Google Authenticator or Authy</p>
                                    <p>2️⃣ Scan the QR code below</p>
                                    <p>3️⃣ Enter the 6-digit code to verify</p>
                                </div>

                                <div className="flex justify-center">
                                    <img
                                        src={qrCode}
                                        alt="2FA QR Code"
                                        className="w-44 h-44 border rounded-lg p-2 bg-white"
                                    />
                                </div>

                                <input
                                    className="border rounded-lg p-3 w-full text-center tracking-widest"
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <Button
                                    className={`w-full text-sm rounded-full ${theme === "light" ? "bg-yellow-200 text-yellow-900 border border-yellow-200" : "bg-orange-100 text-orange-700 border border-orange-300"}`}
                                    onClick={handleVerify2FA}
                                    disabled={otp.length !== 6}
                                >
                                    Verify & Enable 2FA
                                </Button>
                            </div>
                        )}

                        {/* ENABLED STATE */}
                        {settings.twoFA?.enabled && !disableMode && !qrCode && (
                            <div className="pt-4 border-t space-y-3">
                                <p className="text-sm text-green-600">
                                    ✔ Your account is protected with Two-Factor Authentication
                                </p>
                            </div>
                        )}
                    </div>
                </section>


                {/* ================= ACCESSIBILITY ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Sliders className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Accessibility</h2>
                    </div>

                    <div
                        className="border rounded-xl p-5 space-y-4 transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]"
                    >
                        {/* HEADER */}
                        <div className="space-y-1">
                            <p className="font-medium">Reduce Motion</p>
                            <p className="text-sm opacity-70">
                                Minimize animations and transitions for a calmer experience
                            </p>
                        </div>

                        <hr className="border-[var(--border)]" />

                        {/* TOGGLE + STATUS */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm opacity-80">
                                {settings.reduceMotion
                                    ? "Animations are reduced across the app"
                                    : "Animations and transitions are fully enabled"}
                            </p>

                            <input
                                type="checkbox"
                                className="accent-[var(--accent)] scale-125 cursor-pointer"
                                checked={settings.reduceMotion}
                                onChange={() =>
                                    saveSetting(
                                        { reduceMotion: !settings.reduceMotion },
                                        settings.reduceMotion
                                            ? "Animations enabled"
                                            : "Motion reduced"
                                    )
                                }
                            />
                        </div>

                        {/* HELPER TEXT */}
                        <div className="text-xs opacity-60 pt-2">
                            Recommended if you experience motion sensitivity or prefer less visual movement.
                        </div>
                    </div>
                </section>


                {/* ================= LANGUAGE ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Globe className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Language</h2>
                    </div>

                    <div
                        className="border rounded-xl p-5 space-y-4 transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]"
                    >
                        {/* HEADER */}
                        <div className="space-y-1">
                            <p className="font-medium">Display Language</p>
                            <p className="text-sm opacity-70">
                                Choose the language used across the interface
                            </p>
                        </div>

                        <hr className="border-[var(--border)]" />

                        {/* SELECT */}
                        <select
                            value={settings.language}
                            onChange={(e) =>
                                saveSetting(
                                    { language: e.target.value },
                                    `Language set to ${e.target.value}`
                                )
                            }
                            className="w-full border rounded-lg p-3 bg-transparent cursor-pointer
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
        hover:border-[var(--accent)]"
                        >
                            <option value="English (US)" className="text-black">English (US)</option>
                            <option value="English (UK)" className="text-black">English (UK)</option>
                            <option value="Hindi" className="text-black">Hindi</option>
                        </select>

                        {/* CURRENT STATUS */}
                        <p className="text-xs opacity-60">
                            Current language: <span className="font-medium">{settings.language}</span>
                        </p>
                    </div>
                </section>

                {/* ================= DATA ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2">
                        <Database className="text-[var(--accent)]" />
                        <h2 className="text-lg font-semibold">Your Data</h2>
                    </div>

                    <div
                        className="border rounded-xl p-5 space-y-4 transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]"
                    >
                        {/* INFO */}
                        <div className="space-y-1">
                            <p className="font-medium">Account Data Export</p>
                            <p className="text-sm opacity-70">
                                Download a copy of your personal data including profile details,
                                settings, and activity.
                            </p>
                        </div>

                        <hr className="border-[var(--border)]" />

                        {/* ACTION */}
                        <Button
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2
        transition-all duration-300 ease-out
        hover:shadow-md hover:scale-[1.02]
        hover:border-[var(--accent)]"
                            onClick={() => toast.info("Data export will be available soon")}
                        >
                            <Database size={18} />
                            Download Account Data
                        </Button>

                        {/* FOOTNOTE */}
                        <p className="text-xs opacity-60 text-center">
                            Your data is prepared securely and will be available as a downloadable file.
                        </p>
                    </div>
                </section>


                {/* ================= DANGER ZONE ================= */}
                <section className="space-y-4 settings-card">
                    <div className="flex items-center gap-2 text-red-500">
                        <Trash2 size={18} />
                        <h2 className="text-lg font-semibold">Danger Zone</h2>
                    </div>

                    <div
                        className="border border-red-300 rounded-xl p-5 space-y-5
      bg-red-50/40 dark:bg-red-950/20
      transition-all duration-300"
                    >
                        {/* WARNING TEXT */}
                        <p className="text-sm text-red-600">
                            Actions in this section are irreversible. Please proceed with caution.
                        </p>

                        {/* LOGOUT */}
                        <div
                            className="flex items-center justify-between gap-4 p-4 rounded-lg
        transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)]"
                        >
                            <div>
                                <p className="font-medium">Logout</p>
                                <p className="text-sm opacity-70">
                                    Sign out from this device
                                </p>
                            </div>

                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="flex items-center gap-2 transition-all duration-300 ease-out
      hover:shadow-xl hover:scale-[1.02]
      hover:border-[var(--accent)]
      bg-[var(--card)] "
                            >
                                <LogOut size={18} />
                                Logout
                            </Button>
                        </div>

                        {/* DELETE ACCOUNT */}
                        <div
                            className="flex items-center justify-between gap-4 p-4 rounded-lg
        border border-red-300 bg-red-100/60 dark:bg-red-900/30
        transition-all duration-300
        hover:shadow-xl hover:scale-[1.02]"
                        >
                            <div>
                                <p className="font-medium text-red-600">Delete Account</p>
                                <p className="text-sm text-red-500">
                                    Permanently delete your account and all data
                                </p>
                            </div>

                            <Button
                                onClick={handleDeleteAccount}
                                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete
                            </Button>
                        </div>
                    </div>
                </section>


            </div>
        </div>
    );
}
