import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(email, password);
      alert("Logado com sucesso!");
      navigate("/");
    } catch (err) {
      alert("Erro no login");
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="senha"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Entrar</button>

      {/* BOTÃO DE REGISTER */}
      <div style={{ marginTop: 10 }}>
        <button onClick={() => navigate("/register")}>
          Criar conta
        </button>
      </div>
    </div>
  );
}