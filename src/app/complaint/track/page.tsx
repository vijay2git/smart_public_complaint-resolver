'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton, FloatingIcon, StaggerContainer, StaggerItem } from '@/components/ui/animated';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  MapPin,
  Tag,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Loader2,
  CircleDot,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { formatDate, timeAgo, getCategoryIcon } from '@/lib/utils';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  priority_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  ai_classification?: {
    category: string;
    confidence: number;
    keywords: string[];
  };
}

const statusConfig = {
  pending: { 
    color: 'from-yellow-500 to-amber-500', 
    icon: Clock, 
    label: 'Pending',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
  },
  in_progress: { 
    color: 'from-blue-500 to-cyan-500', 
    icon: RefreshCw, 
    label: 'In Progress',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  escalated: { 
    color: 'from-red-500 to-orange-500', 
    icon: AlertTriangle, 
    label: 'Escalated',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
  resolved: { 
    color: 'from-green-500 to-emerald-500', 
    icon: CheckCircle, 
    label: 'Resolved',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  closed: { 
    color: 'from-gray-500 to-gray-600', 
    icon: CircleDot, 
    label: 'Closed',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
  },
};

export default function TrackComplaint() {
  const searchParams = useSearchParams();
  const complaintId = searchParams.get('id');
  const successMessage = searchParams.get('success');

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(complaintId || '');

  const fetchComplaint = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockComplaint: Complaint = {
        id: id,
        title: 'Large pothole on Main Street near intersection',
        description: 'There is a large pothole approximately 2 feet wide on Main Street, near the intersection with Oak Avenue. It has been causing traffic issues and is a safety hazard for cyclists.',
        category: 'pothole',
        severity: 'high',
        priority_score: 85,
        status: 'in_progress',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Main Street & Oak Avenue, New York, NY'
        },
        ai_classification: {
          category: 'pothole',
          confidence: 0.92,
          keywords: ['pothole', 'road damage', 'traffic', 'safety hazard', 'Main Street']
        }
      };

      setComplaint(mockComplaint);
    } catch (err) {
      setError('Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchComplaint(complaintId);
    } else {
      setLoading(false);
    }
  }, [complaintId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.history.pushState({}, '', `?id=${searchInput}`);
      fetchComplaint(searchInput);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-orange-500';
    if (score >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-green-500 to-emerald-500';
  };

  const currentStatus = complaint ? statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending : statusConfig.pending;

  return (
    <div className="min-h-screen retro-grid noise-overlay">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <AnimatedSection delay={0.1}>
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Track Your <span className="text-amber-400">Complaint</span>
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Enter your complaint ID to check its status and progress
            </p>
          </div>
        </AnimatedSection>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <AnimatedCard className="border-green-500/30 bg-green-500/5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-200">Complaint Submitted Successfully!</h3>
                    <p className="text-sm text-gray-400">Your complaint is being analyzed by our AI system.</p>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Form */}
        <AnimatedSection delay={0.2} className="mb-8">
          <AnimatedCard>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter complaint ID (e.g., CMP-12345)"
                  className="glass-input pl-12"
                />
              </div>
              <GlowButton type="submit" disabled={!searchInput.trim()}>
                <span className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </span>
              </GlowButton>
            </form>
          </AnimatedCard>
        </AnimatedSection>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnimatedCard className="py-16 text-center">
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading complaint details...</p>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="border-red-500/30 bg-red-500/5 py-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="font-semibold text-red-200 mb-2">Error Loading Complaint</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <GlowButton onClick={() => fetchComplaint(searchInput)}>
                  Try Again
                </GlowButton>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaint Details */}
        <AnimatePresence>
          {!loading && !error && complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Info Card */}
              <AnimatedCard>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="glass-badge text-xs">{complaint.id}</span>
                      <motion.div
                        className={`glass-badge ${currentStatus.bg} ${currentStatus.border} ${currentStatus.text}`}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <currentStatus.icon className="w-3 h-3" />
                        <span>{currentStatus.label}</span>
                      </motion.div>
                    </div>
                    <h2 className="font-display text-2xl font-semibold text-white">{complaint.title}</h2>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getPriorityColor(complaint.priority_score)} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{complaint.priority_score}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Priority</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed mb-6">{complaint.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-input bg-white/5">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs">Category</span>
                    </div>
                    <p className="text-white flex items-center">
                      <span className="mr-2">{getCategoryIcon(complaint.category)}</span>
                      <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                    </p>
                  </div>

                  <div className="glass-input bg-white/5">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs">Severity</span>
                    </div>
                    <span className={`glass-badge ${
                      complaint.severity === 'critical' ? 'text-red-400 border-red-500/30' :
                      complaint.severity === 'high' ? 'text-orange-400 border-orange-500/30' :
                      'text-amber-400 border-amber-500/30'
                    }`}>
                      {complaint.severity}
                    </span>
                  </div>

                  {complaint.location && (
                    <div className="glass-input bg-white/5">
                      <div className="flex items-center space-x-2 text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">Location</span>
                      </div>
                      <p className="text-white text-sm truncate">
                        {complaint.location.address || 'Coordinates captured'}
                      </p>
                    </div>
                  )}

                  <div className="glass-input bg-white/5">
                    <div className="flex items-center space-x-2 text-gray-500 mb-1">
                      <Timer className="w-4 h-4" />
                      <span className="text-xs">Submitted</span>
                    </div>
                    <p className="text-white text-sm">{timeAgo(complaint.created_at)}</p>
                  </div>
                </div>
              </AnimatedCard>

              {/* AI Analysis Card */}
              {complaint.ai_classification && (
                <AnimatedCard delay={0.1}>
                  <div className="flex items-center space-x-3 mb-6">
                    <FloatingIcon>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </FloatingIcon>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-white">AI Analysis</h3>
                      <p className="text-sm text-gray-400">Intelligent insights from our AI</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Identified Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {complaint.ai_classification.keywords.map((keyword, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-badge"
                          >
                            {keyword}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-2">Classification Confidence</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${complaint.ai_classification.confidence * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          />
                        </div>
                        <span className="text-amber-400 font-semibold">
                          {Math.round(complaint.ai_classification.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              )}

              {/* Timeline */}
              <AnimatedCard delay={0.2}>
                <h3 className="font-display text-lg font-semibold text-white mb-6">Status Timeline</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-4 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Complaint Submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(complaint.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${
                      complaint.status !== 'pending' 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                        : 'bg-white/10'
                    }`}>
                      <RefreshCw className={`w-5 h-5 ${complaint.status !== 'pending' ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${complaint.status !== 'pending' ? 'text-white' : 'text-gray-500'}`}>
                        Under Review
                      </p>
                      <p className="text-sm text-gray-500">
                        {complaint.status !== 'pending' ? formatDate(complaint.updated_at) : 'Awaiting review'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${
                      complaint.status === 'resolved' || complaint.status === 'closed'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                        : 'bg-white/10'
                    }`}>
                      <CheckCircle className={`w-5 h-5 ${
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-white' : 'text-gray-500'
                      }`}>
                        Resolution
                      </p>
                      <p className="text-sm text-gray-500">
                        {complaint.status === 'resolved' || complaint.status === 'closed' 
                          ? 'Completed' 
                          : 'In Progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <Link href="/complaint/submit">
                  <GlowButton variant="secondary">
                    Submit New Complaint
                  </GlowButton>
                </Link>
                <GlowButton onClick={() => fetchComplaint(complaint.id)}>
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh Status</span>
                  </span>
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Complaint Selected */}
        <AnimatePresence>
          {!loading && !error && !complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AnimatedCard className="py-16 text-center">
                <FloatingIcon>
                  <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                </FloatingIcon>
                <h3 className="font-display text-xl font-semibold text-white mb-2">No Complaint Selected</h3>
                <p className="text-gray-400">Enter a complaint ID above to track its status</p>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
