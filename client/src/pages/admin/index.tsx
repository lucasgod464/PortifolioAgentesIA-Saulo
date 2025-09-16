import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function AdminIndexPage() {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (user?.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/login');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}