'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSwipe } from '@/hooks/use-swipe'

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-[#29432B]/70 mb-6">
              <strong>Effective Date:</strong> July 2025
            </p>

            <p className="mb-6">
              At Second Turn, we respect your privacy. This Privacy Policy explains how we collect, use, and store your personal information — especially your email address — when you sign up to receive notifications about our launch.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">What We Collect</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Email address when you voluntarily provide it via our website form.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">How We Use It</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>To send you updates and notifications about the launch of our platform.</li>
              <li>To improve our marketing and user engagement.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">How We Store It</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Stored securely in our database via Supabase (EU-hosted).</li>
              <li>Access is restricted to authorized personnel only.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">Your Rights</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>You may request to view, update, or delete your data at any time.</li>
              <li>To make such a request, contact us at: <a href="mailto:info@secondturn.games" className="text-[#D95323] underline">info@secondturn.games</a></li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-[#D95323]">No Third-Party Sharing</h2>
            <p className="mb-6">
              We do not share your data with third parties except as required by law.
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