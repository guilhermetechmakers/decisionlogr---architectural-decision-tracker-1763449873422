import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";
import { useVerifyEmail } from "@/hooks/useVerification";
import { supabase } from "@/lib/supabase";

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userEmail, setUserEmail] = useState<string>("");
  const [showResendForm, setShowResendForm] = useState(false);
  
  // Extract token from URL hash (Supabase uses hash fragments)
  const token = searchParams.get("token") || undefined;
  
  // Verify email on mount
  const { data: verificationResult, isLoading, error } = useVerifyEmail(token);

  // Get user email on mount
  useEffect(() => {
    async function getUserEmail() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.error("Failed to get user email:", error);
      }
    }
    getUserEmail();
  }, []);

  // Handle successful verification
  useEffect(() => {
    if (verificationResult?.success) {
      // Small delay to show success message
      setTimeout(() => {
        navigate("/dashboard", {
          state: { message: "Your email has been verified successfully!" },
        });
      }, 2000);
    }
  }, [verificationResult, navigate]);

  // Determine the current state
  const getState = () => {
    if (isLoading) {
      return {
        status: "loading" as const,
        icon: Loader2,
        title: "Verifying your email...",
        description: "Please wait while we verify your email address.",
        showActions: false,
      };
    }

    if (error || (verificationResult && !verificationResult.success)) {
      return {
        status: "error" as const,
        icon: XCircle,
        title: "Verification Failed",
        description:
          verificationResult?.message ||
          error?.message ||
          "The verification link has expired or is invalid. Please request a new verification email.",
        showActions: true,
      };
    }

    if (verificationResult?.success) {
      return {
        status: "success" as const,
        icon: CheckCircle2,
        title: "Email Verified Successfully!",
        description: "Your email address has been verified. Redirecting you to the dashboard...",
        showActions: false,
      };
    }

    // Default state (shouldn't reach here)
    return {
      status: "loading" as const,
      icon: Loader2,
      title: "Checking verification status...",
      description: "Please wait.",
      showActions: false,
    };
  };

  const state = getState();
  const Icon = state.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {showResendForm ? (
        <ResendVerificationForm
          defaultEmail={userEmail}
          onSuccess={() => {
            setShowResendForm(false);
          }}
        />
      ) : (
        <Card className="w-full max-w-md card-elevated animate-fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div
                className={`rounded-full p-4 ${
                  state.status === "loading"
                    ? "bg-muted"
                    : state.status === "success"
                    ? "bg-[rgb(var(--accent-mint))]"
                    : "bg-[rgb(var(--accent-yellow))]"
                }`}
              >
                {state.status === "loading" ? (
                  <LoadingSpinner size="lg" />
                ) : (
                  <Icon
                    className={`h-12 w-12 ${
                      state.status === "success"
                        ? "text-[rgb(var(--status-green))]"
                        : "text-[rgb(var(--status-red))]"
                    }`}
                  />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{state.title}</CardTitle>
            <CardDescription className="text-base">
              {state.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.status === "success" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-[rgb(var(--status-green))]" />
                  <span>You can now access all features of DecisionLogr.</span>
                </div>
                <div className="flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              </div>
            )}

            {state.status === "error" && (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-lg bg-[rgb(var(--accent-yellow))] p-4 border border-[rgb(var(--status-yellow))]">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[rgb(var(--status-yellow))] flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        What happened?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Verification links expire after 24 hours for security reasons. If your link
                        has expired, you'll need to request a new one.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setShowResendForm(true)}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Request New Verification Email
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already verified? </span>
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {state.status === "loading" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>This should only take a moment...</span>
                </div>
              </div>
            )}

            {state.status !== "error" && state.status !== "success" && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Need help? </span>
                <Link
                  to="/help"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
