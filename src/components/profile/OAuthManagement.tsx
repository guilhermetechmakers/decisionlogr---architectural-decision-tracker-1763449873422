import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useOAuthConnections,
  useDisconnectOAuth,
  useDeleteOAuthConnection,
} from '@/hooks/useProfile';
import { format } from 'date-fns';

const providerLabels: Record<string, string> = {
  google: 'Google',
  microsoft: 'Microsoft',
  github: 'GitHub',
  slack: 'Slack',
  other: 'Other',
};

export function OAuthManagement() {
  const { data: connections, isLoading } = useOAuthConnections();
  const disconnectOAuth = useDisconnectOAuth();
  const deleteOAuth = useDeleteOAuthConnection();

  const handleDisconnect = async (connectionId: string) => {
    if (confirm('Are you sure you want to disconnect this OAuth connection?')) {
      await disconnectOAuth.mutateAsync(connectionId);
    }
  };

  const handleDelete = async (connectionId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this OAuth connection? This action cannot be undone.'
      )
    ) {
      await deleteOAuth.mutateAsync(connectionId);
    }
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
        <h3 className="text-lg font-semibold">Connected Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Manage your OAuth provider connections
        </p>
      </div>

      {connections && connections.length > 0 ? (
        <div className="space-y-3">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {providerLabels[connection.provider] || connection.provider}
                      </h4>
                      {connection.is_active ? (
                        <Badge variant="outline" className="badge-green">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="badge-red">
                          Disconnected
                        </Badge>
                      )}
                    </div>
                    {connection.provider_email && (
                      <p className="text-sm text-muted-foreground">
                        {connection.provider_email}
                      </p>
                    )}
                    {connection.provider_name && (
                      <p className="text-sm text-muted-foreground">
                        {connection.provider_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Connected {format(new Date(connection.connected_at), 'MMM d, yyyy')}
                      {connection.last_synced_at &&
                        ` • Last synced ${format(new Date(connection.last_synced_at), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={disconnectOAuth.isPending}
                      >
                        Disconnect
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(connection.id)}
                      disabled={deleteOAuth.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center py-4">
              No OAuth connections yet. Connect an account to get started.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Providers</CardTitle>
          <CardDescription>
            Connect your accounts to enable single sign-on
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Google (Coming soon)
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect Microsoft (Coming soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
