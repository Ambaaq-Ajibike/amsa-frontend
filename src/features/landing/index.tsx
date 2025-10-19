import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import AmsaLogo from '@/assets/amsa-logo.jpg'

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Spiritual Development",
      description: "Foster spiritual growth through regular prayers, Quranic studies, and Islamic education programs."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Academic Excellence",
      description: "Promote academic achievement through study groups, mentorship programs, and educational workshops."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Community Service",
      description: "Engage in humanitarian projects, medical outreach, and interfaith initiatives to serve society."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Leadership Development",
      description: "Build leadership skills through conventions, seminars, and hands-on community projects."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Unity & Togetherness",
      description: "Strengthen bonds among Ahmadi Muslim students through social events and collaborative activities."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Moral Guidance",
      description: "Uphold ethical values and moral conduct in all academic and personal pursuits."
    }
  ]

  const benefits = [
    "Connect with fellow Ahmadi Muslim students nationwide",
    "Participate in Annual Higher Institution Conventions (AHIC)",
    "Join community service and humanitarian projects",
    "Access educational seminars and spiritual programs",
    "Build lasting friendships and professional networks",
    "Develop leadership skills through hands-on experience"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  src={AmsaLogo}
                  className="h-10 w-10 rounded-full object-cover"
                  alt="AMSA Nigeria"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">AMSA Nigeria</h1>
                <p className="text-xs text-gray-500">Ahmadi Muslim Students' Association</p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2">
              <Link to="/sign-in">
                <Button 
                  variant="outline" 
                  className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button 
                  className="h-9 px-4 text-sm font-medium text-white"
                >
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-52 text-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/hero-bg.png')"
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl text-white">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              AMSA Nigeria
            </span>
          </h1>
          <p className="mb-8 text-xl text-gray-100">
            The Ahmadi Muslim Students' Association - fostering unity, academic excellence, and spiritual growth. 
            Join our community of future leaders committed to "Love for All, Hatred for None."
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Join AMSA Nigeria
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Our Core Pillars of Development
          </h2>
          <p className="text-lg text-muted-foreground">
            AMSA is built on six fundamental principles that guide our mission and activities
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold tracking-tight">
                Why join AMSA Nigeria?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Since 1983, AMSA has been uniting Ahmadi Muslim students across Nigeria, 
                fostering academic excellence, spiritual growth, and community service.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <img
                        src={AmsaLogo}
                        className="h-12 w-12 rounded-full"
                        alt="AMSA Nigeria"
                      />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Ready to join our community?</h3>
                  <p className="mb-6 text-muted-foreground">
                    Become part of a 42-year legacy of unity, excellence, and service
                  </p>
                  <Link to="/sign-up">
                    <Button className="w-full">
                      Create Your Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={AmsaLogo}
                  className="h-8 w-8 rounded-full"
                  alt="AMSA Nigeria"
                />
                <span className="font-semibold">AMSA Nigeria</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fostering unity, academic excellence, and spiritual growth among Ahmadi Muslim students.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/sign-in" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link></li>
                <li><Link to="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Activities</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Annual Conventions</li>
                <li>Community Service</li>
                <li>Educational Programs</li>
                <li>Spiritual Development</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} AMSA Nigeria. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
