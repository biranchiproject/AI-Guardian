import { useState } from "react";
import { analyzeThreat, type AnalysisResult } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RadioTower, AlertOctagon, CheckCircle2, Crosshair, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThreatIntelligence() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [threatHistory, setThreatHistory] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsPending(true);
    try {
      const res = await analyzeThreat(text);
      setResult(res);
      setThreatHistory(prev => [{
        id: Date.now(),
        analyzedText: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        category: res.category,
        riskLevel: res.riskLevel,
        createdAt: new Date().toISOString()
      }, ...prev]);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing the text.",
        variant: "destructive"
      });
    } finally {
      setIsPending(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getRiskColorText = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-red-500 flex items-center gap-3">
          <RadioTower className="w-8 h-8" />
          Threat Intelligence Center
        </h1>
        <p className="text-muted-foreground mt-1">Deep scanning for malicious payloads, C2 communications, and indicators of compromise.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="bg-card border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <CardHeader>
              <CardTitle>Threat Scanner</CardTitle>
              <CardDescription>Input suspicious commands, logs, or messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter payload here..."
                className="min-h-[180px] font-mono text-sm resize-y bg-background border-border/50 focus-visible:ring-red-500/50"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isPending}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isPending || !text.trim()} 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] w-full sm:w-auto"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
                  Scan Payload
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-card border-card-border animate-in slide-in-from-top-4">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg">Scan Results</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Verdict</p>
                      <p className={cn("text-2xl font-bold", getRiskColorText(result.riskLevel))}>{result.category}</p>
                    </div>
                    <Badge variant="outline" className={cn("uppercase tracking-wider px-3 py-1", getRiskColor(result.riskLevel))}>
                      {result.riskLevel} SEVERITY
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-mono">Confidence Match</span>
                      <span className="font-mono">{(result.confidence * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-1.5" indicatorClassName={cn(
                      result.riskLevel.toLowerCase() === 'high' ? 'bg-red-500' :
                      result.riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    )} />
                  </div>

                  <div className={cn("p-4 rounded-lg border font-mono text-sm", getRiskColor(result.riskLevel))}>
                    <div className="flex items-start gap-3">
                      {result.riskLevel.toLowerCase() === 'high' ? <AlertOctagon className="w-5 h-5 shrink-0" /> :
                       <Shield className="w-5 h-5 shrink-0" />}
                      <p>{result.alertMessage}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="bg-card border-card-border h-full">
            <CardHeader>
              <CardTitle>Recent Threat Scans</CardTitle>
              <CardDescription>History of analyzed payloads</CardDescription>
            </CardHeader>
            <CardContent>
              {false ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : threatHistory.length > 0 ? (
                <div className="space-y-3">
                  {threatHistory.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg bg-background/50 border border-border/50 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-mono text-xs text-muted-foreground truncate" title={item.analyzedText}>
                          {item.analyzedText}
                        </span>
                        <Badge variant="outline" className={cn("uppercase text-[10px] tracking-wider shrink-0", getRiskColor(item.riskLevel))}>
                          {item.riskLevel}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={cn("font-semibold", getRiskColorText(item.riskLevel))}>{item.category}</span>
                        <span className="text-muted-foreground">{new Date(item.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm border border-dashed border-border/50 rounded-lg">
                  <Shield className="w-8 h-8 mb-3 opacity-20" />
                  No threat scans recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
