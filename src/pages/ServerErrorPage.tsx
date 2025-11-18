import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, RefreshCw, HelpCircle, AlertTriangle } from "lucide-react";
import { logError } from "@/api/errors";
import { toast } from "sonner";

export default function ServerErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorLogged, setErrorLogged] = useState(false);

  // Log error on mount
  useEffect(() => {
    if (!errorLogged) {
      const errorInfo = {
        path: location.pathname,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
      };

      logError(errorInfo).catch(() => {
        // Silently fail - error logging shouldn't break the error page
      });

      setErrorLogged(true);
    }
  }, [location.pathname, errorLogged]);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    try {
      // Attempt to reload the page
      window.location.reload();
    } catch (error) {
      // If reload fails, try navigating to home
      toast.error("Unable to retry. Redirecting to home page...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="text-center animate-fade-in-up">
          <CardHeader className="space-y-4 pb-4">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-[#F0F8FF] flex items-center justify-center mb-4 animate-bounce-in">
              <AlertTriangle className="h-10 w-10 text-[#FF7A7A]" />
            </div>
            
            <CardTitle className="text-5xl md:text-6xl font-bold mb-2">
              500
            </CardTitle>
            <CardDescription className="text-xl md:text-2xl">
              Server Error
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-2">
            {/* Error Explanation */}
            <div className="space-y-3">
              <p className="text-lg text-foreground font-medium">
                We're sorry, something went wrong
              </p>
              <p className="text-muted-foreground max-w-md mx-auto">
                Our servers encountered an unexpected error. We've been notified and are working to fix the issue. 
                Please try again in a moment.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                size="lg"
                className="w-full sm:w-auto min-w-[140px]"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-w-[140px]"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto min-w-[140px]"
              >
                <Link to="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
            </div>

            {/* Additional Help Text */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                If this problem persists, please{" "}
                <Link
                  to="/help"
                  className="text-primary hover:underline font-medium"
                >
                  contact our support team
                </Link>
                {" "}and we'll help you right away.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
