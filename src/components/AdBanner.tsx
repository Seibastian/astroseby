import { TR } from "@/lib/i18n";

const AdBanner = () => (
  <div className="fixed bottom-16 left-0 right-0 z-40 flex items-center justify-center bg-muted/80 backdrop-blur-sm py-2 border-t border-border">
    <span className="text-xs text-muted-foreground tracking-wide">{TR.ad.placeholder}</span>
  </div>
);

export default AdBanner;
