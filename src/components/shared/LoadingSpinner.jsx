export default function LoadingSpinner({ fullscreen = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  const spinner = (
    <div
      className={`${sizeClasses[size]} rounded-full border-orange-200 border-t-orange-500 animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-sky-50">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}
