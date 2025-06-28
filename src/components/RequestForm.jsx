import { useState, useEffect } from "react";
import axios from "axios";

const RequestForm = () => {
  const [district, setDistrict] = useState("");
  const [mandal, setMandal] = useState("");
  const [village, setVillage] = useState("");
  const [area, setArea] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [liveStatuses, setLiveStatuses] = useState({});

  const token = localStorage.getItem("access_token");

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
          from_date: yearFrom,
          to_date: yearTo,
          area,
          timestamp: Date.now(),
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
      setArea("");
      setYearFrom("");
      setYearTo("");
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Request Pahani Document
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              District
            </label>
            <select
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-800 rounded-md"
              disabled={loading}
            >
              <option value="">— Select District —</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Mandal
            </label>
            <select
              required
              value={mandal}
              onChange={(e) => setMandal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-800 rounded-md"
              disabled={!district || loading}
            >
              <option value="">— Select Mandal —</option>
              {mandals.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Village
            </label>
            <select
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-800 rounded-md"
              disabled={!mandal || loading}
            >
              <option value="">— Select Village —</option>
              {villages.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                From Date
              </label>
              <input
                type="date"
                required
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-800 rounded-md"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                To Date
              </label>
              <input
                type="date"
                required
                min={yearFrom}
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-800 rounded-md"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-md"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>

      {status === "success" && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-6 text-green-800">
          Request submitted successfully!
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-6 text-red-800">
          Error submitting request. Try again.
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
