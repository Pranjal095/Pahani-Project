import { useState } from 'react'
import axios from 'axios'
import locations from '../data/locations.json'

const RequestForm = () => {
  const [district, setDistrict] = useState('')
  const [area, setArea] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const districts = locations.Telangana

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setStatus('')
    try {
      await axios.post(import.meta.env.VITE_SHEET_WEBHOOK_URL, {
        district, area, yearFrom, yearTo, timestamp: Date.now()
      })
      setStatus('success')
      // Reset form on success
      setDistrict('')
      setArea('')
      setYearFrom('')
      setYearTo('')
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Request Pahani Document</h1>
        <p className="text-gray-600 mb-6">
          Pahani records contain land ownership details. Fill out this form to request 
          specific pages from the pahani archives for your reference.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">District</label>
            <select
              required
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">— Select District —</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Area / Village</label>
            <input
              type="text"
              required
              placeholder="Enter your area or village name" 
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Year From</label>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear()}
                value={yearFrom}
                onChange={e => setYearFrom(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Year To</label>
              <input
                type="number"
                required
                min={yearFrom || 1900}
                max={new Date().getFullYear()}
                value={yearTo}
                onChange={e => setYearTo(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition duration-200 ease-in-out flex justify-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Submit Request"}
          </button>
        </form>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-800">
                Request submitted successfully! You'll be notified when your records are ready for collection.
              </p>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-800">
                Error submitting request. Please try again or contact support.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RequestForm