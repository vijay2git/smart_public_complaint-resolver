'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedCard, AnimatedSection, StaggerContainer, StaggerItem, GlowButton } from '@/components/ui/animated';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Star,
  BarChart3,
  Users,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Complaint<span className="text-[#E60023]">Resolver</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/complaint/submit" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                Submit
              </Link>
              <Link href="/complaint/track" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                Track
              </Link>
              <Link href="/admin/dashboard" className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <AnimatedSection delay={0.1}>
            <motion.div 
              className="inline-flex items-center space-x-2 bg-red-50 text-[#E60023] px-4 py-2 rounded-full text-sm font-medium mb-6"
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Resolution System</span>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Report Issues,<br />
              <span className="text-[#E60023]">Get Them Fixed</span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-lg text-gray-600 mb-8">
              Submit complaints about community issues and track them to resolution. 
              Our AI analyzes, prioritizes, and routes them to the right teams.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/complaint/submit">
                <GlowButton className="flex items-center space-x-2 px-8 py-3">
                  <span>Submit a Complaint</span>
                  <ChevronRight className="w-4 h-4" />
                </GlowButton>
              </Link>
              <Link href="/complaint/track">
                <GlowButton variant="secondary" className="flex items-center space-x-2 px-8 py-3">
                  <Search className="w-4 h-4" />
                  <span>Track Status</span>
                </GlowButton>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
            {[
              { value: '24h', label: 'Avg. Resolution' },
              { value: '98%', label: 'Satisfaction' },
              { value: '10k+', label: 'Resolved' },
              { value: '150+', label: 'Departments' },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Simple, fast, and transparent complaint resolution
            </p>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
          {[
            {
              icon: FileText,
              title: 'Submit',
              description: 'Describe your issue with photos and location',
              color: '#E60023',
            },
            {
              icon: Zap,
              title: 'AI Analysis',
              description: 'Automatic categorization and priority scoring',
              color: '#8B5CF6',
            },
            {
              icon: Users,
              title: 'Assignment',
              description: 'Routed to the right department automatically',
              color: '#3B82F6',
            },
            {
              icon: CheckCircle,
              title: 'Resolution',
              description: 'Track progress and get notified when fixed',
              color: '#10B981',
            },
          ].map((feature, i) => (
            <StaggerItem key={i}>
              <AnimatedCard variant="hover" className="h-full text-center p-6">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                What You Can Report
              </h2>
              <p className="text-gray-600">
                Common issue categories we handle
              </p>
            </div>
          </AnimatedSection>

          <StaggerContainer className="flex flex-wrap justify-center gap-3" staggerDelay={0.05}>
            {[
              { icon: '🕳️', label: 'Potholes' },
              { icon: '💧', label: 'Water Leaks' },
              { icon: '💡', label: 'Streetlights' },
              { icon: '🗑️', label: 'Waste' },
              { icon: '🔊', label: 'Noise' },
              { icon: '🅿️', label: 'Parking' },
              { icon: '🚶', label: 'Sidewalks' },
              { icon: '🎨', label: 'Vandalism' },
            ].map((cat, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm"
                >
                  <span>{cat.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <AnimatedSection>
          <div className="gradient-border p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Your voice matters. Help improve your community by reporting issues that need attention.
            </p>
            <Link href="/complaint/submit">
              <GlowButton className="inline-flex items-center space-x-2 px-8 py-3">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </GlowButton>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">ComplaintResolver</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Smart Public Complaint Resolver
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
