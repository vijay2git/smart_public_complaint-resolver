'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton, FloatingIcon, StaggerContainer, StaggerItem } from '@/components/ui/animated';
import { 
  AlertCircle, 
  BarChart3, 
  Clock, 
  Filter, 
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  CheckCircle,
  AlertTriangle,
  Eye,
  LogOut,
  Zap,
  Target,
  Sparkles,
  ChevronDown,
  X,
  Bell
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
  user: {
    email: string;
    full_name?: string;
  };
  ai_classification?: {
    confidence: number;
    keywords: string[];
  };
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  escalated: number;
  resolved: number;
  avgResolutionTime: number;
}

const statusConfig = {
  pending: { color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  in_progress: { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  escalated: { color: 'from-red-500 to-orange-500', bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  resolved: { color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  closed: { color: 'from-gray-500 to-gray-600', bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400' },
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    escalated: 0,
    resolved: 0,
    avgResolutionTime: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockComplaints: Complaint[] = [
        {
          id: 'CMP-001',
          title: 'Large pothole on Main Street causing traffic issues',
          description: 'There is a dangerous pothole approximately 3 feet wide...',
          category: 'pothole',
          severity: 'high',
          priority_score: 92,
          status: 'pending',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: { email: 'john.doe@example.com', full_name: 'John Doe' },
          ai_classification: { confidence: 0.95, keywords: ['pothole', 'traffic', 'safety'] },
        },
        {
          id: 'CMP-002',
          title: 'Water leak from fire hydrant on Oak Avenue',
          description: 'Fire hydrant is leaking water onto the street...',
          category: 'water_leak',
          severity: 'critical',
          priority_score: 98,
          status: 'pending',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: { email: 'jane.smith@example.com', full_name: 'Jane Smith' },
          ai_classification: { confidence: 0.92, keywords: ['water', 'leak', 'hydrant'] },
        },
        {
          id: 'CMP-003',
          title: 'Broken streetlight at Park entrance',
          description: 'Streetlight has been out for 3 days...',
          category: 'streetlight',
          severity: 'medium',
          priority_score: 75,
          status: 'in_progress',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          user: { email: 'mike.wilson@example.com', full_name: 'Mike Wilson' },
          ai_classification: { confidence: 0.88, keywords: ['streetlight', 'broken', 'safety'] },
        },
        {
          id: 'CMP-004',
          title: 'Overflowing trash bins at Central Park',
          description: 'Multiple trash bins are overflowing...',
          category: 'trash',
          severity: 'medium',
          priority_score: 68,
          status: 'pending',
          created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          user: { email: 'sarah.jones@example.com', full_name: 'Sarah Jones' },
          ai_classification: { confidence: 0.91, keywords: ['trash', 'overflowing', 'pests'] },
        },
        {
          id: 'CMP-005',
          title: 'Noise complaint from construction site',
          description: 'Construction starting before 7 AM...',
          category: 'noise',
          severity: 'low',
          priority_score: 45,
          status: 'resolved',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          user: { email: 'bob.brown@example.com', full_name: 'Bob Brown' },
          ai_classification: { confidence: 0.85, keywords: ['noise', 'construction', 'ordinance'] },
        },
      ];

      setComplaints(mockComplaints);
      setStats({
        total: 156,
        pending: 42,
        inProgress: 28,
        escalated: 8,
        resolved: 78,
        avgResolutionTime: 24.5,
      });
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(complaint => {
    if (filters.status && complaint.status !== filters.status) return false;
    if (filters.category && complaint.category !== filters.category) return false;
    if (filters.priority) {
      if (filters.priority === 'high' && complaint.priority_score < 80) return false;
      if (filters.priority === 'medium' && (complaint.priority_score < 50 || complaint.priority_score >= 80)) return false;
      if (filters.priority === 'low' && complaint.priority_score >= 50) return false;
    }
    if (filters.search && !complaint.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-orange-500';
    if (score >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-green-500 to-emerald-500';
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    // Update local state
    setComplaints(complaints.map(c => 
      c.id === complaintId ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
    ));
    
    // Trigger email notification
    try {
      let stage = 'under_review';
      if (newStatus === 'in_progress') stage = 'work_started';
      if (newStatus === 'resolved') stage = 'completed';
      
      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'advance',
          data: { complaintId },
        }),
      });
      
      console.log(`Email notification triggered for ${complaintId}: ${stage}`);
    } catch (error) {
      console.error('Failed to trigger email:', error);
    }
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: BarChart3, color: 'from-gray-500 to-gray-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-amber-500' },
    { label: 'In Progress', value: stats.inProgress, icon: RefreshCw, color: 'from-blue-500 to-cyan-500' },
    { label: 'Escalated', value: stats.escalated, icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen retro-grid noise-overlay">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 border-b border-white/5"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <AlertCircle className="w-6 h-6 text-retro-dark" />
              </div>
              <div>
                <h1 className="font-display text-xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Complaint Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/">
                <GlowButton variant="secondary" className="!px-4 !py-2 text-sm">
                  Home
                </GlowButton>
              </Link>
              <GlowButton onClick={fetchComplaints} className="!px-4 !py-2 text-sm">
                <span className="flex items-center space-x-2">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </span>
              </GlowButton>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <AnimatedSection delay={0.1} className="mb-8">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4" staggerDelay={0.1}>
            {statCards.map((stat, i) => (
              <StaggerItem key={i}>
                <AnimatedCard className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <motion.span 
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {stat.value}
                  </motion.span>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Complaint Queue */}
          <div className="lg:col-span-2">
            <AnimatedCard delay={0.2}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-white">Complaint Queue</h2>
                  <p className="text-sm text-gray-500">Ranked by priority • {filteredComplaints.length} complaints</p>
                </div>
                <div className="relative mt-4 md:mt-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="glass-input pl-10 !py-2 text-sm w-full md:w-64"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['status', 'category', 'priority'].map((filterType) => (
                  <select
                    key={filterType}
                    className="glass-input !py-2 !px-3 text-sm capitalize"
                    value={filters[filterType as keyof typeof filters]}
                    onChange={(e) => setFilters({ ...filters, [filterType]: e.target.value })}
                  >
                    <option value="">All {filterType}s</option>
                    {filterType === 'status' && (
                      <>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="escalated">Escalated</option>
                        <option value="resolved">Resolved</option>
                      </>
                    )}
                    {filterType === 'category' && (
                      <>
                        <option value="pothole">Pothole</option>
                        <option value="water_leak">Water Leak</option>
                        <option value="streetlight">Streetlight</option>
                        <option value="trash">Waste</option>
                        <option value="noise">Noise</option>
                      </>
                    )}
                    {filterType === 'priority' && (
                      <>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </>
                    )}
                  </select>
                ))}
              </div>

              {/* Complaint List */}
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading complaints...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredComplaints.map((complaint, index) => {
                      const status = statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending;
                      return (
                        <motion.div
                          key={complaint.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedComplaint(complaint)}
                          className={`
                            p-4 rounded-2xl border cursor-pointer transition-all duration-300
                            ${selectedComplaint?.id === complaint.id 
                              ? 'border-amber-500/50 bg-amber-500/10' 
                              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-2">
                                <span className="glass-badge text-xs">{complaint.id}</span>
                                <span className={`glass-badge ${status.bg} ${status.border} ${status.text} text-xs`}>
                                  {complaint.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-500">{timeAgo(complaint.created_at)}</span>
                              </div>
                              <h3 className="font-medium text-white truncate">{complaint.title}</h3>
                              <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <span className="mr-1">{getCategoryIcon(complaint.category)}</span>
                                  {complaint.category.replace('_', ' ')}
                                </span>
                                <span>•</span>
                                <span>{complaint.user.full_name || complaint.user.email}</span>
                              </div>
                            </div>
                            <div className="flex items-center ml-4">
                              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getPriorityColor(complaint.priority_score)} flex items-center justify-center`}>
                                <span className="text-lg font-bold text-white">{complaint.priority_score}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </AnimatedCard>
          </div>

          {/* Detail Panel */}
          <div>
            <AnimatePresence mode="wait">
              {selectedComplaint ? (
                <motion.div
                  key={selectedComplaint.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AnimatedCard>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-display text-lg font-semibold text-white">Details</h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedComplaint(null)}
                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">{selectedComplaint.title}</h4>
                        <p className="text-sm text-gray-400">{selectedComplaint.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="glass-input bg-white/5 !p-3">
                          <p className="text-xs text-gray-500 mb-1">Category</p>
                          <p className="text-white capitalize text-sm">{selectedComplaint.category.replace('_', ' ')}</p>
                        </div>
                        <div className="glass-input bg-white/5 !p-3">
                          <p className="text-xs text-gray-500 mb-1">Severity</p>
                          <span className={`glass-badge text-xs ${
                            selectedComplaint.severity === 'critical' ? 'text-red-400 border-red-500/30' :
                            selectedComplaint.severity === 'high' ? 'text-orange-400 border-orange-500/30' :
                            'text-amber-400 border-amber-500/30'
                          }`}>
                            {selectedComplaint.severity}
                          </span>
                        </div>
                        <div className="glass-input bg-white/5 !p-3">
                          <p className="text-xs text-gray-500 mb-1">Priority</p>
                          <p className="text-2xl font-bold text-white">{selectedComplaint.priority_score}</p>
                        </div>
                        <div className="glass-input bg-white/5 !p-3">
                          <p className="text-xs text-gray-500 mb-1">Citizen</p>
                          <p className="text-white text-sm truncate">{selectedComplaint.user.full_name || 'N/A'}</p>
                        </div>
                      </div>

                      {selectedComplaint.ai_classification && (
                        <div className="glass-input bg-purple-500/5 border-purple-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <p className="text-xs text-purple-400">AI Analysis</p>
                          </div>
                          <p className="text-sm text-white mb-2">
                            Confidence: {Math.round(selectedComplaint.ai_classification.confidence * 100)}%
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {selectedComplaint.ai_classification.keywords.map((keyword, idx) => (
                              <span key={idx} className="glass-badge text-xs">{keyword}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-4">
                        {/* Email Status */}
                        <div className="glass-input bg-blue-500/5 border-blue-500/30 mb-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <Bell className="w-4 h-4 text-blue-400" />
                            <p className="text-xs text-blue-400">Email Notifications</p>
                          </div>
                          <p className="text-sm text-white">
                            {selectedComplaint.status === 'pending' ? '✓ Received email sent' :
                             selectedComplaint.status === 'in_progress' ? '✓ Under Review & Work Started emails sent' :
                             selectedComplaint.status === 'resolved' ? '✓ All emails sent (including Completed)' :
                             'Emails scheduled automatically'}
                          </p>
                        </div>
                        
                        <GlowButton 
                          onClick={() => handleStatusChange(selectedComplaint.id, 'in_progress')}
                          disabled={selectedComplaint.status === 'in_progress' || selectedComplaint.status === 'resolved'}
                          className="w-full"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>Start Work</span>
                            <span className="text-xs opacity-70">(sends email)</span>
                          </span>
                        </GlowButton>
                        <GlowButton 
                          variant="secondary"
                          onClick={() => handleStatusChange(selectedComplaint.id, 'resolved')}
                          disabled={selectedComplaint.status === 'resolved'}
                          className="w-full"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>Mark Resolved</span>
                            <span className="text-xs opacity-70">(sends email)</span>
                          </span>
                        </GlowButton>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleStatusChange(selectedComplaint.id, 'escalated')}
                          className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                        >
                          Escalate (No Email)
                        </motion.button>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AnimatedCard className="py-16 text-center">
                    <FloatingIcon>
                      <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    </FloatingIcon>
                    <h3 className="font-display text-lg font-semibold text-white mb-2">Select a Complaint</h3>
                    <p className="text-gray-500 text-sm">Click on a complaint to view details</p>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
