'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, GlowButton } from '@/components/ui/animated';
import { 
  AlertCircle, 
  BarChart3, 
  Clock, 
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Eye,
  Sparkles,
  X,
  Mail
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
  user: { email: string; full_name?: string };
  ai_classification?: { confidence: number; keywords: string[] };
}

const statusConfig: Record<string, { border: string; text: string; label: string }> = {
  pending: { border: 'border-amber-500/50', text: 'text-amber-400', label: 'Pending' },
  in_progress: { border: 'border-blue-500/50', text: 'text-blue-400', label: 'In Progress' },
  escalated: { border: 'border-red-500/50', text: 'text-red-400', label: 'Escalated' },
  resolved: { border: 'border-green-500/50', text: 'text-green-400', label: 'Resolved' },
  closed: { border: 'border-gray-500/50', text: 'text-gray-400', label: 'Closed' },
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [stats, setStats] = useState({ total: 156, pending: 42, inProgress: 28, escalated: 8, resolved: 78 });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockComplaints: Complaint[] = [
        { id: 'CMP-001', title: 'Large pothole on Main Street', description: 'Dangerous pothole...', category: 'pothole', severity: 'high', priority_score: 92, status: 'pending', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'john@example.com', full_name: 'John Doe' }, ai_classification: { confidence: 0.95, keywords: ['pothole', 'traffic'] } },
        { id: 'CMP-002', title: 'Water leak from fire hydrant', description: 'Leaking water...', category: 'water_leak', severity: 'critical', priority_score: 98, status: 'pending', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'jane@example.com', full_name: 'Jane Smith' }, ai_classification: { confidence: 0.92, keywords: ['water', 'leak'] } },
        { id: 'CMP-003', title: 'Broken streetlight at Park', description: 'Streetlight out...', category: 'streetlight', severity: 'medium', priority_score: 75, status: 'in_progress', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'mike@example.com', full_name: 'Mike Wilson' }, ai_classification: { confidence: 0.88, keywords: ['streetlight', 'broken'] } },
        { id: 'CMP-004', title: 'Overflowing trash bins', description: 'Multiple bins...', category: 'trash', severity: 'medium', priority_score: 68, status: 'pending', created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'sarah@example.com', full_name: 'Sarah Jones' }, ai_classification: { confidence: 0.91, keywords: ['trash', 'overflow'] } },
      ];

      setComplaints(mockComplaints);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const filteredComplaints = complaints.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setComplaints(complaints.map(c => 
      c.id === complaintId ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
    ));
    
    try {
      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', data: { complaintId } }),
      });
    } catch (error) {
      console.error('Email trigger failed:', error);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'text-red-400 border-red-500/30';
    if (score >= 50) return 'text-amber-400 border-amber-500/30';
    return 'text-green-400 border-green-500/30';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Blue Glow */}
      <div className="blue-glow" />
      <div className="retro-grid opacity-20" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg tracking-[0.2em] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                ADMIN
              </span>
              <span className="text-lg tracking-[0.2em] text-blue-400" style={{ fontFamily: 'Playfair Display, serif' }}>
                DASHBOARD
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/">
                <GlowButton variant="secondary" className="!px-4 !py-2 text-xs">Home</GlowButton>
              </Link>
              <GlowButton onClick={fetchComplaints} className="!px-4 !py-2 text-xs">
                <span className="flex items-center space-x-2">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </span>
              </GlowButton>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <AnimatedSection delay={0.1} className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'border-white/10' },
              { label: 'Pending', value: stats.pending, color: 'border-amber-500/30' },
              { label: 'In Progress', value: stats.inProgress, color: 'border-blue-500/30' },
              { label: 'Escalated', value: stats.escalated, color: 'border-red-500/30' },
              { label: 'Resolved', value: stats.resolved, color: 'border-green-500/30' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white/[0.02] border ${stat.color} rounded p-4`}
              >
                <p className="text-xs text-gray-500 tracking-wide uppercase mb-2">{stat.label}</p>
                <span className="text-2xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Complaint Queue */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Complaint Queue</h2>
                  <p className="text-sm text-gray-500">{filteredComplaints.length} complaints • Ranked by priority</p>
                </div>
                <div className="relative mt-3 md:mt-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="glass-input !py-2 !pl-9 text-sm w-full md:w-48"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-6">
                {['', 'pending', 'in_progress', 'escalated', 'resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters({ ...filters, status })}
                    className={`px-3 py-1 rounded text-xs font-medium tracking-wide uppercase transition-colors ${
                      filters.status === status
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/20'
                    }`}
                  >
                    {status ? status.replace('_', ' ') : 'All'}
                  </button>
                ))}
              </div>

              {/* List */}
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredComplaints.map((complaint, index) => {
                    const status = statusConfig[complaint.status] || statusConfig.pending;
                    return (
                      <motion.div
                        key={complaint.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`
                          p-4 rounded border cursor-pointer transition-all
                          ${selectedComplaint?.id === complaint.id 
                            ? 'border-blue-500/50 bg-blue-500/5' 
                            : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
                              <span className={`px-2 py-0.5 border rounded text-xs ${status.border} ${status.text}`}>
                                {status.label}
                              </span>
                            </div>
                            <h3 className="text-white truncate">{complaint.title}</h3>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <span>{getCategoryIcon(complaint.category)} {complaint.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{complaint.user.full_name || complaint.user.email}</span>
                              <span>•</span>
                              <span>{timeAgo(complaint.created_at)}</span>
                            </div>
                          </div>
                          <div className={`w-14 h-14 rounded border ${getPriorityColor(complaint.priority_score)} flex items-center justify-center ml-3 bg-white/5`}>
                            <span className="text-lg font-light text-white">{complaint.priority_score}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            <AnimatePresence mode="wait">
              {selectedComplaint ? (
                <motion.div
                  key={selectedComplaint.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Details</h3>
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="w-8 h-8 rounded border border-white/10 flex items-center justify-center hover:border-white/20"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white mb-2">{selectedComplaint.title}</h4>
                        <p className="text-sm text-gray-400">{selectedComplaint.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                          <p className="text-xs text-gray-500 mb-1">Category</p>
                          <p className="text-white capitalize">{selectedComplaint.category.replace('_', ' ')}</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                          <p className="text-xs text-gray-500 mb-1">Severity</p>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            selectedComplaint.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            selectedComplaint.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {selectedComplaint.severity}
                          </span>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                          <p className="text-xs text-gray-500 mb-1">Priority</p>
                          <p className="text-xl text-white">{selectedComplaint.priority_score}</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                          <p className="text-xs text-gray-500 mb-1">Citizen</p>
                          <p className="text-white truncate">{selectedComplaint.user.full_name || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Email Status */}
                      <div className="p-3 border border-blue-500/30 bg-blue-500/5 rounded">
                        <div className="flex items-center space-x-2 mb-1">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <p className="text-xs text-blue-400 tracking-wide uppercase">Email Status</p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {selectedComplaint.status === 'pending' ? '✓ Received email sent' :
                           selectedComplaint.status === 'in_progress' ? '✓ Review & Work emails sent' :
                           selectedComplaint.status === 'resolved' ? '✓ All emails completed' :
                           'Auto-scheduled'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        <GlowButton 
                          onClick={() => handleStatusChange(selectedComplaint.id, 'in_progress')}
                          disabled={selectedComplaint.status === 'in_progress' || selectedComplaint.status === 'resolved'}
                          className="w-full !py-2 text-xs"
                        >
                          Start Work • Sends Email
                        </GlowButton>
                        <GlowButton 
                          variant="secondary"
                          onClick={() => handleStatusChange(selectedComplaint.id, 'resolved')}
                          disabled={selectedComplaint.status === 'resolved'}
                          className="w-full !py-2 text-xs"
                        >
                          Mark Resolved • Sends Email
                        </GlowButton>
                        <button
                          onClick={() => handleStatusChange(selectedComplaint.id, 'escalated')}
                          className="w-full py-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-xs tracking-wide uppercase"
                        >
                          Escalate
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-card py-16 text-center">
                  <Eye className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Select a Complaint</h3>
                  <p className="text-sm text-gray-500">Click to view details and take action</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
