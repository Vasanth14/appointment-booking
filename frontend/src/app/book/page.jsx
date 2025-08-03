import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Search, Filter, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function BookPage() {
  const availableSlots = [
    {
      id: 1,
      date: "2024-01-15",
      time: "09:00",
      duration: 60,
      availableSpots: 2,
      totalSpots: 5,
      service: "Consultation"
    },
    {
      id: 2,
      date: "2024-01-15",
      time: "14:00",
      duration: 30,
      availableSpots: 3,
      totalSpots: 3,
      service: "Quick Check"
    },
    {
      id: 3,
      date: "2024-01-16",
      time: "10:00",
      duration: 60,
      availableSpots: 4,
      totalSpots: 5,
      service: "Consultation"
    },
    {
      id: 4,
      date: "2024-01-16",
      time: "15:00",
      duration: 90,
      availableSpots: 2,
      totalSpots: 3,
      service: "Extended Session"
    }
  ]

  const getAvailabilityBadge = (available, total) => {
    const percentage = (available / total) * 100
    if (percentage === 100) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Available</Badge>
    } else if (percentage > 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Limited</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Almost Full</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AppointMate</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Book Your Appointment
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Choose from available time slots and book your appointment with ease. 
            We offer flexible scheduling to fit your busy lifestyle.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Select Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="quick-check">Quick Check</SelectItem>
                      <SelectItem value="extended">Extended Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search Slots
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Slots */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Available Time Slots
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Select a time slot that works best for you
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {availableSlots.map((slot) => (
              <Card key={slot.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {slot.date} at {slot.time}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {slot.service}
                      </p>
                    </div>
                    {getAvailabilityBadge(slot.availableSpots, slot.totalSpots)}
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300">Duration:</span>
                      <span className="font-medium">{slot.duration} minutes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300">Available spots:</span>
                      <span className="font-medium">{slot.availableSpots} of {slot.totalSpots}</span>
                    </div>
                  </div>

                  <Button className="w-full" disabled={slot.availableSpots === 0}>
                    {slot.availableSpots > 0 ? 'Book This Slot' : 'Fully Booked'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Our Booking System?
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Flexible Scheduling</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Choose from multiple time slots that fit your schedule
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Instant Confirmation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Get immediate confirmation and reminders for your appointments
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Easy Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  View and manage your appointments from your dashboard
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-slate-900 dark:text-white">AppointMate</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              © 2024 AppointMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 