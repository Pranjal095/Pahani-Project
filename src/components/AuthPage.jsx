import { useState } from "react";
import axios from "axios";

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState("user");
  const [formData, setFormData] = useState({
    name: "",
    aadhaar_number: "",
    patadar_passbook_number: "",
    phone_number: "",
    otp: "",
    email: "",
    password: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(formData.phone_number)) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/send-otp`, {
        phone_number: formData.phone_number,
      });
      setOtpSent(true);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (userType === "admin") {
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
    } else {
      // citizen
      if (
        !formData.name ||
        !formData.aadhaar_number ||
        !formData.patadar_passbook_number ||
        !formData.phone_number
      ) {
        setError("All fields are required for citizen registration/login");
        return false;
      }

      if (!/^\d{12}$/.test(formData.aadhaar_number)) {
        setError("Aadhaar number must be 12 digits");
        return false;
      }

      if (!/^\d{10}$/.test(formData.phone_number)) {
        setError("Phone number must be a valid 10-digit number");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
    try {
      if (userType === "admin") {
        if (!formData.email || !formData.password) {
          setError("Email and password required");
          setLoading(false);
          return;
        }
  
        if (isLogin) {
          // 🔐 Admin Login
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/login/admin`,
            {
              email: formData.email,
              password: formData.password,
            }
          );
          localStorage.setItem("access_token", res.data.access_token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          if (onLogin) onLogin(res.data.user);
        } else {
          // 📝 Admin Registration
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/register/admin`,
            {
              email: formData.email,
              password: formData.password,
              name: formData.name || "Admin",
            }
          );
          setIsLogin(true); // After signup, switch to login mode
          setSuccess("Account created successfully. Please sign in.");
        }
      } else {
        // 👤 Citizen
        if (!isLogin) {
          // 📝 Citizen Registration
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/register/user`,
            {
              name: formData.name,
              phone_number: formData.phone_number,
              aadhaar_number: formData.aadhaar_number,
              patadar_passbook_number: formData.patadar_passbook_number,
            }
          );
          setIsLogin(true);
          setSuccess("Account created successfully. Please login using OTP.");
          setOtpSent(false);
          setFormData((prev) => ({ ...prev, otp: "" }));
          setLoading(false);
          return;
        }
  
        // 👤 Citizen OTP Login
        if (
          !/^\d{10}$/.test(formData.phone_number) ||
          formData.otp.length !== 6
        ) {
          setError("Enter valid phone and OTP");
          setLoading(false);
          return;
        }
  
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/login/user`,
          {
            phone_number: formData.phone_number,
            otp: formData.otp,
          }
        );
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        if (onLogin) onLogin(res.data.user);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setFormData({
      name: "",
      aadhaar_number: "",
      patadar_passbook_number: "",
      phone_number: "",
      email: "",
      password: "",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Vikarabad Pahani Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">Pahani Digital Portal</p>
        </div>
      </div>
  
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-xl border p-8 lg:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {isLogin ? "Sign In to Portal" : "Create New Account"}
              </h2>
              <p className="text-slate-600 text-lg">
                {isLogin
                  ? "Access your account to continue"
                  : "Register to access your land records"}
              </p>
            </div>
  
            {/* Account Type Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-slate-700 mb-4 text-center">
                Select Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("user")}
                  className={`p-6 rounded-xl border-2 ${
                    userType === "user"
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-slate-200"
                  }`}
                >
                  <h3 className="font-semibold text-center">Citizen</h3>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("admin")}
                  className={`p-6 rounded-xl border-2 ${
                    userType === "admin"
                      ? "border-green-500 bg-green-50 shadow-lg"
                      : "border-slate-200"
                  }`}
                >
                  <h3 className="font-semibold text-center">
                    Government Official
                  </h3>
                </button>
              </div>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Admin fields */}
              {userType === "admin" && (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Password *
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Password"
                    />
                  </div>
                </>
              )}
  
              {/* Citizen fields */}
              {userType === "user" && (
                <>
                  {!isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your name"
                        />
                      </div>
  
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Aadhaar Number *
                        </label>
                        <input
                          type="text"
                          name="aadhaar_number"
                          required
                          value={formData.aadhaar_number}
                          maxLength={12}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="12-digit Aadhaar number"
                        />
                      </div>
  
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Patadar Passbook Number *
                        </label>
                        <input
                          type="text"
                          name="patadar_passbook_number"
                          required
                          value={formData.patadar_passbook_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Patadar Passbook Number"
                        />
                      </div>
                    </>
                  )}
  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      required
                      maxLength={10}
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10-digit mobile number"
                    />
                  </div>
  
                  {isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          OTP *
                        </label>
                        <input
                          type="text"
                          name="otp"
                          required
                          maxLength={6}
                          value={formData.otp}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 text-black placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter 6-digit OTP"
                        />
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading || otpSent}
                          className={`text-sm font-medium ${
                            otpSent
                              ? "text-gray-400"
                              : "text-blue-600 hover:underline"
                          }`}
                        >
                          {otpSent ? "OTP Sent" : "Send OTP"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
  
              {/* Success Display */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                  <div>{success}</div>
                </div>
              )}
  
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                  {Array.isArray(error) ? (
                    error.map((e, idx) => <div key={idx}>• {e.msg}</div>)
                  ) : (
                    <div>{error}</div>
                  )}
                </div>
              )}
  
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? isLogin
                    ? "Signing In..."
                    : "Creating Account..."
                  : isLogin
                  ? "Sign In to Portal"
                  : "Create Account"}
              </button>
            </form>
  
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {isLogin ? "Register here" : "Sign in here"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
  
      <footer className="bg-white border-t text-center py-4 text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Government of Telangana
      </footer>
    </div>
  );
};

export default AuthPage;
