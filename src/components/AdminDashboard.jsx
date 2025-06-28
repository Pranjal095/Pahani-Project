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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
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
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // adjust if using context
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-md border border-blue-200 flex items-center gap-2 transition-colors duration-200"
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-red-600 py-6">Error loading requests.</div>
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
                {["all", "pending", "processed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      filter === f
                        ? `bg-white text-${
                            f === "pending"
                              ? "yellow"
                              : f === "processed"
                              ? "green"
                              : "blue"
                          }-600 shadow-sm border`
                        : "text-gray-600 hover:bg-white"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {r.district} / {r.mandal} / {r.village}
                          {r.processed && (
                            <span className="ml-2 text-xs bg-green-50 text-green-700 border border-green-200 py-1 px-2 rounded font-medium">
                              Completed
                            </span>
                          )}
                        </h3>
                        <div className="text-sm text-gray-800 font-medium mt-1">
                          <span className="mr-4">
                            Dates: {r.from_date} to {r.to_date}
                          </span>
                          <span>Requested: {formatDate(r.timestamp)}</span>
                        </div>
                      </div>

                      {!r.processed && (
                        <div className="flex flex-col items-end space-y-2">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              setSelectedFiles((prev) => ({
                                ...prev,
                                [r.id]: e.target.files[0],
                              }))
                            }
                            className="block w-52 text-sm text-gray-700 border rounded px-2 py-1"
                          />
                          <button
                            onClick={() => uploadPDF(r.id)}
                            disabled={uploadingId === r.id}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                              uploadingId === r.id
                                ? "bg-green-100 text-green-700"
                                : "bg-green-50 hover:bg-green-100 text-green-700"
                            } border border-green-200 transition`}
                          >
                            {uploadingId === r.id
                              ? "Uploading..."
                              : "Upload PDF"}
                          </button>
                        </div>
                      )}

                      {r.processed && r.pdf_s3_url && (
                        <a
                          href={r.pdf_s3_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 underline"
                        >
                          View PDF
                        </a>
                      )}
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
