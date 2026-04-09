import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./MainLayout"; 
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import AITest from "../pages/AITest";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang Login không dùng Layout */}
        <Route path="/" element={<Login />} />

        {/* Các trang dùng chung Layout Sidebar/Header */}
        <Route path="/Dashboard" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />

        <Route path="/ai" element={
          <MainLayout>
            <AITest />
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}