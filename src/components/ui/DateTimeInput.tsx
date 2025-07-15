'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { getUserLocale, ensure24HourFormat } from '@/lib/regional-settings'

interface DateTimeInputProps {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
  label?: string
}

export default function DateTimeInput({
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  className = '',
  placeholder = 'YYYY-MM-DD HH:MM',
  label
}: DateTimeInputProps) {
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const locale = getUserLocale()

  // Parse the datetime value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      
      setDateValue(`${year}-${month}-${day}`)
      setTimeValue(`${hours}:${minutes}`)
    } else {
      setDateValue('')
      setTimeValue('')
    }
  }, [value])

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate)
    updateDateTime(newDate, timeValue)
  }

  const handleTimeChange = (newTime: string) => {
    // Validate 24-hour time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (timeRegex.test(newTime)) {
      setTimeValue(newTime)
      updateDateTime(dateValue, newTime)
    }
  }

  const updateDateTime = (date: string, time: string) => {
    if (date && time) {
      const [hours, minutes] = time.split(':')
      const dateObj = new Date(date)
      dateObj.setHours(parseInt(hours), parseInt(minutes))
      
      const formattedValue = ensure24HourFormat(dateObj.toISOString())
      onChange(formattedValue)
    }
  }

  const getMinDate = () => {
    if (min) {
      const minDate = new Date(min)
      return minDate.toISOString().split('T')[0]
    }
    return ''
  }

  const getMaxDate = () => {
    if (max) {
      const maxDate = new Date(max)
      return maxDate.toISOString().split('T')[0]
    }
    return ''
  }

  const getCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Detect if browser shows AM/PM format
  const detectAMPMFormat = () => {
    if (typeof window === 'undefined') return false
    
    const testDate = new Date('2024-01-01T14:30:00')
    const timeString = testDate.toLocaleTimeString()
    return timeString.includes('PM') || timeString.includes('AM')
  }

  const showsAMPM = detectAMPMFormat()

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} (24h format) *
        </label>
      )}
      
      <div className="flex space-x-2">
        {/* Date Input */}
        <div className="flex-1 relative">
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            required={required}
            disabled={disabled}
            className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Time Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            placeholder="HH:MM"
            required={required}
            disabled={disabled}
            pattern="[0-9]{1,2}:[0-9]{2}"
            maxLength={5}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-mono">
            24h
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Format: YYYY-MM-DD HH:MM (24-hour)</span>
        <span className="font-mono">
          Current: {new Date().toLocaleDateString(locale)} {getCurrentTime()}
        </span>
      </div>

      {/* Browser Warning */}
      {showsAMPM && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Your browser may show AM/PM format. Please use 24-hour time (00:00-23:59) in the time field.
        </div>
      )}

      {/* Validation Help */}
      {timeValue && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeValue) && (
        <p className="text-xs text-red-600">
          Please use 24-hour format (00:00-23:59)
        </p>
      )}
    </div>
  )
} 