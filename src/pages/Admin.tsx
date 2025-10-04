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
    return <div className="text-red-500">Error fetching admin statistics.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* This will now have the theme's gradient color */}
      <h1 className="text-4xl font-bold mb-8 gradient-text">Admin Dashboard</h1>

      <section className="admin-section">
        <h2 className="admin-section-title">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* These cards will now receive the custom border and background styles */}
          <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p className="admin-stat-value">{stats?.totalUsers ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Total Weeks Logged</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p className="admin-stat-value">{stats?.totalWeeks ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Total Games Recorded</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p className="admin-stat-value">{stats?.totalGames ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">User Management</h2>
        <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Recent Users</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p>User management interface coming soon.</p>
            </CardContent>
          </Card>
      </section>
    </div>
  );
};

export default Admin;
