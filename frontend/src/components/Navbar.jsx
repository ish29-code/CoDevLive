import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle2
} from "lucide-react";
import { assets } from "@/assets/assets";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { features } from "@/data/features";
const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const profileFeatures = [
    { label: "Profile", path: "/profile", icon: User },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  // 🔹 Reusable Avatar
  const ProfileAvatar = ({ size = "w-8 h-8" }) => {
    return user?.photoURL ? (
      <img
        src={user.photoURL}
        alt="profile"
        className={`${size} rounded-full object-cover`}
      />
    ) : (
      <img
        src={assets.emptylogo}
        alt="default avatar"
        className={`${size} rounded-full object-cover opacity-80`}
      />
    );
  };
  return (
    <nav className="bg-[var(--background)] border-b border-[var(--border)]">
      <div className="container-center flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold text-[var(--accent)]">
          CoDevLive
        </Link>

        {/* ================= Desktop Menu ================= */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>

          {/* Features */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link">
                Features
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--card)] border max-h-80 overflow-y-auto">
              {features.map((item, i) => (
                <DropdownMenuItem key={i} asChild>
                  <Link
                    to={item.path}
                    className={`w-full ${theme === "light"
                      ? "text-black hover:text-yellow-600"
                      : "text-white hover:text-orange-400"
                      }`}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/interview" className="nav-link">Interview</Link>

          {/* Profile Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full">
                  <ProfileAvatar />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className={`${theme === "light"
                  ? "bg-white border border-gray-200"
                  : "bg-black border border-gray-700 text-white"
                  }`}
              >
                {profileFeatures.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <Link to={item.path} className="flex items-center">
                      <item.icon className="w-5 h-5 mr-2" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme */}
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Sun size={20} className="text-gray-800" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </Button>

          {/* Auth */}
          {!user ? (
            <>
              <Link to="/authpage"><Button className="btn-outline">Login</Button></Link>
              <Link to="/authpage"><Button className="btn-primary">Sign Up</Button></Link>
            </>
          ) : (
            <Button onClick={logout} className="btn-outline">Logout</Button>
          )}
        </div>

        {/* ================= Mobile Top Icons ================= */}
        <div className="md:hidden flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full">
                  <ProfileAvatar size="w-9 h-9" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="bg-[var(--card)] border w-44">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="w-5 h-5 mr-2" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-5 h-5 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Sun size={20} className="text-gray-800" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </Button>

          <Menu
            onClick={() => setMenuOpen(true)}
            className={`cursor-pointer ${theme === "dark" ? "text-white" : "text-black"}`}
          />
        </div>
      </div>

      {/* ================= Mobile Sidebar ================= */}
      {
        menuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50">
            <div
              className={`
              w-72 h-full p-6
              border-r border-[var(--border)]
              shadow-2xl flex flex-col
              ${theme === "light"
                  ? "bg-gradient-to-b from-yellow-50 via-white to-yellow-100"
                  : "bg-gradient-to-b from-black via-zinc-900 to-orange-950"}
            `}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-[var(--foreground)]">Menu</h2>
                <X onClick={() => setMenuOpen(false)}
                  className={`cursor-pointer ${theme === "dark" ? "text-white" : "text-black"}`}
                />
              </div>

              {/* Links */}
              <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link">Home</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="nav-link">About</Link>

              {/* Features */}
              <div className="mt-4 flex-1">
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  className={`
                  w-full flex justify-between items-center
                  px-2 py-2 rounded-md font-medium transition
                  ${theme === "light"
                      ? "text-black hover:bg-yellow-200"
                      : "text-white hover:bg-orange-900"}
                  hover:bg-black/5 dark:hover:bg-white/10
                `}
                >
                  <span>Features</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${featuresOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {featuresOpen && (
                  <div className="mt-2 ml-2 pl-3 border-l border-[var(--border)] max-h-[55vh] overflow-y-auto space-y-2 pr-2">
                    {features.map((item, i) => (
                      <Link
                        key={i}
                        to={item.path}
                        onClick={() => {
                          setMenuOpen(false);
                          setFeaturesOpen(false);
                        }}
                        className={`
                        block text-sm transition
                        ${theme === "dark"
                            ? "text-white hover:text-orange-400"
                            : "text-[var(--muted-foreground)] hover:text-yellow-600"}
                      `}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth Section */}
              <div className="pt-4 border-t border-[var(--border)] space-y-3">
                {!user ? (
                  <>
                    <Link to="/authpage"><Button className="w-full btn-outline">Login</Button></Link>
                    <Link to="/authpage"><Button className="w-full btn-primary">Sign Up</Button></Link>
                  </>
                ) : (
                  <Button
                    onClick={logout}
                    className={`w-full font-semibold ${theme === "light"
                      ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                      : "bg-orange-600 hover:bg-orange-700 text-white"
                      }`}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      }
    </nav >
  );
};

export default Navbar;
