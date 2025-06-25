import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'
import RequestForm from './components/RequestForm'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-blue-600 text-white shadow-md">
          <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-bold text-xl">Telangana Pahani Portal</div>
            <div className="space-x-1">
              <NavLink 
                to="/" 
                className={({isActive}) => 
                  `px-4 py-2 rounded-md ${isActive 
                    ? 'bg-white text-blue-600 font-medium' 
                    : 'hover:bg-blue-500 transition-colors'}`
                }
              >
                📄 Request Pahani
              </NavLink>
              <NavLink 
                to="/admin" 
                className={({isActive}) => 
                  `px-4 py-2 rounded-md ${isActive 
                    ? 'bg-white text-blue-600 font-medium' 
                    : 'hover:bg-blue-500 transition-colors'}`
                }
              >
                🛠️ Admin
              </NavLink>
            </div>
          </nav>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<RequestForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <footer className="bg-gray-100 border-t py-4 text-center text-gray-500 text-sm">
          <div className="container mx-auto">
            &copy; {new Date().getFullYear()} Telangana State Land Records Department
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App