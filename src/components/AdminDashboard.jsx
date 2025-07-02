import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [processingId, setProcessingId] = useState();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchRequests = () => {
    setLoading(true);
    setError(false);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/admin/pahani-requests`, {
        headers: getAuthHeaders(),
      })
      .then((r) => {
        setRequests(r.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const markDone = async (requestId) => {
    setProcessingId(requestId);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/approve-request/${requestId}`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      toast.success("Request approved successfully!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve request.");
    } finally {
      setProcessingId(null);
    }
  };

  const uploadPDF = async (id) => {
    const file = selectedFiles[id];
    if (!file || file.type !== "application/pdf") {
      toast.error("Please select a valid PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingId(id);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/upload-pahani-pdf/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      toast.success("PDF uploaded successfully!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setUploadingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return !r.processed;
    if (filter === "processed") return r.processed;
    return true;
  });

  const pendingCount = requests.filter((r) => !r.processed).length;
  const processedCount = requests.filter((r) => r.processed).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-lg border">
        <div className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Administrative Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Manage and process Pahani document requests
              </p>
            </div>

            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors duration-200 disabled:opacity-50"
            >
              <svg
                className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-slate-900">
                {requests.length}
              </p>
              <p className="text-sm text-slate-600">Total Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>
              <p className="text-sm text-slate-600">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-slate-900">
                {processedCount}
              </p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-slate-900">
                {requests.length > 0
                  ? Math.round((processedCount / requests.length) * 100)
                  : 0}
                %
              </p>
              <p className="text-sm text-slate-600">Completion Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
              <p className="text-slate-600 font-medium">
                Loading request data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
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
                    Failed to Load Data
                  </h3>
                  <p className="text-red-800">
                    Unable to retrieve request data. Please check your
                    connection and try refreshing the page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold text-slate-900">
                  Request Management
                </h2>

                <div className="inline-flex rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                      filter === "all"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    All Requests ({requests.length})
                  </button>
                  <button
                    onClick={() => setFilter("pending")}
                    className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                      filter === "pending"
                        ? "bg-white text-yellow-700 shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilter("processed")}
                    className={`px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                      filter === "processed"
                        ? "bg-white text-green-700 shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    Completed ({processedCount})
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-16">
                  <svg
                    className="w-16 h-16 text-slate-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Requests Found
                  </h3>
                  <p className="text-slate-600">
                    {filter === "all"
                      ? "No requests have been submitted yet."
                      : `No ${filter} requests to display.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`border rounded-xl p-6 transition-all duration-200 ${
                        request.processed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {request.district} → {request.mandal} →{" "}
                              {request.village}
                            </h3>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                request.processed
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {request.processed
                                ? "Approved"
                                : "Pending Review"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">
                                Survey Number:
                              </span>
                              <p className="text-slate-600">
                                {request.survey_number}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Date Range:
                              </span>
                              <p className="text-slate-600">
                                {request.from_year} to {request.to_year}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Request ID:
                              </span>
                              <p className="text-slate-600 font-mono">
                                #{request.id}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">
                                Submitted:
                              </span>
                              <p className="text-slate-600">
                                {formatDate(request.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <button
                            disabled={
                              request.processed || processingId === request.id
                            }
                            onClick={() => markDone(request.id)}
                            className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                              request.processed
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : processingId === request.id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                            }`}
                          >
                            {processingId === request.id ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 mr-2"
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
                                Processing...
                              </>
                            ) : request.processed ? (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Approved
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2"
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
                                Approve Request
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
