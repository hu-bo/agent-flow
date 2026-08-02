import { useCasdoorCallback, useRequireAuth } from '@hquant/casdoor/client/react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireAuth();
  if (isLoading) {
    return <div style={{ padding: 24 }}>Signing in...</div>;
  }
  return <>{children}</>;
}

export function AuthCallbackPage() {
  const { isLoading, error, success } = useCasdoorCallback({
    onSuccess: () => {
      window.location.replace('/chat');
    },
  });

  if (isLoading) return <div style={{ padding: 24 }}>Processing sign-in...</div>;
  if (error) return <div style={{ padding: 24 }}>Sign-in failed: {error.message}</div>;
  if (success) return <div style={{ padding: 24 }}>Sign-in successful, redirecting...</div>;
  return <div style={{ padding: 24 }}>Sign-in failed</div>;
}
