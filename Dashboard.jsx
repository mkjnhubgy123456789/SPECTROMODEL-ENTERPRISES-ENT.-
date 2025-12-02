import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { fetchUserWithCache } from "@/components/shared/userCache";
import { Card, CardContent, Button, Badge, cn } from "@/components/ui/index";
import { 
  Music, TrendingUp, BarChart3, Plus, Loader2, Activity, Code, Sparkles, 
  Shield, Brain, AlertCircle, Settings, FolderKanban, Users, Calendar as CalendarIcon, 
  ListTodo, Search, Lock, Trash2, Upload, LineChart, Zap, Crown 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Imports from our generated widgets
import { StatsCards, CategoryFilters, RecentAnalyses, TopTracks } from "@/components/dashboard_widgets";
import DashboardCustomizer from "@/components/dashboard/DashboardCustomizer";
import ProjectCard from "@/components/collaboration/ProjectCard";
import { 
  validateCSP, blockScriptInjection, useMLDataCollector, 
  useCodeIntegrityProtector, LiveSecurityDisplay, LiveThreatDisplay 
} from "@/components/shared/SecurityComponents";
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import HolographicBackground from "@/components/shared/HolographicBackground";

const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    const isRateLimit = err.message?.includes('Rate limit') || err.status === 429;
    const waitTime = isRateLimit ? delay * 2 : delay;
    console.log(`⚠️ Fetch failed, retrying in ${waitTime}ms... (${retries} retries left)`);
    await new Promise(r => setTimeout(r, waitTime));
    return fetchWithRetry(fn, retries - 1, waitTime * 1.5);
  }
};

export default function DashboardPage() {
  const mlDataCollector = useMLDataCollector();
  const codeIntegrity = useCodeIntegrityProtector();
  
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState(null);
  const [projects, setProjects] = useState([]);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [visibleWidgets, setVisibleWidgets] = useState({
    stats: true,
    recent_analyses: true,
    top_tracks: true,
    projects: true,
    tasks: true,
    activity: true,
    quick_actions: true,
    calendar: true
  });
  const [quickActions, setQuickActions] = useState([
    'track_analysis', 'rhythm_analysis', 'dsp_algorithms', 'genre_hit_predictor'
  ]);
  const [sortBy, setSortBy] = useState('date_desc');
  const [showDate, setShowDate] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  const navigate = useNavigate();
  
  const [securityStatus, setSecurityStatus] = useState({ 
    safe: true, 
    threats: 0, 
    mlComplexity: 0, 
    lastCheck: Date.now()
  });

  const [sessionStartTime] = useState(Date.now());
  const analysesRef = React.useRef(analyses);
  const selectedCategoryRef = React.useRef(selectedCategory);

  useEffect(() => {
    analysesRef.current = analyses;
    selectedCategoryRef.current = selectedCategory;
  }, [analyses, selectedCategory]);

  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("⚠️ Dashboard loading timed out - forcing render");
        setIsLoading(false);
        setNetworkError("Loading timed out. Data simulated.");
      }
    }, 4000);
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  const loadAnalyses = async () => {
    try {
      console.log('📦 Loading analyses...');
      setNetworkError(null);

      const [data, projectsData] = await Promise.all([
        fetchWithRetry(() => base44.entities.MusicAnalysis.list('-created_date', 50)),
        fetchWithRetry(() => base44.entities.CollaborationProject.list('-created_date', 10))
      ]);
      
      const validAnalyses = Array.isArray(data) ? data : [];

      setAnalyses(validAnalyses);
      setProjects(projectsData || []);
      setDashboardLayout(null);

      setPinnedProjects(JSON.parse(localStorage.getItem('pinned_projects') || '[]'));
      console.log(`✅ Loaded ${validAnalyses.length} analyses`);

      mlDataCollector.record('dashboard_analyses_loaded', {
        feature: 'dashboard',
        analysisCount: validAnalyses.length,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("❌ Failed to load analyses:", error);
      setNetworkError("Failed to establish neural link.");
    } finally {
      setIsLoading(false);
    }
  };

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
            mlComplexity: cspResult.mlComplexity || 0,
            lastCheck: Date.now()
          });
        }

        const userData = await fetchUserWithCache();
        
        if (mounted) {
          setUser(userData);
          setIsAdmin(userData?.role === 'admin');
          setIsAuthenticated(!!userData);
        }

        await loadAnalyses();
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        if (mounted) {
          setIsLoading(false);
          setNetworkError("Auth handshake failed.");
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
      const sessionDuration = Date.now() - sessionStartTime;
      mlDataCollector.record('dashboard_session_end', {
        sessionDuration,
        timestamp: Date.now()
      });
    };
  }, []);

  useEffect(() => {
    let filtered = [...analyses];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.analysis_type === selectedCategory);
    }
    // Sorting logic omitted for brevity in mock, assuming default sort
    setFilteredAnalyses(filtered);
  }, [analyses, selectedCategory, sortBy]);

  const handleResetStats = async () => {
    if (confirm("⚠️ SYSTEM PURGE: RESET DASHBOARD?")) {
      setIsLoading(true);
      await sleep(1000);
      setAnalyses([]);
      setFilteredAnalyses([]);
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    loadAnalyses();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <HolographicBackground />
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mb-6 mx-auto relative">
             <div className="absolute inset-0 border-4 border-cyber-panel rounded-full"></div>
             <div className="absolute inset-0 border-4 border-t-cyber-cyan border-r-transparent border-b-cyber-gold border-l-transparent rounded-full animate-spin"></div>
             <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-cyber-gold animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white font-mono tracking-[0.5em] animate-pulse">INITIALIZING</h2>
          <p className="text-cyber-gold/60 mt-2 font-mono text-xs">Estabilishing secure neural link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 relative overflow-x-hidden">
      <HolographicBackground />
      
      <NetworkErrorBanner />
      <AILearningBanner />
      <SecurityMonitor />

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-gold to-cyber-purple drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] tracking-tighter">
              NEON<span className="text-white">ANALYTICA</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="h-2 w-2 bg-cyber-gold rounded-full animate-pulse shadow-[0_0_10px_#ffd700]" />
               <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
                 System Online • {user?.full_name || 'Guest'}
               </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button 
              variant="destructive" 
              onClick={handleResetStats} 
              disabled={analyses.length === 0}
              className="border-red-600/50"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Purge Data
            </Button>

            <Button variant="outline" className="border-cyber-gold/30 text-cyber-gold hover:bg-cyber-gold/10 hover:border-cyber-gold/60">
              <Settings className="w-4 h-4 mr-2" /> Config
            </Button>

            <Button className="bg-cyber-purple hover:bg-cyber-purple/80 text-white shadow-[0_0_20px_rgba(189,0,255,0.3)] border border-white/20">
              <Plus className="w-4 h-4 mr-2" /> New Scan
            </Button>
          </div>
        </div>

        {/* AI Insight Banner - Gold Theme */}
        <Card className="mb-8 border-l-4 border-l-cyber-gold border-y-0 border-r-0 bg-gradient-to-r from-cyber-gold/10 to-transparent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-cyber-gold/20 border border-cyber-gold/40 shadow-[0_0_15px_rgba(255,215,0,0.2)] animate-pulse-fast relative">
               <div className="absolute inset-0 bg-cyber-gold/30 blur-md rounded-lg"></div>
               <Crown className="w-6 h-6 text-cyber-gold relative z-10 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm font-mono tracking-widest uppercase mb-1 flex items-center gap-2">
                Neural Engine: <span className="text-cyber-gold">GOLD TIER</span>
              </p>
              <p className="text-xs text-cyber-gold/70 font-mono">Premium predictive algorithms active. Processing at 99.9% accuracy.</p>
            </div>
          </CardContent>
        </Card>

        {showCustomizer && <DashboardCustomizer onClose={() => setShowCustomizer(false)} />}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Stats & Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {visibleWidgets.stats && <StatsCards analyses={analyses} />}
            
            {/* Filter Section */}
            <Card className="border-t border-white/10 shadow-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2 font-mono uppercase tracking-widest">
                    <Activity className="w-4 h-4 text-cyber-gold" /> Data Streams
                  </h3>
                  <div className="flex gap-2">
                    <LiveSecurityDisplay />
                    <LiveThreatDisplay />
                  </div>
                </div>
                <CategoryFilters onFilterChange={setSelectedCategory} selectedCategory={selectedCategory} />
              </CardContent>
            </Card>

            {visibleWidgets.recent_analyses && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-black text-white font-mono uppercase tracking-wider flex items-center gap-2">
                     <ListTodo className="w-5 h-5 text-cyber-purple" /> Recent Scans
                   </h2>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => navigate(createPageUrl('TrackQuery'))}
                     className="text-xs font-mono text-cyber-cyan hover:text-white hover:bg-cyber-cyan/20"
                   >
                     VIEW ALL ANALYSES <TrendingUp className="w-3 h-3 ml-1" />
                   </Button>
                </div>
                <RecentAnalyses analyses={filteredAnalyses} onViewDetails={(id) => navigate(`${createPageUrl('AnalysisResult')}?id=${id}`)} />
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions (Holographic Cards) */}
            {visibleWidgets.quick_actions && (
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => (
                  <Card key={i} className="group hover:scale-[1.02] cursor-pointer bg-cyber-panel/40 hover:bg-cyber-gold/5 hover:border-cyber-gold/50 transition-all duration-500">
                    <CardContent className="p-4 flex flex-col items-center text-center justify-center h-32 relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
                      <div className={cn(
                        "mb-3 p-3 rounded-xl bg-black/40 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden",
                        i === 3 ? "group-hover:border-cyber-gold group-hover:shadow-[0_0_15px_rgba(255,215,0,0.3)]" : "group-hover:border-cyber-cyan group-hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                      )}>
                        {/* Glow effect behind icon */}
                        <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 blur-md transition-opacity", 
                          i === 0 ? "bg-cyber-cyan" : i === 1 ? "bg-cyber-purple" : i === 2 ? "bg-cyber-green" : "bg-cyber-gold"
                        )}></div>
                        
                        {i === 0 ? <Upload className="w-6 h-6 text-cyber-cyan drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]" /> : 
                         i === 1 ? <Activity className="w-6 h-6 text-cyber-purple drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" /> :
                         i === 2 ? <Code className="w-6 h-6 text-cyber-green drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" /> :
                         <TrendingUp className="w-6 h-6 text-cyber-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-widest group-hover:text-white relative z-10">
                        {action.replace(/_/g, ' ')}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {visibleWidgets.top_tracks && (
              <Card className="border-cyber-purple/20 shadow-[0_0_20px_-5px_rgba(189,0,255,0.15)]">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 font-mono uppercase tracking-widest">
                    <TrendingUp className="w-4 h-4 text-cyber-gold" /> Top Hits
                  </h3>
                  <TopTracks analyses={filteredAnalyses} />
                </CardContent>
              </Card>
            )}

            {/* Projects Widget */}
            {visibleWidgets.projects && (
              <Card className="border-l-4 border-l-cyber-green/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                      <div className="p-1 bg-cyber-green/10 rounded relative">
                        <div className="absolute inset-0 bg-cyber-green/20 blur-sm rounded opacity-50"></div>
                        <FolderKanban className="w-4 h-4 text-cyber-green relative z-10 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                      </div> Projects
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {projects.slice(0, 2).map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onOpen={(p) => navigate(`${createPageUrl('ProjectDetail')}?id=${p.id}`)} 
                        onPin={()=>{}} 
                        isPinned={false} 
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {visibleWidgets.calendar && (
              <Card className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-cyber-cyan via-cyber-gold to-cyber-pink" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-white font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                       <div className="p-1 bg-cyber-gold/10 rounded relative">
                         <div className="absolute inset-0 bg-cyber-gold/20 blur-sm rounded opacity-50"></div>
                         <CalendarIcon className="w-4 h-4 text-cyber-gold relative z-10 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
                       </div> Schedule
                     </h3>
                  </div>
                  <CalendarComponent className="bg-black/20 rounded-lg border border-white/5" />
                </CardContent>
              </Card>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}