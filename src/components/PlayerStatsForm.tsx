
import React from 'react';
import { PlayerPerformance } from '@/types/futChampions';
import PlayerPerformanceInput from './PlayerPerformanceInput';

interface PlayerStatsFormProps {
  playerStats: PlayerPerformance[];
  onPlayerStatsChange: (players: PlayerPerformance[]) => void;
  gameDuration?: number;
}

const PlayerStatsForm = ({ playerStats, onPlayerStatsChange, gameDuration }: PlayerStatsFormProps) => {
  return (
    <PlayerPerformanceInput 
      players={playerStats} 
      onChange={onPlayerStatsChange}
    />
  );
};

export default PlayerStatsForm;
