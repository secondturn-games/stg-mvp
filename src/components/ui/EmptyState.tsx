interface EmptyStateProps {
  title: string
  description: string
  icon?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

export default function EmptyState({ 
  title, 
  description, 
  icon = '📦', 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <a
          href={action.href}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </a>
      )}
    </div>
  )
} 