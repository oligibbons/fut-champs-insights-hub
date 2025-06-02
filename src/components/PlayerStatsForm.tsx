
import React from 'react';
import { PlayerPerformance } from '@/types/futChampions';
import PlayerPerformanceInput from './PlayerPerformanceInput';

interface PlayerStatsFormProps {
  playerPerformances: PlayerPerformance[];
  setPlayerPerformances: (players: PlayerPerformance[]) => void;
}

const PlayerStatsForm = ({ playerPerformances, setPlayerPerformances }: PlayerStatsFormProps) => {
  return (
    <PlayerPerformanceInput 
      players={playerPerformances} 
      onChange={setPlayerPerformances}
    />
  );
};

export default PlayerStatsForm;
