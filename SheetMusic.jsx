import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileMusic, Search, Music, AlertCircle, Loader2, RefreshCw, Upload, Shield, Brain, ArrowLeft, Wand2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";

export default function SheetMusicPage() {
  const mlDataCollector = useMLDataCollector();
  const navigate = useNavigate();
  
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [generatingIds, setGeneratingIds] = useState(new Set());
  const [isUploadingSheet, setIsUploadingSheet] = useState(false);
  const [selectedKey, setSelectedKey] = useState("C");
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [keyAnalysisFor, setKeyAnalysisFor] = useState(null);
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [currentUser, setCurrentUser] = useState(null);

  const musicalKeys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        
        if (mounted) {
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0,
            mlComplexity: cspResult.mlComplexity || 0
          });
        }

        // ML LEARNS: Page visit
        mlDataCollector.record('sheet_music_page_visit', {
          feature: 'sheet_music',
          security: { safe: cspResult.valid, threats: cspResult.violations?.length || 0 },
          viewport: { width: window.innerWidth, height: window.innerHeight },
          timestamp: Date.now()
        });

        const authenticated = await base44.auth.isAuthenticated();
        
        if (!authenticated) {
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          base44.auth.redirectToLogin(window.location.pathname);
          return;
        }

        if (mounted) {
          setIsAuthenticated(true);
          const user = await base44.auth.me();
          setCurrentUser(user);
        }

        await loadAnalyses();
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        mlDataCollector.record('sheet_music_init_error', {
          feature: 'sheet_music',
          error: error.message,
          timestamp: Date.now()
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializePage();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('sheet_music_session_end', {
        feature: 'sheet_music',
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAnalyses(analyses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = analyses.filter(a => 
      a.track_name?.toLowerCase().includes(query) || 
      a.artist_name?.toLowerCase().includes(query)
    );
    setFilteredAnalyses(filtered);
  }, [searchQuery, analyses]);

  const loadAnalyses = async () => {
    try {
      const allAnalyses = await base44.entities.MusicAnalysis.list('-created_date');
      const now = new Date();
      const userAnalyses = allAnalyses.filter(a => {
        if (a.artist_name === "[System Cache]") return false;
        if (a.artist_name === "Educational Query") return false;
        if (a.track_name?.startsWith("AI Query:")) return false;
        if (a.track_name?.startsWith("Emoji Lyrics")) return false;
        if (a.track_name?.startsWith("Lyrics:")) return false;
        if (a.analysis_type === "music_education") return false;
        if (a.analysis_type === "lyrics_retrieval") return false;
        if (a.analysis_type === "emoji_lyrics_converter") return false;
        if (a.analysis_type === "lyrics_analyzer") return false;
        if (a.analysis_type === "ai_track_query") return false;
        
        const isValidType = a.analysis_type === "track_analysis" || 
         a.analysis_type === "rhythm_analysis" || 
         a.analysis_type === "sheet_music_generator" ||
         a.analysis_type === "sheet_music_upload" ||
         !a.analysis_type ||
         a.file_url;
        
        return isValidType;
      });
      setAnalyses(userAnalyses);
      setFilteredAnalyses(userAnalyses);
      
      mlDataCollector.record('sheet_music_loaded', {
        feature: 'sheet_music',
        analysisCount: userAnalyses.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("❌ Failed to load analyses:", error);
      setAnalyses([]);
      setFilteredAnalyses([]);
      
      mlDataCollector.record('sheet_music_load_error', {
        feature: 'sheet_music',
        error: error.message,
        timestamp: Date.now()
      });
    }
  };

  const withSheetMusic = filteredAnalyses.filter(a => a.sheet_music);
  const withoutSheetMusic = filteredAnalyses.filter(a => !a.sheet_music);

  const handleViewSheetMusic = (analysisId) => {
    navigate(createPageUrl("SheetMusicView") + `?id=${analysisId}`);
    mlDataCollector.record('sheet_music_viewed', {
      feature: 'sheet_music',
      analysisId,
      timestamp: Date.now()
    });
  };

  const handleRequestKeyChange = (analysis) => {
    setKeyAnalysisFor(analysis);
    setSelectedKey(analysis.sheet_music?.key || analysis.key || "C");
    setShowKeySelector(true);
    
    mlDataCollector.record('key_change_requested', {
      feature: 'sheet_music',
      trackName: analysis.track_name,
      currentKey: analysis.sheet_music?.key || analysis.key,
      timestamp: Date.now()
    });
  };

  const handleGenerateInKey = async (key) => {
    if (!keyAnalysisFor) return;

    setGeneratingIds(prev => new Set(prev).add(keyAnalysisFor.id));
    setShowKeySelector(false);

    const startTime = Date.now();

    try {
      console.log(`🎼 Generating sheet music in key of ${key} for "${keyAnalysisFor.track_name}"...`);

      let response;
      try {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate professional sheet music notation for "${keyAnalysisFor.track_name}" by ${keyAnalysisFor.artist_name} in the key of ${key}. Transpose ALL chords and melodies to ${key}. Musical Characteristics: Genre: ${keyAnalysisFor.genre || 'Pop'}, Tempo: ${keyAnalysisFor.tempo || 120} BPM, Time Signature: ${keyAnalysisFor.time_signature || '4/4'}. Generate complete chord progressions, melodies, and bass lines in ${key}.`,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              artist: { type: "string" },
              key: { type: "string" },
              time_signature: { type: "string", default: "4/4" },
              tempo: { type: "number" },
              chord_progression: {
                type: "object",
                properties: {
                  verse: { type: "array", items: { type: "string" } },
                  chorus: { type: "array", items: { type: "string" } },
                  bridge: { type: "array", items: { type: "string" } }
                }
              },
              drum_pattern: { type: "object" },
              sections: { type: "array" }
            }
          }
        });
      } catch (apiError) {
        throw new Error('Network error - please check your connection and try again');
      }

      await base44.entities.MusicAnalysis.update(keyAnalysisFor.id, {
        sheet_music: { ...response, key: key },
        key: key,
        analysis_type: 'sheet_music_generator'
      });

      await loadAnalyses();
      
      const generationDuration = Date.now() - startTime;
      mlDataCollector.record('sheet_music_generated_in_key', {
        feature: 'sheet_music',
        trackName: keyAnalysisFor.track_name,
        key,
        generationDuration,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error("Failed to generate sheet music:", error);
      alert(`Failed to generate sheet music: ${error.message || 'Please try again.'}`);
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(keyAnalysisFor.id);
        return newSet;
      });
      setKeyAnalysisFor(null);
      setSelectedKey("C");
    }
  };

  const handleGenerateSheetMusic = async (analysis) => {
    setGeneratingIds(prev => new Set(prev).add(analysis.id));

    try {
      console.log(`🎼 Generating sheet music for "${analysis.track_name}"...`);

      let response;
      try {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate professional sheet music for "${analysis.track_name}" by ${analysis.artist_name}. Musical Characteristics: Genre: ${analysis.genre || 'Pop'}, Tempo: ${analysis.tempo || 120} BPM. Generate complete chord progressions, melodies, and arrangements.`,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              artist: { type: "string" },
              key: { type: "string" },
              tempo: { type: "number" },
              sections: { type: "array" }
            }
          }
        });
      } catch (apiError) {
        throw new Error('Network error - please check your connection and try again');
      }

      await base44.entities.MusicAnalysis.update(analysis.id, {
        sheet_music: response,
        analysis_type: 'sheet_music_generator'
      });

      await loadAnalyses();
      
      mlDataCollector.record('sheet_music_generated', {
        feature: 'sheet_music',
        trackName: analysis.track_name,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to generate:", error);
      alert(`Failed: ${error.message || 'Please try again.'}`);
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(analysis.id);
        return newSet;
      });
    }
  };

  const handleUploadSheetMusic = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingSheet(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      let response;
      try {
        response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this sheet music file and extract all musical information. Digitize title, artist, key, tempo, chords, melody, and structure.`,
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              artist: { type: "string" },
              key: { type: "string" },
              tempo: { type: "number" },
              sections: { type: "array" }
            }
          }
        });
      } catch (apiError) {
        throw new Error('Network error - please check your connection and try again');
      }

      const newAnalysis = await base44.entities.MusicAnalysis.create({
        track_name: response.title || file.name.replace(/\.[^/.]+$/, "") || "Untitled",
        artist_name: response.artist || "Unknown",
        analysis_type: 'sheet_music_upload',
        sheet_music: response,
        status: 'completed',
        genre: "Sheet Music Upload",
        file_url: file_url,
        key: response.key || "C major"
      });

      await loadAnalyses();
      navigate(createPageUrl("SheetMusicView") + `?id=${newAnalysis.id}`);
      
      mlDataCollector.record('sheet_music_uploaded', {
        feature: 'sheet_music',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to upload:", error);
      alert(`Failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsUploadingSheet(false);
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
        <p className="text-cyan-500/70 font-mono text-sm tracking-widest animate-pulse">ACCESSING SCORE LIBRARY...</p>
      </div>
    );
  }

  return (
    // CYBERPUNK BASE: Deep black background with a hint of purple/blue mesh
    <div className="min-h-screen bg-transparent p-4 md:p-8 pb-8 text-cyan-50 selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Decorative Grid Overlay Removed - Handled by Layout */}

      <div className="relative z-10">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="analysis_uploads" featureKey="SHEET_MUSIC" user={currentUser} />
        
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="text-center flex-1">
              <h1 className="text-5xl font-black mb-2 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 animate-pulse">
                  SHEET MUSIC LIBRARY
                </span>
              </h1>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                AI Transcription & Generation Matrix
              </p>
            </div>
          </div>

          {/* STATUS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Security Status - Matrix Green */}
            <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 shadow-[0_0_20px_-5px_rgba(34,197,94,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-green-500/60 transition-colors duration-500">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-green-400 to-emerald-600 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <CardContent className="p-5 pl-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Shield className="w-5 h-5 text-green-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-green-50 font-bold text-sm tracking-wide uppercase">Score Security</p>
                      <p className="text-xs text-green-400/70 font-mono">
                        {securityStatus.safe ? `PROTECTED • ML COMPLEXITY: ${securityStatus.mlComplexity.toFixed(1)}` : `THREATS DETECTED: ${securityStatus.threats}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={`shrink-0 border ${securityStatus.safe ? 'bg-green-500/10 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/50'}`}>
                    {securityStatus.safe ? 'ACTIVE' : 'BREACH'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Learning - Cyber Cyan */}
            <Card className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)] backdrop-blur-md rounded-xl overflow-hidden hover:border-cyan-500/60 transition-colors duration-500">
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
              <CardContent className="p-5 pl-6">
                <div className="flex items-center gap-4">
                  <Brain className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-50 font-bold text-sm tracking-wide uppercase">Neural Transcription</p>
                    <p className="text-xs text-cyan-400/70 font-mono mt-1">
                      LEARNING FROM {analyses.length} TRACKS • PATTERN RECOGNITION ACTIVE
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <LiveSecurityDisplay />
          <LiveThreatDisplay />

          {/* UPLOAD TOOL - Electric Blue */}
          <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.15)] rounded-xl backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="p-3 bg-blue-950/50 rounded-lg border border-blue-500/20">
                  <Upload className="w-8 h-8 text-blue-400 shrink-0" />
                </div>
                <div className="flex-1">
                  <h3 className="text-blue-100 font-bold text-lg mb-2 tracking-wide uppercase">Upload & Restore</h3>
                  <p className="text-blue-200/60 text-sm mb-3">
                    Digitize physical sheet music using optical music recognition (OMR) powered by AI.
                  </p>
                  <ul className="text-xs font-mono text-blue-400/70 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      SCANNING CHORD STRUCTURES...
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      DIGITIZING MELODY LINES...
                    </li>
                  </ul>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="sheet-upload"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleUploadSheetMusic}
                      className="hidden"
                      disabled={isUploadingSheet}
                    />
                    <Button
                      onClick={() => document.getElementById('sheet-upload').click()}
                      disabled={isUploadingSheet}
                      className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-300"
                    >
                      {isUploadingSheet ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {isUploadingSheet ? 'PROCESSING...' : 'UPLOAD SCORE'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEARCH BAR */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl opacity-30 group-hover:opacity-50 blur transition duration-500"></div>
            <div className="relative bg-black rounded-xl p-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH NEURAL DATABASE..."
                className="pl-12 bg-black/40 backdrop-blur-xl border-none text-white placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/50 font-mono text-sm h-12"
              />
            </div>
          </div>

          {/* KEY SELECTOR MODAL */}
          {showKeySelector && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="bg-slate-900 border border-purple-500/50 w-full max-w-md shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                <CardHeader>
                  <CardTitle className="text-white text-center font-bold tracking-widest uppercase">Select Transposition Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {musicalKeys.map((key) => (
                      <Button
                        key={key}
                        onClick={() => handleGenerateInKey(key)}
                        className="bg-slate-800 hover:bg-purple-600 border border-purple-500/30 text-purple-200 hover:text-white transition-all duration-200"
                        disabled={generatingIds.has(keyAnalysisFor?.id)}
                      >
                        {key}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowKeySelector(false);
                      setKeyAnalysisFor(null);
                      setSelectedKey("C");
                    }}
                    className="w-full border-slate-700 hover:bg-slate-800 text-slate-400"
                    disabled={generatingIds.has(keyAnalysisFor?.id)}
                  >
                    ABORT SEQUENCE
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* SECTION 1: EXISTING SHEET MUSIC (Purple Theme) */}
          {withSheetMusic.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-purple-900/50 pb-2">
                <Music className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white tracking-wide">GENERATED SCORES ({withSheetMusic.length})</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {withSheetMusic.map((analysis) => (
                  <Card key={analysis.id} className="bg-black/40 border border-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)] transition-all duration-300 rounded-xl overflow-hidden group backdrop-blur-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-600 group-hover:w-1.5 transition-all"></div>
                    <CardContent className="p-5 pl-7">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-md font-bold text-white truncate group-hover:text-purple-300 transition-colors">{analysis.track_name || 'Untitled'}</h3>
                          <p className="text-xs text-purple-300/60 truncate font-mono uppercase">{analysis.artist_name || 'Unknown'}</p>
                        </div>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-900/20 shrink-0 font-mono text-xs">
                          {analysis.sheet_music.key || 'C'}
                        </Badge>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleViewSheetMusic(analysis.id)}
                          size="sm"
                          className="flex-1 bg-purple-600/20 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30 transition-all text-xs font-bold"
                        >
                          <Music className="w-3 h-3 mr-2" />
                          VIEW
                        </Button>
                        <Button
                          onClick={() => handleRequestKeyChange(analysis)}
                          disabled={generatingIds.has(analysis.id)}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-900/50 text-xs"
                        >
                          {generatingIds.has(analysis.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : 'TRANSPOSE'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: GENERATE NEW (Orange Theme) */}
          {withoutSheetMusic.length > 0 && (
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-2 border-b border-orange-900/50 pb-2">
                <Wand2 className="w-5 h-5 text-orange-400" />
                <h2 className="text-xl font-bold text-white tracking-wide">PENDING GENERATION ({withoutSheetMusic.length})</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {withoutSheetMusic.map((analysis) => (
                  <Card key={analysis.id} className="bg-black/40 border border-orange-500/20 hover:border-orange-500/60 hover:shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)] transition-all duration-300 rounded-xl overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-red-600 group-hover:w-1.5 transition-all"></div>
                    <CardContent className="p-5 pl-7">
                       <div className="mb-4">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-300 transition-colors">{analysis.track_name || 'Untitled'}</h3>
                          <p className="text-xs text-orange-300/60 truncate font-mono uppercase">{analysis.artist_name || 'Unknown'}</p>
                       </div>

                      <Button
                        onClick={() => handleGenerateSheetMusic(analysis)}
                        disabled={generatingIds.has(analysis.id)} 
                        size="sm"
                        className="w-full bg-orange-600/10 hover:bg-orange-600 border border-orange-500/40 text-orange-200 hover:text-white transition-all text-xs font-bold"
                      >
                        {generatingIds.has(analysis.id) ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            COMPUTING...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3 mr-2" />
                            GENERATE
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredAnalyses.length === 0 && (
            <Card className="bg-black/30 border border-slate-800 backdrop-blur-sm">
              <CardContent className="p-16 text-center">
                <FileMusic className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">Data Buffer Empty</h3>
                <p className="text-slate-500 font-mono text-sm">
                  {searchQuery ? "NO RECORDS FOUND MATCHING QUERY." : "UPLOAD A TRACK TO BEGIN ANALYSIS SEQUENCE."}
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}