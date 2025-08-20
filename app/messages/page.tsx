"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Send, MoreVertical, Archive, Flag, Dice1, Dice6, ImageIcon, Paperclip } from "lucide-react"
import Link from "next/link"


const conversations = [
  {
    id: 1,
    user: {
      name: "Līga R.",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    game: {
      title: "Wingspan",
      image: "/placeholder.svg?height=60&width=60&text=Wingspan",
    },
    lastMessage: "Great! I can meet you at Galleria Riga tomorrow at 3 PM.",
    timestamp: "2 min ago",
    unread: 2,
    active: true,
  },
  {
    id: 2,
    user: {
      name: "Tomas K.",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
    game: {
      title: "Azul",
      image: "/placeholder.svg?height=60&width=60&text=Azul",
    },
    lastMessage: "Is the game still available? I'm very interested.",
    timestamp: "1 hour ago",
    unread: 0,
    active: false,
  },
  {
    id: 3,
    user: {
      name: "Anna L.",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    game: {
      title: "Ticket to Ride",
      image: "/placeholder.svg?height=60&width=60&text=TTR",
    },
    lastMessage: "Thanks for the quick response! The game looks perfect.",
    timestamp: "3 hours ago",
    unread: 0,
    active: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "Līga R.",
    content: "Hi! I'm interested in your Wingspan game. Is it still available?",
    timestamp: "Yesterday 2:30 PM",
    isOwn: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Yes, it's still available! It's in excellent condition, played only twice.",
    timestamp: "Yesterday 3:15 PM",
    isOwn: true,
  },
  {
    id: 3,
    sender: "Līga R.",
    content: "Perfect! Could you send me a few more photos of the components?",
    timestamp: "Yesterday 3:20 PM",
    isOwn: false,
  },
  {
    id: 4,
    sender: "You",
    content: "Of course! Here are some detailed photos of the cards and wooden pieces.",
    timestamp: "Yesterday 4:00 PM",
    isOwn: true,
    hasImage: true,
  },
  {
    id: 5,
    sender: "Līga R.",
    content: "Looks great! I'd like to buy it. Are you available for pickup this week?",
    timestamp: "Today 10:30 AM",
    isOwn: false,
  },
  {
    id: 6,
    sender: "You",
    content: "Yes! I'm free tomorrow afternoon. How about meeting at Galleria Riga?",
    timestamp: "Today 11:00 AM",
    isOwn: true,
  },
  {
    id: 7,
    sender: "Līga R.",
    content: "Great! I can meet you at Galleria Riga tomorrow at 3 PM.",
    timestamp: "2 min ago",
    isOwn: false,
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const sendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("")
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.game.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-warm-yellow focus:border-vibrant-orange"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                      selectedConversation.id === conversation.id
                        ? "border-vibrant-orange bg-warm-yellow/10"
                        : "border-transparent"
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                        </Avatar>
                        {conversation.user.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm truncate">{conversation.user.name}</span>
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          <img
                            src={conversation.game.image || "/placeholder.svg"}
                            alt={conversation.game.title}
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="text-xs text-gray-600 truncate">{conversation.game.title}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate flex-1">{conversation.lastMessage}</p>
                          {conversation.unread > 0 && (
                            <Badge className="bg-vibrant-orange text-white text-xs ml-2">{conversation.unread}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {/* Chat Header */}
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.user.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <img
                        src={selectedConversation.game.image || "/placeholder.svg"}
                        alt={selectedConversation.game.title}
                        className="w-4 h-4 rounded"
                      />
                      <span>About: {selectedConversation.game.title}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Flag className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <Separator />

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.isOwn ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.isOwn ? "bg-vibrant-orange text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.hasImage && (
                        <div className="mt-2 p-2 bg-white/20 rounded">
                          <div className="flex items-center text-xs">
                            <ImageIcon className="w-4 h-4 mr-1" />3 photos attached
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${message.isOwn ? "text-right" : "text-left"}`}>
                      {message.timestamp}
                    </div>
                  </div>

                  {!message.isOwn && (
                    <Avatar className="w-6 h-6 order-1 mr-2 mt-auto">
                      <AvatarImage src={selectedConversation.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{selectedConversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </CardContent>

            <Separator />

            {/* Message Input */}
            <div className="p-4 flex-shrink-0">
              <div className="flex items-end space-x-2">
                <Button size="sm" variant="outline" className="bg-transparent">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="border-warm-yellow focus:border-vibrant-orange"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-vibrant-orange hover:bg-vibrant-orange/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                💡 Tip: Meet in public places and use secure payment methods
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
