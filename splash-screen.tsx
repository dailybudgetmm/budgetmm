import { useEffect, useState } from "react";
import logo from "@assets/IMG_5473_1773176683690.png";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 1800);
    const done = setTimeout(() => onFinish(), 2400);
    return () => { clearTimeout(timer); clearTimeout(done); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-600 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ transition: "opacity 0.6s ease" }}
    >
      <div className={`flex flex-col items-center gap-5 transition-transform duration-600 ${fadeOut ? "scale-95" : "scale-100"}`}>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl scale-150 animate-pulse" />
          <img
            src={logo}
            alt="My Daily Budget"
            className="w-24 h-24 rounded-3xl shadow-2xl relative z-10 animate-in zoom-in duration-500"
          />
        </div>
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl font-display font-bold text-gradient">My Daily Budget</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track your finances, every day</p>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
