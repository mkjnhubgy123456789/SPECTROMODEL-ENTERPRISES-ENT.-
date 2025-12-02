import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Shield, Sparkles, Zap, Upload, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import SpectrogramVisualizer from '@/components/spectroverse/SpectrogramVisualizer';
import AIResolver from '@/components/shared/AIResolver';
import { validateCSP, blockScriptInjection, validateFile } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { runUnifiedDSPAnalysis, calculatePopHitScore } from '@/components/shared/UnifiedDSPAnalysis';
import AudioConverter from '@/components/analyze/AudioConverter';
import { useCodeIntegrityProtector } from '@/components/shared/CodeIntegrityProtector';
import LimitLocker from "@/components/shared/LimitLocker";

export default function CreativeAnalysisPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);
  const mlDataCollector = useMLDataCollector();
  const codeIntegrity = useCodeIntegrityProtector();
  const fileInputRef = React.useRef(null);
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

  const [showConverter, setShowConverter] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        if (mounted) {
          setSecurityStatus({ safe: cspResult.valid, mlComplexity: cspResult.mlComplexity || 0 });
        }
        mlDataCollector.record('creative_analysis_visit', { feature: 'creative_analysis', timestamp: Date.now() });
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
    
    // Security & Validation (300MB Limit as requested)
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

    // UNIFIED UPLOAD LOGIC (Matches Analyze.js + MP3 Converter)
    // 1. Videos MUST be converted (extract audio)
    // 2. Non-MP3s or Large files (>50MB) trigger conversion for optimization
    // 3. 300MB limit respected
    const shouldConvert = isVideo || fileSizeMB > 50 || !isMP3;
    
    if (shouldConvert) {
      setPendingFile(file);
      setShowConverter(true);
      mlDataCollector.record('optimized_converter_triggered', { 
        feature: 'creative_analysis', 
        reason: isVideo ? 'video_audio_extraction' : (!isMP3 ? 'format_optimization' : 'large_file'),
        fileSize: fileSizeMB, 
        timestamp: Date.now() 
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress('🚀 Fast-Uploading File...');
    
    mlDataCollector.record('upload_started', { feature: 'creative_analysis', fileSize: file.size, fileType: file.type, fileName: file.name, timestamp: Date.now() });
    
    try {
      // Calculate hash for analysis equation
      const hash = await calculateFileHash(file);
      setFileHash(hash);

      // Direct upload for optimized/small files
      // TIMEOUT PRESERVED: 120s for direct upload
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
      
      mlDataCollector.record('upload_success', { feature: 'creative_analysis', fileSize: file.size, timestamp: Date.now() });
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      const errorMsg = error.message || 'Upload failed';
      setError(`Upload failed: ${errorMsg}`);
      setUploadProgress('');
      mlDataCollector.record('upload_error', { feature: 'creative_analysis', error: errorMsg, timestamp: Date.now() });
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
      // Calculate hash for analysis
      const hash = await calculateFileHash(convertedFile);
      setFileHash(hash);

      // Added timeout and robust error handling for converted file upload
      const result = await Promise.race([
        base44.integrations.Core.UploadFile({ file: convertedFile }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out')), 60000))
      ]);

      if (!result || !result.file_url) throw new Error('No file URL returned from server');

      setUploadedFile(convertedFile);
      setUploadedFileUrl(result.file_url);
      setSelectedTrack(null);
      setTrackName(convertedFile.name.replace(/\.[^/.]+$/, '').replace(/_zero_static$/, ''));
      setArtistName((prev) => prev || ''); 
      
      mlDataCollector.record('conversion_upload_success', { 
        feature: 'creative_analysis', 
        size: convertedFile.size,
        timestamp: Date.now() 
      });
      
      setUploadProgress('✅ Upload Complete!');
      setTimeout(() => setUploadProgress(''), 1500);
    } catch (error) {
      console.error('Conversion upload failed:', error);
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
    mlDataCollector.record('analysis_started', { feature: 'creative_analysis', track, timestamp: Date.now() });
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
          mlDataCollector.record('dsp_analysis_completed', { feature: 'creative_analysis', valence: features.valence, energy: features.energy, timestamp: Date.now() });
        } catch (dspError) {
          mlDataCollector.record('dsp_error', { feature: 'creative_analysis', error: dspError.message, timestamp: Date.now() });
        }
      }
      const dspContext = features ? `Audio Features: Valence ${(features.valence*100).toFixed(1)}%, Energy ${(features.energy*100).toFixed(1)}%, Tempo ${features.tempo.toFixed(1)} BPM` : '';
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Creative production analysis for "${track}" by ${artist}.\n${dspContext}\nAnalyze: production quality, mixing, arrangement, instrumentation, sonic palette, innovation with scores (0-100).`,
        add_context_from_internet: false,
        response_json_schema: { type: 'object', properties: { summary: {type:'string'}, production_score: {type:'number'}, creativity_score: {type:'number'}, innovation_score: {type:'number'}, strengths: {type:'array',items:{type:'string'}}, improvements: {type:'array',items:{type:'string'}}, creative_elements: {type:'array',items:{type:'string'}} }}
      });
      setAnalysisResults(response);
      mlDataCollector.record('analysis_completed', { feature: 'creative_analysis', track, timestamp: Date.now() });
    } catch (error) {
      const errorMsg = error.message || 'Analysis failed';
      setError(errorMsg);
      mlDataCollector.record('analysis_error', { feature: 'creative_analysis', error: errorMsg, timestamp: Date.now() });
    } finally { setIsAnalyzing(false); }
  };

  const resetForm = () => {
    setUploadedFile(null); setUploadedFileUrl(null); setSelectedTrack(null); setTrackName(''); setArtistName(''); setAnalysisResults(null); setDspFeatures(null); setError(null); setUploadProgress(''); setFileHash(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    mlDataCollector.record('form_reset', { feature: 'creative_analysis', timestamp: Date.now() });
  };

  if (isLoading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><Loader2 className="w-16 h-16 text-purple-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 pb-8">
      <LimitLocker feature="advanced_analytics" featureKey="ADVANCED_ANALYTICS" user={currentUser} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Creative Insights</h1>
          <Button onClick={() => navigate(createPageUrl("AdvancedAnalytics"))} className="bg-gradient-to-r from-blue-600 to-purple-600 z-base"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </div>
        {error && <Card className="bg-red-500/10 border-red-500/50"><CardContent className="p-4 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" /><div className="flex-1"><p className="text-red-300 text-sm font-semibold">{error}</p><Button onClick={() => setError(null)} size="sm" variant="ghost" className="mt-2 text-red-300">Dismiss</Button></div></CardContent></Card>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/90 border-green-500/30 z-cards">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-bold text-sm">🛡️ Security Active</p>
                    <p className="text-xs text-slate-400">Protected • ML: {securityStatus.mlComplexity.toFixed(1)}</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white font-bold">SAFE</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/90 border-purple-500/30 z-cards">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <p className="text-white font-bold text-sm">🤖 AI Learns From Your Data</p>
                  <p className="text-xs text-slate-400">Uploads improve your personal model</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <AIResolver context={{ feature: 'creative_analysis' }} />
        {showConverter && pendingFile ? (
          <AudioConverter 
            file={pendingFile} 
            onConversionComplete={handleConversionComplete}
            onCancel={() => { setShowConverter(false); setPendingFile(null); }}
          />
        ) : !analysisResults && (
          <Card className="bg-slate-900/90 border-purple-500/30 z-cards"><CardHeader><CardTitle className="text-white">Upload or Select Track</CardTitle></CardHeader><CardContent className="space-y-4">
            <div><label className="block text-white text-sm font-semibold mb-2">Upload Audio/Video File</label>
            <input ref={fileInputRef} type="file" accept="audio/*,video/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.wma,.aiff,.alac,.mp4,.mpeg,.mov,.avi,.webm,.mkv" onChange={handleFileUpload} style={{display:'none'}} disabled={isUploading} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white z-base">
              {isUploading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{uploadProgress || 'Uploading...'}</> : <><Upload className="w-5 h-5 mr-2" />Choose Audio/Video File</>}
            </Button>
            {uploadedFile && <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30"><div className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" /><div><p className="text-green-300 text-sm font-semibold">✓ File uploaded</p><p className="text-slate-300 text-xs mt-1">{uploadedFile.name}</p></div></div></div>}
            </div>
            {uploadedFileUrl && <div className="space-y-3"><div><label className="block text-white text-sm font-semibold mb-2">Track Name *</label><Input value={trackName} onChange={(e) => setTrackName(e.target.value)} placeholder="Enter track name" className="bg-slate-800 border-slate-700 text-white" /></div><div><label className="block text-white text-sm font-semibold mb-2">Artist Name *</label><Input value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="Enter artist name" className="bg-slate-800 border-slate-700 text-white" /></div></div>}
            <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-400">Or</span></div></div>
            <div><label className="block text-white text-sm font-semibold mb-2">Select Previously Analyzed Track</label><select value={selectedTrack?.id || ''} onChange={(e) => { const t = analyses.find(a => a.id === e.target.value); setSelectedTrack(t); setUploadedFile(null); setUploadedFileUrl(null); }} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"><option value="">{analyses.length === 0 ? 'No tracks available' : 'Choose a track...'}</option>{analyses.map(a => <option key={a.id} value={a.id}>{a.track_name} - {a.artist_name}</option>)}</select></div>
          </CardContent></Card>
        )}
        {(selectedTrack || uploadedFileUrl) && (<>
          {(uploadedFileUrl || selectedTrack?.file_url) && uploadedFile?.type?.includes('audio') && <SpectrogramVisualizer audioUrl={uploadedFileUrl || selectedTrack?.file_url} />}
          {dspFeatures && <Card className="bg-slate-900/90 border-blue-500/30"><CardHeader><CardTitle className="text-white text-sm">🎵 Audio Analysis (In-Browser DSP)</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-3 text-xs"><div><span className="text-slate-400">Valence:</span> <span className="text-white font-bold">{(dspFeatures.valence*100).toFixed(0)}%</span></div><div><span className="text-slate-400">Energy:</span> <span className="text-white font-bold">{(dspFeatures.energy*100).toFixed(0)}%</span></div></div></CardContent></Card>}
          <Card className="bg-slate-900/90 border-purple-500/30 z-cards"><CardHeader><CardTitle className="text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" />Creative Analysis</CardTitle></CardHeader><CardContent className="space-y-6">
            {!analysisResults && !isAnalyzing && <Button onClick={runAnalysis} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 z-base" disabled={uploadedFileUrl && (!trackName.trim() || !artistName.trim())}><Zap className="w-5 h-5 mr-2" />Run Creative Analysis</Button>}
            {isAnalyzing && <div className="flex flex-col items-center p-8 space-y-3"><Loader2 className="w-12 h-12 text-purple-400 animate-spin" /><p className="text-white text-sm">Analyzing creative elements...</p></div>}
            {analysisResults && <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {analysisResults.production_score !== undefined && <Card className="bg-slate-900/90 border-purple-500/30"><CardContent className="p-4 text-center"><p className="text-slate-300 text-xs mb-1">Production</p><p className="text-2xl font-bold text-white">{(analysisResults.production_score/10).toFixed(1)}/10</p></CardContent></Card>}
                {analysisResults.creativity_score !== undefined && <Card className="bg-slate-900/90 border-blue-500/30"><CardContent className="p-4 text-center"><p className="text-slate-300 text-xs mb-1">Creativity</p><p className="text-2xl font-bold text-white">{(analysisResults.creativity_score/10).toFixed(1)}/10</p></CardContent></Card>}
                {analysisResults.innovation_score !== undefined && <Card className="bg-slate-900/90 border-purple-500/30"><CardContent className="p-4 text-center"><p className="text-slate-300 text-xs mb-1">Innovation</p><p className="text-2xl font-bold text-white">{(analysisResults.innovation_score/10).toFixed(1)}/10</p></CardContent></Card>}
              </div>
              {analysisResults.summary && <Card className="bg-slate-900/90 border-green-500/30"><CardHeader><CardTitle className="text-white">Summary</CardTitle></CardHeader><CardContent><p className="text-slate-200 text-sm">{analysisResults.summary}</p></CardContent></Card>}
              {analysisResults.strengths?.length > 0 && <Card className="bg-slate-900/90 border-green-500/30"><CardHeader><CardTitle className="text-white">✨ Strengths</CardTitle></CardHeader><CardContent><div className="space-y-2">{analysisResults.strengths.map((s,i) => <p key={i} className="text-slate-200 text-sm">• {s}</p>)}</div></CardContent></Card>}
              {analysisResults.improvements?.length > 0 && <Card className="bg-slate-900/90 border-blue-500/30"><CardHeader><CardTitle className="text-white">🔧 Improvements</CardTitle></CardHeader><CardContent><div className="space-y-2">{analysisResults.improvements.map((imp,i) => <p key={i} className="text-slate-200 text-sm">• {imp}</p>)}</div></CardContent></Card>}
              {analysisResults.creative_elements?.length > 0 && <Card className="bg-slate-900/90 border-purple-500/30"><CardHeader><CardTitle className="text-white">🎨 Creative Elements</CardTitle></CardHeader><CardContent><div className="space-y-2">{analysisResults.creative_elements.map((e,i) => <p key={i} className="text-slate-200 text-sm">• {e}</p>)}</div></CardContent></Card>}
              <div className="flex justify-center pt-4"><Button onClick={resetForm} variant="outline" className="bg-slate-800 text-white">Analyze Another</Button></div>
            </div>}
          </CardContent></Card>
        </>)}
      </div>
    </div>
  );
}