import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-[hsl(260,40%,5%)] to-[hsl(260,40%,10%)]">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, hsl(340 50% 25%), hsl(340 60% 15%))",
                  boxShadow: "0 0 30px hsl(340 50% 20% / 0.3)"
                }}
              >
                <span className="text-4xl">✦</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-display font-bold text-amber-100">
                Bir Sorun Oluştu
              </h1>
              <p className="text-amber-200/60 text-sm">
                Üzgünüz, bir beklenmedik hata meydana geldi. Lütfen tekrar deneyin.
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Tekrar Dene
              </Button>
              <Button
                onClick={() => window.location.href = "/dashboard"}
                variant="outline"
                className="border-amber-700/50 text-amber-200 hover:bg-amber-900/20"
              >
                Ana Sayfaya Dön
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
