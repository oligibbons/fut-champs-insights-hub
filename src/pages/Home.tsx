// src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BarChart, CheckCircle, Gamepad2, ShieldCheck, Users, Trophy, BrainCircuit } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import logo from '/fut-trackr-logo.jpg';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { Skeleton } from '@/components/ui/skeleton';

// This component will render the HTML content from the database
const DynamicContent = ({ content }: { content: string }) => {
  return (
    <div
      className="prose prose-invert max-w-none text-gray-300"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// A simple feature card
const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => {
  const { currentTheme } = useTheme();
  return (
    <Card className="glass-card shadow-lg border-white/10 rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${currentTheme.colors.primary}30` }}
        >
          <Icon className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300">{children}</p>
      </CardContent>
    </Card>
  );
};

const Home = () => {
  const { currentTheme } = useTheme();
  const [homeContent, setHomeContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('page_name', 'home')
        .single();

      if (error || !data) {
        console.error('Error fetching home page content or no content set.', error);
        // Set default content if none is found in the DB
        setHomeContent(
          '<h2>Welcome to FUT Trackr</h2>' +
          '<p>This content can be edited from the Admin panel. Go to Admin -> Home Page Content to set this up!</p>'
        );
      } else {
        setHomeContent(data.content);
      }
      setLoading(false);
    };

    fetchContent();
  }, []);

  return (
    <>
      <AnimatedBackground />
      <div className="relative min-h-screen w-full overflow-x-hidden text-white" style={{ background: currentTheme.colors.background }}>
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-4 sm:px-8 z-50">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FUT Trackr Logo" className="h-10 w-10 rounded-lg object-cover shadow-md" />
            <span className="text-xl font-bold text-white tracking-tight">FUT Trackr</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText }}>
              <Link to="/auth">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 pt-32 pb-16 px-4 sm:px-8">
          <section className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-white">
              Stop Guessing.
              <br />
              <span style={{ color: currentTheme.colors.primary }}>Start Winning.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Track every FUT Champions game, analyze your performance with AI-powered insights, and climb the ranks faster than ever before.
            </p>
            <Button 
              size="lg" 
              asChild 
              className="text-lg py-7 px-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: currentTheme.colors.primary, color: currentTheme.colors.primaryText }}
            >
              <Link to="/auth">
                Start Tracking for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </section>

          {/* Features Section */}
          <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24">
            <FeatureCard icon={Gamepad2} title="Log Every Match">
              Quickly record scores, stats, players, and even xG for every game. See your weekend performance in real-time.
            </FeatureCard>
            <FeatureCard icon={BarChart} title="Deep Dive Analytics">
              Visualize your progress. Discover your best-performing players, most effective formations, and common weaknesses.
            </FeatureCard>
            <FeatureCard icon={BrainCircuit} title="AI-Powered Insights">
              Our custom AI analyzes your data to give you actionable advice on what to change to secure more wins.
            </FeatureCard>
            <FeatureCard icon={Users} title="Challenge Your Friends">
              Create private leagues, compete against friends, and earn bragging rights in Challenge Mode.
            </FeatureCard>
            <FeatureCard icon={Trophy} title="Earn Achievements">
              Unlock unique achievements for your in-game milestones and build your FUT Trackr legacy.
            {/* --- THIS IS THE FIX (comment syntax) --- */}
            </FeatureCard>
            <FeatureCard icon={ShieldCheck} title="Your Data, Secured">
              All your stats are securely stored and backed up. Access your history from any device, anytime.
            </FaceCard>
          </section>

          {/* Admin-Editable Content Section */}
          <section className="max-w-4xl mx-auto mt-24">
            <Card className="glass-card shadow-lg border-white/10 rounded-2xl">
              <CardContent className="p-8 sm:p-12">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <DynamicContent content={homeContent} />
                )}
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center p-8 text-gray-400 border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} FUT Trackr. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
};

export default Home;