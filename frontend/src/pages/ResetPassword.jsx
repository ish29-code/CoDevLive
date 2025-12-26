import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordLocal } from "../api/userApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <p className="text-red-500 font-medium">Invalid or expired reset link</p>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await resetPasswordLocal({ token, newPassword: password });
            toast.success("Password reset successful! Please login.");
            navigate("/authpage");
        } catch (err) {
            toast.error(err.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="
        min-h-screen flex items-center justify-center
        bg-gradient-to-br
        from-[var(--gradient-start)]
        to-[var(--gradient-end)]
        px-4
      "
        >
            <form
                onSubmit={handleSubmit}
                className="
          w-full max-w-md
          bg-[var(--card)]
          text-[var(--card-foreground)]
          border border-[var(--border)]
          rounded-2xl
          shadow-xl
          p-8
          space-y-6
        "
            >
                {/* Header */}
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold">Reset Password</h2>
                    <p className="text-sm opacity-70">
                        Enter a new password for your account
                    </p>
                </div>

                {/* New Password */}
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-transparent pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-transparent pr-10"
                    />
                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </Button>

                {/* Footer */}
                <p className="text-xs text-center opacity-60">
                    After resetting, you will be redirected to login
                </p>
            </form>
        </div>
    );
}
