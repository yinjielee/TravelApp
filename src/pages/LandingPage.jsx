import { Link } from 'react-router-dom'
import { Plane, MapPin, Calendar, FileText } from 'lucide-react'

const features = [
  {
    icon: MapPin,
    title: 'Plan Destinations',
    desc: 'Add every stop on your journey with dates, notes, and estimated costs.',
  },
  {
    icon: Calendar,
    title: 'Day-by-Day Itinerary',
    desc: 'Visualize your trip timeline and organize activities for each day.',
  },
  {
    icon: FileText,
    title: 'Manage Logistics',
    desc: 'Keep flights, hotels, and booking references all in one place.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-sky-50">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-500 font-bold text-xl">
          <Plane className="w-5 h-5" />
          <span>Wanderplan</span>
        </div>
        <Link
          to="/auth"
          className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Plane className="w-3.5 h-3.5" />
          Your travel planner
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Plan trips you'll
          <span className="text-orange-500"> actually remember</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Build day-by-day itineraries, track your logistics, and keep all your travel details
          organized in one beautiful place.
        </p>
        <Link
          to="/auth"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-md shadow-orange-200"
        >
          Get Started — it's free
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-6 shadow-sm border border-orange-50 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Icon className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
