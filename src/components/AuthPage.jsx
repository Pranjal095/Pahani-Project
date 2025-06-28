import { useState } from "react";
import axios from "axios";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    aadhaar_number: "",
    patadar_passbook_number: "",
    survey_number: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError("Name is required for registration");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (userType === "user") {
        if (!formData.aadhaar_number || !formData.patadar_passbook_number || !formData.survey_number) {
          setError("All user fields are required for registration");
          return false;
        }
        
        if (formData.aadhaar_number.length !== 12 || !/^\d+$/.test(formData.aadhaar_number)) {
          setError("Aadhaar number must be 12 digits");
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin 
        ? `/login/${userType}`
        : `/register/${userType}`;
      
      let requestData = {
        email: formData.email,
        password: formData.password
      };

      if (!isLogin) {
        requestData.name = formData.name;
        
        if (userType === "user") {
          requestData.aadhaar_number = formData.aadhaar_number;
          requestData.patadar_passbook_number = formData.patadar_passbook_number;
          requestData.survey_number = formData.survey_number;
        }
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        requestData
      );

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      if (onLogin) {
        onLogin(response.data.user);
      }

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        aadhaar_number: "",
        patadar_passbook_number: "",
        survey_number: ""
      });

    } catch (err) {
      console.error("Auth error:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(isLogin ? "Login failed. Please try again." : "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      aadhaar_number: "",
      patadar_passbook_number: "",
      survey_number: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Government of Telangana</h1>
              <p className="text-lg text-slate-600 mt-1">Land Records Department</p>
              <p className="text-sm text-slate-500 mt-1">Pahani Digital Portal</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-xl border p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {isLogin ? "Sign In to Portal" : "Create New Account"}
              </h2>
              <p className="text-slate-600 text-lg">
                {isLogin ? "Access your account to continue" : "Register for secure access to land records"}
              </p>
            </div>

            {/* Account Type Selector */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-slate-700 mb-4 text-center">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("user")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    userType === "user"
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      userType === "user" ? "bg-blue-100" : "bg-slate-100"
                    }`}>
                      <svg className={`w-6 h-6 ${userType === "user" ? "text-blue-600" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className={`font-semibold mb-2 ${userType === "user" ? "text-blue-900" : "text-slate-900"}`}>
                      Citizen
                    </h3>
                    <p className={`text-sm ${userType === "user" ? "text-blue-700" : "text-slate-600"}`}>
                      Submit requests for land records and documents
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("admin")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    userType === "admin"
                      ? "border-green-500 bg-green-50 shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      userType === "admin" ? "bg-green-100" : "bg-slate-100"
                    }`}>
                      <svg className={`w-6 h-6 ${userType === "admin" ? "text-green-600" : "text-slate-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className={`font-semibold mb-2 ${userType === "admin" ? "text-green-900" : "text-slate-900"}`}>
                      Government Official
                    </h3>
                    <p className={`text-sm ${userType === "admin" ? "text-green-700" : "text-slate-600"}`}>
                      Manage and process citizen requests
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your full legal name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your password"
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {!isLogin && userType === "user" && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Citizen Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="aadhaar_number" className="block text-sm font-semibold text-slate-700 mb-2">
                          Aadhaar Number *
                        </label>
                        <input
                          id="aadhaar_number"
                          name="aadhaar_number"
                          type="text"
                          required
                          value={formData.aadhaar_number}
                          onChange={handleInputChange}
                          maxLength="12"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="12-digit Aadhaar number"
                        />
                      </div>

                      <div>
                        <label htmlFor="patadar_passbook_number" className="block text-sm font-semibold text-slate-700 mb-2">
                          Patadar Passbook Number *
                        </label>
                        <input
                          id="patadar_passbook_number"
                          name="patadar_passbook_number"
                          type="text"
                          required
                          value={formData.patadar_passbook_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="Passbook number"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label htmlFor="survey_number" className="block text-sm font-semibold text-slate-700 mb-2">
                        Survey Number *
                      </label>
                      <input
                        id="survey_number"
                        name="survey_number"
                        type="text"
                        required
                        value={formData.survey_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Survey number"
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
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
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </span>
                ) : (
                  isLogin ? "Sign In to Portal" : "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition ease-in-out duration-150"
                >
                  {isLogin ? "Register here" : "Sign in here"}
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                {userType === "admin" 
                  ? "Government officials have access to administrative functions and can manage citizen requests."
                  : "Citizens can submit requests for land records and track their application status."
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Government of Telangana</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;