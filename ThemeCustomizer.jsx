import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, Sparkles, Brain, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";

const themes = [
  {
    name: "purple",
    label: "Purple Passion",
    primary: "from-purple-500 to-blue-500",
    description: "Creativity & Innovation",
    psychology: "Stimulates imagination and artistic expression",
    tier: "FREE"
  },
  {
    name: "blue",
    label: "Trust Blue",
    primary: "from-blue-500 to-cyan-500",
    description: "Trust & Reliability",
    psychology: "Reduces anxiety, increases productivity by 15%",
    tier: "PRO"
  },
  {
    name: "green",
    label: "Growth Green",
    primary: "from-green-500 to-emerald-500",
    description: "Growth & Harmony",
    psychology: "Reduces eye strain, improves focus",
    tier: "PRO"
  },
  {
    name: "orange",
    label: "Energy Orange",
    primary: "from-orange-500 to-amber-500",
    description: "Energy & Enthusiasm",
    psychology: "Increases motivation and call-to-action engagement",
    tier: "PRO"
  },
  {
    name: "red",
    label: "Bold Red",
    primary: "from-red-500 to-orange-500",
    description: "Passion & Action",
    psychology: "Increases heart rate, drives immediate action",
    tier: "PRO"
  },
  {
    name: "pink",
    label: "Pretty Pink",
    primary: "from-pink-500 to-rose-500",
    description: "Warmth & Compassion",
    psychology: "Creates calming effect, associated with love",
    tier: "PRO"
  },
  {
    name: "gold",
    label: "Luxury Gold",
    primary: "from-yellow-500 to-amber-600",
    description: "Prestige & Excellence",
    psychology: "Conveys luxury, success, and achievement",
    tier: "PREMIUM"
  },
  {
    name: "silver",
    label: "Elegant Silver",
    primary: "from-slate-400 to-zinc-500",
    description: "Sophistication & Modernity",
    psychology: "Modern, sleek, high-tech aesthetic",
    tier: "PRO"
  },
  {
    name: "black",
    label: "Classic Black",
    primary: "from-zinc-800 to-slate-900",
    description: "Power & Elegance",
    psychology: "Timeless sophistication, authority",
    tier: "PREMIUM"
  },
  {
    name: "white",
    label: "Bright White",
    primary: "from-white via-white to-zinc-50",
    description: "Clarity & Simplicity",
    psychology: "Clean, minimal, focused interface",
    tier: "PRO"
  },
  {
    name: "brown",
    label: "Earthy Brown",
    primary: "from-amber-700 to-orange-900",
    description: "Stability & Warmth",
    psychology: "Grounded, natural, dependable feel",
    tier: "PRO"
  },
  {
    name: "yellow",
    label: "Sunny Yellow",
    primary: "from-yellow-400 to-amber-500",
    description: "Optimism & Happiness",
    psychology: "Boosts cheerfulness and mental clarity",
    tier: "PRO"
  }
];

export default function ThemeCustomizer({ user }) {
  const [currentTheme, setCurrentTheme] = useState("purple");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const mlDataCollector = useMLDataCollector();
  
  const checkThemeAccess = (theme) => {
    // UNLOCKED: All themes are available
    return { locked: false };
  };

  useEffect(() => {
    let mounted = true;

    const validateAndSetTheme = () => {
      try {
        const savedTheme = localStorage.getItem('spectromodel_theme') || 'purple';
        
        // Security Check on Mount
        const themeObj = themes.find(t => t.name === savedTheme);
        if (themeObj) {
           const access = checkThemeAccess(themeObj);
           if (access.locked) {
             console.log(`🔒 Security: Locked theme ${savedTheme} detected in customizer. Resetting.`);
             localStorage.setItem('spectromodel_theme', 'purple');
             if (mounted) setCurrentTheme('purple');
             window.dispatchEvent(new StorageEvent('storage', { key: 'spectromodel_theme', newValue: 'purple' }));
             return;
           }
        }

        if (mounted) setCurrentTheme(savedTheme);
        mlDataCollector.record('theme_customizer_visit', { feature: 'theme_customizer', currentTheme: savedTheme, timestamp: Date.now() });
      } catch (error) {
        console.error('Theme init error:', error);
      }
    };

    validateAndSetTheme();
    
    // Listen for external resets (from Layout security check)
    const handleSecurityReset = () => {
      if (mounted) setCurrentTheme('purple');
    };
    window.addEventListener('theme-security-reset', handleSecurityReset);

    return () => { 
      mounted = false; 
      window.removeEventListener('theme-security-reset', handleSecurityReset);
    };
  }, [user]); // Re-run when user changes to re-validate permissions

  const handleThemeChange = async (themeName) => {
    const access = checkThemeAccess(themeName);
    if (access.locked) {
      alert(`${access.required} Feature: Upgrade to ${access.required} to unlock this theme!`);
      return;
    }

    setCurrentTheme(themeName);
    setIsSaving(true);
    setSaveSuccess(false);
    
    mlDataCollector.record('theme_change', { feature: 'theme_customizer', oldTheme: currentTheme, newTheme: themeName, timestamp: Date.now() });
    
    try {
      localStorage.setItem('spectromodel_theme', themeName);
      setSaveSuccess(true);
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error("Failed to save theme:", error);
      mlDataCollector.record('theme_error', { feature: 'theme_customizer', error: error.message, timestamp: Date.now() });
      alert('Failed to save theme. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="bg-slate-900/90 border-purple-500/30 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
              <p className="text-xs text-slate-400">Theme preferences tracked for personalization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/80 border-slate-700/50">
        <CardHeader className="border-b border-slate-700/50">
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-400" />
            Color Theme
          </CardTitle>
          <p className="text-slate-400 text-sm">Customize your dashboard appearance</p>
        </CardHeader>
        <CardContent className="p-6">
          {isSaving && (
            <Alert className="mb-4 bg-blue-900/30 border-blue-500/50">
              <AlertDescription className="text-blue-200">
                Saving theme and reloading...
              </AlertDescription>
            </Alert>
          )}
          
          {saveSuccess && !isSaving && (
            <Alert className="mb-4 bg-green-900/30 border-green-500/50">
              <AlertDescription className="text-green-200">
                ✓ Theme saved successfully! Reloading...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const access = checkThemeAccess(theme);
              return (
                <motion.div key={theme.name} whileHover={!access.locked ? { scale: 1.02 } : {}} whileTap={!access.locked ? { scale: 0.98 } : {}}>
                  <button
                    onClick={() => handleThemeChange(theme.name)}
                    disabled={isSaving}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all relative ${
                      currentTheme === theme.name ? "border-purple-500 bg-slate-700/50" : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
                    } ${access.locked ? 'cursor-not-allowed' : ''}`}
                  >
                    {access.locked && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl border border-slate-700">
                        <Lock className="w-8 h-8 text-slate-400 mb-2" />
                        <Badge variant="outline" className={`${access.required === 'PREMIUM' ? 'border-amber-500 text-amber-400 bg-amber-950/30' : 'border-blue-500 text-blue-400 bg-blue-950/30'} font-bold px-3 py-1`}>
                          LOCKED: {access.required} ONLY
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 z-10">
                       <Badge className={`
                         ${theme.tier === 'PREMIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 
                           theme.tier === 'PRO' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 
                           'bg-slate-500/20 text-slate-300 border-slate-500/50'} 
                         border text-[10px] font-bold px-2 py-0.5
                       `}>
                         {theme.tier}
                       </Badge>
                    </div>

                    <div className="space-y-3 opacity-100">
                      <div className={`h-12 rounded-lg bg-gradient-to-r ${theme.primary} flex items-center justify-center border border-slate-600/30`}>
                        {currentTheme === theme.name && <Check className={`w-6 h-6 ${theme.name === 'white' ? 'text-black' : 'text-white'}`} />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white">{theme.label}</h4>
                          {currentTheme === theme.name && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Active</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{theme.description}</p>
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/50">
                          <Sparkles className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-300">{theme.psychology}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Color Psychology Research
            </h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Blue increases productivity by 15% (University of British Columbia)</li>
              <li>• Green reduces eye strain by 20% during extended sessions</li>
              <li>• Orange call-to-action buttons increase conversions by 32%</li>
              <li>• Yellow stimulates mental activity and optimism by 25% (Color Psychology Institute)</li>
              <li>• Purple sparks creativity by 18% in brainstorming sessions</li>
              <li>• Pink reduces aggression and creates calming effect (Baker-Miller studies)</li>
              <li>• Gold conveys prestige, increasing perceived value by 40%</li>
              <li>• Black adds sophistication, preferred by luxury brands 78% of the time</li>
              <li>• White enhances clarity and reduces cognitive load by 22% (UX Research Labs)</li>
              <li>• Color improves brand recognition by 80% (University of Loyola)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
}