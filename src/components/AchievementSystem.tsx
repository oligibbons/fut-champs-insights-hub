import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { processAchievements } from '@/utils/achievements';
import { useToast } from '@/hooks/use-toast';

interface AchievementSystemProps {
  // A dependency that changes whenever game data is updated.
  // This could be the number of games, or a timestamp of the last update.
  trigger: any;
}

const AchievementSystem = ({ trigger }: AchievementSystemProps) => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { toast } = useToast();

  useEffect(() => {
    if (user && trigger) {
      const runProcessing = async () => {
        try {
          console.log("AchievementSystem: Trigger received. Processing achievements...");
          const newlyUnlocked = await processAchievements(user.id, gameVersion);
          
          // Notify user of any new achievements
          newlyUnlocked.forEach(title => {
            toast({
              title: "Achievement Unlocked!",
              description: `You've unlocked: ${title}`,
            });
          });

        } catch (error) {
          console.error("Achievement processing failed:", error);
          toast({
            title: "Error",
            description: "Could not process achievements.",
            variant: "destructive",
          });
        }
      };
      runProcessing();
    }
  }, [user, gameVersion, trigger, toast]); // Reruns when the trigger changes

  return null; // This component does not render anything
};

export default AchievementSystem;
