import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import {
  passwordResetSchema,
  type PasswordResetFormData,
} from "@/lib/validations/auth";
import { updatePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const password = watch("password");

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Check if we have a session (Supabase sets this automatically when user clicks reset link)
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setTokenValid(true);
        } else {
          // Check URL hash for access token (Supabase uses hash fragments)
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const accessToken = hashParams.get("access_token");
          const type = hashParams.get("type");

          if (accessToken && type === "recovery") {
            // Set the session using the access token
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get("refresh_token") || "",
            });

            if (sessionError) throw sessionError;
            setTokenValid(true);
          } else {
            setTokenValid(false);
          }
        }
      } catch (error: any) {
        console.error("Token validation error:", error);
        setTokenValid(false);
        toast.error("Invalid or expired reset link", {
          description:
            "This password reset link is invalid or has expired. Please request a new one.",
        });
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, []);

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsLoading(true);
    try {
      await updatePassword(data.password);
      setPasswordUpdated(true);
      toast.success("Password updated successfully!", {
        description: "You can now sign in with your new password.",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Your password has been reset. Please sign in with your new password.",
          },
        });
      }, 2000);
    } catch (error: any) {
      let errorMessage = "Failed to update password. Please try again.";
      if (error.message.includes("session")) {
        errorMessage =
          "This reset link has expired. Please request a new password reset link.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error("Password update failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-elevated animate-fade-in-up">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Validating reset link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-elevated animate-fade-in-up">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Password reset links expire after a certain period for security
                reasons. Please request a new password reset link.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
                variant="outline"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Request New Reset Link
              </Button>
            </div>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Need help? </span>
              <Link
                to="/help"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (passwordUpdated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-elevated animate-fade-in-up">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-status-green/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-status-green" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-center">
              Your password has been updated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2 py-4">
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password.
              </p>
              <p className="text-xs text-muted-foreground">
                Redirecting to login page...
              </p>
            </div>
            <Button
              onClick={() =>
                navigate("/login", {
                  state: {
                    message:
                      "Your password has been reset. Please sign in with your new password.",
                  },
                })
              }
              className="w-full"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-elevated animate-fade-in-up">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below. Make sure it's strong and secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  {...register("password")}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive animate-fade-in">
                  {errors.password.message}
                </p>
              )}
              {password && <PasswordStrengthMeter password={password} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive animate-fade-in">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                For security, this reset link can only be used once and expires
                after a set period. Make sure to choose a strong password.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Remember your password? </span>
            <Link
              to="/login"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
