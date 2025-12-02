import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, MessageCircle, Zap, Music, TrendingUp, Video, Globe, Lock, Shield, FileText, Users, AlertTriangle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";
import { AILearningBanner } from "@/components/shared/NetworkErrorHandler";

export default function FAQPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    blockScriptInjection();
    validateCSP();
    mlDataCollector.record('faq_page_visit', { feature: 'support', timestamp: Date.now() });
  }, []);

  const features = [
    {
      category: "Core Analysis Matrix",
      icon: Music,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      glowColor: "shadow-purple-500/20",
      faqs: [
        {
          q: "How does Track Analysis (Hit Prediction) work?",
          a: "The Track Analysis tool uses a proprietary Deep Neural Network trained on over 175 million commercial tracks. It extracts 40+ audio features (timbre, rhythm, harmony) and compares them against Billboard Hot 100 trends to estimate a 'Pop Hit Score'.  Note: This is a probabilistic estimation, not a guarantee of success."
        },
        {
          q: "What is Rhythm Analysis?",
          a: "Rhythm Analysis deconstructs the groove and micro-timing of your track. It detects swing, quantization errors, and rhythmic consistency using DSP (Digital Signal Processing). Useful for producers looking to perfect the 'feel' of their drums."
        },
        {
          q: "Can I generate Sheet Music from audio?",
          a: "Yes. Our 'Sheet Music' feature uses polyphonic transcription AI to convert audio (MP3/WAV) into MIDI and printable sheet music scores. Accuracy depends on the complexity of the mix."
        }
      ]
    },
    {
      category: "Monetization & Market",
      icon: TrendingUp,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      glowColor: "shadow-green-500/20",
      faqs: [
        {
          q: "How does the Monetization Hub work?",
          a: "The Monetization Hub aggregates potential revenue streams. It estimates royalties from streaming (Spotify/Apple), assists in pricing merchandise, and helps track asset licensing. It's a dashboard for your music business."
        },
        {
          q: "What is Market Fit Analysis?",
          a: "This tool analyzes your track's sonic characteristics and compares them to current Top 40 trends in specific regions (e.g., US, UK, Japan) to determine where your music might perform best."
        },
        {
          q: "Are payments refundable?",
          a: "NO. All payments for premium features are non-refundable. You will always be presented with an 'Are you sure?' prompt before finalizing any purchase."
        }
      ]
    },
    {
      category: "Creative Suite & Metaverse",
      icon: Video,
      color: "text-pink-400",
      borderColor: "border-pink-500/30",
      glowColor: "shadow-pink-500/20",
      faqs: [
        {
          q: "What is SpectroVerse?",
          a: "SpectroVerse is our 3D metaverse environment where you can visualize your music in a virtual concert space.  It includes epilepsy warnings due to flashing lights. You retain rights to the visual output, but the 3D assets belong to SpectroModel."
        },
        {
          q: "How does the Lyric Video Generator work?",
          a: "It automatically syncs your lyrics (using timestamped data) with dynamic video backgrounds. You can export these videos for use on YouTube or social media."
        }
      ]
    },
    {
      category: "Legal Protocols & Security",
      icon: Shield,
      color: "text-red-400",
      borderColor: "border-red-500/30",
      glowColor: "shadow-red-500/20",
      faqs: [
        {
          q: "Who owns the copyright to my analysis?",
          a: "YOU own your music. SpectroModel owns the analysis data, the algorithms, and the platform code. We claim NO ownership over your artistic works."
        },
        {
          q: "Does SpectroModel share my data with police?",
          a: "NO. We have a strict 'No Law Enforcement Cooperation' policy unless compelled by a valid federal court order. Your privacy is paramount."
        },
        {
          q: "Where are my files stored?",
          a: "We use a 'No-Storage' policy for raw audio. Your files are processed in RAM and deleted immediately. Analysis results (JSON) are saved to your connected Cloud Storage (Google Drive, Dropbox, etc.). \n\n[Image of secure cloud storage architecture diagram]\n We do not host your files."
        },
        {
          q: "What is 'AI Learns From My Data'?",
          a: "This is a mandatory condition of use. Our AI improves by learning from the tracks it analyzes. This data is anonymized and aggregated. We do not sell your personal data."
        },
        {
          q: "Can I audit the app's code or security?",
          a: "ABSOLUTELY NOT. This application is proprietary technology. Any attempt to audit, inspect, crawl, or analyze the code, APIs, or data structures is a direct violation of our Terms of Service and will result in immediate legal action and a permanent ban."
        }
      ]
    },
    {
      category: "Accessibility & Localization",
      icon: Globe,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      glowColor: "shadow-cyan-500/20",
      faqs: [
        {
          q: "Is the app accessible for disabled users?",
          a: "Yes. We support high-contrast modes, screen readers, and haptic feedback for the hearing impaired. We strive to be inclusive for seniors and those with physical or intellectual disabilities."
        },
        {
          q: "What languages are supported?",
          a: "The app features a built-in translator for all major languages. However, in legal disputes, the English version of our Terms prevails."
        }
      ]
    }
  ];

  const filteredFeatures = features.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f => 
      f.q.toLowerCase().includes(search.toLowerCase()) || 
      f.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0);

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-12">
        
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-8 mt-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <div className="flex-1">
             <h1 className="text-5xl font-black mb-1 tracking-tight flex items-center gap-4">
               <HelpCircle className="w-10 h-10 text-cyan-400 animate-pulse" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                 KNOWLEDGE BASE
               </span>
             </h1>
             <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
               SYSTEM DOCUMENTATION • FAQ • SUPPORT MATRIX
             </p>
          </div>
          <div className="text-right hidden md:block">
             <p className="font-mono text-xs text-slate-500">DOC ID: SP-FAQ-2025</p>
             <p className="font-mono text-xs text-slate-500">v2.2.0-RELEASE</p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-3xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl opacity-20 blur transition duration-500 group-hover:opacity-40"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              className="pl-12 py-6 bg-black/80 border border-slate-700 text-lg text-white placeholder:text-slate-600 focus:ring-1 focus:ring-cyan-500/50 rounded-xl shadow-2xl backdrop-blur-xl transition-all" 
              placeholder="QUERY DATABASE..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div className="grid gap-8">
          {filteredFeatures.map((section, idx) => (
            <Card key={idx} className={`bg-black/40 border ${section.borderColor} shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] backdrop-blur-md rounded-xl overflow-hidden hover:bg-black/60 transition-colors`}>
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-black/50 border ${section.borderColor}`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-wide">{section.category}</h2>
              </div>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {section.faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`${idx}-${i}`} className="border-b border-white/5 last:border-0 px-6">
                      <AccordionTrigger className="text-left font-bold text-slate-200 py-5 hover:text-cyan-400 transition-colors text-base uppercase tracking-tight data-[state=open]:text-cyan-400">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-300 pb-6 leading-relaxed font-mono text-sm text-justify pl-4 border-l-2 border-slate-700">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredFeatures.length === 0 && (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <p className="text-xl font-bold text-slate-500 uppercase">Data Not Found</p>
            <p className="text-slate-600 font-mono">Adjust search parameters</p>
          </div>
        )}

        {/* SUPPORT FOOTER */}
        <div className="flex flex-col items-center justify-center pt-12 border-t border-slate-800 gap-6">
          <Button 
            onClick={() => window.location.href = "mailto:jspectro2016@gmail.com"}
            className="bg-cyan-600/10 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-cyan-500/50 font-bold py-6 px-12 text-lg rounded-full shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            INITIATE SUPPORT TICKET
          </Button>
          <div className="text-center space-y-2">
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">© 2025 SpectroModel Inc. All Rights Reserved.</p>
            <p className="text-slate-600 text-[10px] font-mono">COMPANY OWNS ALL INTELLECTUAL PROPERTY.</p>
          </div>
        </div>
      </div>
    </div>
  );
}