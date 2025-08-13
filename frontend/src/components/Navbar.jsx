import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Example 35 features (replace/add as needed)
  const features = [
    "Real-time Code Editor", "Collaborative Chat", "Interview Mode", "DSA Tracker",
    "AI Code Suggestions", "Version Control", "Code Execution Sandbox", "Syntax Highlighting",
    "Custom Themes", "Whiteboard Mode", "Voice Chat", "Screen Sharing", "Debugging Tools",
    "Snippet Library", "Terminal Access", "API Testing", "GitHub Integration", "Pair Programming",
    "Session Recording", "Offline Mode", "Code Review Tools", "Markdown Support", "Unit Testing",
    "Keyboard Shortcuts", "Project Templates", "Emoji Reactions", "Code Formatting", "Live Cursor",
    "Tab Management", "Branch Management", "Bug Tracking", "User Profiles", "Two-Factor Auth",
    "Admin Dashboard", "Analytics"
  ];

  return (
    <nav className="bg-[var(--background)] border-b border-[var(--border)] relative">
      <div className="container-center flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-[var(--accent)]">CoDevLive</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#home" className="nav-link">Home</a>
          <a href="#about" className="nav-link">About</a>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link">Features</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] max-h-80 overflow-y-auto">
              {features.map((feature, index) => (
                <DropdownMenuItem key={index}>{feature}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="#contact" className="nav-link">Contact</a>

          {/* Theme Toggle */}
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Sun size={20} className="text-gray-800" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </Button>

          {/* Auth Buttons */}
          <button className="btn-outline">Login</button>
          <button className="btn-primary">Sign Up</button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon size={20} className="text-gray-800" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </Button>
          <Menu
            onClick={() => setMenuOpen(true)}
            className="cursor-pointer text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {menuOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-[var(--background)] border-r border-[var(--border)] z-50 flex flex-col p-6 space-y-4 transition-transform duration-300">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[var(--accent)]">Menu</h2>
            <X onClick={() => setMenuOpen(false)} className="cursor-pointer text-[var(--foreground)]" />
          </div>
          <a href="#home" className="block nav-link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" className="block nav-link" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#features" className="block nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#contact" className="block nav-link" onClick={() => setMenuOpen(false)}>Contact</a>
          <button className="btn-outline w-full">Login</button>
          <button className="btn-primary w-full">Sign Up</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
