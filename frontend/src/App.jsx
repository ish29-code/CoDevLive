import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./context/ThemeContext";

import Home from "./pages/Home";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";

/* ================= INTERVIEW PAGES ================= */
import InterviewHome from "./pages/InterviewHome";
import InterviewLobby from "./pages/InterviewLobby";
import InterviewRoom from "./pages/InterviewRoom";

const App = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow bg-[var(--background)] text-[var(--foreground)]">
          <Routes>
            {/* BASIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/authpage" element={<AuthPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ================= INTERVIEW FLOW ================= */}
            {/* Entry Page */}
            <Route path="/interview" element={<InterviewHome />} />

            {/* Lobby (camera + mic check) */}
            <Route path="/interview/lobby/:roomId" element={<InterviewLobby />} />

            {/* Actual Interview Room */}
            <Route path="/interview/room/:roomId" element={<InterviewRoom />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
