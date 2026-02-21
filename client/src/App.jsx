import React from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminPanel from "./pages/AdminPanel";
import ContactUs from "./pages/ContactUs";
import About from "./pages/About";

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
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<About />} />
          
          
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
