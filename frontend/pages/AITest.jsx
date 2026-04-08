import { useState } from "react";

export default function AITest() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateBMI = () => {
    const value = (weight / ((height / 100) ** 2)).toFixed(2);
    setBmi(value);
    return value;
  };

  const getStatus = (bmi) => {
    if (bmi < 18.5) return { text: "Gầy", color: "#3b82f6" };
    if (bmi < 24.9) return { text: "Bình thường", color: "#22c55e" };
    if (bmi < 29.9) return { text: "Thừa cân", color: "#f59e0b" };
    return { text: "Béo phì", color: "#ef4444" };
  };

  const callAI = async () => {
    if (!weight || !height) {
      alert("Nhập đầy đủ!");
      return;
    }

    const bmiValue = calculateBMI();

    setLoading(true);
    setResult("");

    try {
      // Giữ nguyên fetch gốc, chỉ thêm domain localhost để đảm bảo kết nối
      const res = await fetch("http://localhost:3000/api/ai/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight,
          height,
          bmi: bmiValue,
        }),
      });

      const data = await res.json();
      setResult(data.advice);

    } catch (err) {
      setResult("❌ Không kết nối backend");
    }

    setLoading(false);
  };

  const status = bmi ? getStatus(bmi) : null;

  // Giao diện mới nâng cấp UX/UI
  return (
    <div style={{ 
      maxWidth: 450, 
      margin: "40px auto", 
      padding: "30px",
      textAlign: "center", 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#1e293b", marginBottom: "25px", fontSize: "24px" }}>
        🤖 AI Health Analyzer
      </h2>

      <div style={{ marginBottom: "15px" }}>
        <input
          type="number"
          placeholder="Cân nặng (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          style={{ 
            width: "100%", padding: "12px", marginBottom: "12px", 
            borderRadius: "10px", border: "1px solid #e2e8f0",
            fontSize: "16px", boxSizing: "border-box", outline: "none"
          }}
        />

        <input
          type="number"
          placeholder="Chiều cao (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          style={{ 
            width: "100%", padding: "12px", marginBottom: "20px", 
            borderRadius: "10px", border: "1px solid #e2e8f0",
            fontSize: "16px", boxSizing: "border-box", outline: "none"
          }}
        />
      </div>

      <button 
        onClick={callAI} 
        disabled={loading}
        style={{ 
          padding: "14px", width: "100%", 
          backgroundColor: loading ? "#94a3b8" : "#4f46e5",
          color: "white", border: "none", borderRadius: "10px",
          fontSize: "16px", fontWeight: "600", cursor: "pointer",
          transition: "background 0.3s ease"
        }}
      >
        {loading ? "⌛ Đang phân tích..." : "Phân tích ngay"}
      </button>

      {/* Kết quả BMI - Thiết kế dạng Card */}
      {bmi && (
        <div style={{ 
          marginTop: "25px", padding: "20px", 
          backgroundColor: "#f8fafc", borderRadius: "15px",
          border: "1px solid #f1f5f9"
        }}>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Chỉ số BMI của bạn</p>
          <h3 style={{ margin: "5px 0", fontSize: "32px", color: "#1e293b" }}>{bmi}</h3>
          <div style={{ 
            display: "inline-block", padding: "5px 15px", 
            borderRadius: "20px", backgroundColor: status.color + "20",
            color: status.color, fontWeight: "bold", fontSize: "14px"
          }}>
            {status.text}
          </div>
        </div>
      )}

      {/* Kết quả AI - Thiết kế dạng hội thoại */}
      {result && (
        <div style={{
          marginTop: "25px",
          padding: "20px",
          background: "#eff6ff",
          borderRadius: "15px",
          textAlign: "left",
          borderLeft: `5px solid #3b82f6`,
          position: "relative"
        }}>
          <div style={{ fontWeight: "bold", color: "#1e40af", marginBottom: "8px" }}>
            💡 Tư vấn sức khỏe:
          </div>
          <div style={{ 
            color: "#1e293b", fontSize: "15px", lineHeight: "1.6",
            whiteSpace: "pre-line" 
          }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}