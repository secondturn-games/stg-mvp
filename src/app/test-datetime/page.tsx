'use client'

import { useState } from 'react'
import DateTimeInput from '@/components/ui/DateTimeInput'

export default function TestDateTimePage() {
  const [testValue, setTestValue] = useState('')
  const [results, setResults] = useState<string[]>([])

  const handleDateTimeChange = (value: string) => {
    setTestValue(value)
    const date = new Date(value)
    const results = [
      `Input Value: ${value}`,
      `ISO String: ${date.toISOString()}`,
      `Local String: ${date.toString()}`,
      `24h Time: ${date.toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      `12h Time: ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
      `Date: ${date.toLocaleDateString('et-EE')}`,
    ]
    setResults(results)
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">24-Hour Format Test</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">DateTimeInput Component Test</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <DateTimeInput
              value={testValue}
              onChange={handleDateTimeChange}
              min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
              label="Test End Time"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {result}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Select a date and time to see results</p>
            )}
          </div>
        </div>

        {/* Browser Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Browser Information</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Current Time Formats</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Current Time (24h):</strong> {new Date().toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div>
                <strong>Current Time (12h):</strong> {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              <div>
                <strong>Current Date:</strong> {new Date().toLocaleDateString('et-EE')}
              </div>
              <div>
                <strong>Browser Locale:</strong> {typeof window !== 'undefined' ? navigator.language : 'Server'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Test Cases</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-blue-50 rounded">
                <strong>Test 1:</strong> Try entering "14:30" in the time field
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <strong>Test 2:</strong> Try entering "2:30 PM" (should be rejected)
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <strong>Test 3:</strong> Try entering "25:00" (should be rejected)
              </div>
              <div className="p-2 bg-blue-50 rounded">
                <strong>Test 4:</strong> Check if AM/PM warning appears
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 