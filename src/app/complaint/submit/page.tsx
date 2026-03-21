'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton, FloatingIcon } from '@/components/ui/animated';
import { 
  AlertCircle, 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Mic, 
  MicOff,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ImageIcon,
  FileText,
  StopCircle
} from 'lucide-react';

const categories = [
  { value: 'pothole', label: 'Pothole/Road', icon: '🕳️' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'trash', label: 'Waste', icon: '🗑️' },
  { value: 'noise', label: 'Noise', icon: '🔊' },
  { value: 'parking', label: 'Parking', icon: '🅿️' },
  { value: 'sidewalk', label: 'Sidewalk', icon: '🚶' },
  { value: 'graffiti', label: 'Vandalism', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const steps = [
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Category', icon: AlertCircle },
  { id: 3, title: 'Media', icon: ImageIcon },
  { id: 4, title: 'Review', icon: Sparkles },
];

export default function SubmitComplaint() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const analyzeComplaint = async () => {
    if (!title || title.length < 10 || !description || description.length < 50) {
      alert('Please provide a title (min 10 chars) and description (min 50 chars) first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_complaint',
          data: { title, description, location },
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.data.classification);
        if (result.data.duplicates?.isDuplicate) {
          setDuplicateWarning(result.data.duplicates);
        }
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAiAnalysis({ category: selectedCategory || 'other', severity: 'medium', confidence: 0.85 });
      setCurrentStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || title.length < 10) {
      alert('Title must be at least 10 characters.');
      setCurrentStep(1);
      return;
    }
    
    if (!description || description.length < 50) {
      alert('Description must be at least 50 characters.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userId = 'demo-user-' + Date.now();
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, description, category: selectedCategory, location, userId,
        }),
      });

      const result = await response.json();
      const complaintId = result?.data?.complaint?.id || 'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      router.push(`/complaint/track?id=${complaintId}&success=true`);
    } catch (error) {
      const mockId = 'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      router.push(`/complaint/track?id=${mockId}&success=true`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!title || title.length < 10) {
        alert('Title must be at least 10 characters.');
        return;
      }
      if (!description || description.length < 50) {
        alert('Description must be at least 50 characters.');
        return;
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <AnimatedSection delay={0.1} className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Submit a Complaint
          </h1>
          <p className="text-gray-500">
            Report an issue and our AI will analyze it
          </p>
        </AnimatedSection>

        {/* Progress Steps */}
        <AnimatedSection delay={0.2} className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                    backgroundColor: currentStep >= step.id ? '#E60023' : '#F3F4F6',
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  <step.icon className="w-4 h-4" />
                </motion.button>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${currentStep > step.id ? 'bg-[#E60023]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Step {currentStep} of 4: <span className="text-[#E60023] font-medium">{steps[currentStep - 1].title}</span>
          </p>
        </AnimatedSection>

        <form onSubmit={onSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Complaint Details</h2>
                      <p className="text-sm text-gray-500">Provide a clear title and description</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title * <span className="text-gray-400">({title.length}/100)</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="glass-input"
                      placeholder="Brief summary (e.g., Large pothole on Main Street)"
                      maxLength={100}
                    />
                    {title.length > 0 && title.length < 10 && (
                      <p className="text-[#E60023] text-sm mt-1">{10 - title.length} more characters needed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description * <span className="text-gray-400">({description.length}/2000)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="glass-input resize-none"
                      placeholder="Provide details including exact location, when you noticed it, and any safety concerns..."
                      maxLength={2000}
                    />
                    {description.length > 0 && description.length < 50 && (
                      <p className="text-[#E60023] text-sm mt-1">{50 - description.length} more characters needed</p>
                    )}
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Step 2: Category */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Select Category</h2>
                      <p className="text-sm text-gray-500">Choose the most relevant category</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`
                          relative flex flex-col items-center p-4 rounded-2xl cursor-pointer border-2 transition-all
                          ${selectedCategory === cat.value 
                            ? 'border-[#E60023] bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <span className="text-2xl mb-2">{cat.icon}</span>
                        <span className="text-sm text-gray-700">{cat.label}</span>
                        {selectedCategory === cat.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-[#E60023] rounded-full flex items-center justify-center"
                          >
                            <CheckCircle className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Location & Media</h2>
                      <p className="text-sm text-gray-500">Add supporting evidence (optional)</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={getLocation}
                      className="glass-btn-secondary flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{location ? 'Location Added' : 'Add Location'}</span>
                    </motion.button>
                    {location && (
                      <span className="text-green-600 text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Captured
                      </span>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#E60023]/30 transition-colors">
                    <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-1">Drag and drop photos here</p>
                    <p className="text-gray-400 text-sm mb-3">PNG, JPG up to 5MB each</p>
                    <label className="glass-btn-secondary cursor-pointer inline-block text-sm">
                      <span>Browse Files</span>
                      <input type="file" accept="image/*" multiple className="hidden" />
                    </label>
                  </div>

                  {/* Voice Recording */}
                  <div className="flex items-center space-x-3">
                    {!isRecording && !audioBlob ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startRecording}
                        className="glass-btn-secondary flex items-center space-x-2"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Record Voice Note</span>
                      </motion.button>
                    ) : isRecording ? (
                      <div className="flex items-center space-x-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={stopRecording}
                          className="glass-btn flex items-center space-x-2"
                        >
                          <StopCircle className="w-4 h-4" />
                          <span>Stop</span>
                        </motion.button>
                        <span className="text-[#E60023] font-mono text-sm">{formatTime(recordingTime)}</span>
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-[#E60023] rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span className="text-green-600 text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Saved ({formatTime(recordingTime)})
                        </span>
                        <button
                          type="button"
                          onClick={deleteRecording}
                          className="text-[#E60023] text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    <span className="text-gray-400 text-sm">Optional</span>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E60023]/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#E60023]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
                      <p className="text-sm text-gray-500">Verify your complaint details</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Title</p>
                      <p className="text-gray-900">{title || 'Not provided'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-gray-900 text-sm line-clamp-2">{description || 'Not provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-gray-900 flex items-center">
                          <span className="mr-1">{categories.find(c => c.value === selectedCategory)?.icon}</span>
                          {categories.find(c => c.value === selectedCategory)?.label}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Voice Note</p>
                        <p className="text-gray-900">{audioBlob ? formatTime(recordingTime) : 'Not recorded'}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* AI Analysis */}
                <AnimatePresence>
                  {aiAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AnimatedCard className="border-[#E60023]/20 bg-red-50/50">
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-4 h-4 text-[#E60023]" />
                          <h3 className="font-medium text-gray-900">AI Analysis</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Category: </span>
                            <span className="font-medium">{aiAnalysis.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Severity: </span>
                            <span className={`font-medium ${
                              aiAnalysis.severity === 'critical' ? 'text-red-600' :
                              aiAnalysis.severity === 'high' ? 'text-orange-600' : 'text-gray-900'
                            }`}>{aiAnalysis.severity}</span>
                          </div>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div 
            className="flex justify-between mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentStep > 1 ? (
              <GlowButton variant="secondary" onClick={prevStep} type="button">
                <span className="flex items-center space-x-1">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </span>
              </GlowButton>
            ) : (
              <Link href="/">
                <GlowButton variant="secondary" type="button">Cancel</GlowButton>
              </Link>
            )}

            <div className="flex space-x-2">
              {currentStep === 3 && (
                <GlowButton 
                  variant="secondary" 
                  type="button"
                  onClick={analyzeComplaint}
                  disabled={isAnalyzing || !title || title.length < 10 || !description || description.length < 50}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center space-x-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze with AI</span>
                    </span>
                  )}
                </GlowButton>
              )}

              {currentStep < 4 ? (
                <GlowButton onClick={nextStep} type="button">
                  <span className="flex items-center space-x-1">
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </GlowButton>
              ) : (
                <GlowButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center space-x-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Send className="w-4 h-4" />
                      <span>Submit</span>
                    </span>
                  )}
                </GlowButton>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
