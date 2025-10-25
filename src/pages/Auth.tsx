import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import logo from '/fut-trackr-logo.jpg'; // <-- ADD THIS IMPORT

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          toast({
            title: "Error",
            description: "Username is required",
            variant: "destructive"
          });
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        
        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in."
        });
        setIsSignUp(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "Successfully signed in."
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" 
         style={{ background: currentTheme.colors.background }}>
      <Card className="w-full max-w-md rounded-3xl shadow-depth-lg border-0"
            style={{ backgroundColor: currentTheme.colors.cardBg, borderColor: currentTheme.colors.border }}>
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
               style={{ backgroundColor: currentTheme.colors.primary + '20' }}>
            <img 
              src={logo} 
              alt="FUTTrackr Logo" 
              className="w-10 h-10 object-contain"
            /> {/* <-- CHANGE THIS SRC */}
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <p style={{ color: currentTheme.colors.muted }}>
            {isSignUp ? 'Join the Champions community' : 'Sign in to continue your journey'}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm\" style={{ color: currentTheme.colors.text }}>
                  <User className="h-4 w-4" />
                  Username
                </div>
                <Input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isSignUp}
                  className="rounded-2xl border-0"
                  style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: currentTheme.colors.text }}>
                <Mail className="h-4 w-4" />
                Email
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl border-0"
                style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: currentTheme.colors.text }}>
                <Lock className="h-4 w-4" />
                Password
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-2xl border-0"
                style={{ backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }}
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg py-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: currentTheme.colors.primary, color: '#ffffff' }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isSignUp ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm hover:underline transition-colors"
              style={{ color: currentTheme.colors.primary }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
