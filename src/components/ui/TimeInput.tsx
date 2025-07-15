'use client'

import { useState, useEffect } from 'react'
import { getUserLocale } from '@/lib/regional-settings'

interface TimeInputProps {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

export default function TimeInput({
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'HH:MM'
}: TimeInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const locale = getUserLocale()

  // Convert datetime-local value to display format
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      setDisplayValue(`${hours}:${minutes}`)
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleTimeChange = (timeString: string) => {
    setDisplayValue(timeString)
    
    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (timeRegex.test(timeString)) {
      const [hours, minutes] = timeString.split(':')
      
      // Create a new date with the selected time
      const now = new Date()
      const selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
        parseInt(hours), parseInt(minutes))
      
      // If we have a date part from the original value, preserve it
      if (value) {
        const originalDate = new Date(value)
        selectedDate.setFullYear(originalDate.getFullYear())
        selectedDate.setMonth(originalDate.getMonth())
        selectedDate.setDate(originalDate.getDate())
      }
      
      onChange(selectedDate.toISOString().slice(0, 16))
    }
  }

  const handleBlur = () => {
    // Validate and format on blur
    if (displayValue && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(displayValue)) {
      setDisplayValue('')
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleTimeChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
        pattern="[0-9]{1,2}:[0-9]{2}"
        maxLength={5}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
        24h
      </div>
    </div>
  )
} 