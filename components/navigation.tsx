"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, User, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Helper function to get avatar display
  const getAvatarDisplay = () => {
    if (profile?.avatar) {
      return {
        src: profile.avatar,
        fallback: profile.username?.charAt(0).toUpperCase() || 'U'
      }
    }
    
    // For email users, use first letter of email (which is their username)
    if (profile?.username && profile.username.includes('@')) {
      return {
        src: null,
        fallback: profile.username.charAt(0).toUpperCase()
      }
    }
    
    // Fallback to first letter of username or generic user
    return {
      src: null,
      fallback: profile?.username?.charAt(0).toUpperCase() || 'U'
    }
  }





  return (
    <header className="border-b-2 border-dark-green bg-light-beige/95 backdrop-blur-sm sticky top-0 z-50">
      {/* Desktop: 64px height (4rem), Mobile: 56px height (3.5rem) */}
      <div className="px-4 py-2 lg:py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/nav-logo-light.svg"
              alt="Second Turn"
              width={175}
              height={40}
              className="h-10 w-auto lg:h-12"
              priority
            />
          </Link>

                     {/* Mobile menu button and avatar */}
           <div className="lg:hidden flex items-center gap-3">
             {user && (
               <Button variant="ghost" asChild className="p-2 h-auto">
                 <Link href="/profile">
                   <Avatar className="w-8 h-8">
                     <AvatarImage src={getAvatarDisplay().src || undefined} alt={profile?.username || 'Profile'} />
                     <AvatarFallback className="bg-vibrant-orange text-white font-semibold text-sm">
                       {getAvatarDisplay().fallback}
                     </AvatarFallback>
                   </Avatar>
                 </Link>
               </Button>
             )}
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
               {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
           </div>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/games" className="text-dark-green hover:text-vibrant-orange transition-colors font-medium">
              Browse Games
            </Link>
            <Link href="/how-it-works" className="text-dark-green hover:text-vibrant-orange transition-colors font-medium">
              How It Works
            </Link>
            <Link href="/community" className="text-dark-green hover:text-vibrant-orange transition-colors font-medium">
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
                                 <Button variant="ghost" asChild className="p-2 h-auto">
                   <Link href="/profile">
                     <Avatar className="w-8 h-8">
                       <AvatarImage src={getAvatarDisplay().src || undefined} alt={profile?.username || 'Profile'} />
                       <AvatarFallback className="bg-vibrant-orange text-white font-semibold text-sm">
                         {getAvatarDisplay().fallback}
                       </AvatarFallback>
                     </Avatar>
                   </Link>
                 </Button>
              </>
            ) : (
              <>
                <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                  <Link href="/join">Join the Table</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/games" className="text-dark-green hover:text-vibrant-orange transition-colors font-medium">
                Browse Games
              </Link>
              <Link href="/how-it-works" className="text-dark-green hover:text-vibrant-orange transition-colors font-medium">
                How It Works
              </Link>
              <Link href="/community" className="text-dark-green hover:text-vibrant-orange transition-colors font-medium">
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
                                         
                  </>
                ) : (
                  <>
                    <Button asChild className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                      <Link href="/join">Join the Table</Link>
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