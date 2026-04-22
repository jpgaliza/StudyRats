import { router } from "expo-router";
import { logout } from "../services/authService";

type Props = {
  variant?: "default" | "danger";
  label?: string;
  disabled?: boolean;
};

export default function LogoutButton({
  variant = "danger",
  label = "Sair",
  disabled = false,
}: Props) {
  const handleLogout = async () => {
    if (disabled) return;

    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error(err);
      alert("Erro ao sair");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        background: disabled
          ? "#9ca3af"
          : variant === "danger"
          ? "#ef4444"
          : "#1f2937",
        color: "white",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {label}
    </button>
  );
}