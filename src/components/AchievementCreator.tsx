import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Award, Save, Code } from 'lucide-react';

const AchievementCreator = () => {
  const { gameVersion } = useGameVersion();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('gameplay');
  const [rarity, setRarity] = useState('common');
  const [conditions, setConditions] = useState('{}');

  const handleSave = async () => {
    let parsedConditions;
    try {
      parsedConditions = JSON.parse(conditions);
    } catch (e) {
      toast({ title: "Invalid JSON", description: "Please check the conditions JSON format.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('achievement_definitions').insert({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      description,
      category,
      rarity,
      conditions: parsedConditions,
      game_version: gameVersion,
    });

    if (error) {
      toast({ title: "Error saving achievement", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Achievement Saved!", description: `${title} has been added.` });
      // Reset form
      setTitle('');
      setDescription('');
      setConditions('{}');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Achievement Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ach-title">Title</Label>
              <Input id="ach-title" placeholder="e.g., Hat-trick Hero" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ach-desc">Description</Label>
              <Textarea id="ach-desc" placeholder="Score 3 goals with one player in a single game." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gameplay">Gameplay</SelectItem>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label>Rarity</Label>
                <Select value={rarity} onValueChange={setRarity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ach-conditions" className="flex items-center gap-2"><Code size={16}/> Conditions (JSON)</Label>
            <Textarea 
              id="ach-conditions" 
              value={conditions} 
              onChange={(e) => setConditions(e.target.value)}
              className="font-mono min-h-[200px]"
              placeholder={`{\n  "metric": "goals",\n  "target": 3,\n  "scope": "player_in_game"\n}`}
            />
            <p className="text-xs text-muted-foreground">Define the logic that triggers this achievement.</p>
          </div>
        </div>
        <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Achievement Definition</Button>
      </CardContent>
    </Card>
  );
};

export default AchievementCreator;
