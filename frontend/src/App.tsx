import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import MessageAnalyzer from "@/pages/message-analyzer";
import ScamDetection from "@/pages/scam-detection";
import ThreatIntelligence from "@/pages/threat-intelligence";
import NotFound from "@/pages/not-found";
import LinkChecker from "@/pages/link-checker";
import { FloatingChatbot } from "@/components/FloatingChatbot";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/message-analyzer" component={MessageAnalyzer} />
        <Route path="/scam-detection" component={ScamDetection} />
        <Route path="/threat-intelligence" component={ThreatIntelligence} />
        <Route path="/link-checker" component={LinkChecker} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <FloatingChatbot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
