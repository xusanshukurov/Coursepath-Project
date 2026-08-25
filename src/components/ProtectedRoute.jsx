import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
    const { session, loading } = useAuth();


    if(loading){
        return <Loader/>
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }



    return children;
}