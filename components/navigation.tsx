"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, User, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b-2 border-[#29432B] bg-[#E6EAD7]/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/nav-logo-light.svg"
              alt="Second Turn"
              width={175}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/games" className="text-gray-600 hover:text-vibrant-orange transition-colors">
              Browse Games
            </Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-vibrant-orange transition-colors">
              How It Works
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-vibrant-orange transition-colors">
              Community
            </Link>
          </nav>

          {/* Desktop buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                  <Link href="/list-game">
                    <Plus className="w-4 h-4 mr-2" />
                    List a Game
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    {profile?.username || 'Profile'}
                  </Link>
                </Button>
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                  <Link href="/signup">Join Community</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/games" className="text-gray-600 hover:text-vibrant-orange transition-colors">
                Browse Games
              </Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-vibrant-orange transition-colors">
                How It Works
              </Link>
              <Link href="/community" className="text-gray-600 hover:text-vibrant-orange transition-colors">
                Community
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                      <Link href="/list-game">
                        <Plus className="w-4 h-4 mr-2" />
                        List a Game
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/profile">
                        <User className="w-4 h-4 mr-2" />
                        {profile?.username || 'Profile'}
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={signOut} className="justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="justify-start">
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                      <Link href="/signup">Join Community</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 