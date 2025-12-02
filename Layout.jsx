
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, Zap, BarChart3, Music, Upload, LineChart, FileMusic, Sparkles, TrendingUp, RefreshCw, Settings, LogOut, Mic, Video, Globe, Shield, FileText, Clock, Search, History, Vibrate, Volume2, VolumeX, BookOpen, AlertCircle, Lock, Rocket, Code, Users, Waves, Brain, Cookie, AlertTriangle, Network, Binary, Terminal } from "lucide-react";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import GlobalAIAssistant from "@/components/shared/GlobalAIAssistant";
import NavigationArrows from "@/components/shared/NavigationArrows";
import LiveClock from "@/components/shared/LiveClock";
import { audioEngine } from "@/components/shared/AudioSynthEngine";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { blockScriptInjection, validateCSP } from "@/components/shared/SecurityValidator";
import GlobalStyles from "@/components/shared/GlobalStyles";
import SecurityScareSystem from "@/components/shared/SecurityScareSystem";
import LegalGate from "@/components/shared/LegalGate";
import { TutorialProvider, useTutorial } from "@/components/shared/TutorialSystem";
import { HelpCircle } from "lucide-react";
import { setupGlobalNetworkHandler, AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import MeditativePlayer from "@/components/shared/MeditativePlayer";
import CodeProtection from "@/components/shared/CodeProtection";
import UsageRulesModal from "@/components/shared/UsageRulesModal";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import { checkFeatureAccess, SUBSCRIPTION_TIERS } from "@/components/shared/subscriptionSystem";
import ParticleSystem from "@/components/shared/ParticleSystem";
import { fetchUserWithCache, clearUserCache } from "@/components/shared/userCache";

const STATIC_NAVIGATION_ITEMS = [
  { title: "Home", url: createPageUrl("Landing"), icon: Zap },
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: BarChart3 },
  {
    title: "Analysis Types",
    icon: Music,
    children: [
      { title: "Track Analysis", url: createPageUrl("Analyze"), icon: Upload, limitKey: 'analysis_uploads', featureKey: 'TRACK_ANALYSIS' },
      { title: "DSP Analysis", url: createPageUrl("DSPAlgorithms"), icon: Code, limitKey: 'advanced_analytics', featureKey: 'DSP_ALGORITHMS' },
      { title: "Rhythm Analysis", url: createPageUrl("AnalyzeRhythm"), icon: LineChart, limitKey: 'advanced_analytics', featureKey: 'RHYTHM_ANALYSIS' },
      { title: "Sheet Music", url: createPageUrl("SheetMusic"), icon: FileMusic, limitKey: 'analysis_uploads', featureKey: 'SHEET_MUSIC' },
      { title: "Lyrics Retrieval", url: createPageUrl("LyricsRetrieval"), icon: FileText, featureKey: 'LYRICS_RETRIEVAL' },
      { title: "Lyrics Analyzer", url: createPageUrl("LyricsAnalyzer"), icon: Music, limitKey: 'analysis_uploads', featureKey: 'LYRICS_ANALYZER' },
      { title: "Emoji Lyrics", url: createPageUrl("EmojiLyrics"), icon: Sparkles, featureKey: 'EMOJI_LYRICS' },
      { title: "Genre Predictor", url: createPageUrl("GenrePredictor"), icon: TrendingUp, limitKey: 'analysis_uploads', featureKey: 'GENRE_PREDICTOR' },
      { title: "AI Track Query", url: createPageUrl("TrackQuery"), icon: Sparkles, featureKey: 'TRACK_QUERY' },
    ]
  },
  {
    title: "Business Tools",
    icon: TrendingUp,
    children: [
      { title: "Monetization Hub", url: createPageUrl("Monetization"), icon: TrendingUp, featureKey: 'MONETIZATION' },
      { title: "Market Research", url: createPageUrl("MarketResearch"), icon: BarChart3, featureKey: 'MARKET_RESEARCH' },
      { title: "Market Fit Analysis", url: createPageUrl("AnalyzeMarketFit"), icon: TrendingUp, featureKey: 'MARKET_FIT' },
      { title: "Time Series Analysis", url: createPageUrl("AnalyzeTimeSeries"), icon: LineChart, featureKey: 'TIME_SERIES' },
      { title: "Industry Insights", url: createPageUrl("IndustryInsights"), icon: TrendingUp, featureKey: 'INDUSTRY_INSIGHTS' },
      { title: "Distribution & Promo", url: createPageUrl("DistributionPromotion"), icon: Rocket, featureKey: 'DISTRIBUTION' },
    ]
  },
  {
    title: "Creative Tools",
    icon: Sparkles,
    children: [
      { title: "Advanced Analytics", url: createPageUrl("AdvancedAnalytics"), icon: Sparkles, featureKey: 'ADVANCED_ANALYTICS' },
      { title: "Studio Corrector", url: createPageUrl("StudioCorrector"), icon: Sparkles, featureKey: 'STUDIO_CORRECTOR' },
      { title: "Video Studio", url: createPageUrl("VideoStudio"), icon: Lock, featureKey: 'VIDEO_STUDIO' },
      { title: "ProRes 4K Engine", url: createPageUrl("SpectroModelProRes4K"), icon: Video, featureKey: 'VIDEO_STUDIO' },
      { title: "Lyric Video Generator", url: createPageUrl("VideoGenerator"), icon: Lock, featureKey: 'VIDEO_GENERATOR' },
      { title: "SpectroVerse", url: createPageUrl("SpectroVerse"), icon: Lock, featureKey: 'SPECTROVERSE' },
      { title: "Artist Vault", url: createPageUrl("ArtistVault"), icon: Lock, featureKey: 'ARTIST_VAULT' },
    ]
  },
  {
    title: "Recent Analyses",
    icon: BarChart3,
    children: [
      { title: "View All Analyses", url: createPageUrl("Analyze"), icon: BarChart3, featureKey: 'RECENT_ANALYSES' },
    ]
  },
  {
    title: "Collaboration",
    icon: Globe,
    children: [
      { title: "Projects", url: createPageUrl("Projects"), icon: FileMusic, showLoader: true, featureKey: 'PROJECTS' },
    ]
  },
  {
    title: "Resources",
    icon: FileMusic,
    children: [
      { title: "African Research Library", url: createPageUrl("MusicResearch"), icon: BookOpen, featureKey: 'AFRICAN_RESEARCH' },
      { title: "Music Education", url: createPageUrl("MusicEducation"), icon: Music, featureKey: 'MUSIC_EDUCATION' },
      { title: "Company Copyright & IP", url: createPageUrl("CompanyCopyright"), icon: Shield, featureKey: 'COMPANY_COPYRIGHT' },
      { title: "Copyright Registration", url: createPageUrl("CopyrightProtection"), icon: FileText, featureKey: 'COPYRIGHT_PROTECTION' },
      { title: "MP3 Converter", url: createPageUrl("AudioConverter"), icon: RefreshCw, featureKey: 'AUDIO_CONVERTER' },
      { title: "Version History", url: createPageUrl("VersionHistory"), icon: History, featureKey: 'VERSION_HISTORY' },
      { title: "Haptic Feedback", url: createPageUrl("HapticFeedback"), icon: Vibrate, featureKey: 'HAPTIC_FEEDBACK' },
      { title: "Accessibility", url: createPageUrl("Accessibility"), icon: Settings, featureKey: 'ACCESSIBILITY' },
      { title: "Terms of Service", url: createPageUrl("Terms"), icon: FileText, featureKey: 'TERMS' },
      { title: "Privacy Policy", url: createPageUrl("PrivacyPolicy"), icon: Shield, featureKey: 'PRIVACY' },
      { title: "Support", url: createPageUrl("Support"), icon: HelpCircle, featureKey: 'SUPPORT' },
      ]
      },
];

// Reusable Diagram Component for Layout
const LayoutDiagram = ({ type, label, color = "red" }) => {
  const colorMap = {
    red: "text-red-400 border-red-500/30 bg-red-950/30",
    amber: "text-amber-400 border-amber-500/30 bg-amber-950/30",
    blue: "text-blue-400 border-blue-500/30 bg-blue-950/30",
  };
  
  return (
    <div className="w-full h-48 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Lock className={`w-6 h-6 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-1">Security Protocol</div>
        <Badge variant="outline" className={`font-mono text-sm py-1 px-4 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-xs max-w-md mx-auto mt-2 font-mono">{label}</p>}
      </div>
    </div>
  );
};

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = React.useState([]);
  const [recentAnalyses, setRecentAnalyses] = React.useState([]);
  const [isLoadingRecents, setIsLoadingRecents] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [networkError, setNetworkError] = React.useState(null);
  const [user, setUser] = React.useState(null);

  const mlDataCollector = useMLDataCollector();
  const { isLocked } = useUsageLimits(user);

  const navigationItems = React.useMemo(() => {
    const userTier = user?.role === 'admin' ? 'premium' : (user?.subscription_tier || 'free');
    console.log("Nav Security Check - Tier:", userTier);

    return STATIC_NAVIGATION_ITEMS.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(subItem => {
            // Unlocked all pages as requested
            return {
              ...subItem,
              locked: false
            };
          })
        };
      }
      return item;
    });
  }, [isLocked, user]);

  // SECURITY: Determine if current page is locked
  const isCurrentPageLocked = React.useMemo(() => {
    if (currentPageName === 'Landing' || currentPageName === 'Settings') return false;
    const targetUrl = createPageUrl(currentPageName);
    const findLockStatus = (items) => {
      for (const item of items) {
        if (item.url && (item.url === targetUrl || item.url.includes(`/${currentPageName}`))) {
          return item.locked;
        }
        if (item.children) {
          const childStatus = findLockStatus(item.children);
          if (childStatus !== null) return childStatus;
        }
      }
      return null;
    };
    const status = findLockStatus(navigationItems);
    return status === true;
  }, [currentPageName, navigationItems]);

  React.useEffect(() => {
    audioEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  React.useEffect(() => {
    let isMounted = true;
    const loadRecents = async () => {
      try {
        setNetworkError(null);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) console.warn('Web Audio API not supported');

        let userData = null;
        try {
          userData = await fetchUserWithCache();
          if (isMounted) {
            setUser(userData);
            setIsAuthenticated(!!userData);
          }
        } catch (userErr) {
          console.warn('User fetch/auth check failed:', userErr);
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        }

        const searches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
        if (isMounted) setRecentSearches(searches.slice(0, 5));
        
        if (userData) {
          try {
            const analyses = await Promise.race([
              base44.entities.MusicAnalysis.list('-created_date', 5),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            if (isMounted) setRecentAnalyses(analyses || []);
          } catch (apiError) {
            console.warn('Failed to load analyses:', apiError);
          }
        }
        
        if (isMounted) setIsLoadingRecents(false);
      } catch (error) {
        console.error('Layout init error:', error);
        if (isMounted) {
          setIsLoadingRecents(false);
          setIsAuthenticated(false);
          setNetworkError(null);
        }
      }
    };

    loadRecents();

    const handleAnalysesDeleted = () => {
      if (isMounted) {
        setRecentAnalyses([]);
        setRecentSearches([]);
      }
    };

    window.addEventListener('analyses-deleted', handleAnalysesDeleted);
    return () => {
      isMounted = false;
      window.removeEventListener('analyses-deleted', handleAnalysesDeleted);
    };
  }, []);

  // THEME & FEATURE SECURITY VALIDATOR
  React.useEffect(() => {
    const validateThemeSecurity = () => {
      try {
        const currentTheme = localStorage.getItem('spectromodel_theme');
        if (!currentTheme || currentTheme === 'purple') return;

        const userTier = user?.role === 'admin' ? 'premium' : (user?.subscription_tier || 'free');
        const premiumThemes = ['gold', 'black'];
        const proThemes = ['blue', 'green', 'orange', 'red', 'pink', 'silver', 'white', 'brown', 'yellow'];

        let isLocked = false;
        if (userTier === 'free') {
          if (premiumThemes.includes(currentTheme) || proThemes.includes(currentTheme)) isLocked = true;
        } else if (userTier === 'pro') {
          if (premiumThemes.includes(currentTheme)) isLocked = true;
        }

        if (isLocked) {
          localStorage.setItem('spectromodel_theme', 'purple');
          window.dispatchEvent(new StorageEvent('storage', { key: 'spectromodel_theme', newValue: 'purple' }));
          window.dispatchEvent(new Event('theme-security-reset'));
          mlDataCollector.record('security_theme_reset', {
            feature: 'layout',
            attemptedTheme: currentTheme,
            userTier: userTier,
            timestamp: Date.now()
          });
        }
      } catch (e) {
        console.error('Theme security check failed:', e);
      }
    };

    if (!isLoadingRecents) validateThemeSecurity();
  }, [user, isLoadingRecents, mlDataCollector]);

  React.useEffect(() => {
    if (currentPageName && currentPageName !== "Landing") {
      mlDataCollector.record('navigation', {
        page: currentPageName,
        timestamp: Date.now()
      });
    }
  }, [currentPageName, mlDataCollector]);

  React.useEffect(() => {
    try {
      setupGlobalNetworkHandler();
      blockScriptInjection();
      validateCSP();
      mlDataCollector.record('security_initialized', { feature: 'layout', timestamp: Date.now() });
    } catch (err) {
      console.warn('Security init warning:', err);
    }
  }, []);

  const handleAction = (action) => {
    if (action === 'clear-cache') {
      if (confirm('🗑️ Clear browser cache and recent searches? (Previous versions will be preserved)')) {
        Object.keys(localStorage).forEach(key => {
          if (!key.startsWith('spectro_version_') && !key.startsWith('spectro_backup_')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
        mlDataCollector.record('cache_cleared', { feature: 'layout', timestamp: Date.now() });
        alert('✅ Cache cleared! (Version history preserved)');
        window.location.reload();
      }
    }
  };

  const handleLogout = () => {
    clearUserCache();
    mlDataCollector.record('logout', { feature: 'layout', timestamp: Date.now() });
    try {
      base44.auth.logout();
    } catch (err) {
      window.location.href = createPageUrl("Landing");
    }
  };

  if (currentPageName === "Landing") {
    return (
      <ErrorBoundary>
        <GlobalStyles />
        <TutorialProvider user={user}>
          <LegalGate user={user} />
          {children}
        </TutorialProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GlobalStyles />
      <TutorialProvider user={user}>
        <CodeProtection />
        <LegalGate user={user} />
        {user && <UsageRulesModal featureName={currentPageName} userTier={user.role === 'admin' ? 'premium' : 'free'} />}
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-[#030014] touch-manipulation relative overflow-hidden font-sans text-slate-200">
            {/* --- NEURAL INTERFACE BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                {/* DYNAMIC THEME ORBS */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--primary-dark)_0%,#030014_60%,#000000_100%)] opacity-60"></div>
                <div 
                  className="orb w-[800px] h-[800px] top-[-20%] left-[-20%] blur-[120px] mix-blend-screen animate-pulse duration-[10s]"
                  style={{ backgroundColor: 'var(--primary)', opacity: 0.25 }}
                ></div>
                <div 
                  className="orb w-[600px] h-[600px] bottom-[-10%] right-[-10%] blur-[120px] mix-blend-screen animate-pulse duration-[15s]"
                  style={{ backgroundColor: 'var(--secondary)', opacity: 0.25 }}
                ></div>
                <div 
                  className="orb w-[400px] h-[400px] top-[40%] right-[20%] blur-[100px] mix-blend-screen animate-pulse duration-[12s]"
                  style={{ backgroundColor: 'var(--primary)', opacity: 0.15 }}
                ></div>
            </div>
            <ParticleSystem />

            <div className="relative z-10 flex w-full">
              {/* GLASSMORPHIC COMMAND RAIL SIDEBAR */}
              <Sidebar className="border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:block shadow-2xl z-50">
                <SidebarContent className="bg-transparent">
                  <SidebarGroup>
                    <SidebarGroupLabel className="px-4 py-4 h-16 flex items-center border-b border-white/5 mb-2">
                      <div className="flex items-center gap-2 font-black text-xl tracking-tighter uppercase" style={{ color: 'var(--primary)' }}>
                        <Binary className="w-6 h-6" style={{ color: 'var(--secondary)' }} />
                        SpectroModel
                      </div>
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="px-2">
                      <SidebarMenu>
                        {navigationItems.map((item) => {
                          if (item.children) {
                            return (
                              <Collapsible key={item.title} className="group/collapsible">
                                <SidebarMenuItem>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="hover:bg-transparent hover:text-cyan-400 transition-all duration-300 data-[state=open]:text-cyan-400 rounded-lg my-0.5 font-black">
                                      <item.icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                      <span className="tracking-wide text-sm font-black text-slate-200 hover:text-cyan-400">{item.title}</span>
                                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-100 text-slate-400" />
                                    </SidebarMenuButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub className="border-l-white/10 ml-4 pl-2">
                                      {item.children.map((subItem) => {
                                        if (subItem.locked) {
                                          return (
                                            <SidebarMenuSubItem key={subItem.title}>
                                              <SidebarMenuSubButton 
                                                className="text-slate-600 cursor-not-allowed hover:bg-transparent flex justify-between items-center group/lock" 
                                                onClick={(e) => { e.preventDefault(); alert("This feature is locked. Upgrade to access."); }}
                                              >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                  <subItem.icon className="w-3 h-3 shrink-0 group-hover/lock:text-red-400 transition-colors" />
                                                  <span className="truncate text-xs font-mono group-hover/lock:text-red-400 transition-colors">{subItem.title}</span>
                                                </div>
                                                <Lock className="w-3 h-3 text-slate-700 group-hover/lock:text-red-500" />
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          );
                                        }
                                        return (
                                          <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild>
                                              <Link to={subItem.url} className="hover:text-cyan-400 transition-all rounded-md font-bold my-1 pl-8">
                                                <subItem.icon className="w-3 h-3" style={{ color: 'var(--secondary)' }} />
                                                <span className="text-xs tracking-wide font-bold text-slate-300 hover:text-cyan-400">{subItem.title}</span>
                                              </Link>
                                            </SidebarMenuSubButton>
                                          </SidebarMenuSubItem>
                                        );
                                      })}
                                    </SidebarMenuSub>
                                  </CollapsibleContent>
                                </SidebarMenuItem>
                              </Collapsible>
                            );
                          }
                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild>
                                <Link to={item.url} className="hover:bg-transparent hover:text-cyan-400 transition-all rounded-lg my-0.5 font-black">
                                  <item.icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                  <span className="tracking-wide text-sm font-black text-slate-200 hover:text-cyan-400">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>

                  {!isLoadingRecents && isAuthenticated && recentSearches.length > 0 && (
                    <SidebarGroup className="mt-4 border-t border-white/5 pt-4">
                      <SidebarGroupLabel className="text-slate-500 text-xs font-mono uppercase tracking-widest px-4 mb-2 flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        Command History
                      </SidebarGroupLabel>
                      <SidebarGroupContent className="px-2">
                        <SidebarMenu>
                          {recentSearches.map((search, idx) => (
                            <SidebarMenuItem key={idx}>
                              <SidebarMenuButton asChild>
                                <Link to={createPageUrl("TrackQuery")} className="text-slate-500 hover:text-cyan-300 hover:bg-white/5 text-xs font-mono">
                                  <span className="truncate opacity-70"> {">"} {search.query || search.track || 'NULL'}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  )}

                  <SidebarGroup className="mt-auto border-t border-white/5 pt-2 bg-black/40">
                    <SidebarGroupContent className="px-2">
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild>
                            <Link to={createPageUrl("Settings")} className="text-slate-400 hover:text-white hover:bg-white/5">
                              <Settings className="w-4 h-4" />
                              <span>System Config</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                           <SidebarMenuButton onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-cyan-300 hover:bg-white/5 cursor-pointer">
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            <span>Audio: {soundEnabled ? 'ON' : 'OFF'}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                          <SidebarMenuButton onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        <div className="px-2 py-3">
                          <GlobalAIAssistant />
                        </div>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>

              <div className="flex-1 flex flex-col w-full min-w-0 touch-action-manipulation relative">
                {/* HUD STYLE HEADER */}
                <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="text-slate-400 hover:text-white hover:bg-white/10" />
                    <div className="hidden md:flex h-8 w-[1px] bg-white/10"></div>
                    <div className="flex flex-col">
                       <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                         {currentPageName || 'DASHBOARD'}
                         <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                       </h1>
                       <span className="text-[10px] font-mono text-slate-500">SYS.VER.2025.5.1</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="hidden md:flex bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px] font-mono items-center gap-2">
                      <Brain className="w-3 h-3 animate-pulse" /> 
                      NEURAL_LEARNING_ACTIVE
                    </Badge>
                    
                    <TutorialTrigger pageName={currentPageName} />
                    
                    <div className="hidden md:block">
                       <LiveClock showDate={false} className="font-mono text-xs text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/20" timezone="UTC" />
                    </div>

                    <Button 
                      onClick={() => navigate(createPageUrl("Analyze"))} 
                      size="sm" 
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wide text-xs border border-cyan-400/50 shadow-[0_0_15px_rgba(8,145,178,0.4)]"
                    >
                      <Upload className="w-3 h-3 mr-2" /> Initiate Scan
                    </Button>
                  </div>
                </header>

                <div className="px-4 md:px-8 pt-6 space-y-4 relative z-30">
                  <NetworkErrorBanner />
                  <SecurityScareSystem />
                  <SecurityMonitor />
                  <AILearningBanner />
                </div>

                <main className="flex-1 overflow-x-hidden pb-24 relative z-20">
                  {isCurrentPageLocked ? (
                    <div className="flex items-center justify-center min-h-[70vh] p-4 animate-in fade-in zoom-in duration-500">
                      <Card className="max-w-lg w-full bg-black/80 border border-red-500/30 backdrop-blur-xl shadow-[0_0_100px_-20px_rgba(220,38,38,0.2)] relative overflow-hidden">
                        {/* Scanning Line Animation */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(220,38,38,0.1),transparent)] h-[200%] w-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>
                        
                        <CardContent className="p-10 text-center relative z-10">
                          <div className="w-24 h-24 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)] relative">
                             <div className="absolute inset-0 rounded-full border-t-2 border-red-500 animate-spin"></div>
                             <Lock className="w-10 h-10 text-red-500" />
                          </div>
                          
                          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest glitch-text" data-text="ACCESS DENIED">
                            ACCESS DENIED
                          </h2>
                          <p className="text-red-400 font-mono text-sm mb-8 uppercase tracking-widest">
                            Clearance Level Insufficient
                          </p>

                          <LayoutDiagram type="security_clearance_protocol" label="Authentication Gate: Level 5 Required" color="red" />
                          
                          <p className="text-slate-400 mb-8 leading-relaxed text-sm max-w-sm mx-auto">
                            {isAuthenticated 
                              ? "This neural sector requires higher clearance credentials. Please upgrade your access privileges." 
                              : "Biometric signature not found. Please authenticate to bypass security protocols."}
                          </p>
                          
                          <div className="space-y-4">
                            <Button 
                              onClick={() => {
                                if (!isAuthenticated) {
                                  navigate(createPageUrl('Landing'));
                                } else {
                                  navigate(createPageUrl('Settings'));
                                }
                              }} 
                              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-6 uppercase tracking-widest shadow-lg shadow-red-900/20 border border-red-400/50"
                            >
                              {isAuthenticated ? "REQUEST CLEARANCE UPGRADE" : "INITIATE AUTHENTICATION"}
                            </Button>
                            {isAuthenticated && (
                              <Button variant="ghost" onClick={() => navigate(createPageUrl('Dashboard'))} className="w-full text-slate-500 hover:text-white hover:bg-white/5 font-mono text-xs">
                                {`< RETURN_TO_DASHBOARD />`}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {children}
                    </div>
                  )}
                </main>
              </div>
            </div>
          </div>
          <NavigationArrows />
          <MeditativePlayer />
        </SidebarProvider>
      </TutorialProvider>
    </ErrorBoundary>
  );
}

function TutorialTrigger({ pageName }) {
  const { startTutorial, suggestTutorial } = useTutorial();
  const [shouldSuggest, setShouldSuggest] = React.useState(false);

  React.useEffect(() => {
    if (suggestTutorial(pageName)) {
      setShouldSuggest(true);
    }
  }, [pageName, suggestTutorial]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30 ${shouldSuggest ? 'animate-pulse text-cyan-400' : ''}`}
      onClick={() => startTutorial(pageName)}
      title="System Tutorial"
    >
      <HelpCircle className="w-5 h-5" />
    </Button>
  );
}
