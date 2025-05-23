// App.jsx
import React from "react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";

import Products from "./pages/inventoryManagement/Products";
import Dashboard from "./pages/Dashboard";
import "./styles/global.css";
import NewSale from "./pages/NewSale";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} /> {/* Default route */}
        <Route path="/new-sale" element={<NewSale />} /> {/* Route for Sale */}
        <Route path="/products" element={<Products />} /> {/* Route for Sale */}
        {/* Add other routes if needed */}
      </Routes>
    </Router>
  );
}
