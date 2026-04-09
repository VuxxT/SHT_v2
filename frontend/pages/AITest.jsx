import { useState } from "react";

export default function AITest() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateBMI = () => {
    if (!weight || !height) return null;
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
      alert("Vui lòng nhập đầy đủ cân nặng và chiều cao!");
      return;
    }

    const bmiValue = calculateBMI();
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("http://localhost:3000/api/ai/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight,
          height,
          bmi: bmiValue,
        }),
      });

      const data = await res.json();
      setResult(data.advice);
    } catch (err) {
      setResult("❌ Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const status = bmi ? getStatus(bmi) : null;

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>🤖 Phân tích sức khỏe AI</h2>
        <p style={styles.subtitle}>Nhập thông số để nhận lời khuyên từ trí tuệ nhân tạo Gemini</p>

        <div style={styles.inputGroup}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Cân nặng (kg)</label>
            <input
              type="number"
              placeholder="Ví dụ: 65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Chiều cao (cm)</label>
            <input
              type="number"
              placeholder="Ví dụ: 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button 
          onClick={callAI} 
          disabled={loading}
          style={loading ? {...styles.button, backgroundColor: "#94a3b8"} : styles.button}
        >
          {loading ? "⌛ AI đang tính toán..." : "Gửi thông tin cho AI"}
        </button>

        {/* Kết quả BMI */}
        {bmi && (
          <div style={styles.bmiCard}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Chỉ số BMI hiện tại</p>
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

        {/* Kết quả AI */}
        {result && (
          <div style={styles.resultBox}>
            <div style={{ fontWeight: "bold", color: "#1e40af", marginBottom: "10px", display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "20px", marginRight: "8px" }}>💡</span> Lời khuyên sức khỏe:
            </div>
            <div style={styles.resultText}>
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "20px"
  },
  card: { 
    width: "100%",
    maxWidth: "600px",
    padding: "35px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  title: { color: "#0f172a", marginBottom: "8px", fontSize: "24px", textAlign: "center" },
  subtitle: { color: "#64748b", textAlign: "center", marginBottom: "30px", fontSize: "15px" },
  inputGroup: { display: "flex", gap: "20px", marginBottom: "20px", textAlign: "left" },
  label: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { 
    width: "100%", padding: "12px", 
    borderRadius: "10px", border: "1px solid #e2e8f0",
    fontSize: "16px", boxSizing: "border-box", outline: "none",
    transition: "border 0.2s"
  },
  button: { 
    padding: "14px", width: "100%", 
    backgroundColor: "#4f46e5",
    color: "white", border: "none", borderRadius: "10px",
    fontSize: "16px", fontWeight: "600", cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "10px"
  },
  bmiCard: { 
    marginTop: "30px", padding: "20px", 
    backgroundColor: "#f8fafc", borderRadius: "12px",
    border: "1px solid #e2e8f0",
    textAlign: "center"
  },
  resultBox: {
    marginTop: "25px",
    padding: "20px",
    background: "#f0f7ff",
    borderRadius: "12px",
    textAlign: "left",
    borderLeft: `6px solid #3b82f6`,
  },
  resultText: { 
    color: "#1e293b", fontSize: "15px", lineHeight: "1.7",
    whiteSpace: "pre-line" 
  }
};