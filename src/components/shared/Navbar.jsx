import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Plane, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-orange-500">
          <Plane className="w-5 h-5" />
          <span>Wanderplan</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center hover:bg-orange-200 transition-colors"
            title="Profile"
          >
            <User className="w-4 h-4 text-orange-600" />
          </Link>
          <button
            onClick={handleSignOut}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}
