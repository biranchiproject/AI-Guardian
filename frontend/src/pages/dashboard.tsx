import { useState, useEffect } from "react";
import { getStats, getHistory } from "@/lib/api-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ShieldCheck, AlertTriangle, Bug, RadioTower, MessageSquareWarning } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const COLORS = ['#00F5FF', '#7C3AED', '#EF4444', '#F59E0B', '#10B981'];

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const s = await getStats();
        setStats(s);
        setStatsLoading(false);
      } catch (e) {
        console.error("Failed to fetch stats", e);
        setStatsLoading(false);
      }

      try {
        const h = await getHistory();
        setHistory(h);
        setHistoryLoading(false);
      } catch (e) {
        console.error("Failed to fetch history", e);
        setHistoryLoading(false);
      }
    }
    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
        <p className="text-muted-foreground mt-1">System overview and threat intelligence summary.</p>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card border-card-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-card-border overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Scans</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalAnalyzed.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-card-border overflow-hidden relative">
            <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Safe Content</CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.safeCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-card-border overflow-hidden relative">
            <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scam Detects</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.scamCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-card-border overflow-hidden relative">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Threats Found</CardTitle>
              <RadioTower className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.threatCount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card border-card-border">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Volume of requests over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : stats?.recentActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recentActivity} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => val.split('T')[1]?.substring(0,5) || val}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', color: '#E5E7EB' }}
                    itemStyle={{ color: '#00F5FF' }}
                    labelStyle={{ color: '#94A3B8', marginBottom: 4 }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No activity data</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card border-card-border">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown of all scanned content</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {statsLoading ? (
              <Skeleton className="w-full h-full" />
            ) : stats?.categoryBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.categoryBreakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="category"
                    stroke="none"
                  >
                    {stats.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '8px' }}
                    itemStyle={{ color: '#E5E7EB' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No distribution data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-card-border">
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Latest items analyzed across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 5).map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-full", 
                      item.analyzerType === 'threat' ? 'bg-red-500/10 text-red-500' :
                      item.analyzerType === 'scam' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-purple-500/10 text-purple-500'
                    )}>
                      {item.analyzerType === 'threat' ? <RadioTower className="w-5 h-5" /> :
                       item.analyzerType === 'scam' ? <AlertTriangle className="w-5 h-5" /> :
                       <MessageSquareWarning className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1 max-w-[300px] md:max-w-md" title={item.analyzedText}>
                        "{item.analyzedText}"
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.analyzerType}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={cn("uppercase text-[10px] tracking-wider", getRiskColor(item.riskLevel))}>
                      {item.riskLevel} RISK
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent scans available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
