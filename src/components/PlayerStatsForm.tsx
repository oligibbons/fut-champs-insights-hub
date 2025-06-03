
import React from 'react';
import { PlayerPerformance } from '@/types/futChampions';
import PlayerPerformanceInput from './PlayerPerformanceInput';

interface PlayerStatsFormProps {
  playerStats: PlayerPerformance[];
  onPlayerStatsChange: (players: PlayerPerformance[]) => void;
}

const PlayerStatsForm = ({ playerStats, onPlayerStatsChange }: PlayerStatsFormProps) => {
  return (
    <PlayerPerformanceInput 
      players={playerStats} 
      onChange={onPlayerStatsChange}
    />
  );
};

export default PlayerStatsForm;
