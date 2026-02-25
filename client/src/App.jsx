import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import ContactUs from "./pages/ContactUs";
import About from "./pages/About";
import CardioAI from "./pages/CardioAI";
import AIHistory from "./components/Customer/AIHistory";
import Reports from "./pages/Reports";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Toaster />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          <Route path="/ai" element={<CardioAI />} />
          <Route path="/ai-history" element={<AIHistory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Catch-all: redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
