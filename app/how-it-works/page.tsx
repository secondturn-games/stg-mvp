"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MessageCircle,
  Handshake,
  Shield,
  Star,
  MapPin,
  Camera,
  Euro,
  CheckCircle,
  Dice1,
  Dice6,
  Users,
  Package,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"


const steps = [
  {
    number: 1,
    title: "Sign Up",
    description: "Create your free account in under 2 minutes",
    icon: Users,
    details: ["Quick mobile registration", "Add your Baltic location", "Optional profile photo"],
  },
  {
    number: 2,
    title: "List Games",
    description: "Use BGG search to list games instantly",
    icon: Package,
    details: ["Search game by name", "Auto-fill all details", "Take photos with your phone"],
  },
  {
    number: 3,
    title: "Find & Chat",
    description: "Browse local games and message sellers",
    icon: Search,
    details: ["Filter by your city", "Check seller ratings", "Chat directly in-app"],
  },
  {
    number: 4,
    title: "Meet & Trade",
    description: "Meet safely and complete your trade",
    icon: Handshake,
    details: ["Meet in public places", "Pay cash or mobile payment", "Leave a review"],
  },
]

const safetyTips = [
  {
    icon: MapPin,
    title: "Public Meetups",
    description: "Cafes, malls, game stores",
  },
  {
    icon: Shield,
    title: "Check Profiles",
    description: "Reviews and ratings first",
  },
  {
    icon: Euro,
    title: "Safe Payments",
    description: "Cash or secure mobile pay",
  },
  {
    icon: Camera,
    title: "Inspect Games",
    description: "Check condition before buying",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-light-beige">


      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Badge className="mb-4 bg-warm-yellow text-dark-green hover:bg-warm-yellow text-sm">
            🎲 Simple & Safe Trading
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-dark-green mb-4 leading-tight">
            How Second Turn
            <br />
            <span className="text-vibrant-orange">Works</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 px-2">
            Trading board games in the Baltics has never been easier. Four simple steps to get started.
          </p>
          <Button size="lg" className="bg-vibrant-orange hover:bg-vibrant-orange/90 w-full max-w-sm" asChild>
                            <Link href="/join">Get Started Now</Link>
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Steps Section */}
      <section className="py-12 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-dark-green mb-2">Four Simple Steps</h2>
          <p className="text-gray-600">From listing to trading in minutes</p>
        </div>

        <div className="space-y-8">
          {steps.map((step) => (
            <Card key={step.number} className="border-warm-yellow shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-vibrant-orange rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <step.icon className="w-6 h-6 text-vibrant-orange mr-2" />
                      <h3 className="text-xl font-bold text-dark-green">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Mobile-First BGG Integration */}
      <section className="py-12 px-4 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-dark-green mb-2">Powered by BoardGameGeek</h2>
          <p className="text-gray-600 px-2">List games in seconds with auto-filled details</p>
        </div>

        <div className="space-y-4">
          <Card className="border-warm-yellow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warm-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-vibrant-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-green">Search BGG Database</h3>
                  <p className="text-sm text-gray-600">Find from 100,000+ games</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warm-yellow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warm-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-vibrant-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-green">Auto-Fill Details</h3>
                  <p className="text-sm text-gray-600">All info filled automatically</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warm-yellow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warm-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-5 h-5 text-vibrant-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-green">Add Your Photos</h3>
                  <p className="text-sm text-gray-600">Take photos with your phone</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile-Optimized Safety Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-dark-green mb-2">Stay Safe</h2>
          <p className="text-gray-600">Essential safety tips for mobile trading</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safetyTips.map((tip, index) => (
            <Card key={index} className="border-warm-yellow">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-warm-yellow/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <tip.icon className="w-5 h-5 text-vibrant-orange" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-600">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button
            variant="outline"
            asChild
            className="border-warm-yellow hover:bg-warm-yellow/20 bg-transparent w-full max-w-sm"
          >
            <Link href="/safety">Full Safety Guide</Link>
          </Button>
        </div>
      </section>

      {/* Mobile-First Community Features */}
      <section className="py-12 px-4 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-bold text-dark-green mb-2">Join the Community</h2>
          <p className="text-gray-600 px-2">More than just trading</p>
        </div>

        <div className="space-y-4">
          <Card className="border-warm-yellow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-vibrant-orange flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-dark-green">Local Meetups</h3>
                  <p className="text-sm text-gray-600">Game nights in your city</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warm-yellow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-8 h-8 text-vibrant-orange flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-dark-green">Discussions</h3>
                  <p className="text-sm text-gray-600">Reviews and recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warm-yellow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-vibrant-orange flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-dark-green">Trust System</h3>
                  <p className="text-sm text-gray-600">Ratings and reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mobile-Optimized CTA Section */}
      <section className="py-12 px-4 bg-vibrant-orange text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-lg mb-6 opacity-90 px-2">Join thousands of Baltic board gamers</p>
          <div className="space-y-3">
            <Button size="lg" variant="secondary" className="w-full max-w-sm" asChild>
                              <Link href="/join">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full max-w-sm border-white text-white hover:bg-white hover:text-vibrant-orange bg-transparent"
              asChild
            >
              <Link href="/games">Browse Games Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile-Optimized Footer */}
      <footer className="bg-dark-green text-white py-8 px-4">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="flex items-center space-x-1">
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <Dice1 className="w-3 h-3 text-dark-green" />
                </div>
                <div className="w-5 h-5 bg-vibrant-orange rounded flex items-center justify-center">
                  <Dice6 className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold leading-tight">Second Turn</span>
                <span className="text-xs text-gray-300 leading-tight">secondturn.games</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">Board game marketplace for the Baltics</p>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/games" className="hover:text-white">
                    Browse Games
                  </Link>
                </li>
                <li>
                  <Link href="/list-game" className="hover:text-white">
                    List a Game
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white">
                    Safety Tips
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4 text-center text-gray-300 text-xs">
            <p>&copy; 2024 Second Turn Games. Every game deserves a second turn.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
