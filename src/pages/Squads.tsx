
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';

const Squads = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-3">Squad Management</h1>
            <p className="text-gray-400 text-lg">Build and manage your ultimate teams</p>
          </div>
          
          <Card className="section-card animate-fade-in">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-fifa-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-fifa-purple/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Squad Builder Coming Soon</h3>
              <p className="text-gray-400 text-lg max-w-md mx-auto">Advanced squad builder and management tools are in development. Track formations, player chemistry, and optimize your team composition.</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Squads;
