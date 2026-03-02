import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ArchiveProvider } from "./contexts/ArchiveContext";
import AuthGuard from "./components/AuthGuard";
import Home from "./pages/Home";
import Voices from "./pages/Voices";
import Academic from "./pages/Academic";
import Archive from "./pages/Archive";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/voices" component={Voices} />
      <Route path="/academic" component={Academic} />
      <Route path="/archive" component={Archive} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <AuthGuard>
            <ArchiveProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Router />
                </main>
                <Footer />
              </div>
            </ArchiveProvider>
          </AuthGuard>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
