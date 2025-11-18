import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useProfile';
import { useState, useEffect } from 'react';

export function NotificationPreferences() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const [localPreferences, setLocalPreferences] = useState({
    decision_created: true,
    decision_updated: true,
    client_comment: true,
    client_confirmation: true,
    decision_reminder: true,
    weekly_summary: false,
    monthly_report: false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        decision_created: preferences.decision_created,
        decision_updated: preferences.decision_updated,
        client_comment: preferences.client_comment,
        client_confirmation: preferences.client_confirmation,
        decision_reminder: preferences.decision_reminder,
        weekly_summary: preferences.weekly_summary,
        monthly_report: preferences.monthly_report,
      });
    }
  }, [preferences]);

  const handleToggle = (key: keyof typeof localPreferences) => {
    const newValue = !localPreferences[key];
    setLocalPreferences((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSave = async () => {
    await updatePreferences.mutateAsync(localPreferences);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Email Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose which email notifications you want to receive
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="decision_created" className="text-base">
                  Decision Created
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a new decision is created
                </p>
              </div>
              <Switch
                id="decision_created"
                checked={localPreferences.decision_created}
                onCheckedChange={() => handleToggle('decision_created')}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="decision_updated" className="text-base">
                  Decision Updated
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a decision is updated
                </p>
              </div>
              <Switch
                id="decision_updated"
                checked={localPreferences.decision_updated}
                onCheckedChange={() => handleToggle('decision_updated')}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="client_comment" className="text-base">
                  Client Comments
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a client adds a comment
                </p>
              </div>
              <Switch
                id="client_comment"
                checked={localPreferences.client_comment}
                onCheckedChange={() => handleToggle('client_comment')}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="client_confirmation" className="text-base">
                  Client Confirmation
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a client confirms a choice
                </p>
              </div>
              <Switch
                id="client_confirmation"
                checked={localPreferences.client_confirmation}
                onCheckedChange={() => handleToggle('client_confirmation')}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="decision_reminder" className="text-base">
                  Decision Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming decision deadlines
                </p>
              </div>
              <Switch
                id="decision_reminder"
                checked={localPreferences.decision_reminder}
                onCheckedChange={() => handleToggle('decision_reminder')}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly_summary" className="text-base">
                  Weekly Summary
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of all activity
                </p>
              </div>
              <Switch
                id="weekly_summary"
                checked={localPreferences.weekly_summary}
                onCheckedChange={() => handleToggle('weekly_summary')}
                disabled={updatePreferences.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthly_report" className="text-base">
                  Monthly Report
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive a monthly report of your decisions
                </p>
              </div>
              <Switch
                id="monthly_report"
                checked={localPreferences.monthly_report}
                onCheckedChange={() => handleToggle('monthly_report')}
                disabled={updatePreferences.isPending}
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={updatePreferences.isPending}
              className="w-full sm:w-auto"
            >
              {updatePreferences.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Preferences'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
