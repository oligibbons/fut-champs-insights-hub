import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Squad, PlayerCard, SquadPosition, FORMATIONS } from '@/types/squads';
import { useSquadData } from '@/hooks/useSquadData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserSettings } from '@/types/futChampions';
import PlayerSearchModal from './PlayerSearchModal';
import { Plus, Users, Save, Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SquadBuilderProps {
  squad?: Squad;
  onSave: (squad: Squad) => void;
  onCancel: () => void;
}

const SquadBuilder = ({ squad, onSave, onCancel }: SquadBuilderProps) => {
  const { toast } = useToast();
  const { squads, getDefaultSquad } = useSquadData();
  const [settings] = useLocalStorage<UserSettings>('futChampions_settings', {
    preferredFormation: '4-3-3',
    trackingStartDate: new Date().toISOString().split('T')[0],
    gameplayStyle: 'balanced',
    notifications: true,
    gamesPerWeek: 15,
    theme: 'futvisionary',
    carouselSpeed: 12,
    dashboardSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
      showAchievements: true,
      showTargetProgress: true,
      showTimeAnalysis: true,
      showStressAnalysis: true,
    },
    currentWeekSettings: {
      showTopPerformers: true,
      showXGAnalysis: true,
      showAIInsights: true,
      showFormAnalysis: true,
      showWeaknesses: true,
      showOpponentAnalysis: true,
      showPositionalAnalysis: true,
      showRecentTrends: true,
      showAchievements: true,
      showTargetProgress: true,
      showTimeAnalysis: true,
      showStressAnalysis: true,
    },
    qualifierSettings: {
      totalGames: 5,
      winsRequired: 2,
    },
    targetSettings: {
      autoSetTargets: false,
      adaptiveTargets: true,
      notifyOnTarget: true,
    },
    analyticsPreferences: {
      detailedPlayerStats: true,
      opponentTracking: true,
      timeTracking: true,
      stressTracking: true,
      showAnimations: true,
      dynamicFeedback: true,
    }
  });
  
  const [squadData, setSquadData] = useState<Squad>(() => {
    if (squad) return squad;
    
    // Use preferred formation from settings
    const preferredFormation = FORMATIONS.find(f => f.name === settings.preferredFormation) || FORMATIONS[0];
    return {
      id: `squad-${Date.now()}`,
      name: 'New Squad',
      formation: preferredFormation.name,
      startingXI: preferredFormation.positions.map((pos, index) => ({
        id: `starting-${index}`,
        position: pos.position,
        player: undefined,
        x: pos.x,
        y: pos.y
      })),
      substitutes: Array.from({ length: 7 }, (_, index) => ({
        id: `sub-${index}`,
        position: 'SUB',
        player: undefined,
        x: 0,
        y: 0
      })),
      reserves: Array.from({ length: 5 }, (_, index) => ({
        id: `res-${index}`,
        position: 'RES',
        player: undefined,
        x: 0,
        y: 0
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      isDefault: false,
      totalRating: 0,
      chemistry: 0
    };
  });

  const [selectedPosition, setSelectedPosition] = useState<SquadPosition | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Auto-select default squad for game recording
  useEffect(() => {
    const defaultSquad = getDefaultSquad();
    if (defaultSquad && !squad) {
      setSquadData(defaultSquad);
    }
  }, [getDefaultSquad, squad]);

  const handleFormationChange = (formation: string) => {
    const formationData = FORMATIONS.find(f => f.name === formation);
    if (!formationData) return;

    // Keep existing players when changing formation
    const existingPlayers = squadData.startingXI.map(pos => pos.player);

    setSquadData(prev => ({
      ...prev,
      formation,
      startingXI: formationData.positions.map((pos, index) => {
        // Try to keep existing players in similar positions if possible
        const existingPlayer = index < existingPlayers.length ? existingPlayers[index] : undefined;
        return {
          id: `starting-${index}`,
          position: pos.position,
          player: existingPlayer,
          x: pos.x,
          y: pos.y
        };
      }),
      lastModified: new Date().toISOString()
    }));
  };

  const handlePlayerSelect = (player: PlayerCard) => {
    if (!selectedPosition) return;

    const updatedPlayer = {
      ...player,
      lastUsed: new Date().toISOString()
    };

    if (selectedPosition.id.startsWith('starting')) {
      setSquadData(prev => ({
        ...prev,
        startingXI: prev.startingXI.map(pos => 
          pos.id === selectedPosition.id ? { ...pos, player: updatedPlayer } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (selectedPosition.id.startsWith('sub')) {
      setSquadData(prev => ({
        ...prev,
        substitutes: prev.substitutes.map(pos => 
          pos.id === selectedPosition.id ? { ...pos, player: updatedPlayer } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (selectedPosition.id.startsWith('res')) {
      setSquadData(prev => ({
        ...prev,
        reserves: prev.reserves.map(pos => 
          pos.id === selectedPosition.id ? { ...pos, player: updatedPlayer } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    }

    setSelectedPosition(null);
    setShowPlayerModal(false);
  };

  const handleRemovePlayer = (positionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (positionId.startsWith('starting')) {
      setSquadData(prev => ({
        ...prev,
        startingXI: prev.startingXI.map(pos => 
          pos.id === positionId ? { ...pos, player: undefined } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (positionId.startsWith('sub')) {
      setSquadData(prev => ({
        ...prev,
        substitutes: prev.substitutes.map(pos => 
          pos.id === positionId ? { ...pos, player: undefined } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    } else if (positionId.startsWith('res')) {
      setSquadData(prev => ({
        ...prev,
        reserves: prev.reserves.map(pos => 
          pos.id === positionId ? { ...pos, player: undefined } : pos
        ),
        lastModified: new Date().toISOString()
      }));
    }
  };

  const handlePositionClick = (position: SquadPosition) => {
    setSelectedPosition(position);
    setShowPlayerModal(true);
  };

  const handleSave = () => {
    if (!squadData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a squad name",
        variant: "destructive"
      });
      return;
    }

    onSave(squadData);
    toast({
      title: "Success",
      description: `Squad "${squadData.name}" saved successfully`,
    });
  };

  const getCardTypeColor = (cardType: PlayerCard['cardType']) => {
    switch (cardType) {
      case 'bronze': return 'bg-amber-700 text-white';
      case 'silver': return 'bg-gray-400 text-black';
      case 'gold': return 'bg-yellow-500 text-black';
      case 'inform': return 'bg-gray-800 text-white';
      case 'totw': return 'bg-blue-600 text-white';
      case 'toty': return 'bg-blue-900 text-white';
      case 'tots': return 'bg-green-600 text-white';
      case 'icon': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black';
      case 'hero': return 'bg-purple-600 text-white';
      default: return 'bg-purple-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Squad Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Squad Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Squad Name</label>
              <Input
                value={squadData.name}
                onChange={(e) => setSquadData(prev => ({ ...prev, name: e.target.value }))}
                className="modern-input"
                placeholder="Enter squad name"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Formation</label>
              <Select value={squadData.formation} onValueChange={handleFormationChange}>
                <SelectTrigger className="modern-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-gray-900 border-gray-700">
                  {FORMATIONS.map((formation) => (
                    <SelectItem key={formation.name} value={formation.name} className="text-white hover:bg-gray-800">
                      {formation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Formation Pitch */}
          <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-lg p-6 relative h-96 border-2 border-white/20 overflow-x-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-green-700/10 rounded-lg"></div>
            
            {/* Pitch markings */}
            <div className="absolute inset-x-0 top-0 h-px bg-white/30"></div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/30"></div>
            <div className="absolute inset-y-0 left-0 w-px bg-white/30"></div>
            <div className="absolute inset-y-0 right-0 w-px bg-white/30"></div>
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/30 transform -translate-y-1/2"></div>
            
            {/* Players */}
            <div className="relative w-full h-full min-w-[500px]">
              {squadData.startingXI.map((position) => (
                <div
                  key={position.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  onClick={() => handlePositionClick(position)}
                >
                  {position.player ? (
                    <div className="relative">
                      <div className={`w-16 h-20 rounded-lg border-2 border-white/50 flex flex-col items-center justify-center text-xs font-bold transition-all duration-200 group-hover:scale-110 ${getCardTypeColor(position.player.cardType)}`}>
                        <div className="text-xs font-bold">{position.player.rating}</div>
                        <div className="text-xs">{position.position}</div>
                        <div className="text-xs truncate w-full text-center px-1">{position.player.name.split(' ').pop()}</div>
                      </div>
                      <button
                        onClick={(e) => handleRemovePlayer(position.id, e)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-20 border-2 border-dashed border-white/50 rounded-lg flex flex-col items-center justify-center text-white text-xs bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 group-hover:scale-110">
                      <Plus className="h-4 w-4 mb-1" />
                      <span>{position.position}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Substitutes and Reserves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Substitutes */}
            <div>
              <h3 className="text-white font-medium mb-3">Substitutes</h3>
              <div className="grid grid-cols-1 gap-2">
                {squadData.substitutes.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer transition-colors group"
                    onClick={() => handlePositionClick(position)}
                  >
                    {position.player ? (
                      <>
                        <Badge className={`${getCardTypeColor(position.player.cardType)} text-xs`}>
                          {position.player.rating}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-white font-medium">{position.player.name}</p>
                          <p className="text-gray-400 text-sm">{position.player.position} • {position.player.club}</p>
                        </div>
                        <button
                          onClick={(e) => handleRemovePlayer(position.id, e)}
                          className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-400 w-full">
                        <Plus className="h-4 w-4" />
                        <span>Add Substitute</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reserves */}
            <div>
              <h3 className="text-white font-medium mb-3">Reserves</h3>
              <div className="grid grid-cols-1 gap-2">
                {squadData.reserves.map((position) => (
                  <div
                    key={position.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer transition-colors group"
                    onClick={() => handlePositionClick(position)}
                  >
                    {position.player ? (
                      <>
                        <Badge className={`${getCardTypeColor(position.player.cardType)} text-xs`}>
                          {position.player.rating}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-white font-medium">{position.player.name}</p>
                          <p className="text-gray-400 text-sm">{position.player.position} • {position.player.club}</p>
                        </div>
                        <button
                          onClick={(e) => handleRemovePlayer(position.id, e)}
                          className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3 text-gray-400 w-full">
                        <Plus className="h-4 w-4" />
                        <span>Add Reserve</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button onClick={onCancel} variant="outline" className="flex-1 modern-button-secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 modern-button-primary">
              <Save className="h-4 w-4 mr-2" />
              Save Squad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Player Search Modal */}
      <PlayerSearchModal
        isOpen={showPlayerModal}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPosition(null);
        }}
        onPlayerSelect={handlePlayerSelect}
        position={selectedPosition?.position}
      />
    </div>
  );
};

export default SquadBuilder;