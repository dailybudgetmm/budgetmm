import { useState } from "react";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

const EMOJI_LIST = [
  "🍕", "🍔", "🍜", "🍣", "🥗", "☕", "🍺", "🛒", "🏠", "💡",
  "📱", "💻", "🚗", "⛽", "🚌", "✈️", "🏥", "💊", "🎓", "📚",
  "👕", "👗", "👟", "💈", "🎬", "🎮", "🎵", "🏋️", "💰", "💵",
  "💳", "🏦", "📈", "🎁", "❤️", "👶", "🐶", "🐱", "🌿", "🔧",
  "🧹", "🧺", "📦", "🎯", "🏆", "📊", "💼", "🖨️", "📝", "🔑",
  "🏪", "🍿", "🧁", "🥤", "🎂", "🧲", "💎", "👑", "🎪", "⚽",
];

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const { mutate: createCat, isPending } = useCreateCategory();
  const { mutate: deleteCat } = useDeleteCategory();

  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [icon, setIcon] = useState("💰");
  const [showPicker, setShowPicker] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createCat({ name, type, icon, isDefault: true }, {
      onSuccess: () => { setName(""); setIcon("💰"); }
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Manage Categories</h1>
        <p className="text-muted-foreground">Configure global system categories</p>
      </div>

      <div className="glass p-6 rounded-3xl mb-8">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input value={name} onChange={e=>setName(e.target.value)} required placeholder="e.g. Food, Salary" className="bg-background/50 h-12" data-testid="admin-input-category-name" />
            </div>
            <div className="w-48 space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v: string) => setType(v as "income" | "expense")}>
                <SelectTrigger className="bg-background/50 h-12"><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <button type="button" onClick={() => setShowPicker(v => !v)} className="h-12 w-12 rounded-xl bg-background/50 border border-input flex items-center justify-center text-2xl hover:bg-muted/60 transition-colors" data-testid="admin-button-emoji-picker">
                {icon}
              </button>
            </div>
            <Button type="submit" disabled={isPending} className="h-12 bg-primary" data-testid="admin-button-add-category">Add Category</Button>
          </div>
          {showPicker && (
            <div className="grid grid-cols-10 gap-1.5 p-3 bg-muted/30 rounded-xl border border-border/50 max-w-lg">
              {EMOJI_LIST.map(emoji => (
                <button key={emoji} type="button" onClick={() => { setIcon(emoji); setShowPicker(false); }}
                  className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-lg hover:bg-muted/60 transition-colors", icon === emoji ? "bg-primary/20 ring-2 ring-primary" : "")}
                  data-testid={`admin-emoji-${emoji}`}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {['expense', 'income'].map(t => (
          <div key={t} className="glass p-6 rounded-3xl">
            <h2 className="text-xl font-bold capitalize mb-4 text-primary">{t}s</h2>
            <div className="space-y-2">
              {categories?.filter(c => c.type === t).map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-background/30 rounded-xl border border-border" data-testid={`admin-card-category-${c.id}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.icon || "⚪"}</span>
                    <span className="font-medium">{c.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteCat(c.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10" data-testid={`admin-button-delete-category-${c.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
