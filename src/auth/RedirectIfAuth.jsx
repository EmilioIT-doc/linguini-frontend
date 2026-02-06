import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RedirectIfAuth({ children }) {
  const { token, name } = useSelector((s) => s.auth);

  if (token) {
    return <Navigate to={`/profile/${encodeURIComponent(name || "me")}`} replace />;
  }

  return children;
}
