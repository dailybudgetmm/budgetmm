import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adSetting } = useQuery({
    queryKey: [api.settings.get.path, 'ad_code'],
    queryFn: () => fetchWithAuth('/api/settings/ad_code').catch(() => ({ key: 'ad_code', value: '' })),
  });

  const [adCode, setAdCode] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  useEffect(() => {
    if (adSetting?.value !== undefined) setAdCode(adSetting.value);
  }, [adSetting]);

  const saveAdMutation = useMutation({
    mutationFn: () => fetchWithAuth(api.settings.set.path, {
      method: api.settings.set.method,
      body: JSON.stringify({ key: 'ad_code', value: adCode }),
    }),
    onSuccess: () => {
      toast({ title: "Saved", description: "Ad code updated." });
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path, 'ad_code'] });
    },
  });

  const announceMutation = useMutation({
    mutationFn: () => fetchWithAuth(api.announcements.create.path, {
      method: api.announcements.create.method,
      body: JSON.stringify({ title: announcementTitle, content: announcementContent }),
    }),
    onSuccess: () => {
      toast({ title: "Announcement Posted", description: "Users will see it on next visit." });
      setAnnouncementTitle(""); setAnnouncementContent("");
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">Configure global application settings</p>
      </div>

      <div className="glass p-8 rounded-[2rem] space-y-6">
        <h2 className="text-xl font-bold">Advertisement Code</h2>
        <p className="text-sm text-muted-foreground">Paste your ad HTML/script code here. It will be shown to users in the app.</p>
        <div className="space-y-2">
          <Label>Ad Code (HTML/Script)</Label>
          <Textarea
            value={adCode}
            onChange={e => setAdCode(e.target.value)}
            placeholder='<script async src="..."></script>'
            className="bg-background/50 font-mono text-sm min-h-[140px]"
          />
        </div>
        <Button onClick={() => saveAdMutation.mutate()} disabled={saveAdMutation.isPending} className="bg-primary text-white rounded-xl px-8">
          {saveAdMutation.isPending ? "Saving..." : "Save Ad Code"}
        </Button>
      </div>

      <div className="glass p-8 rounded-[2rem] space-y-6">
        <h2 className="text-xl font-bold">Post Announcement</h2>
        <p className="text-sm text-muted-foreground">Post a system-wide announcement visible to all users.</p>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} placeholder="Announcement title" className="bg-background/50 h-12" />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea value={announcementContent} onChange={e => setAnnouncementContent(e.target.value)} placeholder="Announcement content..." className="bg-background/50 min-h-[120px]" />
        </div>
        <Button
          onClick={() => announceMutation.mutate()}
          disabled={announceMutation.isPending || !announcementTitle || !announcementContent}
          className="bg-primary text-white rounded-xl px-8"
        >
          {announceMutation.isPending ? "Posting..." : "Post Announcement"}
        </Button>
      </div>
    </div>
  );
}
