import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PasswordResetDialog } from "@/components/auth/PasswordResetDialog";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { signIn, signInWithMagicLink, signInWithOAuth } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch("email");

  // Show message from signup if present
  const message = location.state?.message;
  if (message) {
    toast.info(message);
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn(data);
      if (result.user && result.session) {
        toast.success("Welcome back!", {
          description: "You've been signed in successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      // Handle specific Supabase errors
      let errorMessage = "Failed to sign in. Please check your credentials.";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before signing in.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error("Sign in failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicLinkEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsMagicLinkLoading(true);
    try {
      await signInWithMagicLink(magicLinkEmail);
      toast.success("Magic link sent!", {
        description: "Check your email for the sign-in link.",
      });
      setShowMagicLinkForm(false);
      setMagicLinkEmail("");
    } catch (error: any) {
      toast.error("Failed to send magic link", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "microsoft") => {
    try {
      await signInWithOAuth(provider);
      // OAuth redirects automatically, so we don't need to navigate
    } catch (error: any) {
      toast.error(`Failed to sign in with ${provider}`, {
        description: error.message || "Please try again later.",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-elevated animate-fade-in-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("google")}
                disabled={isLoading || isMagicLinkLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("microsoft")}
                disabled={isLoading || isMagicLinkLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                  <path fill="#f25022" d="M0 0h11v11H0z" />
                  <path fill="#00a4ef" d="M12 0h11v11H12z" />
                  <path fill="#7fba00" d="M0 12h11v11H0z" />
                  <path fill="#ffb900" d="M12 12h11v11H12z" />
                </svg>
                Continue with Microsoft
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Magic Link Form */}
            {showMagicLinkForm ? (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="name@example.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    disabled={isMagicLinkLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowMagicLinkForm(false);
                      setMagicLinkEmail("");
                    }}
                    disabled={isMagicLinkLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isMagicLinkLoading || !magicLinkEmail}
                  >
                    {isMagicLinkLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <>
                {/* Login Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      {...register("email")}
                      disabled={isLoading}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive animate-fade-in">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowResetDialog(true)}
                        className="text-sm text-primary hover:underline font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Magic Link Option */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMagicLinkForm(true);
                      setMagicLinkEmail(email || "");
                    }}
                    className="text-sm text-primary hover:underline font-medium transition-colors"
                    disabled={isLoading}
                  >
                    <Sparkles className="inline h-3 w-3 mr-1" />
                    Sign in with magic link
                  </button>
                </div>
              </>
            )}

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <PasswordResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
      />
    </>
  );
}
