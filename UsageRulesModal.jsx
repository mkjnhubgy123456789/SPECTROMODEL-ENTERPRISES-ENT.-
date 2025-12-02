import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, DollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function UsageRulesModal({ featureName, isPaidFeature = false, userTier = 'free' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  useEffect(() => {
    // Check if user has already seen/accepted rules for this specific feature
    const storageKey = `rules_accepted_${featureName}`;
    const hasAccepted = localStorage.getItem(storageKey);
    
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, [featureName]);

  const handleAccept = () => {
    if (!agreed) return;
    localStorage.setItem(`rules_accepted_${featureName}`, 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Info className="w-6 h-6 text-blue-400" />
            <DialogTitle className="text-xl font-bold">Usage Rules: {featureName}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Please review the usage guidelines and pricing for this feature before proceeding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {isPaidFeature ? (
            <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-amber-400 mb-1">Premium Feature</p>
                <p className="text-amber-200/80">This tool requires a Pro or Premium subscription. Usage is metered based on your plan limits.</p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-950/30 border border-blue-900/50 p-3 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-blue-400 mb-1">Free Access Available</p>
                <p className="text-blue-200/80">You can use this feature with limited monthly uploads. Upgrade for unlimited access.</p>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-sm space-y-3">
            <p className="font-bold text-white">Required Usage Guidelines:</p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Do not use for illegal or copyright-infringing activities.</li>
              <li>Generated content is for personal or authorized commercial use only.</li>
              <li>System logs all usage for security and compliance.</li>
              <li>Abuse of API or automated scraping is strictly prohibited.</li>
            </ul>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="acknowledge" 
              checked={agreed} 
              onCheckedChange={setAgreed}
              className="border-slate-500 data-[state=checked]:bg-blue-600"
            />
            <label
              htmlFor="acknowledge"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300"
            >
              I acknowledge the usage rules and pricing terms.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAccept} 
            disabled={!agreed} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Continue to App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}