// Baltic Regional Settings
// Estonia, Latvia, Lithuania regional formatting preferences

export const BALTIC_LOCALES = {
  ESTONIA: 'et-EE',
  LATVIA: 'lv-LV', 
  LITHUANIA: 'lt-LT'
} as const

export type BalticLocale = typeof BALTIC_LOCALES[keyof typeof BALTIC_LOCALES]

// Default to Estonia if no preference set
export const DEFAULT_LOCALE: BalticLocale = 'et-EE'

// Regional date/time formatting options
export const REGIONAL_OPTIONS = {
  date: {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  },
  time: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // 24-hour format
  },
  dateTime: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  }
} as const

// Currency formatting for EUR
export const CURRENCY_OPTIONS = {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
} as const

// Regional formatting functions
export function formatDate(date: Date | string, locale: BalticLocale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, REGIONAL_OPTIONS.date)
}

export function formatTime(date: Date | string, locale: BalticLocale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString(locale, REGIONAL_OPTIONS.time)
}

export function formatDateTime(date: Date | string, locale: BalticLocale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale, REGIONAL_OPTIONS.dateTime)
}

export function formatCurrency(amount: number, locale: BalticLocale = DEFAULT_LOCALE): string {
  return amount.toLocaleString(locale, CURRENCY_OPTIONS)
}

// Relative time formatting (e.g., "2 hours ago")
export function formatRelativeTime(date: Date | string, locale: BalticLocale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} h ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} d ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} w ago`
  }
  
  return formatDate(dateObj, locale)
}

// Auction-specific time formatting
export function formatAuctionTimeLeft(endTime: Date | string): string {
  const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime
  const now = new Date()
  const timeRemaining = endDate.getTime() - now.getTime()
  
  if (timeRemaining <= 0) {
    return 'Ended'
  }
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

// Phone number formatting for Baltic countries
export function formatPhoneNumber(phone: string, locale: BalticLocale = DEFAULT_LOCALE): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Baltic phone number formats
  const formats = {
    'et-EE': '+372', // Estonia
    'lv-LV': '+371', // Latvia  
    'lt-LT': '+370'  // Lithuania
  }
  
  const countryCode = formats[locale]
  
  if (cleaned.startsWith('372') || cleaned.startsWith('371') || cleaned.startsWith('370')) {
    return `+${cleaned}`
  }
  
  if (cleaned.startsWith('0')) {
    return `${countryCode}${cleaned.slice(1)}`
  }
  
  return `${countryCode}${cleaned}`
}

// Address formatting for Baltic countries
export function formatAddress(address: {
  street: string
  city: string
  postalCode: string
  country: string
}, locale: BalticLocale = DEFAULT_LOCALE): string {
  const { street, city, postalCode, country } = address
  
  // Baltic address format: Street, Postal Code City, Country
  return `${street}, ${postalCode} ${city}, ${country}`
}

// Number formatting with Baltic preferences
export function formatNumber(num: number, locale: BalticLocale = DEFAULT_LOCALE): string {
  return num.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

// Get user's preferred locale from browser or default
export function getUserLocale(): BalticLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }
  
  const browserLocale = navigator.language
  
  if (browserLocale.startsWith('et')) return BALTIC_LOCALES.ESTONIA
  if (browserLocale.startsWith('lv')) return BALTIC_LOCALES.LATVIA
  if (browserLocale.startsWith('lt')) return BALTIC_LOCALES.LITHUANIA
  
  return DEFAULT_LOCALE
}

// Ensure 24-hour format for datetime inputs
export function ensure24HourFormat(dateTimeString: string): string {
  if (!dateTimeString) return dateTimeString
  
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

// Validate 24-hour time format
export function validate24HourTime(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeString)
}

// Convert 12-hour time to 24-hour format
export function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = modifier === 'PM' ? '12' : '00'
  } else if (modifier === 'PM') {
    hours = String(parseInt(hours) + 12)
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`
}

// Format time for display with 24-hour format
export function formatTime24Hour(date: Date | string, locale: BalticLocale = DEFAULT_LOCALE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
} 