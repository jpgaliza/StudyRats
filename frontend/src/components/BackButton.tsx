import { useNavigate } from "react-router-dom";

type BackButtonProps = {
  label?: string;
};

export default function BackButton({ label = "Voltar" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        padding: "8px 16px",
        marginBottom: "16px",
        cursor: "pointer",
      }}
    >
      ← {label}
    </button>
  );
}