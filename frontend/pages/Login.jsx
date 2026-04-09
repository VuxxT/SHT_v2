import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  card: {
    maxWidth: 400, margin: "80px auto", padding: "30px",
    textAlign: "center", backgroundColor: "#fff",
    borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif"
  },
  title: { color: "#1e293b", marginBottom: "25px" },
  input: {
    width: "100%", padding: "12px", marginBottom: "15px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    boxSizing: "border-box", outline: "none"
  },
  button: {
    width: "100%", padding: "12px", backgroundColor: "#4f46e5",
    color: "white", border: "none", borderRadius: "10px",
    fontWeight: "600", cursor: "pointer"
  },
  switchText: { marginTop: "20px", fontSize: "14px", color: "#64748b" },
  link: { color: "#4f46e5", fontWeight: "bold", cursor: "pointer" }
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          // LƯU CẢ TOKEN VÀ EMAIL VÀO LOCALSTORAGE
          localStorage.setItem("token", data.token);
          localStorage.setItem("userEmail", data.user.email); 
          alert("Đăng nhập thành công!");
          navigate("/Dashboard"); // Chuyển về trang chủ (Dashboard)
        } else {
          alert("Đăng ký thành công! Mời bạn đăng nhập.");
          setIsLogin(true);
        }
      } else {
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      alert("Không thể kết nối đến Server. Hãy chắc chắn Backend đang chạy!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>{isLogin ? "🔐 Đăng Nhập" : "📝 Đăng Ký"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email" placeholder="Email của bạn"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required style={styles.input}
        />
        <input
          type="password" placeholder="Mật khẩu"
          value={password} onChange={(e) => setPassword(e.target.value)}
          required style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Đang xử lý..." : isLogin ? "Đăng Nhập" : "Đăng Ký"}
        </button>
      </form>
      <p style={styles.switchText}>
        {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <span style={styles.link} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
        </span>
      </p>
    </div>
  );
}