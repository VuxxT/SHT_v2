import { useNavigate } from "react-router-dom";


export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "Khách";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>🏥 HealthApp</h2>
        <nav style={styles.nav}>
          <div style={styles.navItem} onClick={() => navigate("/")}>🏠 Dashboard</div>
          <div style={styles.navItem} onClick={() => navigate("/ai")}>🤖 AI Advice</div>
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Đăng xuất</button>
      </aside>

      <div style={styles.mainContent}>
        <header style={styles.header}>
          <h3 style={{ color: "#334155" }}>Hệ thống Sức khỏe</h3>
          <div style={styles.userProfile}>
            <span style={styles.emailBadge}>👤 {userEmail}</span>
          </div>
        </header>
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", height: "100vh", backgroundColor: "#f8fafc" },
  sidebar: { width: "240px", backgroundColor: "#0f172a", color: "white", display: "flex", flexDirection: "column", padding: "20px" },
  logo: { textAlign: "center", marginBottom: "30px", fontSize: "22px" },
  nav: { flex: 1 },
  navItem: { padding: "12px", cursor: "pointer", borderRadius: "8px", marginBottom: "8px", transition: "0.2s" },
  logoutBtn: { padding: "10px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { height: "64px", backgroundColor: "white", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  content: { padding: "30px", flex: 1, overflowY: "auto" },
  emailBadge: { backgroundColor: "#f1f5f9", padding: "8px 15px", borderRadius: "20px", fontSize: "14px", fontWeight: "600", color: "#475569", border: "1px solid #e2e8f0" }
};