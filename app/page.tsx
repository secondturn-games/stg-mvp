import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Users, Star, Package, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-light-beige">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-vibrant-orange/10 via-warm-yellow/5 to-light-beige py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <div className="mx-auto w-28 h-28 bg-vibrant-orange/20 rounded-2xl flex items-center justify-center mb-8">
              <Globe className="w-14 h-14 text-vibrant-orange" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-dark-green mb-8 font-geist">
              Second Turn Games
            </h1>
            <p className="text-xl md:text-2xl text-dark-green/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              The Baltic's premier marketplace for board game enthusiasts. Buy, sell, and discover your next favorite game.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/games">
              <Button className="h-16 px-10 text-xl bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Search className="w-6 h-6 mr-3" />
                Browse Games
              </Button>
            </Link>
            <Link href="/list-game">
              <Button variant="outline" className="h-16 px-10 text-xl border-2 border-vibrant-orange text-vibrant-orange hover:bg-vibrant-orange hover:text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Plus className="w-6 h-6 mr-3" />
                Sell Your Games
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-green text-center mb-20 font-geist">
            Why Choose Second Turn?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="border-2 border-warm-yellow/30 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-warm-yellow/20 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-vibrant-orange" />
                </div>
                <CardTitle className="text-2xl text-dark-green font-geist">Curated Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-dark-green/80 text-lg leading-relaxed">
                  Every game is carefully verified and comes with detailed condition reports. No surprises, just great games.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-warm-yellow/30 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-warm-yellow/20 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-vibrant-orange" />
                </div>
                <CardTitle className="text-2xl text-dark-green font-geist">Local Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-dark-green/80 text-lg leading-relaxed">
                  Connect with fellow board gamers in Latvia, Estonia, and Lithuania. Build lasting friendships through gaming.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-warm-yellow/30 hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-warm-yellow/20 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="w-10 h-10 text-vibrant-orange" />
                </div>
                <CardTitle className="text-2xl text-dark-green font-geist">Trust & Safety</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <p className="text-dark-green/80 text-lg leading-relaxed">
                  Verified sellers, secure transactions, and a rating system that ensures quality experiences for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-green mb-8 font-geist">
            Ready to Start Your Board Game Journey?
          </h2>
          <p className="text-xl text-dark-green/80 mb-10 leading-relaxed">
            Join hundreds of board game enthusiasts across the Baltics
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/join">
              <Button className="h-16 px-10 text-xl bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Started
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="h-16 px-10 text-xl border-2 border-dark-green text-dark-green hover:bg-dark-green hover:text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
