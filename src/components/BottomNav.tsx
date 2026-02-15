import { Home, BookOpen, Crown, User, Sparkles, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { TR } from "@/lib/i18n";

const tabs = [
  { path: "/dashboard", icon: Home, label: TR.nav.home },
  { path: "/dreams", icon: BookOpen, label: TR.nav.dreams },
  { path: "/karmic", icon: Heart, label: TR.nav.karmic },
  { path: "/mentor", icon: Sparkles, label: TR.nav.mentor },
  { path: "/profile", icon: User, label: TR.nav.profile },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
