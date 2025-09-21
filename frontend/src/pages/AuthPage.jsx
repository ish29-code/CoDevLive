import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Mail } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false); // reset password mode
  const { theme } = useTheme();
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isReset) {
        alert(`📧 Reset link sent to ${email}`);
        setIsReset(false);
        return;
      }

      if (isLogin) {
        await login(email, password);
        alert("✅ Logged in!");
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
      console.error(err);
      alert("❌ " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--gradient-start)] via-[var(--background)] to-[var(--gradient-end)]">
      <Card className="w-full max-w-md p-6 shadow-xl border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[var(--accent)]">
            {isReset ? "Reset Password" : isLogin ? "Login" : "Sign Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Social login buttons */}
          {!isReset && (
            <div className="space-y-3">
              <Button variant="outline" onClick={() => window.location.href = "http://localhost:5000/api/auth/google"} className="w-full flex items-center gap-2">
                <Mail size={18} /> Continue with Gmail
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "http://localhost:5000/api/auth/github"} className="w-full flex items-center gap-2">
                <Github size={18} /> Continue with GitHub
              </Button>
              <div className="flex items-center my-3">
                <hr className="flex-grow border-[var(--border)]" />
                <span className="px-3 text-sm text-gray-500">OR</span>
                <hr className="flex-grow border-[var(--border)]" />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isReset ? (
              <>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                )}
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {!isLogin && (
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
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
