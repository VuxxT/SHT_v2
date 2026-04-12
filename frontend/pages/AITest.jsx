import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../src/css/dashboard.css'; 

export default function AITest() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(""); 

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

  const handleAICall = async (isMenuRequest = false) => {
    if (!weight || !height) {
      alert("Vui lòng nhập đầy đủ cân nặng và chiều cao!");
      return;
    }

    const bmiValue = calculateBMI();
    setLoading(true);
    setType(isMenuRequest ? "menu" : "advice");
    setResult("");

    try {
      const res = await fetch("http://localhost:3000/api/ai/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight,
          height,
          bmi: bmiValue,
          isMenuRequest: isMenuRequest 
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
        <p style={styles.subtitle}>Nhập thông số để nhận lời khuyên và thực đơn từ Gemini</p>

        <div style={styles.inputGroup}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Cân nặng (kg)</label>
            <input
              type="number"
              placeholder="65"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={styles.label}>Chiều cao (cm)</label>
            <input
              type="number"
              placeholder="170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button 
              onClick={() => handleAICall(false)} 
              disabled={loading}
              style={loading && type === "advice" ? {...styles.button, backgroundColor: "#94a3b8"} : styles.button}
            >
              {loading && type === "advice" ? "⌛ AI đang suy nghĩ..." : "💡 Nhận lời khuyên nhanh"}
            </button>

            <button 
              onClick={() => handleAICall(true)} 
              disabled={loading}
              style={loading && type === "menu" ? {...styles.menuButton, backgroundColor: "#94a3b8"} : styles.menuButton}
            >
              {loading && type === "menu" ? "🥗 Đang lập thực đơn..." : "🥗 Lên thực đơn 7 ngày (Bảng)"}
            </button>
        </div>

        {bmi && (
          <div style={styles.bmiCard}>
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

        {result && (
          <div style={{
            ...styles.resultBox, 
            borderLeftColor: type === "menu" ? "#10b981" : "#4f46e5",
            borderTop: type === "menu" ? "4px solid #10b981" : "none"
          }}>
            <div style={{ 
                fontWeight: "bold", 
                color: type === "menu" ? "#065f46" : "#1e40af", 
                marginBottom: "15px", 
                display: "flex", 
                alignItems: "center",
                fontSize: "18px"
            }}>
              <span style={{ marginRight: "8px" }}>
                {type === "menu" ? "📋" : "✨"}
              </span> 
              {type === "menu" ? "Thực đơn chi tiết 7 ngày:" : "Lời khuyên sức khỏe:"}
            </div>
            
            {/* Sử dụng className để áp dụng CSS bảng từ file ngoài */}
            <div style={styles.resultText} className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { display: "flex", justifyContent: "center", paddingTop: "20px", paddingBottom: "40px", backgroundColor: "#f1f5f9", minHeight: "100vh" },
  card: { width: "100%", maxWidth: "700px", padding: "30px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" },
  title: { color: "#0f172a", marginBottom: "8px", fontSize: "24px", textAlign: "center" },
  subtitle: { color: "#64748b", textAlign: "center", marginBottom: "30px", fontSize: "15px" },
  inputGroup: { display: "flex", gap: "20px", marginBottom: "20px" },
  label: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "#334155" },
  input: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "16px", outline: "none" },
  button: { padding: "14px", width: "100%", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  menuButton: { padding: "14px", width: "100%", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "600", cursor: "pointer" },
  bmiCard: { marginTop: "20px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" },
  resultBox: {
    marginTop: "25px",
    padding: "20px",
    background: "#ffffff",
    borderRadius: "12px",
    borderLeft: "6px solid #3b82f6",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    overflowX: "auto" 
  },
  resultText: { color: "#1e293b", fontSize: "15px", lineHeight: "1.6" }
};