import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { Paintbrush, Plus, Trash2 } from 'lucide-react';

interface CardType {
  id: string;
  name: string;
  color: string;
  text_color: string;
}

const CardTypeCreator = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  const { toast } = useToast();
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [newCardType, setNewCardType] = useState({ name: '', color: '#ffffff', text_color: '#000000' });

  const fetchCardTypes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('card_types')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_version', gameVersion);
    if (error) console.error("Error fetching card types", error);
    else setCardTypes(data || []);
  };

  useEffect(() => {
    fetchCardTypes();
  }, [user, gameVersion]);

  const handleSave = async () => {
    if (!user || !newCardType.name) {
      toast({ title: "Name is required.", variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('card_types').insert({
      ...newCardType,
      id: newCardType.name.toLowerCase().replace(/\s+/g, '-'),
      user_id: user.id,
      game_version: gameVersion,
    });

    if (error) {
      toast({ title: "Error saving card type", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "Card Type Saved!", description: `${newCardType.name} has been added.` });
      setNewCardType({ name: '', color: '#ffffff', text_color: '#000000' });
      fetchCardTypes();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('card_types').delete().eq('id', id);
    if (error) {
        toast({ title: "Error deleting card type", description: error.message, variant: 'destructive' });
    } else {
        toast({ title: "Card Type Deleted" });
        fetchCardTypes();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Paintbrush className="h-5 w-5 text-primary" />Card Type Creator</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-semibold">Create New Card Type</h3>
          <div className="space-y-2">
            <Label htmlFor="card-name">Card Name</Label>
            <Input id="card-name" placeholder="e.g., Team of the Season" value={newCardType.name} onChange={(e) => setNewCardType({ ...newCardType, name: e.target.value })} />
          </div>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-color">Card Color</Label>
              <Input id="card-color" type="color" value={newCardType.color} onChange={(e) => setNewCardType({ ...newCardType, color: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <Input id="text-color" type="color" value={newCardType.text_color} onChange={(e) => setNewCardType({ ...newCardType, text_color: e.target.value })} />
            </div>
          </div>
          <div className="pt-4">
            <h4 className="font-semibold text-sm mb-2">Live Preview:</h4>
            <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: newCardType.color }}>
              <span className="font-bold" style={{ color: newCardType.text_color }}>{newCardType.name || "Card Preview"}</span>
            </div>
          </div>
          <Button onClick={handleSave}><Plus className="h-4 w-4 mr-2" />Save New Card Type</Button>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold">Existing Card Types ({gameVersion})</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {cardTypes.map(card => (
                    <div key={card.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-border" style={{backgroundColor: card.color}}></div>
                            <span className="font-medium">{card.name}</span>
                        </div>
                        <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(card.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardTypeCreator;
