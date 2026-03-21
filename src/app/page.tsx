'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedCard, AnimatedSection, StaggerContainer, StaggerItem, GlowButton } from '@/components/ui/animated';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Zap,
  Users,
  Sparkles,
  ArrowRight,
  Search,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      {/* Blue Glow Effects */}
      <div className="blue-glow" />
      <div className="blue-glow-bottom" />
      
      {/* Subtle Grid */}
      <div className="fixed inset-0 retro-grid opacity-30 pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-xl font-light tracking-[0.2em] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                COMPLAINT
              </span>
              <span className="text-xl font-light tracking-[0.2em] text-blue-400" style={{ fontFamily: 'Playfair Display, serif' }}>
                RESOLVER
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/complaint/submit" className="text-xs tracking-[0.15em] text-gray-400 hover:text-white transition-colors uppercase">
                Submit
              </Link>
              <Link href="/complaint/track" className="text-xs tracking-[0.15em] text-gray-400 hover:text-white transition-colors uppercase">
                Track
              </Link>
              <Link href="/admin/dashboard" className="text-xs tracking-[0.15em] text-gray-400 hover:text-white transition-colors uppercase">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <AnimatedSection delay={0.2}>
              <div className="inline-flex items-center space-x-2 border border-blue-500/30 px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs tracking-[0.1em] text-blue-400 uppercase">AI-Powered System</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                Public Issue<br />
                <span className="text-blue-400">Resolution</span><br />
                System
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <p className="text-gray-400 text-lg mb-10 max-w-md leading-relaxed">
                Report community issues with precision. Our intelligent system analyzes, 
                prioritizes, and routes complaints to resolution.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/complaint/submit">
                  <GlowButton className="flex items-center space-x-3">
                    <span>Submit Complaint</span>
                    <ArrowRight className="w-4 h-4" />
                  </GlowButton>
                </Link>
                <Link href="/complaint/track">
                  <GlowButton variant="secondary" className="flex items-center space-x-3">
                    <Search className="w-4 h-4" />
                    <span>Track Issue</span>
                  </GlowButton>
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Visual */}
          <AnimatedSection delay={0.6} className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-lg" />
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-900 to-black rounded-lg border border-white/5 overflow-hidden relative">
                {/* Decorative Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-8">
                    <div className="w-20 h-20 mx-auto mb-8 border border-blue-500/30 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-2xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Community First
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Every complaint matters. Our AI ensures urgent issues 
                      receive immediate attention while maintaining 
                      transparent tracking throughout.
                    </p>
                  </div>
                </div>
                {/* Subtle Lines */}
                <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
                <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
                <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Bar */}
      <AnimatedSection delay={1} className="relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '24h', label: 'Avg. Resolution' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '10,000+', label: 'Issues Resolved' },
              { value: '150+', label: 'Departments' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stat.value}
                </div>
                <div className="text-xs tracking-[0.1em] text-gray-500 uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Resolution Process
            </h2>
            <div className="w-24 h-px bg-blue-500 mx-auto" />
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-4 gap-8" staggerDelay={0.15}>
          {[
            {
              number: '01',
              icon: FileText,
              title: 'Submit',
              description: 'Document your issue with precise details and location data',
            },
            {
              number: '02',
              icon: Zap,
              title: 'AI Analysis',
              description: 'Intelligent classification, severity scoring, and duplicate detection',
            },
            {
              number: '03',
              icon: Users,
              title: 'Assignment',
              description: 'Automatic routing to the appropriate department and team',
            },
            {
              number: '04',
              icon: CheckCircle,
              title: 'Resolution',
              description: 'Track progress and receive notifications at every stage',
            },
          ].map((step, i) => (
            <StaggerItem key={i}>
              <div className="glass-card p-8 h-full">
                <div className="text-blue-500/50 text-5xl font-light mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {step.number}
                </div>
                <div className="w-12 h-12 border border-blue-500/30 rounded flex items-center justify-center mb-6">
                  <step.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Categories */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <AnimatedSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Issue Categories
              </h2>
              <div className="w-24 h-px bg-blue-500 mx-auto" />
            </div>
          </AnimatedSection>

          <StaggerContainer className="flex flex-wrap justify-center gap-4" staggerDelay={0.05}>
            {[
              { icon: '🕳️', label: 'Road Damage' },
              { icon: '💧', label: 'Water Systems' },
              { icon: '💡', label: 'Street Lighting' },
              { icon: '🗑️', label: 'Waste Management' },
              { icon: '🔊', label: 'Noise Control' },
              { icon: '🅿️', label: 'Parking Issues' },
              { icon: '🚶', label: 'Pedestrian Safety' },
              { icon: '🎨', label: 'Vandalism' },
            ].map((cat, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ scale: 1.05, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                  className="flex items-center space-x-3 px-6 py-3 border border-white/10 bg-white/[0.02]"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm text-gray-300 tracking-wide">{cat.label}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <AnimatedSection>
          <div className="gradient-border p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Begin Your Submission
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Your report contributes to a better community. Every issue documented 
              brings us closer to resolution.
            </p>
            <Link href="/complaint/submit">
              <GlowButton className="inline-flex items-center space-x-3">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </GlowButton>
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <span className="text-sm tracking-[0.15em] text-gray-500" style={{ fontFamily: 'Playfair Display, serif' }}>
                COMPLAINT RESOLVER
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <span className="text-xs text-gray-600 tracking-wide">
                © {new Date().getFullYear()} All Rights Reserved
              </span>
              <span className="text-xs text-blue-500/50">
                AI-Powered Resolution
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
