'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSwipe } from '@/hooks/use-swipe'

export default function CookiePolicyPage() {
  const router = useRouter()
  const mainRef = useRef<HTMLElement>(null)

  const { isSwiping } = useSwipe(mainRef, {
    onSwipeRight: () => {
      // Swipe right to go back to home
      router.push('/coming-soon')
    }
  })

  return (
    <main 
      ref={mainRef}
      className={`min-h-screen bg-[#E6EAD7] text-[#29432B] transition-opacity duration-200 ${
        isSwiping ? 'opacity-90' : 'opacity-100'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
            Cookie Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-[#29432B]/70 mb-6">
              <strong>Effective Date:</strong> July 2025
            </p>

            <p className="mb-6">
              Our landing page does <strong>not</strong> use cookies or tracking technologies at this time.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Future Updates</h2>
            <p className="mb-6">
              If we introduce cookies in the future (e.g., for analytics), this policy will be updated accordingly and users will be notified via a cookie banner.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">What Are Cookies?</h2>
            <p className="mb-6">
              Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Contact Us</h2>
            <p className="mb-6">
              If you have any questions about our cookie policy, please contact us at: <a href="mailto:info@secondturn.games" className="text-[#D95323] underline">info@secondturn.games</a>
            </p>

            <div className="mt-12 pt-6 border-t border-[#29432B]/20">
              <a 
                href="/coming-soon" 
                className="inline-flex items-center text-[#D95323] hover:underline"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 