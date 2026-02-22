import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import "./index.css";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import api from "./services/api";

function AppLayout() {
  const location = useLocation();
  const hideNavbar = ["/login"].includes(location.pathname);
  const isHome = location.pathname === "/";

  const [catMode,      setCatMode]      = useState(false);
  const [catColor,     setCatColor]     = useState("#c4956a");
  const [accessory,    setAccessory]    = useState("none");
  const [catHappiness, setCatHappiness] = useState(10);
  const [platform,     setPlatform]     = useState("spotify");
  const [darkMode,     setDarkMode]     = useState(false);
  const [showPlayer,   setShowPlayer]   = useState(false);

  // Auto guest login — runs once on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) return; // already logged in (guest or real account)

    // Generate or retrieve a stable guest ID for this browser
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("guestId", guestId);
    }

    api.post("/auth/guest", { guestId })
      .then(res => localStorage.setItem("token", res.data.token))
      .catch(err => console.error("Guest login failed", err));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const sharedProps = {
    darkMode, setDarkMode, catMode, setCatMode,
    catColor, setCatColor, accessory, setAccessory,
    platform, setPlatform, showPlayer, setShowPlayer
  };

  return (
    <>
      {!hideNavbar && <Navbar {...sharedProps} isHome={isHome} />}
      <Routes>
        <Route path="/"      element={<Home darkMode={darkMode} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/music" element={<Dashboard {...sharedProps} onHappinessChange={setCatHappiness} />} />
        <Route path="/games" element={<Games {...sharedProps} catHappiness={catHappiness} />} />
      </Routes>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter><AppLayout /></BrowserRouter>
);
