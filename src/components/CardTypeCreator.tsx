import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner'; // **MODIFIED: Import toast from sonner**
import { useGameVersion } from '../contexts/GameVersionContext';
import { Paintbrush, Plus, Trash2, Edit, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Interface updated to use three colors
interface CardType {
  id: string;
  name: string;
  primary_color: string;
  secondary_color: string;
  highlight_color: string;
}

// A new component for the detailed card preview
const CardPreview = ({ name, primaryColor, secondaryColor, highlightColor }: { name: string, primaryColor: string, secondaryColor: string, highlightColor: string }) => {
    return (
        <div className="w-full max-w-[220px] aspect-[3/4] p-2 rounded-xl shadow-lg mx-auto" style={{ background: `linear-gradient(135deg, ${primaryColor} 50%, ${secondaryColor} 50%)` }}>
            <div className="w-full h-full border-2 border-white/20 rounded-lg flex flex-col justify-between items-center text-center p-2" style={{ color: highlightColor }}>
                {/* Top Section */}
                <div className='w-full'>
                    <div className="font-bold text-2xl leading-none">99</div>
                    <div className="font-semibold text-lg leading-none">ST</div>
                    <div className="h-4 w-6 bg-gray-400/50 rounded-sm mt-1 mx-auto border border-white/20" title="Nation Flag Placeholder"></div>
                </div>

                {/* Name */}
                <div className="w-full font-bold text-xl uppercase tracking-tighter leading-tight break-words">
                    {name || "Player Name"}
                </div>

                {/* Bottom Stats */}
                <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1 text-xs font-bold">
                    <span>99 PAC</span>
                    <span>99 SHO</span>
                    <span>99 PAS</span>
                    <span>99 DRI</span>
                    <span>99 DEF</span>
                    <span>99 PHY</span>
                </div>
            </div>
        </div>
    );
};


const CardTypeCreator = () => {
  const { user } = useAuth();
  const { gameVersion } = useGameVersion();
  // **MODIFIED: Removed useToast hook**
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  
  // State updated for three colors
  const [newCardType, setNewCardType] = useState({ 
    name: '', 
    primary_color: '#4B0082', 
    secondary_color: '#FFD700', 
    highlight_color: '#FFFFFF' 
  });
  const [editingCardType, setEditingCardType] = useState<CardType | null>(null);

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

  // Logic updated to save three colors
  const handleSave = async () => {
    if (!user || !newCardType.name) {
      // **MODIFIED: Use sonner toast**
      toast.error("Name is required.");
      return;
    }
    const { error } = await supabase.from('card_types').insert({
      ...newCardType,
      id: `${gameVersion}-${newCardType.name.toLowerCase().replace(/\s+/g, '-')}`,
      user_id: user.id,
      game_version: gameVersion,
    });

    if (error) {
      // **MODIFIED: Use sonner toast**
      toast.error("Error saving card type", { description: error.message });
    } else {
      // **MODIFIED: Use sonner toast**
      toast.success("Card Type Saved!", { description: `${newCardType.name} has been added.` });
      setNewCardType({ name: '', primary_color: '#4B0082', secondary_color: '#FFD700', highlight_color: '#FFFFFF' });
      fetchCardTypes();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('card_types').delete().eq('id', id);
    if (error) {
        // **MODIFIED: Use sonner toast**
        toast.error("Error deleting card type", { description: error.message });
    } else {
        // **MODIFIED: Use sonner toast**
        toast.success("Card Type Deleted");
        fetchCardTypes();
    }
  };

  const handleEdit = (card: CardType) => {
    setEditingCardType(card);
  };

  // Logic updated to update three colors
  const handleUpdate = async () => {
    if (!editingCardType) return;

    const { error } = await supabase
      .from('card_types')
      .update({ 
          name: editingCardType.name, 
          primary_color: editingCardType.primary_color, 
          secondary_color: editingCardType.secondary_color,
          highlight_color: editingCardType.highlight_color 
      })
      .eq('id', editingCardType.id);

    if (error) {
      // **MODIFIED: Use sonner toast**
      toast.error("Error updating card type", { description: error.message });
    } else {
      // **MODIFIED: Use sonner toast**
      toast.success("Card Type Updated!", { description: `${editingCardType.name} has been updated.` });
      setEditingCardType(null);
      fetchCardTypes();
    }
  };

  // Logic updated to duplicate three colors
  const handleDuplicate = async (card: CardType) => {
    if (!user) return;
    const newName = `${card.name} (Copy)`;
    const { error } = await supabase.from('card_types').insert({
      name: newName,
      primary_color: card.primary_color,
      secondary_color: card.secondary_color,
      highlight_color: card.highlight_color,
      id: `${gameVersion}-${newName.toLowerCase().replace(/\s+/g, '-')}`,
      user_id: user.id,
      game_version: gameVersion,
    });

    if (error) {
      // **MODIFIED: Use sonner toast**
      toast.error("Error duplicating card type", { description: error.message });
    } else {
      // **MODIFIED: Use sonner toast**
      toast.success("Card Type Duplicated!", { description: `${card.name} has been duplicated.` });
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
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary</Label>
              <Input id="primary-color" type="color" value={newCardType.primary_color} onChange={(e) => setNewCardType({ ...newCardType, primary_color: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary</Label>
              <Input id="secondary-color" type="color" value={newCardType.secondary_color} onChange={(e) => setNewCardType({ ...newCardType, secondary_color: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highlight-color">Highlights</Label>
              <Input id="highlight-color" type="color" value={newCardType.highlight_color} onChange={(e) => setNewCardType({ ...newCardType, highlight_color: e.target.value })} />
            </div>
          </div>
          <div className="pt-4">
            <h4 className="font-semibold text-sm mb-2">Live Preview:</h4>
            <CardPreview 
                name={newCardType.name}
                primaryColor={newCardType.primary_color}
                secondaryColor={newCardType.secondary_color}
                highlightColor={newCardType.highlight_color}
            />
          </div>
          <Button onClick={handleSave}><Plus className="h-4 w-4 mr-2" />Save New Card Type</Button>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold">Existing Card Types ({gameVersion})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {cardTypes.map(card => (
                    <div key={card.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border border-border" style={{background: `linear-gradient(135deg, ${card.primary_color} 50%, ${card.secondary_color} 50%)`}}></div>
                            <span className="font-medium">{card.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleEdit(card)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Card Type</DialogTitle>
                              </DialogHeader>
                              {editingCardType && editingCardType.id === card.id && (
                                <div className="space-y-4 pt-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-card-name">Card Name</Label>
                                    <Input id="edit-card-name" value={editingCardType.name} onChange={(e) => setEditingCardType({ ...editingCardType, name: e.target.value })} />
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-primary-color">Primary</Label>
                                      <Input id="edit-primary-color" type="color" value={editingCardType.primary_color} onChange={(e) => setEditingCardType({ ...editingCardType, primary_color: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-secondary-color">Secondary</Label>
                                      <Input id="edit-secondary-color" type="color" value={editingCardType.secondary_color} onChange={(e) => setEditingCardType({ ...editingCardType, secondary_color: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-highlight-color">Highlights</Label>
                                      <Input id="edit-highlight-color" type="color" value={editingCardType.highlight_color} onChange={(e) => setEditingCardType({ ...editingCardType, highlight_color: e.target.value })} />
                                    </div>
                                  </div>
                                   <div className="pt-4">
                                        <h4 className="font-semibold text-sm mb-2">Live Preview:</h4>
                                        <CardPreview 
                                            name={editingCardType.name}
                                            primaryColor={editingCardType.primary_color}
                                            secondaryColor={editingCardType.secondary_color}
                                            highlightColor={editingCardType.highlight_color}
                                        />
                                    </div>
                                  <Button onClick={handleUpdate}>Save Changes</Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(card)}>
                              <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => handleDelete(card.id)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardTypeCreator;