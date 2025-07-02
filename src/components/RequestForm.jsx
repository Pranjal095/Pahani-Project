import { useState, useEffect } from "react";
import axios from "axios";

const RequestForm = () => {
  const [district, setDistrict] = useState("");
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");

  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [surveyNumber, setSurveyNumber] = useState("");
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [liveStatuses, setLiveStatuses] = useState({});

  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/location/districts`)
      .then((res) => setDistricts(res.data))
      .catch((err) => console.error("Failed to fetch districts:", err));
  }, []);

  useEffect(() => {
    if (district) {
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/location/mandals/${district}`)
        .then((res) => {
          setMandals(res.data);
          setMandal("");
          setVillage("");
          setVillages([]);
        });
    }
  }, [district]);

  useEffect(() => {
    if (district && mandal) {
      axios
        .get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/location/villages/${district}/${mandal}`
        )
        .then((res) => {
          setVillages(res.data);
          setVillage("");
        })
        .catch((err) => {
          console.error("Failed to fetch villages:", err);
        });
    }
  }, [mandal]);

  const fetchUserRequests = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/my-pahani-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserRequests(res.data);
    } catch (err) {
      console.error("Error fetching your requests", err);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/pahani-request`,
        {
          district,
          mandal,
          village,
          survey_number: surveyNumber,
          from_year: yearFrom,
          to_year: yearTo,
         
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("success");
      setDistrict("");
      setMandal("");
      setVillage("");
      setYearFrom("");
      setYearTo("");
      setSurveyNumber("");
      await fetchUserRequests();
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusForRequest = async (requestId) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/user/pahani-request-status/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLiveStatuses((prev) => ({ ...prev, [requestId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-lg border p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Pahani Document Request
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Submit a formal request to access Pahani land records, which include
            detailed information about land ownership, surveys, and history
            maintained by the Vikarabad Department.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-blue-900">Processing Time</h3>
            </div>
            <p className="text-sm text-blue-700">
              Document requests are typically processed within 5-7 business
              days.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-green-900">Verified Records</h3>
            </div>
            <p className="text-sm text-green-700">
              All provided documents are officially verified and authenticated.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg
                className="w-5 h-5 text-purple-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="font-semibold text-purple-900">Secure Access</h3>
            </div>
            <p className="text-sm text-purple-700">
              Your request and documents are handled with complete
              confidentiality.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border">
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Request Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Location Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    District *
                  </label>
                  <select
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loading}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Mandal *
                  </label>
                  <select
                    required
                    value={mandal}
                    onChange={(e) => setMandal(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={!district || loading}
                  >
                    <option value="">Select Mandal</option>
                    {mandals.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Village *
                  </label>
                  <select
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={!mandal || loading}
                  >
                    <option value="">Select Village</option>
                    {villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Date Range for Records
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    From Date *
                  </label>
                  <input
                    type="number"
                    required
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    placeholder="e.g., 2010"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-slate-300 bg-gray-50 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Start date for record search
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    To Date *
                  </label>
                  <input
                    type="number"
                    required
                    min={yearFrom}
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    placeholder="e.g., 2023"
                    className="w-full px-4 py-3 border border-slate-300 bg-gray-50 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    End date for record search
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Survey Number *
              </label>
              <input
                type="text"
                required
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                disabled={loading}
                placeholder="e.g., 123/A"
              />
            </div>
            <div className="pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-slate-600">
                  <p className="flex items-center">
                    <svg
                      className="w-4 h-4 text-slate-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    All fields marked with * are required
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    loading
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
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
                      Processing Request...
                    </span>
                  ) : (
                    "Submit Official Request"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Status Messages */}
      {status === "success" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Request Submitted Successfully
              </h3>
              <p className="text-green-800">
                Your Pahani document request has been submitted and is being
                processed. You will be notified once the documents are ready for
                collection.
              </p>
              <p className="text-sm text-green-700 mt-2">
                Reference ID: #
                {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "unauthorized" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-yellow-800">
                Your session has expired or you are not properly authenticated.
                Please log out and log back in to continue.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Request Submission Failed
              </h3>
              <p className="text-red-800">
                There was an error processing your request. Please check your
                information and try again. If the problem persists, contact the
                Vikarabad Department.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Request History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Your Requests</h2>
        {userRequests.length === 0 ? (
          <p className="text-gray-600">No previous requests found.</p>
        ) : (
          <div className="space-y-4">
            {userRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 border rounded-md shadow-sm bg-gray-50"
              >
                <div className="font-medium text-gray-800">
                  {req.district} / {req.mandal} / {req.village}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  <span className="mr-4">
                    Dates: {req.from_date} to {req.to_date}
                  </span>
                  <span>
                    Status:{" "}
                    {req.processed
                      ? req.is_paid
                        ? "✅ Completed"
                        : "📄 Ready for Payment"
                      : "⏳ Pending Upload"}
                  </span>
                </div>
                <button
                  onClick={() => fetchStatusForRequest(req.id)}
                  className="mt-2 text-sm text-blue-600 underline"
                >
                  Check Status
                </button>
                {liveStatuses[req.id] && (
                  <div className="mt-2 text-sm text-gray-700">
                    → {liveStatuses[req.id].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestForm;
