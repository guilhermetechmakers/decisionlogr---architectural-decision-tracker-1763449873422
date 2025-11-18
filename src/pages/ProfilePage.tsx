import { useState, useEffect } from 'react';
import { Edit, Lock, Bell, Key, Link2, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useUserProfile,
  useUserSessions,
  useRevokeSession,
  useRevokeAllOtherSessions,
} from '@/hooks/useProfile';
import { getCurrentUser } from '@/lib/auth';
import { EditProfileDialog } from '@/components/profile/EditProfileDialog';
import { PasswordChangeDialog } from '@/components/profile/PasswordChangeDialog';
import { NotificationPreferences } from '@/components/profile/NotificationPreferences';
import { ApiKeyManagement } from '@/components/profile/ApiKeyManagement';
import { OAuthManagement } from '@/components/profile/OAuthManagement';

export default function ProfilePage() {
  const { data: profile, isLoading } = useUserProfile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user email from auth
  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setUserEmail(user.email || null);
      }
    });
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Unable to load profile. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Profile Info Card */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                <CardDescription className="mt-1">
                  {userEmail && <div>{userEmail}</div>}
                  {profile.title && <div>{profile.title}</div>}
                  {profile.company && <div>{profile.company}</div>}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
                className="shrink-0"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base">{profile.full_name}</p>
              </div>
              {profile.title && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Title</p>
                  <p className="text-base">{profile.title}</p>
                </div>
              )}
              {profile.company && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-base">{profile.company}</p>
                </div>
              )}
              {profile.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{profile.phone}</p>
                </div>
              )}
              {profile.role && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-base capitalize">{profile.role.replace('_', ' ')}</p>
                </div>
              )}
              {profile.company_size && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company Size</p>
                  <p className="text-base">{profile.company_size}</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge variant={profile.email_verified ? 'outline' : 'destructive'}>
                  {profile.email_verified ? 'Email Verified' : 'Email Not Verified'}
                </Badge>
                {profile.onboarding_completed && (
                  <Badge variant="outline">Onboarding Complete</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="security" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="security">
              <Lock className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="api">
              <Key className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Link2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Manage your password and active sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {profile.updated_at
                        ? new Date(profile.updated_at).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
                <Separator />
                <div>
                  <p className="font-medium mb-2">Active Sessions</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your active sessions across different devices
                  </p>
                  <SessionList />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationPreferences />
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <ApiKeyManagement />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <OAuthManagement />
          </TabsContent>
        </Tabs>

        {/* Billing Link */}
        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href="/billing" target="_blank" rel="noopener noreferrer">
                <CreditCard className="mr-2 h-4 w-4" />
                Go to Billing
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EditProfileDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <PasswordChangeDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </div>
  );
}

// Session List Component
function SessionList() {
  const { data: sessions, isLoading } = useUserSessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllOtherSessions();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active sessions found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {session.device_info?.browser || 'Unknown Browser'} on{' '}
              {session.device_info?.os || 'Unknown OS'}
            </p>
            <p className="text-xs text-muted-foreground">
              Last active: {new Date(session.last_activity_at).toLocaleString()}
              {session.ip_address && ` • ${session.ip_address}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => revokeSession.mutate(session.id)}
            disabled={revokeSession.isPending}
          >
            Revoke
          </Button>
        </div>
      ))}
      {sessions.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => revokeAll.mutate()}
          disabled={revokeAll.isPending}
          className="w-full"
        >
          Revoke All Other Sessions
        </Button>
      )}
    </div>
  );
}
