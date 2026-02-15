import MantarAvatar from "./MantarAvatar";

interface SporeLoadingProps {
  text?: string;
}

const SporeLoading = ({ text = "Mantar sporlarını yayıyor..." }: SporeLoadingProps) => (
  <div className="flex items-center gap-3">
    <MantarAvatar size="sm" pulsing />
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground italic">{text}</span>
      <div className="spore-loading">
        <div className="spore" />
        <div className="spore" />
        <div className="spore" />
        <div className="spore" />
        <div className="spore" />
      </div>
    </div>
  </div>
);

export default SporeLoading;
