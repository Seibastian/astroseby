import { Home, BookOpen, Crown } from "lucide-react";
import mantarImg from "@/assets/mantar-avatar.png";
import { useNavigate, useLocation } from "react-router-dom";
import { TR } from "@/lib/i18n";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: "/dreams", icon: BookOpen, label: "Rüyalar" },
    { path: "/dashboard", icon: Home, label: "Ev", isCenter: true },
    { path: "/premium", icon: Crown, label: "Premium" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
      <div className="flex items-center justify-center h-14 max-w-lg mx-auto gap-8">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const isMantar = tab.path === "/mentor";
          
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              } ${tab.isCenter ? "scale-125 -mt-2" : ""}`}
            >
              {isMantar ? (
                <img
                  src={mantarImg}
                  alt="Mantar"
                  className={`h-6 w-6 rounded-full ${isActive ? "ring-2 ring-primary" : "opacity-70"}`}
                />
              ) : tab.isCenter ? (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <tab.icon className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <tab.icon className="h-5 w-5" />
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
        
        <button
          onClick={() => navigate("/mentor")}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${
            location.pathname === "/mentor" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <img
            src={mantarImg}
            alt="Mantar"
            className={`h-6 w-6 rounded-full ${location.pathname === "/mentor" ? "ring-2 ring-primary" : "opacity-70"}`}
          />
          <span className="text-[10px] font-medium">MANTAR</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
