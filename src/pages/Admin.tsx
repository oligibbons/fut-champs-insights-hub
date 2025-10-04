import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';

// Helper function to fetch admin statistics
const fetchAdminStats = async () => {
  const { data: users, error: usersError } = await supabase.from('profiles').select('id', { count: 'exact' });
  if (usersError) throw new Error(usersError.message);

  const { data: weeks, error: weeksError } = await supabase.from('weekly_performances').select('id', { count: 'exact' });
  if (weeksError) throw new Error(weeksError.message);

  const { data: games, error: gamesError } = await supabase.from('game_results').select('id', { count: 'exact' });
  if (gamesError) throw new Error(gamesError.message);

  // Add more stats as needed
  return {
    totalUsers: users?.length || 0,
    totalWeeks: weeks?.length || 0,
    totalGames: games?.length || 0,
  };
};

const Admin: React.FC = () => {
  const { currentTheme } = useTheme();
  const { data: stats, isLoading, error } = useQuery('adminStats', fetchAdminStats);

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
      <h1 className="text-4xl font-bold mb-8 gradient-text">Admin Dashboard</h1>

      {/* Overview Section */}
      <section className="admin-section">
        <h2 className="admin-section-title">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Apply the .admin-card class to each Card component */}
          <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p className="admin-stat-value">{stats?.totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Total Weeks Logged</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p className="admin-stat-value">{stats?.totalWeeks}</p>
            </CardContent>
          </Card>
          <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Total Games Recorded</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              <p className="admin-stat-value">{stats?.totalGames}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Add other admin sections here */}
      {/* For example: User Management, Content Management, etc. */}
      <section className="admin-section">
        <h2 className="admin-section-title">User Management</h2>
        <Card className="admin-card">
            <CardHeader className="admin-card-header">
              <CardTitle className="admin-card-title">Recent Users</CardTitle>
            </CardHeader>
            <CardContent className="admin-card-content">
              {/* User list would go here */}
              <p>User management interface coming soon.</p>
            </CardContent>
          </Card>
      </section>

    </div>
  );
};

export default Admin;
