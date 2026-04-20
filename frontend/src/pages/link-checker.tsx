import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ShieldCheck, ShieldAlert, Globe, ExternalLink, Loader2, Info, Bot } from "lucide-react";
import { analyzeUrl } from "@/lib/api-service";

export default function LinkChecker() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showAiDetails, setShowAiDetails] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setResult(null);
    setShowAiDetails(false);
    setIsAnalyzing(true);
    try {
      const data = await analyzeUrl(url);
      setResult(data);
    } catch (error) {
      console.error("URL Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActionDirective = (risk: string) => {
    switch (risk) {
      case 'High': return "DO NOT visit this site. Avoid entering any personal or financial information.";
      case 'Medium': return "Exercise CAUTION. Verified credentials before proceeding.";
      default: return "Safe to visit. This domain is recognized as a trusted official source.";
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 sm:p-8 pt-24 text-slate-200">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
           <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20"
          >
            <Globe className="h-8 w-8 text-red-500" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Link <span className="text-red-500">Scanner</span>
            </h1>
            <p className="text-slate-400 text-sm">
              Rapid reputation and threat verification engine.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-1.5 shadow-2xl">
          <form onSubmit={handleCheck} className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <Link2 className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste URL to scan..."
                className="w-full bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !url}
              className="group relative overflow-hidden rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-red-500 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <span>Verify</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Results section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className={`overflow-hidden rounded-3xl border ${
                result.risk_level === 'Low' ? "border-green-500/30 bg-green-500/5 shadow-green-500/5" : 
                result.risk_level === 'Medium' ? "border-yellow-500/30 bg-yellow-500/5 shadow-yellow-500/5" :
                "border-red-500/30 bg-red-500/5 shadow-red-500/5"
              } p-6 shadow-2xl transition-all`}
              >
                <div className="flex flex-col items-center gap-6 text-center">
                  {/* 1. RISK STATUS HERO */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Security Assessment</div>
                    <div className={`text-6xl font-black tracking-tighter ${
                      result.risk_level === 'Low' ? "text-green-500" : 
                      result.risk_level === 'Medium' ? "text-yellow-500" : "text-red-500"
                    }`}>
                      {result.risk_level.toUpperCase()}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-white/5" />

                  <div className="space-y-6 w-full">
                    {/* 2. SHORT REASON */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Analysis Reason</div>
                      <p className="text-lg font-medium text-white leading-tight">
                        {result.reason}
                      </p>
                    </div>

                    {/* 3. USER ACTION */}
                    <div className={`rounded-xl p-4 border ${
                      result.risk_level === 'Low' ? "border-green-500/20 bg-green-500/10" : 
                      result.risk_level === 'Medium' ? "border-yellow-500/20 bg-yellow-500/10" :
                      "border-red-500/20 bg-red-500/10"
                    }`}>
                      <div className="flex items-center justify-center gap-2 mb-1">
                         <Info className={`h-4 w-4 ${
                            result.risk_level === 'Low' ? "text-green-500" : 
                            result.risk_level === 'Medium' ? "text-yellow-500" : "text-red-500"
                          }`} />
                         <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-300">Recommended Action</span>
                      </div>
                      <p className="text-white font-semibold">
                        {getActionDirective(result.risk_level)}
                      </p>
                    </div>

                    {/* 4. AI EXPLANATION - COLLAPSIBLE */}
                    {result.ai_explanation && (
                      <div className="space-y-3">
                         <button 
                          onClick={() => setShowAiDetails(!showAiDetails)}
                          className="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1 mx-auto"
                         >
                           {showAiDetails ? "Hide Expert Details" : "View Expert Analysis"}
                           <div className={`transition-transform ${showAiDetails ? "rotate-180" : ""}`}>↓</div>
                         </button>
                         
                         <AnimatePresence>
                           {showAiDetails && (
                             <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                             >
                               <div className="rounded-2xl bg-white/5 p-5 border border-white/5 text-left relative overflow-hidden">
                                  <div className="absolute -right-2 -bottom-2 opacity-5">
                                    <Bot className="h-20 w-20" />
                                  </div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Bot className="h-4 w-4 text-red-500" />
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">AI Intelligence Insight</span>
                                  </div>
                                  <p className="text-slate-300 text-sm italic leading-relaxed">
                                    "{result.ai_explanation}"
                                  </p>
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                 <p className="text-[10px] font-mono text-slate-600 truncate opacity-50 px-10">Scan ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • URL: {result.url}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer tips */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex gap-3 items-start">
              <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">Verified Checks</div>
                <p className="text-[10px] text-slate-400 leading-tight">We check domain reputation, structural anomalies, and suspicious keywords.</p>
              </div>
           </div>
           <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex gap-3 items-start">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">Reporting Issues</div>
                <p className="text-[10px] text-slate-400 leading-tight">If you find a scam we missed, please report it to our threat database.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

