import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchRequests = () => {
    setLoading(true);
    setError(false);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/admin/pahani-requests`)
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

  const markDone = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/admin/pahani-requests/process`, {
        id,
        action: "process",
      });
      setRequests((r) =>
        r.map((x) => (x.id === id ? { ...x, processed: true } : x))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark as processed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return !r.processed;
    if (filter === "processed") return r.processed;
    return true;
  });

  const pendingCount = requests.filter((r) => !r.processed).length;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md border border-blue-200 flex items-center gap-2 transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
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
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center my-12">
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
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-800">
              Failed to load requests. Please try refreshing.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2 text-sm">
                <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 py-1 px-3 rounded-full font-medium">
                  Pending: {pendingCount}
                </span>
                <span className="bg-green-50 text-green-700 border border-green-200 py-1 px-3 rounded-full font-medium">
                  Processed: {requests.length - pendingCount}
                </span>
              </div>

              <div className="inline-flex rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    filter === "all"
                      ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    filter === "pending"
                      ? "bg-white text-yellow-600 shadow-sm border border-yellow-100"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter("processed")}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    filter === "processed"
                      ? "bg-white text-green-600 shadow-sm border border-green-100"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  Processed
                </button>
              </div>
            </div>

            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-700 font-medium">
                No requests to display
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((r) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-lg border shadow-sm ${
                      r.processed ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center text-gray-900">
                          {r.district} / {r.mandal} / {r.village}
                          {r.processed && (
                            <span className="ml-2 text-xs bg-green-50 text-green-700 border border-green-200 py-1 px-2 rounded font-medium">
                              Processed
                            </span>
                          )}
                        </h3>
                        <div className="text-gray-800 text-sm mt-1 font-medium">
                          <span className="mr-4">
                            Dates: {r.from_date} to {r.to_date}
                          </span>
                          <span>Request Date: {formatDate(r.timestamp)}</span>
                        </div>
                      </div>
                      <button
                        disabled={r.processed || processingId === r.id}
                        onClick={() => markDone(r.id)}
                        className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                          r.processed
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                            : processingId === r.id
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-300"
                        }`}
                      >
                        {processingId === r.id ? (
                          <span className="flex items-center">
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
                          </span>
                        ) : r.processed ? (
                          "Completed"
                        ) : (
                          "Mark Collected"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;