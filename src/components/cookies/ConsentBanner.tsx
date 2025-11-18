import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAcceptAllCookies, useRejectAllCookies, useLogConsentAction } from '@/hooks/useCookies';
import { Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConsentBanner() {
  const navigate = useNavigate();
  const acceptAll = useAcceptAllCookies();
  const rejectAll = useRejectAllCookies();
  const logAction = useLogConsentAction();

  const handleAcceptAll = async () => {
    await acceptAll.mutateAsync();
    await logAction.mutateAsync({ actionType: 'accept_all' });
  };

  const handleRejectAll = async () => {
    await rejectAll.mutateAsync();
    await logAction.mutateAsync({ actionType: 'reject_all' });
  };

  const handleManagePreferences = () => {
    logAction.mutate({ actionType: 'manage_preferences' });
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg',
        'animate-fade-in-up'
      )}
      role="banner"
      aria-label="Cookie consent banner"
    >
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-1">We use cookies</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link
                  to="/cookies"
                  className="text-primary hover:underline font-medium"
                  onClick={handleManagePreferences}
                >
                  Learn more
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRejectAll}
              disabled={rejectAll.isPending || acceptAll.isPending}
              className="whitespace-nowrap"
            >
              {rejectAll.isPending ? 'Processing...' : 'Reject All'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleManagePreferences();
                navigate('/cookies');
              }}
              className="whitespace-nowrap"
            >
              Manage Preferences
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              disabled={acceptAll.isPending || rejectAll.isPending}
              className="whitespace-nowrap"
            >
              {acceptAll.isPending ? 'Processing...' : 'Accept All'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
