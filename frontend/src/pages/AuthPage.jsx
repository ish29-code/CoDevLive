import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // ✅ use context
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { theme } = useTheme();
  const { login, signup } = useAuth(); // ✅ useAuth instead of calling services directly

  // State for showing password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // 🔹 Login via AuthContext
        await login(email, password);
        alert(`✅ Logged in as ${email}`);
        navigate("/");
      } else {
        // 🔹 Signup via AuthContext
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
    <div
      className="flex min-h-screen items-center justify-center transition-colors duration-150"
      style={{
        background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--background) 40%, var(--gradient-end) 100%)`,
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-8 
        bg-[var(--card)] text-[var(--card-foreground)] 
        border border-[var(--border)] transition-colors duration-150"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-[var(--accent)]">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg 
              bg-[var(--card)] text-[var(--card-foreground)] 
              border-[var(--border)] focus:outline-none 
              focus:ring-2 focus:ring-[var(--ring)]"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg 
            bg-[var(--card)] text-[var(--card-foreground)] 
            border-[var(--border)] focus:outline-none 
            focus:ring-2 focus:ring-[var(--ring)]"
            required
          />

          {/* Password field with eye toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg 
              bg-[var(--card)] text-[var(--card-foreground)] 
              border-[var(--border)] focus:outline-none 
              focus:ring-2 focus:ring-[var(--ring)]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--foreground)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password (only in signup) */}
          {!isLogin && (
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg 
                bg-[var(--card)] text-[var(--card-foreground)] 
                border-[var(--border)] focus:outline-none 
                focus:ring-2 focus:ring-[var(--ring)]"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute inset-y-0 right-3 flex items-center text-[var(--foreground)]"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold hover:underline text-[var(--accent)]"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
