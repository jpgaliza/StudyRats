import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        background: "#0f172a",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        Welcome to the Study Rats 🐀
      </h1>

      <p style={{ opacity: 0.7 }}>
        Create or join a group to start studying together
      </p>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={() => navigate("/groups")}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#22c55e",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Groups
        </button>
      </div>
      <LogoutButton />
    </div>
  );
}