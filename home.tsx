import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wallet, PieChart, Smartphone, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center space-y-12 animate-in fade-in zoom-in duration-500">
      <div className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/30 text-primary font-medium text-sm">
          <Globe className="w-4 h-4" /> Designed for Myanmar Users
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground leading-tight">
          Master Your Money with <br/>
          <span className="text-gradient">My Daily Budget</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Track expenses, analyze your spending habits, and take control of your financial future. Beautifully designed, completely free.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 text-lg px-8 py-6 rounded-2xl hover:-translate-y-1 transition-all">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
        <div className="glass p-8 rounded-3xl text-left space-y-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Multi-Currency</h3>
          <p className="text-muted-foreground">Support for MMK, USD, THB, SGD and many more. Perfect for global users.</p>
        </div>
        <div className="glass p-8 rounded-3xl text-left space-y-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <PieChart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Smart Reports</h3>
          <p className="text-muted-foreground">Visualize your spending with beautiful, interactive charts and insights.</p>
        </div>
        <div className="glass p-8 rounded-3xl text-left space-y-4 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Always in Sync</h3>
          <p className="text-muted-foreground">Access your budget from any device. Your data is securely backed up in real-time.</p>
        </div>
      </div>
    </div>
  );
}
