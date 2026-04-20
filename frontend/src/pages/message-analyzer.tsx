import { useState } from "react";
import { 
  analyzeToxicity, 
  analyzeScam, 
  analyzeThreat,
  type AnalysisResult 
} from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Trash2, CheckCircle2, AlertTriangle, ShieldAlert, RadioTower, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessageAnalyzer() {
  const [text, setText] = useState("");
  const { toast } = useToast();

  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState<{
    toxicity?: AnalysisResult;
    scam?: AnalysisResult;
    threat?: AnalysisResult;
  } | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({ title: "Input required", description: "Please enter text to analyze", variant: "destructive" });
      return;
    }

    setResults(null);
    setIsPending(true);

    try {
      const [toxRes, scamRes, threatRes] = await Promise.all([
        analyzeToxicity(text),
        analyzeScam(text),
        analyzeThreat(text)
      ]);

      setResults({
        toxicity: toxRes,
        scam: scamRes,
        threat: threatRes
      });

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

  const handleCopy = () => {
    if (results) {
      navigator.clipboard.writeText(JSON.stringify(results, null, 2));
      toast({ title: "Copied to clipboard", description: "Raw JSON results copied." });
    }
  };

  const handleClear = () => {
    setText("");
    setResults(null);
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

  const ResultCard = ({ title, icon: Icon, result }: { title: string, icon: any, result?: AnalysisResult }) => (
    <Card className="bg-card border-card-border relative overflow-hidden">
      {!result && !isPending && <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10" />}
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          {result && (
            <Badge variant="outline" className={cn("uppercase text-[10px] tracking-wider", getRiskColor(result.riskLevel))}>
              {result.riskLevel} RISK
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 relative">
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium animate-pulse">Running Neural Scan...</p>
          </div>
        ) : result ? (
          <>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Classification</p>
              <p className={cn("text-xl font-bold", getRiskColorText(result.riskLevel))}>{result.category}</p>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground uppercase tracking-wider">Confidence Score</span>
                <span className="font-mono">{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <Progress value={result.confidence * 100} className="h-2" indicatorClassName={cn(
                result.riskLevel.toLowerCase() === 'high' ? 'bg-red-500' :
                result.riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500' :
                'bg-emerald-500'
              )} />
            </div>

            <div className="pt-2">
              <div className={cn("p-3 rounded-md border flex items-start gap-3", getRiskColor(result.riskLevel))}>
                {result.riskLevel.toLowerCase() === 'high' ? <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" /> :
                 result.riskLevel.toLowerCase() === 'medium' ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> :
                 <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium">{result.alertMessage}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground/50 text-sm">
            Awaiting input
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Omni-Channel Analyzer</h1>
        <p className="text-muted-foreground mt-1">Run text through all active security models simultaneously.</p>
      </div>

      <Card className="bg-card border-card-border shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">Target Content</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClear} disabled={!text && !results} className="h-8">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                {results && (
                  <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 border-primary/30 text-primary hover:bg-primary/10">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy JSON
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              placeholder="Paste content here to scan for toxicity, scam patterns, and cyber threats..."
              className="min-h-[150px] font-mono text-sm resize-y bg-background border-border/50 focus-visible:ring-primary/50"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPending}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleAnalyze} 
                disabled={isPending || !text.trim()} 
                className="glow-button w-full sm:w-auto h-12 px-8"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Run Omni-Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <ResultCard title="Toxicity Filter" icon={AlertTriangle} result={results?.toxicity} />
        <ResultCard title="Scam Detection" icon={ShieldAlert} result={results?.scam} />
        <ResultCard title="Threat Intel" icon={RadioTower} result={results?.threat} />
      </div>
    </div>
  );
}
