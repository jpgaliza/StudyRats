import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe } from "../services/authService";

export default function ProtectedRoute({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getMe();
      setUser(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // importante
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}