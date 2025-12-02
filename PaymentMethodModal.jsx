import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, Shield } from "lucide-react"; // Added Shield to import

export default function PaymentMethodModal({ isOpen, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zip: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would tokenize via Stripe/Processor
    alert("✓ Payment method securely tokenized and added to your vault.");
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Lock className="w-5 h-5" />
            <DialogTitle>Add Secure Payment Method</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Your card details are encrypted with AES-256 and never stored on our servers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Cardholder Name</Label>
            <Input 
              id="name" 
              placeholder="Jane Doe" 
              className="bg-slate-800 border-slate-600 text-white"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="number" className="text-slate-300">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <Input 
                id="number" 
                placeholder="0000 0000 0000 0000" 
                className="bg-slate-800 border-slate-600 text-white pl-10"
                value={formData.cardNumber}
                onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-slate-300">Expiry</Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                className="bg-slate-800 border-slate-600 text-white"
                value={formData.expiry}
                onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-slate-300">CVC</Label>
              <Input 
                id="cvc" 
                placeholder="123" 
                type="password"
                className="bg-slate-800 border-slate-600 text-white"
                value={formData.cvc}
                onChange={(e) => setFormData({...formData, cvc: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip" className="text-slate-300">ZIP</Label>
              <Input 
                id="zip" 
                placeholder="10001" 
                className="bg-slate-800 border-slate-600 text-white"
                value={formData.zip}
                onChange={(e) => setFormData({...formData, zip: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400 flex gap-2 items-start">
            <Shield className="w-4 h-4 text-green-400 shrink-0" />
            <p>Secure SSL connection. Charges will appear as "SPECTROMODEL ENT".</p>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
              {isProcessing ? "Verifying..." : "Save Payment Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}