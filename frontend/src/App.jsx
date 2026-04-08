import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AITest from "../pages/AITest";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai" element={<AITest />} />
      </Routes>
    </BrowserRouter>
  );
}