import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Mail, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const { theme } = useTheme();
  const { login, signup, resetPassword, loginWithGoogle, loginWithGitHub } =
    useAuth();

  const navigate = useNavigate();
  const inputClass =
    theme === "light"
      ? "text-black placeholder:text-gray-500"
      : "text-white placeholder:text-gray-400";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 👁️ show / hide states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isReset) {
        await resetPassword(email);
        alert(`📧 Password reset link sent to ${email}`);
        setIsReset(false);
        return;
      }

      if (isLogin) {
        await login(email, password);
        alert("✅ Logged in successfully!");
        navigate("/");
      } else {
        if (password !== confirmPassword) {
          alert("❌ Passwords do not match");
          return;
        }
        await signup(fullName, email, password);
        alert("✅ Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.message || "Something went wrong");
    }
  };

  // Google login
  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch {
      alert("❌ Google Sign-in failed");
    }
  };

  // GitHub login
  const handleGithub = async () => {
    try {
      await loginWithGitHub();
      navigate("/");
    } catch {
      alert("❌ GitHub Sign-in failed");
    }
  };

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--gradient-start)] via-[var(--background)] to-[var(--gradient-end)] ${theme === "light" ? "text-black" : "text-white"}`}>
      <Card className="w-full max-w-md p-6 shadow-xl border-[var(--border)] bg-[var(--card)]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[var(--accent)]">
            {isReset ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Social Login */}
          {!isReset && (
            <div className="space-y-3">
              <Button variant="outline" onClick={handleGoogle} className="w-full">
                <Mail size={18} className="mr-2" /> Continue with Gmail
              </Button>

              <Button variant="outline" onClick={handleGithub} className="w-full">
                <Github size={18} className="mr-2" /> Continue with GitHub
              </Button>

              <div className="flex items-center my-3">
                <hr className="flex-grow" />
                <span className="px-3 text-sm text-gray-500">OR</span>
                <hr className="flex-grow" />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={`space-y-4 ${theme === "light" ? "text-black" : "text-white"}`}>
            {isReset ? (
              <>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  className={inputClass}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full btn-primary">
                  Send Reset Link
                </Button>
              </>
            ) : (
              <>
                {!isLogin && (
                  <Input
                    type="text"
                    placeholder="Full Name"
                    className={inputClass}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                )}

                <Input
                  type="email"
                  placeholder="Email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* Password */}
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={inputClass}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password */}
                {!isLogin && (
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className={inputClass}
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full btn-primary">
                  {isLogin ? "Login" : "Sign Up"}
                </Button>
              </>
            )}
          </form>

          {/* Links */}
          <div className="text-center mt-4 text-sm">
            {isReset ? (
              <button
                onClick={() => setIsReset(false)}
                className="text-[var(--accent)] hover:underline"
              >
                Back to Login
              </button>
            ) : isLogin ? (
              <>
                <button
                  onClick={() => setIsReset(true)}
                  className="block mb-2 text-[var(--accent)] hover:underline"
                >
                  Forgot Password?
                </button>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-[var(--accent)] hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-[var(--accent)] hover:underline font-semibold"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
