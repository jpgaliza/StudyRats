import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

type Props = {
  variant?: "default" | "danger";
  label?: string;
};

export default function LogoutButton({
  variant = "danger",
  label = "Sair",
}: Props) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Erro ao sair");
    }
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        background: variant === "danger" ? "#ef4444" : "#1f2937",
        color: "white",
      }}
    >
      {label}
    </button>
  );
}