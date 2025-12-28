import React from "react";
import { Routes, Route } from "react-router-dom"; // ⬅️ no BrowserRouter here
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import Interview from "./pages/Interview";


const App = () => {
  return (
    <ThemeProvider>
      <div className="max-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/authpage" element={<AuthPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;





