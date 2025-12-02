import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, ShieldCheck, Loader2 } from "lucide-react";
import { LegalTermsText, PrivacyPolicyText } from "@/components/shared/LegalText";
import { base44 } from "@/api/base44Client";
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [user, setUser] = useState(null);
  const [lastSigned, setLastSigned] = useState(null);
  const mlDataCollector = useMLDataCollector();
  const [language, setLanguage] = useState("English");
  
  const CURRENT_VERSION = "2.2.0-RELEASE";

  useEffect(() => {
    const init = async () => {
      try {
        blockScriptInjection();
        validateCSP();
        
        const userData = await base44.auth.me();
        setUser(userData);
        if (userData?.terms_accepted_at) {
          setLastSigned(new Date(userData.terms_accepted_at));
        }

        mlDataCollector.record('terms_page_visit', {
          feature: 'legal_center',
          timestamp: Date.now()
        });
      } catch (err) {
        console.error("Init error:", err);
      }
    };
    init();
  }, []);

  const handleSign = async () => {
    if (!user) {
      alert("Please log in to sign the agreement.");
      return;
    }
    
    setIsSigning(true);
    try {
      // Log acceptance to entity
      await base44.entities.TermsAcceptanceLog.create({
        user_email: user.email,
        terms_version: CURRENT_VERSION,
        accepted_at: new Date().toISOString(),
        device_info: navigator.userAgent,
        acceptance_method: 'settings_page_resign'
      });

      // Update user profile
      await base44.auth.updateMe({
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        terms_version: CURRENT_VERSION
      });

      // ML Record
      mlDataCollector.record('terms_resigned', {
        userId: user.id,
        version: CURRENT_VERSION,
        timestamp: Date.now()
      });

      setLastSigned(new Date());
      setAgreed(false);
      alert("✅ Agreement signed and recorded successfully.");
    } catch (error) {
      console.error("Signing failed:", error);
      alert("Failed to sign agreement. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4 pb-6 border-b border-slate-200">
          <div className="flex justify-center gap-3 mb-2">
            <Badge variant="outline" className="bg-white text-black border-black font-black flex items-center gap-1">
              <Brain className="w-3 h-3" /> AI Learns From Your Data
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Security Active
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight border-b-4 border-black pb-4 inline-block">SpectroModel Legal Center</h1>
          <p className="text-black font-black text-lg">Effective Date: November 25, 2025</p>
          {lastSigned && (
             <p className="text-sm text-green-600 font-medium mt-2">
               You last signed this agreement on: {lastSigned.toLocaleString()}
             </p>
          )}
        </div>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-8 md:p-12">
            <LegalTermsText />
            <PrivacyPolicyText />
            
            <div className="mt-16 pt-8 border-t-4 border-black bg-slate-50 p-4 md:p-8 rounded-xl">
              <div className="border-t-4 border-black pt-6 mt-8">
                <h3 className="text-xl md:text-2xl font-black text-black uppercase mb-4">6. ANTI-AUDIT & CODE PROTECTION CLAUSE</h3>
              </div>
              <p className="text-black font-bold text-lg mb-6 text-justify leading-relaxed">
                STRICTLY PROHIBITED: USERS, ENTITIES, OR AUTOMATED SYSTEMS ARE STRICTLY PROHIBITED FROM AUDITING, INSPECTING, REVERSE ENGINEERING, DECOMPILING, OR ANALYZING THE SOURCE CODE, ALGORITHMS, DATA STRUCTURES, OR INTELLECTUAL PROPERTY OF THIS APPLICATION. ANY ATTEMPT TO AUDIT THIS APPLICATION FOR VULNERABILITIES, CODE QUALITY, OR LOGIC VERIFICATION WITHOUT EXPRESSED WRITTEN CONSENT FROM THE OWNER IS A VIOLATION OF INTERNATIONAL COPYRIGHT AND TRADE SECRET LAWS. VIOLATORS WILL BE SUBJECT TO IMMEDIATE LEGAL ACTION AND PERMANENT BAN.
              </p>

              <div className="border-t-4 border-black pt-6 mt-8">
                <h3 className="text-xl font-black text-black mb-4">Acknowledgement & Signature</h3>
              </div>
              <div className="flex items-start space-x-3 mb-6">
                <Checkbox 
                  id="terms-resign" 
                  checked={agreed} 
                  onCheckedChange={setAgreed}
                  className="mt-1 data-[state=checked]:bg-purple-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms-resign"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700"
                  >
                    I acknowledge that I have read, understood, and agree to be bound by these Terms of Service and Privacy Policy. 
                    I understand that my action here constitutes a legal signature recorded by the system.
                    <br/><br/>
                    <span className="font-black text-black uppercase">
                      Protect your identity. Do not share personal info with strangers or with anyone. 
                      By reaching this point, you acknowledge that you have reviewed the full extent of the Section 239.2 and Articles 1-5 of the Privacy Policy provided above. <span className="font-black text-black underline decoration-2 underline-offset-2">Master Service Agreement.</span> The User agrees that analytical outputs, including but not limited to Hit Scores, Market Fit assessments, and Rhythm Analysis graphs, do not constitute defamation, libel, or slander against the User or the artist. These outputs are automated, objective data visualizations and are not subjective critical reviews. The User waives any right to pursue civil litigation against the Company, Creator, or Employee(s) based on the perceived reputational damage caused by a low algorithmic score or an unfavorable market analysis.
                    </span>
                  </label>
                </div>
              </div>
              <Button 
                onClick={handleSign} 
                disabled={!agreed || isSigning}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 text-lg shadow-lg"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Recording Signature...
                  </>
                ) : (
                  "Sign & Accept Agreement"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-black font-black text-xs md:text-sm pt-8 uppercase tracking-widest">
          &copy; 2025 SpectroModel ENT. All Rights Reserved. | NO AUDITING ALLOWED | COMPANY OWNS ALL COMPANY'S INTELLECTUAL PROPERTY | TRADEMARKS, PATENTS, COPYRIGHTS ENFORCED
        </div>
      </div>
    </div>
  );
}