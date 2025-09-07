import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Quiz from "@/pages/quiz";
import Admin from "@/pages/admin";
import Stats from "@/pages/stats";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Quiz} />
      <Route path="/stats" component={Stats} />
      <Route path="/admin">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Laden...</div>
          </div>
        ) : (
          <Admin />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
