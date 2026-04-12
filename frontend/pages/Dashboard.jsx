import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../src/css/dashboard.css';

// --- COMPONENT NHỎ: THEO DÕI NƯỚC (Giữ nguyên logic của bạn nhưng tối ưu hiển thị) ---
function WaterTracker({ currentWeight }) {
  const [drank, setDrank] = useState(0);
  const weightNum = parseFloat(currentWeight) || 60;
  const goal = Math.round(weightNum * 35);

  const addWater = () => setDrank(prev => Math.min(prev + 250, goal));
  const resetWater = () => setDrank(0);

  return (
    <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#1e293b", fontSize: "20px" }}>💧 Theo dõi nước uống</h2>
        <button onClick={resetWater} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}>Đặt lại</button>
      </div>
      
      <p style={{ color: "#64748b", margin: "10px 0" }}>Mục tiêu dựa trên cân nặng ({weightNum}kg): <b>{goal}ml</b></p>
      
      <div style={{ width: "100%", backgroundColor: "#e2e8f0", height: "25px", borderRadius: "20px", overflow: "hidden", margin: "20px 0" }}>
        <div style={{ 
          width: `${(drank / goal) * 100}%`, 
          height: "100%", 
          backgroundColor: "#3b82f6", 
          transition: "width 0.5s ease-out",
          display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px"
        }}>
          {Math.round((drank / goal) * 100)}%
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Đã uống: <b>{drank}ml</b></span>
        <button onClick={addWater} style={{ 
          padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", 
          border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
        }}>
          + 250ml
        </button>
      </div>
    </div>
  );
}

// --- COMPONENT CHÍNH: DASHBOARD ---
export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isChecking, setIsChecking] = useState(true); // Trạng thái kiểm tra token ban đầu

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Nếu không có token, chuyển hướng ngay lập tức
    if (!token || token === "undefined") {
      navigate("/login");
      return;
    }

    // Nếu có token, tiến hành lấy dữ liệu
    setIsChecking(false); 

    fetch("http://localhost:3000/api/health/history", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          // Token giả hoặc hết hạn
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(err => console.error("Lỗi hệ thống:", err));
  }, [navigate]);

  // Trong khi đang kiểm tra token, trả về rỗng để tránh nháy giao diện
  if (isChecking) return null;

  const latestData = history.length > 0 ? history[history.length - 1] : { weight: 0, bmi: "--" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", paddingBottom: "40px" }}>
      
      {/* 1. Khối Tổng quan */}
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ color: "#1e293b", fontSize: "24px", margin: 0 }}>📊 Chỉ số sức khỏe mới nhất</h1>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px", textAlign: "center" }}>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Cân nặng hiện tại</p>
            <h2 style={{ color: "#3b82f6", fontSize: "32px", margin: "10px 0" }}>
                {latestData.weight || "--"} <span style={{fontSize: "16px"}}>kg</span>
            </h2>
          </div>
          <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px", textAlign: "center" }}>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Chỉ số BMI</p>
            <h2 style={{ color: "#10b981", fontSize: "32px", margin: "10px 0" }}>
                {latestData.bmi || "--"}
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Khối Biểu đồ */}
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ marginBottom: "20px", color: "#1e293b", fontSize: "20px" }}>📈 Xu hướng BMI gần đây</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(str) => new Date(str).toLocaleDateString('vi-VN')} 
                style={{ fontSize: '12px' }}
              />
              <YAxis domain={['auto', 'auto']} style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelFormatter={(str) => "Ngày đo: " + new Date(str).toLocaleDateString('vi-VN')}
              />
              <Line 
                type="monotone" 
                dataKey="bmi" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Khối Theo dõi nước */}
      <WaterTracker currentWeight={latestData.weight} />

    </div>
  );
}