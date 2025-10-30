// src/components/admin/HomePageEditor.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

const HomePageEditor = () => {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('page_name', 'home')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        toast({
          title: 'Error fetching content',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setContent(data.content);
      }
      setLoading(false);
    };

    fetchContent();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_content')
      .upsert({ page_name: 'home', content: content, updated_at: new Date().toISOString() });

    if (error) {
      toast({
        title: 'Error saving content',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Home page content has been updated.',
      });
    }
    setSaving(false);
  };

  return (
    <Card className="glass-card rounded-2xl shadow-2xl border-0">
      <CardHeader>
        <CardTitle>Home Page Content Editor</CardTitle>
        <CardDescription>
          Edit the HTML content for the public landing page. Use standard HTML tags (e.g., `<h2>`, `<p>`, `<ul>`, `<li>`, `<strong>`).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Textarea
            placeholder="Enter HTML content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] font-mono glass-card"
          />
        )}
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Content
        </Button>
      </CardContent>
    </Card>
  );
};

export default HomePageEditor;