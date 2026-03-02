/**
 * AuthGuard - Protects routes by requiring authentication.
 * Shows Login page if user is not authenticated.
 * Shows loading skeleton while checking auth state.
 */
import { useAuth } from '@/_core/hooks/useAuth';
import Login from '@/pages/Login';
import { Sparkles } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-orange flex items-center justify-center animate-pulse">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            加载中...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}
