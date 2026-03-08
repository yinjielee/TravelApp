import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/shared/Navbar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import CityCombobox from '../components/shared/CityCombobox'
import {
  ArrowLeft, Plus, X, MapPin, Plane, Hotel,
  Calendar, Clock, DollarSign, FileText, Trash2, AlertTriangle,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent'

// ─── Add Destination Modal ───────────────────────────────────────────────────

function AddDestinationModal({ tripId, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', city: '', arrival_date: '', arrival_time: '',
    departure_date: '', departure_time: '', notes: '', estimated_cost: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('destinations').insert({
      trip_id: tripId,
      name: form.name.trim(),
      city: form.city.trim() || null,
      arrival_date: form.arrival_date || null,
      arrival_time: form.arrival_time || null,
      departure_date: form.departure_date || null,
      departure_time: form.departure_time || null,
      notes: form.notes.trim() || null,
      estimated_cost: form.estimated_cost ? parseFloat(form.estimated_cost) : null,
    }).select().single()
    if (error) { setError(error.message); setLoading(false) }
    else onSaved(data)
  }

  return (
    <Modal title="Add Destination" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Place name *">
          <input className={inputCls} required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Louvre Museum" />
        </Field>
        <Field label="City / Town">
          <CityCombobox value={form.city} onChange={(v) => set('city', v)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Arrival date">
            <input type="date" className={inputCls} value={form.arrival_date} onChange={(e) => set('arrival_date', e.target.value)} />
          </Field>
          <Field label="Arrival time">
            <input type="time" className={inputCls} value={form.arrival_time} onChange={(e) => set('arrival_time', e.target.value)} />
          </Field>
          <Field label="Departure date">
            <input type="date" className={inputCls} value={form.departure_date} onChange={(e) => set('departure_date', e.target.value)} />
          </Field>
          <Field label="Departure time">
            <input type="time" className={inputCls} value={form.departure_time} onChange={(e) => set('departure_time', e.target.value)} />
          </Field>
        </div>
        <Field label="Estimated cost ($)">
          <input type="number" min="0" step="0.01" className={inputCls} value={form.estimated_cost} onChange={(e) => set('estimated_cost', e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Notes">
          <textarea rows={3} className={inputCls} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any notes for this stop…" />
        </Field>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'Saving…' : 'Save Destination'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Transport Modal ─────────────────────────────────────────────────────

function AddTransportModal({ tripId, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: 'Flight', provider: '', booking_reference: '',
    departure_location: '', arrival_location: '',
    departure_time: '', arrival_time: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('transport').insert({
      trip_id: tripId,
      type: form.type,
      provider: form.provider.trim() || null,
      booking_reference: form.booking_reference.trim() || null,
      departure_location: form.departure_location.trim() || null,
      arrival_location: form.arrival_location.trim() || null,
      departure_time: form.departure_time || null,
      arrival_time: form.arrival_time || null,
    }).select().single()
    if (error) { setError(error.message); setLoading(false) }
    else onSaved(data)
  }

  return (
    <Modal title="Add Transport" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Type">
          <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
            {['Flight', 'Train', 'Bus', 'Car', 'Ferry', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Provider / Airline">
            <input className={inputCls} value={form.provider} onChange={(e) => set('provider', e.target.value)} placeholder="e.g. Delta" />
          </Field>
          <Field label="Booking reference">
            <input className={inputCls} value={form.booking_reference} onChange={(e) => set('booking_reference', e.target.value)} placeholder="ABC123" />
          </Field>
          <Field label="Departure from">
            <input className={inputCls} value={form.departure_location} onChange={(e) => set('departure_location', e.target.value)} placeholder="JFK" />
          </Field>
          <Field label="Arrival at">
            <input className={inputCls} value={form.arrival_location} onChange={(e) => set('arrival_location', e.target.value)} placeholder="CDG" />
          </Field>
          <Field label="Departure time">
            <input type="datetime-local" className={inputCls} value={form.departure_time} onChange={(e) => set('departure_time', e.target.value)} />
          </Field>
          <Field label="Arrival time">
            <input type="datetime-local" className={inputCls} value={form.arrival_time} onChange={(e) => set('arrival_time', e.target.value)} />
          </Field>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'Saving…' : 'Save Transport'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Add Accommodation Modal ─────────────────────────────────────────────────

function AddAccommodationModal({ tripId, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', address: '', check_in: '', check_out: '',
    booking_reference: '', contact_info: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('accommodation').insert({
      trip_id: tripId,
      name: form.name.trim(),
      address: form.address.trim() || null,
      check_in: form.check_in || null,
      check_out: form.check_out || null,
      booking_reference: form.booking_reference.trim() || null,
      contact_info: form.contact_info.trim() || null,
    }).select().single()
    if (error) { setError(error.message); setLoading(false) }
    else onSaved(data)
  }

  return (
    <Modal title="Add Accommodation" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <Field label="Hotel / Property name *">
          <input className={inputCls} required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Hotel du Louvre" />
        </Field>
        <Field label="Address">
          <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, City" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in">
            <input type="date" className={inputCls} value={form.check_in} onChange={(e) => set('check_in', e.target.value)} />
          </Field>
          <Field label="Check-out">
            <input type="date" className={inputCls} value={form.check_out} onChange={(e) => set('check_out', e.target.value)} />
          </Field>
          <Field label="Booking reference">
            <input className={inputCls} value={form.booking_reference} onChange={(e) => set('booking_reference', e.target.value)} placeholder="ABC123" />
          </Field>
          <Field label="Contact info">
            <input className={inputCls} value={form.contact_info} onChange={(e) => set('contact_info', e.target.value)} placeholder="Phone / email" />
          </Field>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'Saving…' : 'Save Accommodation'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Itinerary Tab ───────────────────────────────────────────────────────────

function ItineraryTab({ tripId, destinations, onAdd, onDelete }) {
  const grouped = destinations.reduce((acc, d) => {
    const key = d.arrival_date || 'No date'
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})
  const sortedDays = Object.keys(grouped).sort((a, b) =>
    a === 'No date' ? 1 : b === 'No date' ? -1 : a.localeCompare(b)
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {destinations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">No destinations yet. Add your first stop!</p>
        </div>
      ) : (
        sortedDays.map((day) => (
          <div key={day}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {day === 'No date' ? 'No date set' : formatDate(day)}
            </h3>
            <div className="space-y-3">
              {grouped[day].map((d) => (
                <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-800">{d.name}</p>
                        {d.city && <p className="text-xs text-gray-400">{d.city}</p>}
                      </div>
                      <button
                        onClick={() => onDelete(d.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(d.arrival_time || d.departure_time) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {d.arrival_time && `Arrive ${d.arrival_time}`}
                        {d.arrival_time && d.departure_time && ' · '}
                        {d.departure_time && `Depart ${d.departure_time}`}
                      </p>
                    )}
                    {d.estimated_cost != null && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3 h-3" />{Number(d.estimated_cost).toFixed(2)}
                      </p>
                    )}
                    {d.notes && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{d.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Logistics Tab ───────────────────────────────────────────────────────────

function LogisticsTab({ tripId, transport, accommodation, onAddTransport, onAddAccommodation, onDeleteTransport, onDeleteAccommodation }) {
  return (
    <div className="space-y-8">
      {/* Transport section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Plane className="w-4 h-4 text-orange-400" /> Transport
          </h3>
          <button
            onClick={onAddTransport}
            className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {transport.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No transport added yet.</p>
        ) : (
          <div className="space-y-3">
            {transport.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
                  <Plane className="w-4 h-4 text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-800">
                      {t.type}{t.provider ? ` · ${t.provider}` : ''}
                    </p>
                    <button onClick={() => onDeleteTransport(t.id)} className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {(t.departure_location || t.arrival_location) && (
                    <p className="text-xs text-gray-400 mt-0.5">{t.departure_location} → {t.arrival_location}</p>
                  )}
                  {t.booking_reference && (
                    <p className="text-xs text-gray-400 mt-0.5">Ref: <span className="font-mono">{t.booking_reference}</span></p>
                  )}
                  {t.departure_time && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{new Date(t.departure_time).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accommodation section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Hotel className="w-4 h-4 text-amber-400" /> Accommodation
          </h3>
          <button
            onClick={onAddAccommodation}
            className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {accommodation.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No accommodation added yet.</p>
        ) : (
          <div className="space-y-3">
            {accommodation.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Hotel className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-800">{a.name}</p>
                    <button onClick={() => onDeleteAccommodation(a.id)} className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {a.address && <p className="text-xs text-gray-400 mt-0.5">{a.address}</p>}
                  {(a.check_in || a.check_out) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(a.check_in)} — {formatDate(a.check_out)}
                    </p>
                  )}
                  {a.booking_reference && (
                    <p className="text-xs text-gray-400 mt-0.5">Ref: <span className="font-mono">{a.booking_reference}</span></p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab({ trip, onTitleSaved, onDelete }) {
  const [title, setTitle] = useState(trip.title)
  const [saving, setSaving] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSaveTitle = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const { error } = await supabase.from('trips').update({ title: title.trim() }).eq('id', trip.id)
    if (!error) onTitleSaved(title.trim())
    setSaving(false)
  }

  return (
    <div className="space-y-8 max-w-lg">
      {/* Edit title */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Trip Details</h3>
        <form onSubmit={handleSaveTitle} className="flex gap-2">
          <input
            className={`flex-1 ${inputCls}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Trip title"
          />
          <button
            type="submit"
            disabled={saving || title.trim() === trip.title}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 rounded-xl border border-red-100 p-5">
        <h3 className="font-semibold text-red-700 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <p className="text-sm text-red-500 mb-4">
          Deleting this trip is permanent and cannot be undone.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete trip
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600 font-medium">
              Type "<strong>{trip.title}</strong>" to confirm deletion:
            </p>
            <input
              className={inputCls}
              value={confirmTitle}
              onChange={(e) => setConfirmTitle(e.target.value)}
              placeholder={trip.title}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteConfirm(false); setConfirmTitle('') }}
                className="border border-gray-200 text-gray-600 font-medium px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={confirmTitle !== trip.title}
                onClick={onDelete}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main TripDetail Page ────────────────────────────────────────────────────

const TABS = ['Itinerary', 'Logistics', 'Settings']

export default function TripDetail() {
  const { tripId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [trip, setTrip] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [transport, setTransport] = useState([])
  const [accommodation, setAccommodation] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Itinerary')

  const [showAddDest, setShowAddDest] = useState(false)
  const [showAddTransport, setShowAddTransport] = useState(false)
  const [showAddAccommodation, setShowAddAccommodation] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [tripId])

  const fetchAll = async () => {
    const [tripRes, destRes, transRes, accomRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', tripId).eq('owner_id', user.id).single(),
      supabase.from('destinations').select('*').eq('trip_id', tripId).order('arrival_date', { ascending: true }),
      supabase.from('transport').select('*').eq('trip_id', tripId).order('departure_time', { ascending: true }),
      supabase.from('accommodation').select('*').eq('trip_id', tripId).order('check_in', { ascending: true }),
    ])
    if (tripRes.error || !tripRes.data) { navigate('/dashboard'); return }
    setTrip(tripRes.data)
    setDestinations(destRes.data || [])
    setTransport(transRes.data || [])
    setAccommodation(accomRes.data || [])
    setLoading(false)
  }

  const handleDeleteTrip = async () => {
    await supabase.from('trips').delete().eq('id', tripId)
    navigate('/dashboard')
  }

  const handleDeleteDestination = async (id) => {
    await supabase.from('destinations').delete().eq('id', id)
    setDestinations((d) => d.filter((x) => x.id !== id))
  }

  const handleDeleteTransport = async (id) => {
    await supabase.from('transport').delete().eq('id', id)
    setTransport((t) => t.filter((x) => x.id !== id))
  }

  const handleDeleteAccommodation = async (id) => {
    await supabase.from('accommodation').delete().eq('id', id)
    setAccommodation((a) => a.filter((x) => x.id !== id))
  }

  if (loading) return <LoadingSpinner fullscreen />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Trip header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-orange-100 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to trips
          </button>
          <h1 className="text-3xl font-bold text-white">{trip.title}</h1>
          {(trip.start_date || trip.end_date) && (
            <p className="text-orange-100 text-sm mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(trip.start_date)}{trip.start_date && trip.end_date ? ' – ' : ''}{formatDate(trip.end_date)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'Itinerary' && (
          <ItineraryTab
            tripId={tripId}
            destinations={destinations}
            onAdd={() => setShowAddDest(true)}
            onDelete={handleDeleteDestination}
          />
        )}
        {activeTab === 'Logistics' && (
          <LogisticsTab
            tripId={tripId}
            transport={transport}
            accommodation={accommodation}
            onAddTransport={() => setShowAddTransport(true)}
            onAddAccommodation={() => setShowAddAccommodation(true)}
            onDeleteTransport={handleDeleteTransport}
            onDeleteAccommodation={handleDeleteAccommodation}
          />
        )}
        {activeTab === 'Settings' && (
          <SettingsTab
            trip={trip}
            onTitleSaved={(t) => setTrip((prev) => ({ ...prev, title: t }))}
            onDelete={handleDeleteTrip}
          />
        )}
      </main>

      {/* Modals */}
      {showAddDest && (
        <AddDestinationModal
          tripId={tripId}
          onClose={() => setShowAddDest(false)}
          onSaved={(d) => { setDestinations((prev) => [...prev, d]); setShowAddDest(false) }}
        />
      )}
      {showAddTransport && (
        <AddTransportModal
          tripId={tripId}
          onClose={() => setShowAddTransport(false)}
          onSaved={(t) => { setTransport((prev) => [...prev, t]); setShowAddTransport(false) }}
        />
      )}
      {showAddAccommodation && (
        <AddAccommodationModal
          tripId={tripId}
          onClose={() => setShowAddAccommodation(false)}
          onSaved={(a) => { setAccommodation((prev) => [...prev, a]); setShowAddAccommodation(false) }}
        />
      )}
    </div>
  )
}
