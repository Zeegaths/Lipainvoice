import React, { useState, useEffect } from "react";
import {
  Bitcoin,
  Users,
  CheckSquare,
  Award,
  Shield,
  Star,
  ArrowRight,
  Play,
  Menu,
  X,
  Zap,
  Globe,
  TrendingUp,
  Clock,
  FileText,
  Smartphone,
  Monitor,
  ChevronRight,
  Quote,
  Check,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";

export type Page =
  | "landing"
  | "dashboard"
  | "create-invoice"
  | "admin"
  | "task-logger"
  | "team-payments"
  | "client-portal"
  | "settings";

interface LandingPageProps {
  onNavigate: (page: Page) => void;
}

export const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Bitcoin,
      title: "Bitcoin Invoicing",
      description:
        "Create professional invoices with Bitcoin payment integration. Generate QR codes and track payments in real-time.",
      benefits: [
        "Instant Bitcoin payments",
        "QR code generation",
        "Real-time tracking",
        "USD conversion",
      ],
      image: "/assets/bitcoin-invoice-mockup.png",
    },
    {
      icon: Users,
      title: "Team Payment Splits",
      description:
        "Automatically split payments among team members with transparent, trustless distribution.",
      benefits: [
        "Automatic splitting",
        "Transparent allocation",
        "On-chain verification",
        "Team collaboration",
      ],
      image: "/assets/team-split-mockup.png",
    },
    {
      icon: CheckSquare,
      title: "Task Tracking",
      description:
        "Log tasks, track time, and seamlessly integrate with your invoices for accurate billing.",
      benefits: [
        "Time tracking",
        "Task management",
        "Invoice integration",
        "Productivity insights",
      ],
      image: "/assets/task-tracker-mockup.png",
    },
    {
      icon: Award,
      title: "Reputation System",
      description:
        "Build your professional reputation with multi-tier badges and client reviews.",
      benefits: [
        "Multi-tier badges",
        "Client reviews",
        "Reputation scoring",
        "Professional growth",
      ],
      image: "/assets/reputation-mockup.png",
    },
    {
      icon: Shield,
      title: "Admin Controls",
      description:
        "Comprehensive admin dashboard with analytics, user management, and platform insights.",
      benefits: [
        "User management",
        "Analytics dashboard",
        "Platform insights",
        "Performance metrics",
      ],
      image: "/assets/admin-mockup.png",
    },
    {
      icon: Smartphone,
      title: "Client Portals",
      description:
        "Branded payment portals for clients with mobile-optimized payment experience.",
      benefits: [
        "Mobile-optimized",
        "Branded experience",
        "Easy payments",
        "Client reviews",
      ],
      image: "/assets/client-portal-mockup.png",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      company: "TechCorp",
      rating: 5,
      comment:
        "LipaInvoice revolutionized how I handle payments. The Bitcoin integration is seamless and the team split feature saves me hours of manual calculations.",
      avatar: "/assets/avatar-sarah.jpg",
    },
    {
      name: "Mike Rodriguez",
      role: "Design Agency Owner",
      company: "Creative Studios",
      rating: 5,
      comment:
        "The reputation system helped me showcase my expertise to new clients. The badge progression keeps me motivated to deliver excellent work.",
      avatar: "/assets/avatar-mike.jpg",
    },
    {
      name: "Alex Johnson",
      role: "Blockchain Consultant",
      company: "CryptoStartup",
      rating: 5,
      comment:
        "Finally, a platform that understands crypto freelancers. The client payment portals are professional and the Bitcoin payments are instant.",
      avatar: "/assets/avatar-alex.jpg",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "₿0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 10 invoices/month",
        "Basic task tracking",
        "Bitcoin payments",
        "Client payment portals",
        "Basic reputation badges",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "₿0.001",
      period: "per month",
      description: "For growing freelancers",
      features: [
        "Unlimited invoices",
        "Advanced task tracking",
        "Team payment splits",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For agencies and teams",
      features: [
        "Everything in Pro",
        "Multi-user accounts",
        "Advanced admin controls",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const handleGetStarted = () => {
    onNavigate("dashboard");
  };

  return (
    <div className="">
      {/* Navigation */}
      <Navbar onNavigate={onNavigate} />

      {/* Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* Stats Section */}
      <Stats />

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How LipaInvoice Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple, powerful workflow designed
              for modern freelancers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description:
                  "Sign up with Internet Identity for secure, decentralized authentication.",
                icon: Shield,
              },
              {
                step: "02",
                title: "Track Your Work",
                description:
                  "Log tasks, track time, and organize your projects with our intuitive tools.",
                icon: CheckSquare,
              },
              {
                step: "03",
                title: "Generate Invoice",
                description:
                  "Create professional Bitcoin invoices with team splits and file attachments.",
                icon: FileText,
              },
              {
                step: "04",
                title: "Get Paid",
                description:
                  "Share payment portals with clients and receive instant Bitcoin payments.",
                icon: Bitcoin,
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-orange-500 to-yellow-500 text-white shadow-2xl transform scale-105"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-white text-orange-500 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <div
                    className={`text-4xl font-bold mb-2 ${
                      plan.popular ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </div>
                  <div
                    className={`text-sm ${
                      plan.popular ? "text-orange-100" : "text-gray-600"
                    }`}
                  >
                    {plan.period}
                  </div>
                  <p
                    className={`mt-4 ${
                      plan.popular ? "text-orange-100" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check
                        className={`h-5 w-5 mr-3 ${
                          plan.popular ? "text-white" : "text-green-500"
                        }`}
                      />
                      <span
                        className={
                          plan.popular ? "text-white" : "text-gray-700"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? "bg-white text-orange-500 hover:bg-gray-100"
                      : "bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Freelance Business?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of freelancers who are already earning more and
            working smarter with LipaInvoice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-white text-orange-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              Start Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => scrollToSection("demo")}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-orange-500 transition-all duration-200 flex items-center justify-center"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </button>
          </div>
          <p className="text-orange-100 text-sm mt-6">
            No credit card required • Free forever plan • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="ml-2 text-xl font-bold">LipaInvoice</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The future of freelance invoicing. Create Bitcoin invoices,
                split payments, track tasks, and build your reputation on the
                decentralized web.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleGetStarted}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 LipaInvoice. All rights reserved.{" "}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
