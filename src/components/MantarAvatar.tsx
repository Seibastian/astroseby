import mantarImg from "@/assets/mantar-avatar.png";

interface MantarAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  pulsing?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

const MantarAvatar = ({ size = "md", className = "", pulsing = false }: MantarAvatarProps) => (
  <div
    className={`rounded-full overflow-hidden shrink-0 ${sizeClasses[size]} ${
      pulsing ? "animate-pulse" : ""
    } ${className}`}
    style={{
      boxShadow: "0 0 12px 3px hsl(160 90% 50% / 0.3)",
    }}
  >
    <img src={mantarImg} alt="Mantar" className="w-full h-full object-cover" />
  </div>
);

export default MantarAvatar;
