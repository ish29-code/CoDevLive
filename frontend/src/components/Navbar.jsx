// src/components/Navbar.jsx
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../components/ui/dropdown-menu";

import { Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
          DevSphere
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <a href="#home" className="hover:text-yellow-500 dark:hover:text-yellow-400">Home</a>
          <a href="#about" className="hover:text-yellow-500 dark:hover:text-yellow-400">About</a>

          {/* Features Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hover:text-yellow-500 dark:hover:text-yellow-400">
                Features
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Real-time Code Editor</DropdownMenuItem>
              <DropdownMenuItem>Collaborative Chat</DropdownMenuItem>
              <DropdownMenuItem>Interview Mode</DropdownMenuItem>
              <DropdownMenuItem>DSA Tracker</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="#contact" className="hover:text-yellow-500 dark:hover:text-yellow-400">Contact</a>

          {/* Theme Toggle */}
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          {/* Auth Buttons */}
          <Button variant="outline">Login</Button>
          <Button className="bg-yellow-500 text-white hover:bg-yellow-600">Sign Up</Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </Button>
          <Menu onClick={() => setMenuOpen(!menuOpen)} className="cursor-pointer" />
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 py-4 bg-white dark:bg-gray-800 space-y-4">
          <a href="#home" className="block hover:text-yellow-500 dark:hover:text-yellow-400">Home</a>
          <a href="#about" className="block hover:text-yellow-500 dark:hover:text-yellow-400">About</a>
          <a href="#features" className="block hover:text-yellow-500 dark:hover:text-yellow-400">Features</a>
          <a href="#contact" className="block hover:text-yellow-500 dark:hover:text-yellow-400">Contact</a>
          <Button variant="outline" className="w-full">Login</Button>
          <Button className="bg-yellow-500 text-white hover:bg-yellow-600 w-full">Sign Up</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
