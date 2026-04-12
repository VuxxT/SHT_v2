import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- COMPONENT THEO DÕI NƯỚC ---
function WaterTracker({ currentWeight }) {
  const [drank, setDrank] = useState(0);
  const weightNum = parseFloat(currentWeight) || 60;
  const goal = Math.round(weightNum * 35);
  const addWater = () => setDrank(prev => Math.min(prev + 250, goal));
  const resetWater = () => setDrank(0);

  return (
    <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginTop: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#1e293b", fontSize: "20px" }}>💧 Theo dõi nước uống</h2>
        <button onClick={resetWater} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px" }}>Đặt lại</button>
      </div>
      <p style={{ color: "#64748b", margin: "10px 0" }}>Mục tiêu ({weightNum}kg): <b>{goal}ml</b></p>
      <div style={{ width: "100%", backgroundColor: "#e2e8f0", height: "25px", borderRadius: "20px", overflow: "hidden", margin: "20px 0" }}>
        <div style={{ width: `${Math.min((drank / goal) * 100, 100)}%`, height: "100%", backgroundColor: "#3b82f6", transition: "width 0.5s", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px" }}>
          {Math.round((drank / goal) * 100)}%
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Đã uống: <b>{drank}ml</b></span>
        <button onClick={addWater} style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>+ 250ml</button>
      </div>
    </div>
  );
}

// --- COMPONENT CHÍNH: DASHBOARD ---
export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Lấy dữ liệu lịch sử từ Backend
  const fetchHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/health/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.status === 401 || res.status === 403) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Xử lý lưu chỉ số mới
  const handleSaveHealth = async (e) => {
    e.preventDefault();
    if (!weight || !height) return alert("Vui lòng nhập đầy đủ thông tin!");
    
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/api/health/log", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          weight: parseFloat(weight), 
          height: parseFloat(height) 
        }), 
      });

      const data = await res.json();

      if (res.ok) {
        alert("Cập nhật thành công!");
        setWeight(""); 
        // Sau khi lưu xong, gọi fetchHistory để cập nhật con số BMI và biểu đồ ngay lập tức
        fetchHistory(); 
      } else {
        alert(data.error || "Lỗi lưu nhật ký");
      }
    } catch (err) {
      alert("Không thể kết nối Server!");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) return null;

  // Lấy bản ghi cuối cùng để hiển thị lên 2 ô Tổng quan
  const latestData = history.length > 0 
    ? history[history.length - 1] 
    : { weight: "--", bmi: "--" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* 1. Form Nhập Chỉ Số */}
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h2 style={{ color: "#1e293b", fontSize: "20px", marginBottom: "20px" }}>📝 Nhập chỉ số hôm nay</h2>
        <form onSubmit={handleSaveHealth} style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "5px" }}>Cân nặng (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} placeholder="VD: 65.5" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: "14px", color: "#64748b", marginBottom: "5px" }}>Chiều cao (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }} placeholder="VD: 170" />
          </div>
          <button type="submit" disabled={loading} style={{ padding: "10px 25px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}>
            {loading ? "Đang lưu..." : "Lưu chỉ số"}
          </button>
        </form>
      </div>

      {/* 2. Khối Tổng quan */}
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ color: "#1e293b", fontSize: "24px", margin: 0 }}>📊 Chỉ số sức khỏe mới nhất</h1>
        <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px", textAlign: "center" }}>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Cân nặng hiện tại</p>
            <h2 style={{ color: "#3b82f6", fontSize: "32px", margin: "10px 0" }}>
                {latestData.weight} <span style={{fontSize: "16px"}}>kg</span>
            </h2>
          </div>
          <div style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "10px", textAlign: "center" }}>
            <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>Chỉ số BMI</p>
            <h2 style={{ color: "#10b981", fontSize: "32px", margin: "10px 0" }}>
              {latestData.bmi && latestData.bmi !== "NULL" ? latestData.bmi : "--"}
            </h2>
          </div>
        </div>
      </div>

      {/* 3. Khối Biểu đồ */}
      <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "20px", color: "#1e293b", fontSize: "20px" }}>📈 Xu hướng BMI gần đây</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(str) => str ? new Date(str).toLocaleDateString('vi-VN') : ""} 
                style={{ fontSize: '12px' }} 
              />
              <YAxis domain={['auto', 'auto']} style={{ fontSize: '12px' }} />
              <Tooltip 
                labelFormatter={(str) => "Ngày đo: " + new Date(str).toLocaleDateString('vi-VN')} 
                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="bmi" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: "#4f46e5" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <WaterTracker currentWeight={latestData.weight} />
      
    </div>
  );
}