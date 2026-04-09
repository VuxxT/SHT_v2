import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Bảo vệ trang: Nếu không có token thì đuổi về Login
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  return (
    <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
      <h1 style={{ color: "#1e293b" }}>📊 Tổng quan sức khỏe</h1>
      <p style={{ color: "#64748b", marginTop: "10px" }}>
        Chào mừng bạn đã đăng nhập thành công. Đây là nơi hiển thị các chỉ số cá nhân của bạn.
      </p>
      
      <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
          <h4>Cân nặng gần nhất</h4>
          <h2 style={{ color: "#3b82f6" }}>65 kg</h2>
        </div>
        <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
          <h4>Chỉ số BMI</h4>
          <h2 style={{ color: "#10b981" }}>22.1</h2>
        </div>
      </div>
    </div>
  );
}