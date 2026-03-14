import { useMessages } from "@/hooks/use-admin";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { Mail } from "lucide-react";

export default function AdminMessages() {
  const { data: messages, isLoading } = useMessages();

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Messages from users via the contact form</p>
      </div>

      {messages?.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages?.map(msg => (
            <div key={msg.id} className="glass p-6 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {msg.createdAt ? format(new Date(msg.createdAt), 'MMM dd, yyyy HH:mm') : ''}
                </span>
              </div>
              <p className="text-muted-foreground bg-background/50 rounded-xl p-4 text-sm leading-relaxed">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
