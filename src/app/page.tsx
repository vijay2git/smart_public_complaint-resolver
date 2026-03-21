'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedCard, AnimatedSection, StaggerContainer, StaggerItem, FloatingIcon, GlowButton } from '@/components/ui/animated';
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
  Bell
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen retro-grid noise-overlay">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-white/5"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <AlertCircle className="w-6 h-6 text-retro-dark" />
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                Complaint<span className="text-amber-400">Resolver</span>
              </span>
            </motion.div>
            
            <nav className="hidden md:flex items-center space-x-2">
              <Link href="/complaint/submit">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Submit
                </motion.span>
              </Link>
              <Link href="/complaint/track">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Track
                </motion.span>
              </Link>
              <Link href="/admin/dashboard">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm glass-badge cursor-pointer"
                >
                  Admin Portal
                </motion.span>
              </Link>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection delay={0.1}>
            <motion.div 
              className="inline-flex items-center space-x-2 glass-badge mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200">AI-Powered Resolution System</span>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Smart Public{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Complaint
                </span>
                <motion.span 
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-amber-500/30 -skew-x-3"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                />
              </span>
              {' '}Resolver
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Report issues in your community with ease. Our AI analyzes, prioritizes, 
              and routes complaints to the right teams automatically.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/complaint/submit">
                <GlowButton className="flex items-center space-x-2 text-base px-8 py-4">
                  <FileText className="w-5 h-5" />
                  <span>Submit a Complaint</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </GlowButton>
              </Link>
              <Link href="/complaint/track">
                <GlowButton variant="secondary" className="flex items-center space-x-2 text-base px-8 py-4">
                  <Clock className="w-5 h-5" />
                  <span>Track Status</span>
                </GlowButton>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection delay={0.5} className="relative z-10 container mx-auto px-6 mb-20">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '24h', label: 'Avg. Resolution', icon: Clock },
            { value: '98%', label: 'Satisfaction', icon: Star },
            { value: '10k+', label: 'Resolved', icon: CheckCircle },
            { value: '150+', label: 'Departments', icon: Users },
          ].map((stat, i) => (
            <StaggerItem key={i}>
              <div className="glass-card p-6 text-center group">
                <FloatingIcon delay={i * 0.2}>
                  <stat.icon className="w-6 h-6 text-amber-400 mx-auto mb-3 group-hover:text-amber-300 transition-colors" />
                </FloatingIcon>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection delay={0.6} className="relative z-10 container mx-auto px-6 mb-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It <span className="text-amber-400">Works</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Our intelligent system streamlines complaint resolution from submission to completion
          </p>
        </div>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.15}>
          {[
            {
              icon: FileText,
              title: 'Easy Submission',
              description: 'Submit via text, photo, or voice with automatic geolocation',
              color: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Zap,
              title: 'AI Analysis',
              description: 'Automatic categorization, severity detection, and duplicate checking',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: TrendingUp,
              title: 'Smart Priority',
              description: 'Dynamic scoring based on severity, time, and community impact',
              color: 'from-green-500 to-emerald-500',
            },
            {
              icon: Shield,
              title: 'Auto Escalation',
              description: 'SLA monitoring with automatic escalation for overdue tickets',
              color: 'from-orange-500 to-red-500',
            },
          ].map((feature, i) => (
            <StaggerItem key={i}>
              <AnimatedCard variant="hover" className="h-full group cursor-pointer">
                <FloatingIcon delay={i * 0.3} className="mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                </FloatingIcon>
                <h3 className="font-display text-xl font-semibold mb-2 text-white group-hover:text-amber-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection delay={0.7} className="relative z-10 container mx-auto px-6 mb-20">
        <div className="gradient-border p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a <span className="text-amber-400">Difference</span>?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Your voice matters. Help improve your community by reporting issues that need attention.
          </p>
          <Link href="/complaint/submit">
            <GlowButton className="flex items-center space-x-2 mx-auto text-lg px-10 py-5">
              <Sparkles className="w-5 h-5" />
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </GlowButton>
          </Link>
        </div>
      </AnimatedSection>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 border-t border-white/5 py-8"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-retro-dark" />
              </div>
              <span className="font-display text-lg font-semibold">
                Complaint<span className="text-amber-400">Resolver</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 Smart Public Complaint Resolver. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
