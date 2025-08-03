'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSwipe } from '@/hooks/use-swipe'

export default function TermsOfServicePage() {
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
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-[#29432B]/70 mb-6">
              <strong>Effective Date:</strong> July 2025
            </p>

            <p className="mb-6">
              Welcome to Second Turn!
            </p>

            <p className="mb-6">
              By accessing our website at <strong>https://secondturn.games</strong>, you agree to these terms:
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Use of Site</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>You may browse the site and sign up to receive launch notifications.</li>
              <li>You must not misuse the site or attempt unauthorized access.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Email Signup</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>By submitting your email, you consent to receive occasional updates from us.</li>
              <li>You can unsubscribe at any time.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Intellectual Property</h2>
            <p className="mb-6">
              All content, logos, and trademarks on this site are the property of Second Turn Games.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Changes</h2>
            <p className="mb-6">
              We may update these terms at any time. Your continued use signifies your agreement.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Contact</h2>
            <p className="mb-6">
              Questions? Email us at: <a href="mailto:info@secondturn.games" className="text-[#D95323] underline">info@secondturn.games</a>
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