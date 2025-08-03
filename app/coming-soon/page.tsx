'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      toast.error('Request timed out. Please try again.')
    }, 10000) // 10 second timeout

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase() })

      clearTimeout(timeoutId)

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          toast.error('You\'re already signed up!')
        } else {
          toast.error('Something went wrong. Please try again.')
        }
        return
      }

      // Success case
      toast.success('Thanks! You\'ll be notified when we launch.')
      setEmail('')
      setIsSubscribed(true)
      
    } catch (error) {
      clearTimeout(timeoutId)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSignup = () => {
    setIsSubscribed(false)
    setEmail('')
  }

  return (
    <main className="min-h-screen bg-[#E6EAD7] text-[#29432B] flex flex-col">
      {/* Header */}
      <header className="p-6 pt-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src="/logo-dark.png" 
            alt="Second Turn Games" 
            className="mx-auto w-80 h-auto lg:w-80"
          />
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg w-full"
        >
          <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
           Almost ready to roll!
          </h1>
          
          <p className="text-lg lg:text-xl mb-8 text-[#29432B]/80">
           Discover, trade, and relive the joy of pre-loved board games. Built for the Baltic community.
          </p>

          {!isSubscribed ? (
            /* Email Signup Form */
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 border-[#29432B]/20 focus:border-[#D95323] bg-white/80 backdrop-blur-sm rounded-2xl"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#D95323] hover:bg-[#D95323]/90 text-white px-8 py-3 rounded-2xl font-medium transition-colors disabled:bg-[#E6EAD7] disabled:text-[#29432B]/50"
                >
                  {isLoading ? 'Signing up...' : 'Be the first to know!'}
                </Button>
              </div>
              

            </motion.form>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[#F2C94C]/20"
            >
              <div className="text-[#F2C94C] mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-[#29432B]">
                You're all set!
              </h2>
              <p className="text-lg mb-6 text-[#29432B]/80">
                We'll notify you as soon as Second Turn launches. Get ready to give your games a second turn!
              </p>
              <Button
                onClick={handleNewSignup}
                className="bg-[#D95323] hover:bg-[#D95323]/90 text-white px-6 py-2 rounded-2xl font-medium transition-colors"
              >
                Sign up another email
              </Button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-4"
        >
          <p className="text-sm text-[#29432B]/70">
            Contact us:{' '}
            <a 
              href="mailto:info@secondturn.games" 
              className="underline hover:text-[#D95323] transition-colors"
            >
              info@secondturn.games
            </a>
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a 
              href="/privacy" 
              className="underline hover:text-[#D95323] transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/cookies" 
              className="underline hover:text-[#D95323] transition-colors"
            >
              Cookie Policy
            </a>
            <a 
              href="/terms" 
              className="underline hover:text-[#D95323] transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
      </footer>
    </main>
  )
} 