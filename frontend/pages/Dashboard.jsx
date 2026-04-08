import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>🏥 Health App</h1>

      <button onClick={() => navigate("/ai")}>
        🤖 Go to AI
      </button>
    </div>
  );
}