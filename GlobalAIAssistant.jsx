import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { checkContent, getSafeAIPrompt } from "./ContentFilter";

export default function GlobalAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const toggleHandler = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-ai-assistant', toggleHandler);
    return () => window.removeEventListener('toggle-ai-assistant', toggleHandler);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    
    // Check content against comprehensive filter
    const contentCheck = checkContent(userMessage);
    if (contentCheck.isProhibited) {
      setMessages(prev => [...prev, 
        { role: "user", content: userMessage },
        { role: "assistant", content: contentCheck.message }
      ]);
      setInput("");
      return;
    }

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsProcessing(true);

    try {
      // Get safe prompt with content guidelines
      const safePrompt = getSafeAIPrompt(userMessage);
      
      if (safePrompt.blocked) {
        setMessages(prev => [...prev, { role: "assistant", content: safePrompt.response }]);
        setIsProcessing(false);
        return;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: safePrompt.prompt,
        add_context_from_internet: false
      });

      // Double-check response for prohibited content
      const responseCheck = checkContent(response || '');
      const finalResponse = responseCheck.isProhibited 
        ? "I'm here to help with music, education, and business topics!"
        : (response || "I'm here to help with music analysis, education, and business questions!");

      setMessages(prev => [...prev, { role: "assistant", content: finalResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm here to help! Ask me about music analysis, education, or business topics." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={handleToggle}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl animate-pulse"
        >
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-96 max-w-[calc(100vw-2rem)] shadow-2xl border-purple-500/50 bg-slate-900/95 backdrop-blur-xl">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-purple-500/30">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              AI Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleToggle} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-3 bg-slate-950/50">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="font-semibold text-white">Ask me about SpectroModel!</p>
                  <p className="text-xs mt-2">Music • Education • Business • Finance</p>
                  <div className="flex items-center justify-center gap-1 mt-3 text-xs text-green-400">
                    <Shield className="w-3 h-3" />
                    <span>Safe & Moderated</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30 animate-pulse">
                       🤖 AI LEARNS FROM MY DATA
                    </span>
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm break-words ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-purple-500/30 bg-slate-900/80">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about features..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isProcessing || !input.trim()}
                  className="bg-purple-600 hover:bg-purple-700 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}