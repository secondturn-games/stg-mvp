"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Dice1,
  Dice6,
  Trophy,
  Star,
  Clock,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

const communityPosts = [
  {
    id: 1,
    author: {
      name: "Kristjan M.",
      avatar: "/placeholder.svg?height=40&width=40",
      badge: "Top Trader",
    },
    title: "Just discovered Wingspan and I'm obsessed! 🦅",
    content:
      "Finally got to play this beautiful engine-building game. The artwork is stunning and the gameplay is so satisfying. Already looking for the European expansion!",
    timestamp: "2 hours ago",
    likes: 12,
    comments: 5,
    tags: ["Wingspan", "Engine Building", "Recommendation"],
    image: "/placeholder.svg?height=200&width=300&text=Wingspan+Setup",
  },
  {
    id: 2,
    author: {
      name: "Līga R.",
      avatar: "/placeholder.svg?height=40&width=40",
      badge: "Community Helper",
    },
    title: "Riga Board Game Café Meetup - This Saturday!",
    content:
      "Join us at Spēļu Kafejnīca this Saturday at 2 PM for our monthly meetup. We'll have plenty of games to try and it's a great way to meet fellow gamers. Beginners welcome!",
    timestamp: "5 hours ago",
    likes: 8,
    comments: 12,
    tags: ["Event", "Riga", "Meetup"],
    isEvent: true,
    eventDate: "Jan 27, 2024",
    eventLocation: "Riga, Latvia",
  },
  {
    id: 3,
    author: {
      name: "Tomas K.",
      avatar: "/placeholder.svg?height=40&width=40",
      badge: "Game Guru",
    },
    title: "Review: Azul - A Perfect Gateway Game",
    content:
      "Just finished a comprehensive review of Azul. It's an excellent choice for introducing new players to modern board games. Beautiful components, simple rules, but deep strategy.",
    timestamp: "1 day ago",
    likes: 15,
    comments: 8,
    tags: ["Review", "Azul", "Gateway Game"],
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Tallinn Board Game Night",
    date: "Jan 25, 2024",
    time: "7:00 PM",
    location: "Telliskivi Creative City",
    city: "Tallinn, Estonia",
    attendees: 24,
    maxAttendees: 30,
    organizer: "Anna L.",
    description: "Weekly board game night with a focus on strategy games.",
  },
  {
    id: 2,
    title: "Vilnius Indie Game Showcase",
    date: "Jan 28, 2024",
    time: "3:00 PM",
    location: "Loftas Art Factory",
    city: "Vilnius, Lithuania",
    attendees: 18,
    maxAttendees: 25,
    organizer: "Mindaugas P.",
    description: "Discover and play the latest indie board games from local designers.",
  },
  {
    id: 3,
    title: "Riga Trading Day",
    date: "Feb 3, 2024",
    time: "12:00 PM",
    location: "Galleria Riga",
    city: "Riga, Latvia",
    attendees: 35,
    maxAttendees: 50,
    organizer: "Līga R.",
    description: "Bring games to trade and discover new additions to your collection.",
  },
]

const topTraders = [
  {
    name: "Kristjan M.",
    avatar: "/placeholder.svg?height=40&width=40",
    trades: 47,
    rating: 4.9,
    location: "Tallinn, Estonia",
    badge: "Top Trader",
  },
  {
    name: "Līga R.",
    avatar: "/placeholder.svg?height=40&width=40",
    trades: 38,
    rating: 4.8,
    location: "Riga, Latvia",
    badge: "Community Helper",
  },
  {
    name: "Tomas K.",
    avatar: "/placeholder.svg?height=40&width=40",
    trades: 32,
    rating: 5.0,
    location: "Kaunas, Lithuania",
    badge: "Game Guru",
  },
]

export default function CommunityPage() {
  const [newPost, setNewPost] = useState("")
  const [selectedTab, setSelectedTab] = useState("feed")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-green mb-4">Baltic Board Game Community</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with fellow board game enthusiasts across Estonia, Latvia, and Lithuania. Share experiences,
            discover new games, and join local events.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-green">1,234</div>
              <div className="text-sm text-gray-600">Active Members</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <MessageSquare className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-green">2,847</div>
              <div className="text-sm text-gray-600">Community Posts</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Calendar className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-green">156</div>
              <div className="text-sm text-gray-600">Events This Month</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <div className="text-2xl font-bold text-dark-green">5,691</div>
              <div className="text-sm text-gray-600">Successful Trades</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="feed">Community Feed</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                {/* Create Post */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                        <AvatarFallback>YU</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Share your board game experiences, ask questions, or start a discussion..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          className="border-warm-yellow focus:border-vibrant-orange mb-4"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="bg-transparent">
                              📷 Photo
                            </Button>
                            <Button size="sm" variant="outline" className="bg-transparent">
                              📅 Event
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            className="bg-vibrant-orange hover:bg-vibrant-orange/90"
                            disabled={!newPost.trim()}
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts */}
                {communityPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{post.author.name}</h3>
                            <Badge className="bg-warm-yellow text-dark-green text-xs">{post.author.badge}</Badge>
                            <span className="text-sm text-gray-500">{post.timestamp}</span>
                          </div>

                          <h4 className="font-medium text-lg mb-2">{post.title}</h4>
                          <p className="text-gray-700 mb-4">{post.content}</p>

                          {post.image && (
                            <div className="mb-4">
                              <img
                                src={post.image || "/placeholder.svg"}
                                alt="Post image"
                                className="rounded-lg max-w-full h-48 object-cover"
                              />
                            </div>
                          )}

                          {post.isEvent && (
                            <div className="bg-warm-yellow/20 rounded-lg p-3 mb-4">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1 text-vibrant-orange" />
                                  {post.eventDate}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-vibrant-orange" />
                                  {post.eventLocation}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Button size="sm" variant="ghost" className="text-gray-600 hover:text-vibrant-orange">
                                <Heart className="w-4 h-4 mr-1" />
                                {post.likes}
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-600 hover:text-vibrant-orange">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {post.comments}
                              </Button>
                              <Button size="sm" variant="ghost" className="text-gray-600 hover:text-vibrant-orange">
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-dark-green">Upcoming Events</h2>
                  <Button className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </div>

                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-dark-green mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                        </div>
                        <Badge className="bg-warm-yellow text-dark-green">
                          {event.attendees}/{event.maxAttendees} attending
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-vibrant-orange" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-vibrant-orange" />
                          {event.location}, {event.city}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Organized by <strong>{event.organizer}</strong>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Learn More
                          </Button>
                          <Button size="sm" className="bg-vibrant-orange hover:bg-vibrant-orange/90">
                            Join Event
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="discussions" className="space-y-6">
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Discussion Forums Coming Soon</h3>
                  <p className="text-gray-500 mb-4">
                    We're building dedicated discussion forums for game reviews, strategy tips, and more.
                  </p>
                  <Button variant="outline" className="border-warm-yellow hover:bg-warm-yellow/20 bg-transparent">
                    Get Notified
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Traders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-vibrant-orange" />
                  Top Community Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topTraders.map((trader, index) => (
                  <div key={trader.name} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-vibrant-orange text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={trader.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{trader.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{trader.name}</h4>
                        <Badge className="bg-warm-yellow text-dark-green text-xs">{trader.badge}</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{trader.trades} trades</span>
                        <span>•</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 fill-warm-yellow text-warm-yellow mr-1" />
                          {trader.rating}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{trader.location}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Community Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/safety" className="flex items-center text-sm text-gray-600 hover:text-vibrant-orange">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Safety Guidelines
                </Link>
                <Link href="/rules" className="flex items-center text-sm text-gray-600 hover:text-vibrant-orange">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Community Rules
                </Link>
                <Link href="/help" className="flex items-center text-sm text-gray-600 hover:text-vibrant-orange">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Help Center
                </Link>
                <Link href="/feedback" className="flex items-center text-sm text-gray-600 hover:text-vibrant-orange">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Give Feedback
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-vibrant-orange" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { user: "Anna L.", action: "joined the community", time: "5 min ago" },
                  { user: "Mart P.", action: "listed Catan", time: "12 min ago" },
                  { user: "Janis M.", action: "completed a trade", time: "1 hour ago" },
                  { user: "Ruta K.", action: "joined Riga meetup", time: "2 hours ago" },
                ].map((activity, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600"> {activity.action}</span>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
