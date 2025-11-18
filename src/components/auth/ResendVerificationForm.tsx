import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResendVerification } from "@/hooks/useVerification";

const resendSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResendFormData = z.infer<typeof resendSchema>;

interface ResendVerificationFormProps {
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function ResendVerificationForm({ defaultEmail = "", onSuccess }: ResendVerificationFormProps) {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const resendMutation = useResendVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  // Set cooldown from mutation result
  useEffect(() => {
    if (resendMutation.isSuccess && resendMutation.data?.cooldownSeconds) {
      setCooldownSeconds(resendMutation.data.cooldownSeconds);
    }
  }, [resendMutation.isSuccess, resendMutation.data]);

  const onSubmit = async (data: ResendFormData) => {
    if (cooldownSeconds > 0) return;

    try {
      const result = await resendMutation.mutateAsync(data.email);
      if (result.cooldownSeconds) {
        setCooldownSeconds(result.cooldownSeconds);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Card className="w-full max-w-md card-elevated animate-fade-in-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Resend Verification Email
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address to receive a new verification link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resend-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="resend-email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={resendMutation.isPending || cooldownSeconds > 0}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-sm text-destructive animate-fade-in">
                {errors.email.message}
              </p>
            )}
          </div>

          {cooldownSeconds > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
              <Clock className="h-4 w-4" />
              <span>Please wait {cooldownSeconds} seconds before requesting another email.</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={resendMutation.isPending || cooldownSeconds > 0}
          >
            {resendMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : cooldownSeconds > 0 ? (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Wait {cooldownSeconds}s
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
