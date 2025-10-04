import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';

const fetchAdminStats = async () => {
  const { count: totalUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
  const { count: totalWeeks } = await supabase.from('weekly_performances').select('id', { count: 'exact', head: true });
  const { count: totalGames } = await supabase.from('game_results').select('id', { count: 'exact', head: true });
  return { totalUsers, totalWeeks, totalGames };
};

const Admin: React.FC = () => {
  const { currentTheme } = useTheme();
  const { data: stats, isLoading, error } = useQuery({ queryKey: ['adminStats'], queryFn: fetchAdminStats });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: currentTheme.colors.background }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: currentTheme.colors.primary }}/>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">
                <p className="font-bold">Error!</p>
                <p>Could not fetch admin statistics.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-8 gradient-text">Admin Dashboard</h1>

      {/* Platform Overview Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalUsers ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Weeks Logged</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalWeeks ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Games Recorded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalGames ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* User Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">User Management</h2>
        <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p>User management interface coming soon.</p>
            </CardContent>
          </Card>
      </section>
    </div>
  );
};

export default Admin;
