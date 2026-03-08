import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { CITIES } from '../../data/cities'

export default function CityCombobox({ value, onChange, placeholder = 'Search city…' }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  // Keep local query in sync if parent resets value
  useEffect(() => {
    setQuery(value || '')
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        // If user typed something not in the list, keep it as a custom value
        if (query && query !== value) onChange(query)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [query, value, onChange])

  const filtered = query.length === 0
    ? CITIES.slice(0, 8)
    : CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)

  const handleSelect = (city) => {
    setQuery(city)
    onChange(city)
    setOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setQuery('')
    onChange('')
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false)
            if (e.key === 'Enter' && filtered.length > 0) { handleSelect(filtered[0]); e.preventDefault() }
          }}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button type="button" onClick={handleClear} className="text-gray-300 hover:text-gray-500 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((city) => (
            <li key={city}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(city) }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
