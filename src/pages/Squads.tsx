
import Navigation from '@/components/Navigation';
import { Card } from '@/components/ui/card';

const Squads = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold gradient-text mb-6">Squad Management</h1>
          <Card className="glass-card p-6">
            <p className="text-gray-400">Squad builder and management coming soon...</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Squads;
