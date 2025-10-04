import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Award, Save, Code, Edit, Trash2, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  conditions: any;
  game_version: string;
}

const AchievementCreator = () => {
  const { gameVersion } = useGameVersion();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('gameplay');
  const [rarity, setRarity] = useState('common');
  const [conditions, setConditions] = useState('{}');
  const [editingAchievement, setEditingAchievement] = useState<AchievementDefinition | null>(null);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievement_definitions')
      .select('*')
      .eq('game_version', gameVersion);
    if (error) console.error("Error fetching achievements", error);
    else setAchievements(data || []);
  };

  useEffect(() => {
    fetchAchievements();
  }, [gameVersion]);

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
      fetchAchievements();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('achievement_definitions').delete().eq('id', id);
    if (error) {
        toast({ title: "Error deleting achievement", description: error.message, variant: 'destructive' });
    } else {
        toast({ title: "Achievement Deleted" });
        fetchAchievements();
    }
  };

  const handleEdit = (achievement: AchievementDefinition) => {
    setEditingAchievement({
      ...achievement,
      conditions: JSON.stringify(achievement.conditions, null, 2),
    });
  };

  const handleUpdate = async () => {
    if (!editingAchievement) return;

    let parsedConditions;
    try {
      parsedConditions = JSON.parse(editingAchievement.conditions);
    } catch (e) {
      toast({ title: "Invalid JSON", description: "Please check the conditions JSON format.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from('achievement_definitions')
      .update({
        title: editingAchievement.title,
        description: editingAchievement.description,
        category: editingAchievement.category,
        rarity: editingAchievement.rarity,
        conditions: parsedConditions,
      })
      .eq('id', editingAchievement.id);

    if (error) {
      toast({ title: "Error updating achievement", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Achievement Updated!", description: `${editingAchievement.title} has been updated.` });
      setEditingAchievement(null);
      fetchAchievements();
    }
  };

  const handleDuplicate = async (achievement: AchievementDefinition) => {
    const { error } = await supabase.from('achievement_definitions').insert({
      ...achievement,
      title: `${achievement.title} (Copy)`,
      id: `${achievement.id}-copy`,
    });

    if (error) {
      toast({ title: "Error duplicating achievement", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "Achievement Duplicated!", description: `${achievement.title} has been duplicated.` });
      fetchAchievements();
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Create Achievement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="ach-conditions" className="flex items-center gap-2"><Code size={16}/> Conditions (JSON)</Label>
                <Textarea
                  id="ach-conditions"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="font-mono min-h-[150px]"
                  placeholder={`{\n  "metric": "goals",\n  "target": 3,\n  "scope": "player_in_game"\n}`}
                />
                <p className="text-xs text-muted-foreground">Define the logic that triggers this achievement.</p>
              </div>
            </div>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save Achievement Definition</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Achievements ({gameVersion})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {achievements.map(ach => (
              <div key={ach.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{ach.title}</h4>
                  <p className="text-sm text-muted-foreground">{ach.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(ach)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {editingAchievement && (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Achievement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-ach-title">Title</Label>
                          <Input id="edit-ach-title" value={editingAchievement.title} onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-ach-desc">Description</Label>
                          <Textarea id="edit-ach-desc" value={editingAchievement.description} onChange={(e) => setEditingAchievement({ ...editingAchievement, description: e.target.value })} />
                        </div>
                        <div className="flex gap-4">
                          <div className="space-y-2 flex-1">
                            <Label>Category</Label>
                            <Select value={editingAchievement.category} onValueChange={(value) => setEditingAchievement({ ...editingAchievement, category: value })}>
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
                            <Select value={editingAchievement.rarity} onValueChange={(value) => setEditingAchievement({ ...editingAchievement, rarity: value })}>
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
                        <div className="space-y-2">
                          <Label htmlFor="edit-ach-conditions" className="flex items-center gap-2"><Code size={16}/> Conditions (JSON)</Label>
                          <Textarea
                            id="edit-ach-conditions"
                            value={editingAchievement.conditions}
                            onChange={(e) => setEditingAchievement({ ...editingAchievement, conditions: e.target.value })}
                            className="font-mono min-h-[150px]"
                          />
                        </div>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                      </div>
                    </DialogContent>
                    )}
                  </Dialog>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(ach)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(ach.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AchievementCreator;
