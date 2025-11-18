import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { signupSchema, type SignupFormData } from "@/lib/validations/auth";
import { signUp, signInWithOAuth } from "@/lib/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      acceptTos: false,
    },
  });

  const password = watch("password");
  const acceptTos = watch("acceptTos");

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        company: data.company,
        companySize: data.companySize,
        role: data.role,
      });

      if (result.needsEmailVerification) {
        toast.success("Account created successfully!", {
          description: "Please check your email to verify your account.",
        });
        navigate("/login", {
          state: { message: "Please verify your email before signing in." },
        });
      } else {
        toast.success("Welcome to DecisionLogr!", {
          description: "Your account has been created successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Failed to create account", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: "google" | "microsoft") => {
    try {
      await signInWithOAuth(provider);
      // OAuth redirects automatically, so we don't need to navigate
    } catch (error: any) {
      toast.error(`Failed to sign up with ${provider}`, {
        description: error.message || "Please try again later.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md card-elevated animate-fade-in-up">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthSignup("google")}
              disabled={isLoading}
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
              onClick={() => handleOAuthSignup("microsoft")}
              disabled={isLoading}
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-sm text-destructive animate-fade-in">
                  {errors.name.message}
                </p>
              )}
            </div>

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
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Your Company"
                {...register("company")}
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
              {errors.company && (
                <p className="text-sm text-destructive animate-fade-in">
                  {errors.company.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  onValueChange={(value) => setValue("companySize", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="500+">500+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <p className="text-sm text-destructive animate-fade-in">
                    {errors.companySize.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) => setValue("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive animate-fade-in">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
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
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
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
                  placeholder="Confirm your password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive animate-fade-in">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="tos"
                checked={acceptTos}
                onCheckedChange={(checked) =>
                  setValue("acceptTos", checked === true)
                }
                disabled={isLoading}
                className="mt-1"
              />
              <Label
                htmlFor="tos"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTos && (
              <p className="text-sm text-destructive animate-fade-in">
                {errors.acceptTos.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !acceptTos}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
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
