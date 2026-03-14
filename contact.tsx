import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMessage } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, ExternalLink } from "lucide-react";
import { SiFacebook, SiTelegram } from "react-icons/si";

const SUPPORT_LINKS = [
  {
    label: "Facebook Page",
    sublabel: "facebook.com/mydailybudget",
    href: "https://facebook.com/mydailybudget",
    icon: SiFacebook,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
  },
  {
    label: "Telegram Support",
    sublabel: "t.me/MyDailyBudget",
    href: "https://t.me/MyDailyBudget",
    icon: SiTelegram,
    color: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "border-sky-200 dark:border-sky-500/20",
  },
  {
    label: "Email Support",
    sublabel: "mydailybudgetmm@gmail.com",
    href: "mailto:mydailybudgetmm@gmail.com",
    icon: Mail,
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-500/20",
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { mutate: sendMessage, isPending } = useCreateMessage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage({ name, email, message }, {
      onSuccess: () => {
        toast({ title: "Message Sent!", description: "We'll get back to you soon." });
        setName(""); setEmail(""); setMessage("");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-8 animate-in fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient">Support & Contact</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">We're here to help. Reach us on any platform.</p>
      </div>

      {/* Quick Support Links */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Quick Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUPPORT_LINKS.map(({ label, sublabel, href, icon: Icon, color, bg, border }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 rounded-2xl border ${bg} ${border} hover:scale-[1.02] transition-all active:scale-[0.98] group`}
              data-testid={`link-support-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold text-sm ${color}`}>{label}</p>
                <p className="text-xs text-muted-foreground truncate">{sublabel}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="glass p-6 sm:p-8 rounded-[2rem] shadow-xl">
        <h2 className="text-xl font-bold mb-1">Send a Message</h2>
        <p className="text-muted-foreground text-sm mb-6">Have a question or feedback? Drop us a line.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your name"
                className="bg-background/50 h-11"
                data-testid="input-contact-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="bg-background/50 h-11"
                data-testid="input-contact-email"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              placeholder="How can we help?"
              className="bg-background/50 min-h-[120px] resize-none"
              data-testid="input-contact-message"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90 rounded-xl shadow-lg shadow-primary/20"
            data-testid="button-send-message"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isPending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
