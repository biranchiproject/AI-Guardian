import { useState } from "react";
import { analyzeScam, type AnalysisResult } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, ShieldAlert, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "URGENT: Your account has been suspended. Click here to verify your identity immediately.",
  "Congratulations! You've been selected to receive a $1000 gift card. Claim it now.",
  "Hi, I noticed your profile and I think we have a lot in common. Can we chat on WhatsApp?",
  "Please see the attached invoice for your recent purchase of $499.99."
];

export default function ScamDetection() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsPending(true);
    try {
      const res = await analyzeScam(text);
      setResult(res);
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-amber-500 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8" />
          Scam Detection Module
        </h1>
        <p className="text-muted-foreground mt-1">Dedicated analyzer for phishing, social engineering, and financial scams.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="bg-card border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <CardHeader>
              <CardTitle>Input Payload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste suspicious message, email, or text here..."
                className="min-h-[200px] font-mono text-sm resize-y bg-background border-border/50 focus-visible:ring-amber-500/50"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isPending}
              />
              <div className="flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setText("")} 
                  disabled={!text || isPending}
                >
                  Clear Input
                </Button>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isPending || !text.trim()} 
                  className="bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.6)]"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Analyze for Scams
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Known Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-amber-500/10 hover:text-amber-500 transition-colors font-normal py-1.5"
                    onClick={() => setText(example)}
                  >
                    "{example.substring(0, 40)}..."
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-card border-card-border h-full">
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-amber-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-sm font-medium animate-pulse">Analyzing patterns...</p>
                </div>
              ) : result ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Classification</p>
                      <p className={cn("text-2xl font-bold", getRiskColorText(result.riskLevel))}>{result.category}</p>
                    </div>
                    <Badge variant="outline" className={cn("uppercase tracking-wider", getRiskColor(result.riskLevel))}>
                      {result.riskLevel} RISK
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-mono">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} className="h-2.5" indicatorClassName={cn(
                      result.riskLevel.toLowerCase() === 'high' ? 'bg-red-500' :
                      result.riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    )} />
                  </div>

                  <div className={cn("p-4 rounded-lg border", getRiskColor(result.riskLevel))}>
                    <div className="flex items-start gap-3">
                      {result.riskLevel.toLowerCase() === 'high' ? <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" /> :
                      result.riskLevel.toLowerCase() === 'medium' ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> :
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                      <p className="text-sm leading-relaxed">{result.alertMessage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground/50 text-sm">
                  <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                  Waiting for payload
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
