import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "", checks: undefined };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    // Additional length bonus
    if (password.length >= 12) score++;

    let label = "";
    let color = "";

    if (score <= 2) {
      label = "Weak";
      color = "bg-status-red";
    } else if (score <= 4) {
      label = "Fair";
      color = "bg-status-yellow";
    } else if (score <= 5) {
      label = "Good";
      color = "bg-status-blue";
    } else {
      label = "Strong";
      color = "bg-status-green";
    }

    return { score, label, color, checks };
  }, [password]);

  if (!password) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span
          className={cn(
            "font-medium",
            strength.score <= 2
              ? "text-status-red"
              : strength.score <= 4
              ? "text-status-yellow"
              : strength.score <= 5
              ? "text-status-blue"
              : "text-status-green"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300",
            strength.color
          )}
          style={{ width: `${(strength.score / 6) * 100}%` }}
        />
      </div>
      {password && strength.checks && (
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
          <div className={cn("flex items-center gap-1.5", strength.checks.length ? "text-status-green" : "")}>
            <span>{strength.checks.length ? "✓" : "○"}</span>
            <span>8+ characters</span>
          </div>
          <div className={cn("flex items-center gap-1.5", strength.checks.lowercase ? "text-status-green" : "")}>
            <span>{strength.checks.lowercase ? "✓" : "○"}</span>
            <span>Lowercase</span>
          </div>
          <div className={cn("flex items-center gap-1.5", strength.checks.uppercase ? "text-status-green" : "")}>
            <span>{strength.checks.uppercase ? "✓" : "○"}</span>
            <span>Uppercase</span>
          </div>
          <div className={cn("flex items-center gap-1.5", strength.checks.number ? "text-status-green" : "")}>
            <span>{strength.checks.number ? "✓" : "○"}</span>
            <span>Number</span>
          </div>
          <div className={cn("flex items-center gap-1.5", strength.checks.special ? "text-status-green" : "")}>
            <span>{strength.checks.special ? "✓" : "○"}</span>
            <span>Special char</span>
          </div>
        </div>
      )}
    </div>
  );
}
