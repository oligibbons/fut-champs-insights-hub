
import { useState, useEffect } from 'react';
import { useDataSync } from '@/hooks/useDataSync';
import Navigation from '@/components/Navigation';
import DashboardCarousel from '@/components/DashboardCarousel';
import DashboardOverview from '@/components/DashboardOverview';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import PositionalHeatMap from '@/components/PositionalHeatMap';
import AnalyticsTooltip from '@/components/AnalyticsTooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, Target, Users, Calendar, BarChart3, Zap, Award, Clock, Star, Activity, PieChart, LineChart } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const { weeklyData, getCurrentWeek, calculatePlayerStats, settings } = useDataSync();

  const currentRun = getCurrentWeek();
  const playerStats = calculatePlayerStats();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-20 lg:hover:ml-64 transition-all duration-500 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-fifa-blue/20 to-fifa-purple/20">
              <BarChart3 className="h-8 w-8 text-fifa-blue" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-fifa-blue via-fifa-purple to-fifa-gold bg-clip-text text-transparent">
                FUTALYST Analytics Hub
              </h1>
              <p className="text-gray-400 mt-1">Welcome back! Here's your performance overview</p>
            </div>
          </div>

          {/* Dashboard Carousel */}
          <AnalyticsTooltip
            title="Performance Overview Carousel"
            description="Rotating dashboard showing key metrics including top performers, match facts, weekly scores, recent form, and progress towards targets. Auto-rotates every 12 seconds."
            showIcon={false}
          >
            <DashboardCarousel
              weeklyData={weeklyData}
              currentWeek={currentRun}
              enabledTiles={Object.keys(settings.dashboardSettings).filter(key => 
                settings.dashboardSettings[key as keyof typeof settings.dashboardSettings]
              )}
            />
          </AnalyticsTooltip>

          {/* Comprehensive Dashboard Overview */}
          <DashboardOverview />

          {/* Positional Heat Map */}
          <PositionalHeatMap />

          {/* Comprehensive Analytics Dashboard */}
          <Card className="glass-card">
            <CardHeader>
              <AnalyticsTooltip
                title="Performance Analytics Dashboard"
                description="Comprehensive analysis including performance charts, AI-generated insights based on your gameplay patterns, and personalized tips to improve your FIFA Champions performance."
                showIcon={false}
              >
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-fifa-blue" />
                  Performance Analytics
                </CardTitle>
              </AnalyticsTooltip>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card static-element">
            <CardHeader>
              <AnalyticsTooltip
                title="Quick Actions"
                description="Fast access to key features: record new games, manage your squad setups, view achievements, and adjust application settings."
                showIcon={false}
              >
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </AnalyticsTooltip>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnalyticsTooltip
                title="Record New Game"
                description="Start recording a new FIFA Champions match. Input scores, opponent details, player performance, and detailed match statistics."
                showIcon={false}
              >
                <Button onClick={() => navigate('/current-week')} className="modern-button-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Record New Game
                </Button>
              </AnalyticsTooltip>
              
              <AnalyticsTooltip
                title="Manage Squads"
                description="Create, edit, and organize your FIFA Ultimate Team squads. Track performance by formation and analyze which setups work best."
                showIcon={false}
              >
                <Button onClick={() => navigate('/squads')} className="modern-button-secondary">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Squads
                </Button>
              </AnalyticsTooltip>
              
              <AnalyticsTooltip
                title="View Achievements"
                description="Track your progress through various milestones and achievements. See what goals you've completed and what challenges await."
                showIcon={false}
              >
                <Button onClick={() => navigate('/achievements')} className="modern-button-secondary">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </AnalyticsTooltip>
              
              <AnalyticsTooltip
                title="Adjust Settings"
                description="Customize your tracking preferences, dashboard layout, notification settings, and analytical display options."
                showIcon={false}
              >
                <Button onClick={() => navigate('/settings')} className="modern-button-secondary">
                  <Target className="h-4 w-4 mr-2" />
                  Adjust Settings
                </Button>
              </AnalyticsTooltip>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
