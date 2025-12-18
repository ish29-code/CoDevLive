import React, { useState } from "react";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../components/ui/dropdown-menu";
import { Sun, Moon, Menu, X, User, ChevronDown } from "lucide-react";
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
    { label: "Profile", path: "/profile" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="bg-[var(--background)] border-b border-[var(--border)]">
      <div className="container-center flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold text-[var(--accent)]">
          CoDevLive
        </Link>

        {/* ===== Desktop Menu ===== */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>

          {/* Desktop Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link">
                Features
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--card)] border max-h-80 overflow-y-auto">
              {features.map((item, i) => (
                <DropdownMenuItem key={i} asChild>
                  <Link to={item.path} className="w-full cursor-pointer">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/interview" className="nav-link">Interview</Link>

          {/* Profile */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full">
                  <User size={20} className={theme === "light" ? "text-gray-800" : "text-white"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[var(--card)] border">
                {profileFeatures.map((item, i) => (
                  <DropdownMenuItem key={i} asChild>
                    <Link to={item.path} className="w-full cursor-pointer">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme */}
          <Button variant="ghost" onClick={toggleTheme}> 
            {theme === "light" ? 
               ( <Sun size={20} className="text-gray-800" /> ) : 
               ( <Moon size={20} className="text-white" /> )} 
          </Button>

          {/* Auth */}
          {!user ? (
            <>
              <Link to="/authpage">
                <Button className="btn-outline">Login</Button>
              </Link>
              <Link to="/authpage">
                <Button className="btn-primary">Sign Up</Button>
              </Link>
            </>
          ) : (
            <Button onClick={logout} className="btn-outline">
              Logout
            </Button>
          )}
        </div>

        {/* ===== Mobile Menu Button ===== */}
        <div className="md:hidden flex items-center gap-3">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? 
               ( <Sun size={20} className="text-gray-800" /> ) : 
               ( <Moon size={20} className="text-white" /> )} 
          </Button>
          <Menu onClick={() => setMenuOpen(true)} />
        </div>
      </div>

      {/* ===== Mobile Sidebar ===== */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-[var(--background)] w-64 h-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Menu</h2>
              <X onClick={() => setMenuOpen(false)} />
            </div>

            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>

            {/* ✅ Mobile Features Dropdown */}
            <div>
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className="w-full flex justify-between items-center font-medium"
              >
                Features
                <ChevronDown
                  size={18}
                  className={`transition-transform ${featuresOpen ? "rotate-180" : ""}`}
                />
              </button>

              {featuresOpen && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {features.map((item, i) => (
                    <Link
                      key={i}
                      to={item.path}
                      onClick={() => {
                        setMenuOpen(false);
                        setFeaturesOpen(false);
                      }}
                      className="text-sm text-muted-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!user ? (
              <>
                <Link to="/authpage">
                  <Button>Login</Button>
                </Link>
                <Link to="/authpage">
                  <Button>Sign Up</Button>
                </Link>
              </>
            ) : (
              <Button onClick={logout}>Logout</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

