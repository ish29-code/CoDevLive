import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { Sun, Moon, Menu, X, User, Link2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user,  logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const profileFeatures = ["User Profiles", "Settings"];
  return (
    <nav className="bg-[var(--background)] border-b border-[var(--border)] relative">
      <div className="container-center flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold text-[var(--accent)]">CoDevLive</h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link">Features</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)] max-h-80 overflow-y-auto">
              {features.map((feature, index) => (
                <DropdownMenuItem key={index} className="cursor-pointer">{feature}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/interview" className="nav-link">Interview</Link>

          {/* Profile Dropdown (Desktop) */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full">
                  <User size={20} className={theme === "light" ? "text-gray-800" : "text-white"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)]">
                {profileFeatures.map((feature, index) => (
                  <DropdownMenuItem key={index} className="cursor-pointer">{feature}</DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Sun size={20} className="text-gray-800" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </Button>

          {/* Auth Buttons (Only show if NOT logged in) */}
          {!user ? (
            <>
              <div className="flex space-x-2">
                <Link to="/authpage"><Button className="btn-outline" >Login</Button></Link>
                <Link to="/authpage"><Button className="btn-primary" >Sign Up</Button></Link>
              </div>
            </>
          ) : (
            <Button onClick={logout} className="btn-outline">Logout</Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Profile Dropdown (Mobile) */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full">
                  <User size={20} className={theme === "light" ? "text-gray-800" : "text-white"} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--border)]">
                {profileFeatures.map((feature, index) => (
                  <DropdownMenuItem key={index} className="cursor-pointer">{feature}</DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={logout} className="cursor-pointer">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon size={20} className="text-gray-800" />
            ) : (
              <Moon size={20} className="text-white" />
            )}
          </Button>

          {/* Mobile menu open button */}
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
          <Link to="/" className="block nav-link cursor-pointer" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className="block nav-link cursor-pointer" onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/features" className="block nav-link cursor-pointer" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link to="/interview" className="block nav-link cursor-pointer" onClick={() => setMenuOpen(false)}>Interview</Link>

          
          {!user ? (
            <>
                <Link to="/authpage"><Button className="btn-outline" >Login</Button></Link>
                <Link to="/authpage"><Button className="btn-primary" >Sign Up</Button></Link>
            </>   
            
          ) : (
            <button onClick={logout} className="btn-outline w-full">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

