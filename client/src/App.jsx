import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import AIAssessment from "./pages/AIAssessment";

// Layout wrapper to conditionally show navbar
const AppLayout = ({ children }) => {
  const location = useLocation();
  // Hide navbar for admin routes that use DashboardLayout
  const hideNavbar = location.pathname.startsWith('/admin/ai-assessment');
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
};

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Toaster />
        <AppLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/adminpanel" element={<AdminPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/ai-assessment" element={<AIAssessment />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<About />} />
            <Route path="/ai" element={<CardioAI />} />
            <Route path="/ai-history" element={<AIHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </>
  );
};

export default App;
