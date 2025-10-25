import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import MallMap from "./components/maps/MallMap";
import MallDetails from "./pages/MallDetails";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AuthService from "./utils/AuthService";
import SessionHandler from "./components/SessionHandler"; // ✅ Import session handler

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isAuthenticated());

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.log("⛔ No token found. Skipping session check.");
      return;
    }

    const checkSessionExpiration = async () => {
      try {
        const response = await AuthService.checkStatus(); // ✅ Make sure this calls /auth/status
        if (!response.status) {
          console.log("🚨 Session expired! Logging out...");
          AuthService.logout();
          setIsLoggedIn(false);
        } else {
          console.log("✅ Session valid:", response.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        const error = err as Error;
        console.error("❌ Session check failed:", error.message);
        AuthService.logout();
        setIsLoggedIn(false);
      }
    };

    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsLoggedIn(AuthService.isAuthenticated());
    };

    window.addEventListener("storage", handleAuthChange);
    return () => window.removeEventListener("storage", handleAuthChange);
  }, []);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/mall-map"
          element={
            <>
              <SessionHandler />
              <MallMap />
            </>
          }
        />
        <Route
          path="/mall/:id"
          element={
            <>
              <SessionHandler />
              <MallDetails />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;