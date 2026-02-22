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

  const [ready, setReady] = useState(false); // wait for guest token before rendering

  const [catMode,      setCatMode]      = useState(false);
  const [catColor,     setCatColor]     = useState("#c4956a");
  const [accessory,    setAccessory]    = useState("none");
  const [catHappiness, setCatHappiness] = useState(10);
  const [platform,     setPlatform]     = useState("spotify");
  const [darkMode,     setDarkMode]     = useState(false);
  const [showPlayer,   setShowPlayer]   = useState(false);

  // Auto guest login — blocks render until token is ready
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { setReady(true); return; }

    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
      guestId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("guestId", guestId);
    }

    api.post("/auth/guest", { guestId })
      .then(res => {
        localStorage.setItem("token", res.data.token);
        setReady(true);
      })
      .catch(() => setReady(true)); // still render even if guest login fails
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("catmode", catMode);
  }, [darkMode, catMode]);

  if (!ready) return (
    <div style={{
      minHeight: "100vh", background: "#fdf6ed",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Nunito, sans-serif", color: "#c4a882", fontSize: "1rem",
    }}>
      🐱 Loading...
    </div>
  );

  const sharedProps = {
    darkMode, setDarkMode, catMode, setCatMode,
    catColor, setCatColor, accessory, setAccessory,
    platform, setPlatform, showPlayer, setShowPlayer,
  };

  return (
    <>
      {!hideNavbar && <Navbar {...sharedProps} isHome={isHome} />}
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} catMode={catMode} />} />
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
