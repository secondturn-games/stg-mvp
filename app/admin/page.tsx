"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  Users,
  Package,
  MessageSquare,
  Shield,
  Search,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  Dice1,
  Dice6,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

const reports = [
  {
    id: 1,
    type: "listing",
    status: "pending",
    reporter: "Anna L.",
    reported: "Suspicious User",
    reason: "Fake listing - stock photos used",
    content: "Wingspan board game listing",
    timestamp: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    type: "message",
    status: "pending",
    reporter: "Tomas K.",
    reported: "BadActor123",
    reason: "Inappropriate language",
    content: "Message thread about Azul",
    timestamp: "4 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "user",
    status: "resolved",
    reporter: "Līga R.",
    reported: "ScammerUser",
    reason: "Attempted fraud",
    content: "User profile",
    timestamp: "1 day ago",
    priority: "high",
  },
]

const users = [
  {
    id: 1,
    username: "kristjan_m",
    email: "kristjan@example.com",
    status: "active",
    joinDate: "Jan 2023",
    listings: 12,
    trades: 24,
    rating: 4.9,
    reports: 0,
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    username: "liga_r",
    email: "liga@example.com",
    status: "active",
    joinDate: "Feb 2023",
    listings: 8,
    trades: 15,
    rating: 4.8,
    reports: 0,
    lastActive: "1 day ago",
  },
  {
    id: 3,
    username: "suspicious_user",
    email: "fake@example.com",
    status: "flagged",
    joinDate: "1 week ago",
    listings: 25,
    trades: 0,
    rating: 0,
    reports: 3,
    lastActive: "3 hours ago",
  },
]

const stats = {
  totalUsers: 1234,
  activeListings: 2847,
  pendingReports: 5,
  resolvedToday: 12,
  newUsersToday: 23,
  tradesCompleted: 5691,
}

export default function AdminPage() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleReportAction = (reportId, action) => {
    console.log(`${action} report ${reportId}`)
    // Handle report action
  }

  const handleUserAction = (userId, action) => {
    console.log(`${action} user ${userId}`)
    // Handle user action
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="w-8 h-8 text-vibrant-orange mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.activeListings.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.pendingReports}</div>
              <div className="text-sm text-gray-600">Pending Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.resolvedToday}</div>
              <div className="text-sm text-gray-600">Resolved Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.newUsersToday}</div>
              <div className="text-sm text-gray-600">New Users Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.tradesCompleted.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Trades</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>Review and moderate reported content</CardDescription>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge
                                className={`${
                                  report.priority === "high"
                                    ? "bg-red-100 text-red-800"
                                    : report.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {report.priority} priority
                              </Badge>
                              <Badge variant="outline">{report.type}</Badge>
                              <Badge
                                className={`${
                                  report.status === "pending"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {report.status}
                              </Badge>
                            </div>

                            <div>
                              <h4 className="font-semibold">{report.reason}</h4>
                              <p className="text-sm text-gray-600">
                                Reported by <strong>{report.reporter}</strong> against{" "}
                                <strong>{report.reported}</strong>
                              </p>
                              <p className="text-sm text-gray-500">Content: {report.content}</p>
                            </div>

                            <div className="text-xs text-gray-500">{report.timestamp}</div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {report.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleReportAction(report.id, "resolve")}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReportAction(report.id, "delete")}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Monitor and manage user accounts</CardDescription>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={`/placeholder.svg?height=48&width=48&text=${user.username[0].toUpperCase()}`}
                              />
                              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>

                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{user.username}</h4>
                                <Badge
                                  className={`${
                                    user.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : user.status === "flagged"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {user.status}
                                </Badge>
                                {user.reports > 0 && (
                                  <Badge className="bg-red-100 text-red-800">{user.reports} reports</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span>Joined {user.joinDate}</span>
                                <span>{user.listings} listings</span>
                                <span>{user.trades} trades</span>
                                <span>Rating: {user.rating}/5</span>
                                <span>Last active: {user.lastActive}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            {user.status !== "banned" && (
                              <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, "ban")}>
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listing Moderation</CardTitle>
                <CardDescription>Review and manage game listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Listing moderation tools coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Message Moderation</CardTitle>
                <CardDescription>Monitor reported messages and conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Message moderation tools coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
