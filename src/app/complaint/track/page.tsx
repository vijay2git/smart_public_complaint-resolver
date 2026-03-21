'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, GlowButton } from '@/components/ui/animated';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  MapPin,
  Sparkles,
  Loader2
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
  location?: { latitude: number; longitude: number; address?: string };
  ai_classification?: { category: string; confidence: number; keywords: string[] };
}

const statusConfig: Record<string, { border: string; text: string; label: string }> = {
  pending: { border: 'border-amber-500/50', text: 'text-amber-400', label: 'Pending' },
  in_progress: { border: 'border-blue-500/50', text: 'text-blue-400', label: 'In Progress' },
  escalated: { border: 'border-red-500/50', text: 'text-red-400', label: 'Escalated' },
  resolved: { border: 'border-green-500/50', text: 'text-green-400', label: 'Resolved' },
  closed: { border: 'border-gray-500/50', text: 'text-gray-400', label: 'Closed' },
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockComplaint: Complaint = {
        id,
        title: 'Large pothole on Main Street near intersection',
        description: 'There is a large pothole approximately 2 feet wide on Main Street, near the intersection with Oak Avenue.',
        category: 'pothole',
        severity: 'high',
        priority_score: 85,
        status: 'in_progress',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        location: { latitude: 40.7128, longitude: -74.0060, address: 'Main Street & Oak Avenue' },
        ai_classification: { category: 'pothole', confidence: 0.92, keywords: ['pothole', 'road', 'traffic'] }
      };

      setComplaint(mockComplaint);
    } catch (err) {
      setError('Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) fetchComplaint(complaintId);
    else setLoading(false);
  }, [complaintId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.history.pushState({}, '', `?id=${searchInput}`);
      fetchComplaint(searchInput);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-400 border-red-500/30';
    if (score >= 50) return 'text-amber-400 border-amber-500/30';
    return 'text-green-400 border-green-500/30';
  };

  const currentStatus = complaint ? statusConfig[complaint.status] || statusConfig.pending : statusConfig.pending;

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Blue Glow */}
      <div className="blue-glow-bottom" />
      <div className="retro-grid opacity-20" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-xs tracking-[0.1em] uppercase">Back</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <AnimatedSection delay={0.1} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Track Your Complaint
          </h1>
          <div className="w-16 h-px bg-blue-500 mx-auto" />
        </AnimatedSection>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="border border-green-500/30 bg-green-500/5 rounded p-4 flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium text-green-400">Complaint Submitted</p>
                  <p className="text-sm text-gray-400">Your complaint is being analyzed</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Form */}
        <AnimatedSection delay={0.2} className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter complaint ID"
                className="glass-input pl-10"
              />
            </div>
            <GlowButton type="submit" disabled={!searchInput.trim()}>
              Search
            </GlowButton>
          </form>
        </AnimatedSection>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card py-16 text-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading complaint details...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="border border-red-500/30 bg-red-500/5 rounded p-8 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 mb-4">{error}</p>
                <GlowButton variant="secondary" onClick={() => fetchComplaint(searchInput)}>
                  Try Again
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaint Details */}
        <AnimatePresence>
          {!loading && !error && complaint && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Main Card */}
              <div className="glass-card p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
                      <span className={`px-3 py-1 border rounded text-xs font-medium ${currentStatus.border} ${currentStatus.text}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                    <h2 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {complaint.title}
                    </h2>
                  </div>
                  <div className={`w-16 h-16 rounded border ${getPriorityColor(complaint.priority_score)} flex items-center justify-center bg-white/5`}>
                    <div className="text-center">
                      <span className="text-2xl font-light text-white">{complaint.priority_score}</span>
                      <p className="text-xs text-gray-500 mt-1">Priority</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed mb-6">{complaint.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Tag className="w-3 h-3 mr-1" />
                      <span className="text-xs tracking-wide uppercase">Category</span>
                    </div>
                    <p className="text-white text-sm flex items-center">
                      <span className="mr-2">{getCategoryIcon(complaint.category)}</span>
                      <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                    <div className="flex items-center text-gray-500 mb-2">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-xs tracking-wide uppercase">Severity</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      complaint.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      complaint.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {complaint.severity}
                    </span>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                    <div className="flex items-center text-gray-500 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-xs tracking-wide uppercase">Location</span>
                    </div>
                    <p className="text-white text-sm truncate">
                      {complaint.location?.address || 'Captured'}
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs tracking-wide uppercase">Submitted</span>
                    </div>
                    <p className="text-white text-sm">{timeAgo(complaint.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {complaint.ai_classification && (
                <div className="glass-card p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg text-white" style={{ fontFamily: 'Playfair Display, serif' }}>AI Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-3 tracking-wide uppercase">Identified Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {complaint.ai_classification.keywords.map((keyword, index) => (
                          <span key={index} className="glass-badge">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-3 tracking-wide uppercase">Classification Confidence</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${complaint.ai_classification.confidence * 100}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                        <span className="text-sm text-white">{Math.round(complaint.ai_classification.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="glass-card p-8">
                <h3 className="text-lg text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Status Timeline</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 border border-green-500/30 rounded flex items-center justify-center mr-4">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white">Submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(complaint.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`w-10 h-10 border rounded flex items-center justify-center mr-4 ${
                      complaint.status !== 'pending' ? 'border-blue-500/30' : 'border-white/10'
                    }`}>
                      <RefreshCw className={`w-4 h-4 ${complaint.status !== 'pending' ? 'text-blue-400' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className={complaint.status !== 'pending' ? 'text-white' : 'text-gray-600'}>Under Review</p>
                      <p className="text-sm text-gray-500">
                        {complaint.status !== 'pending' ? formatDate(complaint.updated_at) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`w-10 h-10 border rounded flex items-center justify-center mr-4 ${
                      complaint.status === 'resolved' || complaint.status === 'closed' ? 'border-green-500/30' : 'border-white/10'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-green-400' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className={complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-white' : 'text-gray-600'}>
                        Resolution
                      </p>
                      <p className="text-sm text-gray-500">
                        {complaint.status === 'resolved' || complaint.status === 'closed' ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <Link href="/complaint/submit">
                  <GlowButton variant="secondary">New Complaint</GlowButton>
                </Link>
                <GlowButton onClick={() => fetchComplaint(complaint.id)}>
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </span>
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Complaint */}
        <AnimatePresence>
          {!loading && !error && !complaint && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="glass-card py-16 text-center">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>No Complaint Selected</h3>
                <p className="text-sm text-gray-500">Enter an ID above to track status</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Tag({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.36-6.36c.94-.94.94-2.48 0-3.42L12 2Z"/>
      <path d="M7 7h.01"/>
    </svg>
  );
}

function TrendingUp({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  );
}
