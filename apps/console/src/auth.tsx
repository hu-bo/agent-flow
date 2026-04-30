import { useCasdoor, useCasdoorCallback, useRequireAuth } from '@hquant/casdoor/client/react';

export function ConsoleAuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireAuth();
  if (isLoading) {
    return <div style={{ padding: 24 }}>Signing in...</div>;
  }
  return <>{children}</>;
}

export function ConsoleAuthCallbackPage() {
  const { isLoading, success, error } = useCasdoorCallback({
    onSuccess: () => {
      window.location.replace('/');
    },
  });

  if (isLoading) return <div style={{ padding: 24 }}>Processing sign-in...</div>;
  if (error) return <div style={{ padding: 24 }}>Sign-in failed: {error.message}</div>;
  if (success) return <div style={{ padding: 24 }}>Sign-in successful, redirecting...</div>;
  return <div style={{ padding: 24 }}>Sign-in failed</div>;
}

export function ConsoleAuthToolbar() {
  const { user, logout } = useCasdoor();

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '8px 16px' }}>
      <span>{user?.displayName || user?.name}</span>
      <button className="btn" onClick={logout}>Logout</button>
    </div>
  );
}
