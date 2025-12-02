import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Shield, Brain, Zap, Upload, AlertCircle, CheckCircle, Activity, BarChart3, Lock, Eye, Lightbulb, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import SpectrogramVisualizer from '@/components/spectroverse/SpectrogramVisualizer';
import AIResolver from '@/components/shared/AIResolver';
import { validateCSP, blockScriptInjection, validateFile } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { runUnifiedDSPAnalysis } from '@/components/shared/UnifiedDSPAnalysis';
import AudioConverter from '@/components/analyze/AudioConverter';
import { useCodeIntegrityProtector } from '@/components/shared/CodeIntegrityProtector';
import LimitLocker from "@/components/shared/LimitLocker";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";

export default function CognitiveAnalysisPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const codeIntegrity = useCodeIntegrityProtector();
  const fileInputRef = useRef(null);
  const [analyses, setAnalyses] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, mlComplexity: 0 });
  const [error, setError] = useState(null);
  const [dspFeatures, setDspFeatures] = useState(null);
  const [fileHash, setFileHash] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [showConverter, setShowConverter] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        if (mounted) {
          setSecurityStatus({ safe: cspResult.valid, mlComplexity: cspResult.mlComplexity || 0 });
        }
        mlDataCollector.record('cognitive_analysis_visit', { feature: 'cognitive_analysis', timestamp: Date.now() });
        try {
          const data = await base44.entities.MusicAnalysis.list('-created_date', 50);
          if (mounted) setAnalyses(data.filter(a => a.status === 'completed' && a.track_name));
        } catch (e) {
          if (mounted) setAnalyses([]);
        }
        if (mounted) setIsLoading(false);
      } catch (e) {
        if (mounted) { setAnalyses([]); setIsLoading(false); }
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const calculateFileHash = React.useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    
    const validation = validateFile(file, {
      maxSizeMB: 300, 
      allowedTypes: ['audio/*', 'video/*'],
      allowedExtensions: ['mp3', 'wav', 'm4a', 'mp4', 'flac', 'ogg', 'aac', 'wma', 'aiff', 'alac', 'mov', 'avi', 'webm', 'mkv']
    });

    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    const isVideo = file.type.includes('video') || file.name.match(/\.(mp4|mov|avi|webm|mkv)$/i);
    const isMP3 = file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3');

    const shouldConvert = isVideo || fileSizeMB > 50 || !isMP3;
    
    if (shouldConvert) {
      setPendingFile(file);
      setShowConverter(true);
      mlDataCollector.record('optimized_converter_triggered', { 
        feature: 'cognitive_analysis', 
        reason: isVideo ? 'video_audio_extraction' : (!isMP3 ? 'format_optimization' : 'large_file'),
        fileSize: fileSizeMB, 
        timestamp: Date.now() 
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress('🚀 Fast-Uploading File...');
    
    mlDataCollector.record('upload_started', { feature: 'cognitive_analysis', fileSize: file.size, fileType: file.type, fileName: file.name, timestamp: Date.now() });
    
    try {
      const hash = await calculateFileHash(file);
      setFileHash(hash);

      const result = await Promise.race([
        base44.integrations.Core.UploadFile({ file }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout - check connection')), 120000))
      ]);
      
      if (!result || !result.file_url) throw new Error('Upload failed - no file URL returned');
      
      setUploadProgress('✅ Upload complete!');
      setUploadedFile(file);
      setUploadedFileUrl(result.file_url);
      setSelectedTrack(null);
      setTrackName(file.name.replace(/\.[^/.]+$/, ''));
      setArtistName('');
      
      mlDataCollector.record('upload_success', { feature: 'cognitive_analysis', fileSize: file.size, timestamp: Date.now() });
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      const errorMsg = error.message || 'Upload failed';
      setError(`Upload failed: ${errorMsg}`);
      setUploadProgress('');
      mlDataCollector.record('upload_error', { feature: 'cognitive_analysis', error: errorMsg, timestamp: Date.now() });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConversionComplete = async (convertedFile) => {
    setShowConverter(false);
    setPendingFile(null);
    setIsUploading(true);
    setUploadProgress('🚀 Uploading Optimized Audio...');
    
    try {
      const hash = await calculateFileHash(convertedFile);
      setFileHash(hash);

      const result = await Promise.race([
        base44.integrations.Core.UploadFile({ file: convertedFile }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out')), 60000))
      ]);

      if (!result || !result.file_url) throw new Error('No file URL returned');

      setUploadedFile(convertedFile);
      setUploadedFileUrl(result.file_url);
      setSelectedTrack(null);
      setTrackName(convertedFile.name.replace(/\.[^/.]+$/, '').replace(/_zero_static$/, ''));
      setArtistName((prev) => prev || ''); 
      
      mlDataCollector.record('conversion_upload_success', { 
        feature: 'cognitive_analysis', 
        size: convertedFile.size,
        timestamp: Date.now() 
      });
      
      setUploadProgress('✅ Upload Complete!');
      setTimeout(() => setUploadProgress(''), 1500);
    } catch (error) {
      setError(`Upload error: ${error.message}`);
      mlDataCollector.record('conversion_upload_error', { error: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const runAnalysis = async () => {
    if (!uploadedFileUrl && !selectedTrack) return;
    if (uploadedFileUrl && (!trackName.trim() || !artistName.trim())) { setError('Enter track and artist name'); return; }
    setIsAnalyzing(true);
    setAnalysisResults(null);
    setError(null);
    const track = selectedTrack?.track_name || trackName;
    const artist = selectedTrack?.artist_name || artistName;
    mlDataCollector.record('analysis_started', { feature: 'cognitive_analysis', track, timestamp: Date.now() });
    try {
      let features = null;
      if (uploadedFile && uploadedFile.type.includes('audio')) {
        try {
          let currentHash = fileHash;
          if (!currentHash) {
            currentHash = await calculateFileHash(uploadedFile);
            setFileHash(currentHash);
          }
          features = await runUnifiedDSPAnalysis(uploadedFile, currentHash);
          setDspFeatures(features);
          mlDataCollector.record('dsp_analysis_completed', { feature: 'cognitive_analysis', valence: features.valence, energy: features.energy, timestamp: Date.now() });
        } catch (dspError) {
          mlDataCollector.record('dsp_error', { feature: 'cognitive_analysis', error: dspError.message, timestamp: Date.now() });
        }
      }
      const dspContext = features ? `Audio Features: Valence ${(features.valence*100).toFixed(1)}%, Energy ${(features.energy*100).toFixed(1)}%, Tempo ${features.tempo.toFixed(1)} BPM` : '';
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Cognitive impact analysis for "${track}" by ${artist}.\n${dspContext}\nAnalyze: attention capture, memory encoding, neural patterns, cognitive load, mental engagement with scores (0-100).`,
        add_context_from_internet: false,
        response_json_schema: { type: 'object', properties: { summary: {type:'string'}, attention_score: {type:'number'}, memory_score: {type:'number'}, engagement_score: {type:'number'}, cognitive_patterns: {type:'array',items:{type:'string'}}, neural_effects: {type:'array',items:{type:'string'}}, key_insights: {type:'array',items:{type:'string'}} }}
      });
      setAnalysisResults(response);
      mlDataCollector.record('analysis_completed', { feature: 'cognitive_analysis', track, timestamp: Date.now() });
    } catch (error) {
      const errorMsg = error.message || 'Analysis failed';
      setError(errorMsg);
      mlDataCollector.record('analysis_error', { feature: 'cognitive_analysis', error: errorMsg, timestamp: Date.now() });
    } finally { setIsAnalyzing(false); }
  };

  const resetForm = () => {
    setUploadedFile(null); setUploadedFileUrl(null); setSelectedTrack(null); setTrackName(''); setArtistName(''); setAnalysisResults(null); setDspFeatures(null); setError(null); setUploadProgress(''); setFileHash(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    mlDataCollector.record('form_reset', { feature: 'cognitive_analysis', timestamp: Date.now() });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    // CYBERPUNK BASE - DEEP VOID BACKGROUND
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-purple-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      {/* Decorative Grid Overlay - NEON VECTORS */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

      <LimitLocker feature="cognitive_analysis" featureKey="ADVANCED_ANALYTICS" user={currentUser} />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
              <Brain className="w-10 h-10 text-purple-500 animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-500">
                COGNITIVE IMPACT TERMINAL
              </span>
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold mt-2">
              Neural Patterns • Attention Metrics • Memory Encoding • Deep Analysis
            </p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        {error && (
          <Card className="bg-red-900/20 border border-red-500/50 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-sm font-semibold">{error}</p>
                <Button onClick={() => setError(null)} size="sm" variant="ghost" className="mt-2 text-red-300 hover:bg-red-500/20 hover:text-red-200">Dismiss</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <AIResolver context={{ feature: 'cognitive_analysis' }} />

        {showConverter && pendingFile ? (
          <div className="glass-panel rounded-2xl overflow-hidden border border-purple-500/30 shadow-lg">
            <AudioConverter 
              file={pendingFile} 
              onConversionComplete={handleConversionComplete}
              onCancel={() => { setShowConverter(false); setPendingFile(null); }}
            />
          </div>
        ) : !analysisResults ? (
          <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5 p-6">
              <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                <Upload className="w-6 h-6 text-purple-400" />
                Input Source Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-purple-200 text-sm font-bold uppercase tracking-wider mb-2">Upload Audio/Video File</label>
                <input ref={fileInputRef} type="file" accept="audio/*,video/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.aiff,.alac,.mp4,.mpeg,.mov,.avi,.webm,.mkv" onChange={handleFileUpload} style={{display:'none'}} disabled={isUploading} />
                
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading} 
                  className="w-full h-20 bg-gradient-to-r from-purple-900/50 to-blue-900/50 hover:from-purple-800/50 hover:to-blue-800/50 border border-purple-500/30 text-white group relative overflow-hidden transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? (
                      <><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /><span className="font-mono text-purple-300">{uploadProgress || 'UPLOADING DATA STREAM...'}</span></>
                    ) : (
                      <><Upload className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" /><span className="font-bold tracking-wider">INITIALIZE DATA UPLOAD</span></>
                    )}
                  </div>
                </Button>
                
                {uploadedFile && (
                  <div className="mt-4 p-4 bg-green-900/20 rounded-xl border border-green-500/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                      <div>
                        <p className="text-green-300 font-bold uppercase tracking-wide">File Securely Uploaded</p>
                        <p className="text-slate-400 text-xs font-mono mt-1">{uploadedFile.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {uploadedFileUrl && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 rounded-xl border border-white/5">
                  <div className="space-y-2">
                    <label className="text-purple-300 text-xs font-bold uppercase tracking-wider">Track Name</label>
                    <Input value={trackName} onChange={(e) => setTrackName(e.target.value)} placeholder="ENTER TRACK DESIGNATION" className="bg-black/50 border-purple-500/30 text-white font-mono placeholder:text-slate-600 h-12" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-purple-300 text-xs font-bold uppercase tracking-wider">Artist Name</label>
                    <Input value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="ENTER ARTIST ID" className="bg-black/50 border-purple-500/30 text-white font-mono placeholder:text-slate-600 h-12" />
                  </div>
                </div>
              )}

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-[#030014] px-4 text-slate-500 font-bold">Or Select From Archive</span></div>
              </div>

              <div className="space-y-2">
                <label className="block text-purple-200 text-sm font-bold uppercase tracking-wider mb-2">Previously Analyzed Tracks</label>
                <select 
                  value={selectedTrack?.id || ''} 
                  onChange={(e) => { const t = analyses.find(a => a.id === e.target.value); setSelectedTrack(t); setUploadedFile(null); setUploadedFileUrl(null); }} 
                  className="w-full bg-black/50 border border-purple-500/30 rounded-lg p-4 text-white font-mono focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none appearance-none cursor-pointer hover:bg-purple-900/10 transition-colors"
                >
                  <option value="">{analyses.length === 0 ? 'NO ARCHIVED DATA AVAILABLE' : 'SELECT TRACK FROM DATABASE...'}</option>
                  {analyses.map(a => <option key={a.id} value={a.id}>{a.track_name} - {a.artist_name}</option>)}
                </select>
              </div>

              {(!isAnalyzing && (uploadedFileUrl || selectedTrack)) && (
                <Button 
                  onClick={runAnalysis} 
                  className="w-full h-16 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-lg font-black uppercase tracking-widest shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] transition-all duration-300"
                  disabled={uploadedFileUrl && (!trackName.trim() || !artistName.trim())}
                >
                  <Brain className="w-6 h-6 mr-3" /> Initiate Cognitive Sequence
                </Button>
              )}
              
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-purple-900/10 rounded-xl border border-purple-500/30 animate-pulse">
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  <p className="text-cyan-300 font-mono uppercase tracking-widest text-sm">Processing Neural Patterns...</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* VISUALIZER PANEL */}
            {(uploadedFileUrl || selectedTrack?.file_url) && uploadedFile?.type?.includes('audio') && (
              <Card className="bg-black/60 border border-cyan-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/5 p-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-sm font-mono uppercase tracking-wider flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-400" /> Audio Spectrum Visualization
                  </CardTitle>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 font-mono text-[10px]">LIVE FEED</Badge>
                </CardHeader>
                <div className="h-48 w-full bg-black/80 relative">
                  <SpectrogramVisualizer audioUrl={uploadedFileUrl || selectedTrack?.file_url} />
                </div>
              </Card>
            )}

            {/* MAIN METRICS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ATTENTION (PINK) */}
                <Card className="bg-black/60 border border-pink-500/30 shadow-[0_0_20px_-10px_rgba(236,72,153,0.3)] backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                            <Eye className="w-5 h-5 text-pink-400" /> Attention Capture
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                        <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                            {(analysisResults.attention_score/10).toFixed(1)}
                        </div>
                        <div className="text-pink-400 font-mono text-xs mt-2 uppercase tracking-widest">Scale Index 0-10</div>
                    </CardContent>
                </Card>

                {/* MEMORY (BLUE) */}
                <Card className="bg-black/60 border border-blue-500/30 shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)] backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                            <Brain className="w-5 h-5 text-blue-400" /> Memory Encoding
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                        <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            {(analysisResults.memory_score/10).toFixed(1)}
                        </div>
                        <div className="text-blue-400 font-mono text-xs mt-2 uppercase tracking-widest">Retention Factor</div>
                    </CardContent>
                </Card>

                {/* ENGAGEMENT (PURPLE) */}
                <Card className="bg-black/60 border border-purple-500/30 shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)] backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                            <Activity className="w-5 h-5 text-purple-400" /> Engagement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center justify-center">
                        <div className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                            {(analysisResults.engagement_score/10).toFixed(1)}
                        </div>
                        <div className="text-purple-400 font-mono text-xs mt-2 uppercase tracking-widest">Immersion Level</div>
                    </CardContent>
                </Card>
            </div>

            {/* DETAILED ANALYSIS SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COGNITIVE PATTERNS (CYAN) */}
                <Card className="bg-black/60 border border-cyan-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden h-full">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                            <Zap className="w-5 h-5 text-cyan-400" /> Neural Patterns
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {analysisResults.cognitive_patterns?.map((p, i) => (
                            <div key={i} className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
                                <p className="text-slate-200 text-sm leading-relaxed">{p}</p>
                            </div>
                        ))}
                        {(!analysisResults.cognitive_patterns || analysisResults.cognitive_patterns.length === 0) && <p className="text-slate-500 italic">No specific patterns detected.</p>}
                    </CardContent>
                </Card>

                {/* KEY INSIGHTS (GOLD/YELLOW - using amber for warm contrast) */}
                <Card className="bg-black/60 border border-amber-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden h-full">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                            <Lightbulb className="w-5 h-5 text-amber-400" /> Strategic Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                        {analysisResults.key_insights?.map((k, i) => (
                            <div key={i} className="p-3 bg-amber-900/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0 shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                                <p className="text-slate-200 text-sm leading-relaxed">{k}</p>
                            </div>
                        ))}
                        {(!analysisResults.key_insights || analysisResults.key_insights.length === 0) && <p className="text-slate-500 italic">No strategic insights available.</p>}
                    </CardContent>
                </Card>
            </div>

            {/* SUMMARY (FULL WIDTH - WHITE/SLATE) */}
            <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-black/20 p-6">
                    <CardTitle className="text-white flex items-center gap-3 text-lg font-bold uppercase tracking-wide">
                        <BarChart3 className="w-5 h-5 text-slate-300" /> Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <p className="text-lg text-slate-200 leading-relaxed font-light tracking-wide">
                        {analysisResults.summary}
                    </p>
                </CardContent>
            </Card>

            <div className="flex justify-center pt-8">
                <Button 
                    onClick={resetForm} 
                    variant="outline" 
                    className="bg-transparent border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-white hover:border-purple-500 px-8 py-6 rounded-full font-mono uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Reset Terminal
                </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}