import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";

import RequestForm from "./components/RequestForm";
import AdminDashboard from "./components/AdminDashboard";
import AuthPage from "./components/AuthPage";
import "./App.css";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Redirect if admin
        if (parsedUser.role === "admin") {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, [navigate]);

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="font-bold text-xl">Vikarabad land pahani portal</div>

          <div className="flex items-center space-x-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-sm ${
                  isActive
                    ? "bg-white text-blue-600 font-medium"
                    : "hover:bg-blue-500 transition-colors"
                }`
              }
            >
              📄 Request Pahani
            </NavLink>

            {user.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm ${
                    isActive
                      ? "bg-white text-blue-600 font-medium"
                      : "hover:bg-blue-500 transition-colors"
                  }`
                }
              >
                🛠️ Admin Dashboard
              </NavLink>
            )}

            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-500">
              <div className="text-sm">
                <span className="opacity-90">Welcome, </span>
                <span className="font-medium">{user.email}</span>
                <span className="ml-2 px-2 py-1 bg-blue-500 rounded-full text-xs font-medium">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-md text-sm font-medium transition-colors duration-200"
                title="Logout"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<RequestForm />} />
          <Route
            path="/admin"
            element={
              user.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-gray-100 border-t py-4 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} Telangana State Land Records
          Department
        </div>
      </footer>
    </div>
  );
}

export default AppWrapper;
