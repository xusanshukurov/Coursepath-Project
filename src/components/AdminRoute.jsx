import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { loading, session, profile } = useAuth();

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (!profile) {
        return <h2>Loading...</h2>;
    }

    if (profile.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}