"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  MapPin,
  Eye,
  CreditCard,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Camera,
  Users,
  Clock,
  Flag,
  Dice1,
  Dice6,
  Menu,
  X,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"


const safetyTips = [
  {
    icon: MapPin,
    title: "Meet in Public Places",
    description: "Always meet in well-lit, busy public locations",
    tips: [
      "Shopping malls and cafes are ideal",
      "Board game stores welcome trades",
      "Avoid private homes or isolated areas",
      "Bring a friend if possible",
    ],
    priority: "high",
  },
  {
    icon: Eye,
    title: "Inspect Before Buying",
    description: "Thoroughly check the game condition",
    tips: [
      "Count all pieces and cards",
      "Check for damage or wear",
      "Verify completeness against BGG",
      "Ask questions about condition",
    ],
    priority: "high",
  },
  {
    icon: CreditCard,
    title: "Safe Payment Methods",
    description: "Use secure payment options",
    tips: [
      "Cash is safest for local trades",
      "Mobile payments (Swish, MobilePay)",
      "Avoid wire transfers to strangers",
      "Never pay before seeing the game",
    ],
    priority: "high",
  },
  {
    icon: MessageCircle,
    title: "Communication Best Practices",
    description: "Keep conversations on the platform",
    tips: [
      "Use Second Turn messaging system",
      "Be clear about meeting details",
      "Confirm before traveling",
      "Save important messages",
    ],
    priority: "medium",
  },
  {
    icon: Users,
    title: "Check Seller Profiles",
    description: "Research before committing to trade",
    tips: [
      "Read reviews and ratings",
      "Check account age and activity",
      "Look for verified profiles",
      "Trust your instincts",
    ],
    priority: "medium",
  },
  {
    icon: Camera,
    title: "Document Everything",
    description: "Keep records of your transactions",
    tips: [
      "Take photos of the game condition",
      "Screenshot important messages",
      "Keep receipts if applicable",
      "Note meeting details",
    ],
    priority: "low",
  },
]

const redFlags = [
  "Seller refuses to meet in public",
  "Asks for payment before meeting",
  "Won't provide additional photos",
  "Pressures you to decide quickly",
  "Has no reviews or ratings",
  "Asks to communicate off-platform",
  "Price seems too good to be true",
  "Avoids answering direct questions",
]

const emergencyContacts = [
  {
    country: "Estonia",
    flag: "🇪🇪",
    police: "112",
    consumerProtection: "+372 620 1707",
  },
  {
    country: "Latvia",
    flag: "🇱🇻",
    police: "112",
    consumerProtection: "+371 67 228 322",
  },
  {
    country: "Lithuania",
    flag: "🇱🇹",
    police: "112",
    consumerProtection: "+370 5 262 6751",
  },
]

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-light-beige">


      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-vibrant-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-dark-green mb-4">Safety Guidelines</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your safety is our priority. Follow these guidelines to trade board games safely in the Baltic region.
          </p>
        </div>

        {/* Quick Safety Alert */}
        <Alert className="mb-8 border-vibrant-orange bg-vibrant-orange/10">
          <AlertTriangle className="h-4 w-4 text-vibrant-orange" />
          <AlertDescription className="text-dark-green">
            <strong>Remember:</strong> If something feels wrong, trust your instincts. It's better to walk away from a
            deal than compromise your safety.
          </AlertDescription>
        </Alert>

        {/* Safety Tips Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark-green mb-6">Essential Safety Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {safetyTips.map((tip, index) => (
              <Card key={index} className="border-warm-yellow">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        tip.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : tip.priority === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <tip.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{tip.title}</span>
                        <Badge
                          className={`text-xs ${
                            tip.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : tip.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {tip.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 font-normal mt-1">{tip.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tip.tips.map((tipItem, tipIndex) => (
                      <li key={tipIndex} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{tipItem}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Red Flags Section */}
        <div className="mb-12">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <Flag className="w-5 h-5 mr-2" />
                Red Flags - When to Walk Away
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">{flag}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meeting Guidelines */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark-green mb-6">Safe Meeting Guidelines</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-warm-yellow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2 text-vibrant-orange" />
                  Before Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Confirm meeting details in writing</div>
                <div>• Share location with a friend</div>
                <div>• Check seller's profile and reviews</div>
                <div>• Agree on payment method</div>
                <div>• Plan your transportation</div>
              </CardContent>
            </Card>

            <Card className="border-warm-yellow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-5 h-5 mr-2 text-vibrant-orange" />
                  During Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Meet in daylight hours</div>
                <div>• Stay in public areas</div>
                <div>• Inspect the game thoroughly</div>
                <div>• Count all components</div>
                <div>• Trust your instincts</div>
              </CardContent>
            </Card>

            <Card className="border-warm-yellow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CheckCircle className="w-5 h-5 mr-2 text-vibrant-orange" />
                  After Meeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Leave a review for the seller</div>
                <div>• Report any issues to us</div>
                <div>• Keep transaction records</div>
                <div>• Update your inventory</div>
                <div>• Share your experience</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Meeting Places */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark-green mb-6">Recommended Meeting Places</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-warm-yellow">
              <CardHeader>
                <CardTitle className="text-lg">🇪🇪 Estonia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Ülemiste Centre (Tallinn)</div>
                <div>• Rocca al Mare (Tallinn)</div>
                <div>• Tartu Kaubamaja</div>
                <div>• Local libraries</div>
                <div>• Board game cafes</div>
              </CardContent>
            </Card>

            <Card className="border-warm-yellow">
              <CardHeader>
                <CardTitle className="text-lg">🇱🇻 Latvia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Galleria Riga</div>
                <div>• Spice Shopping Centre</div>
                <div>• Alfa Shopping Centre</div>
                <div>• Central Library</div>
                <div>• Game stores</div>
              </CardContent>
            </Card>

            <Card className="border-warm-yellow">
              <CardHeader>
                <CardTitle className="text-lg">🇱🇹 Lithuania</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>• Akropolis (Vilnius)</div>
                <div>• Panorama (Vilnius)</div>
                <div>• Mega Shopping Centre</div>
                <div>• Public libraries</div>
                <div>• Coffee shops</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-dark-green mb-6">Emergency Contacts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <span className="text-2xl mr-2">{contact.flag}</span>
                    {contact.country}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Emergency:</span>
                    <a href={`tel:${contact.police}`} className="text-red-600 font-bold">
                      {contact.police}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Consumer Protection:</span>
                    <a href={`tel:${contact.consumerProtection}`} className="text-vibrant-orange font-medium text-sm">
                      {contact.consumerProtection}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Report Issues */}
        <Card className="mb-12 border-vibrant-orange">
          <CardHeader>
            <CardTitle className="flex items-center text-vibrant-orange">
              <Flag className="w-5 h-5 mr-2" />
              Report Safety Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you encounter any safety issues, suspicious behavior, or have concerns about a user, please report it
              immediately. Our team reviews all reports within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-vibrant-orange hover:bg-vibrant-orange/90" asChild>
                <Link href="/report">Report an Issue</Link>
              </Button>
              <Button variant="outline" className="bg-transparent" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-green mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/community-guidelines">
                <ExternalLink className="w-4 h-4 mr-2" />
                Community Guidelines
              </Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/terms">
                <ExternalLink className="w-4 h-4 mr-2" />
                Terms of Service
              </Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/privacy">
                <ExternalLink className="w-4 h-4 mr-2" />
                Privacy Policy
              </Link>
            </Button>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/help">
                <ExternalLink className="w-4 h-4 mr-2" />
                Help Center
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
