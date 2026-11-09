
import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Navigate
                        to={isAuthenticated ? "/chat" : "/login"}
                        replace
                    />
                }
            />

            <Route path="/register" element={<Register />} />

            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate to="/chat" replace />
                        : <Login />
                }
            />

            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <Chat />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
