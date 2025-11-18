import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import {
  useCookies,
  useCookiePreferences,
  useSavePreferences,
  useAcceptAllCookies,
  useRejectAllCookies,
  useLogConsentAction,
} from '@/hooks/useCookies';
import { Cookie, Shield, BarChart3, Target, Settings, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CookieCategory, CookiePreferences, Cookie as CookieType } from '@/types/cookies';
import { toast } from 'sonner';

const categoryInfo: Record<CookieCategory, { name: string; icon: React.ComponentType<{ className?: string }>; description: string; color: string }> = {
  essential: {
    name: 'Essential Cookies',
    icon: Shield,
    description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
    color: 'text-[#5FD37B]',
  },
  analytics: {
    name: 'Analytics Cookies',
    icon: BarChart3,
    description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.',
    color: 'text-[#9D79F9]',
  },
  advertising: {
    name: 'Advertising Cookies',
    icon: Target,
    description: 'These cookies are used to deliver advertisements that are more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.',
    color: 'text-[#F6C96B]',
  },
  functional: {
    name: 'Functional Cookies',
    icon: Settings,
    description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
    color: 'text-[#6AD8FA]',
  },
  performance: {
    name: 'Performance Cookies',
    icon: Zap,
    description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages are most and least popular.',
    color: 'text-[#FF7A7A]',
  },
};

export default function CookiePolicyPage() {
  const { data: cookies, isLoading: cookiesLoading } = useCookies();
  const { data: preferences, isLoading: preferencesLoading } = useCookiePreferences();
  const savePreferences = useSavePreferences();
  const acceptAll = useAcceptAllCookies();
  const rejectAll = useRejectAllCookies();
  const logAction = useLogConsentAction();

  const [localPreferences, setLocalPreferences] = useState<CookiePreferences | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') {
      toast.info('Essential cookies cannot be disabled');
      return;
    }

    if (!localPreferences) return;

    const newPreferences = {
      ...localPreferences,
      [category]: localPreferences[category] === 'accepted' ? 'rejected' : 'accepted',
    };
    setLocalPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!localPreferences) return;

    await savePreferences.mutateAsync(localPreferences);
    setHasChanges(false);
    await logAction.mutateAsync({ actionType: 'manage_preferences' });
  };

  const handleAcceptAll = async () => {
    await acceptAll.mutateAsync();
    await logAction.mutateAsync({ actionType: 'accept_all' });
    if (localPreferences) {
      setLocalPreferences({
        essential: 'accepted',
        analytics: 'accepted',
        advertising: 'accepted',
        functional: 'accepted',
        performance: 'accepted',
      });
      setHasChanges(false);
    }
  };

  const handleRejectAll = async () => {
    await rejectAll.mutateAsync();
    await logAction.mutateAsync({ actionType: 'reject_all' });
    if (localPreferences) {
      setLocalPreferences({
        essential: 'accepted',
        analytics: 'rejected',
        advertising: 'rejected',
        functional: 'rejected',
        performance: 'rejected',
      });
      setHasChanges(false);
    }
  };

  // Group cookies by category
  const cookiesByCategory = cookies?.reduce((acc, cookie) => {
    if (!acc[cookie.category]) {
      acc[cookie.category] = [];
    }
    acc[cookie.category].push(cookie);
    return acc;
  }, {} as Record<CookieCategory, CookieType[]>) || ({} as Record<CookieCategory, CookieType[]>);

  const categories: CookieCategory[] = ['essential', 'analytics', 'advertising', 'functional', 'performance'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
            You can manage your cookie preferences below.
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 card-elevated animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Accept or reject all cookies at once</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleAcceptAll}
                disabled={acceptAll.isPending || rejectAll.isPending}
                className="flex-1"
              >
                {acceptAll.isPending ? 'Processing...' : 'Accept All Cookies'}
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectAll}
                disabled={acceptAll.isPending || rejectAll.isPending}
                className="flex-1"
              >
                {rejectAll.isPending ? 'Processing...' : 'Reject Non-Essential'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Categories */}
        {categories.map((category, index) => {
          const categoryData = categoryInfo[category];
          const Icon = categoryData.icon;
          const categoryCookies = cookiesByCategory[category] || [];
          const isAccepted = localPreferences?.[category] === 'accepted';
          const isEssential = category === 'essential';

          return (
            <Card
              key={category}
              className={cn(
                'mb-6 card-elevated animate-fade-in-up',
                isAccepted && 'border-primary/20'
              )}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn('w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0', categoryData.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{categoryData.name}</CardTitle>
                      <CardDescription className="text-base">{categoryData.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isAccepted && (
                      <CheckCircle2 className="h-5 w-5 text-[#5FD37B]" />
                    )}
                    <div className="flex flex-col items-end gap-1">
                      <Label
                        htmlFor={`toggle-${category}`}
                        className={cn(
                          'text-sm font-medium cursor-pointer',
                          isEssential && 'text-muted-foreground'
                        )}
                      >
                        {isAccepted ? 'Enabled' : 'Disabled'}
                      </Label>
                      <Switch
                        id={`toggle-${category}`}
                        checked={isAccepted}
                        onCheckedChange={() => handleToggle(category)}
                        disabled={isEssential || preferencesLoading || cookiesLoading}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              {categoryCookies.length > 0 && (
                <CardContent>
                  <Separator className="mb-4" />
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Cookies in this category ({categoryCookies.length})
                    </h4>
                    <div className="space-y-2">
                      {categoryCookies.map((cookie: CookieType) => (
                        <div
                          key={cookie.id}
                          className="p-3 rounded-lg bg-muted/50 border border-border"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-medium mb-1">{cookie.name}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{cookie.purpose}</p>
                              {cookie.description && (
                                <p className="text-xs text-muted-foreground">{cookie.description}</p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              Duration: {cookie.duration}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {/* Save Button */}
        {hasChanges && (
          <Card className="mb-8 card-elevated animate-fade-in-up">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-medium mb-1">You have unsaved changes</p>
                  <p className="text-sm text-muted-foreground">
                    Click Save Preferences to apply your changes
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={savePreferences.isPending}
                  size="lg"
                >
                  {savePreferences.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card className="mb-8 card-elevated animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-4">
              You can change your cookie preferences at any time by returning to this page.
              Your preferences are stored locally and will be remembered for future visits.
            </p>
            <p className="text-muted-foreground mb-4">
              For more information about how we handle your data, please see our{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
            </p>
            <p className="text-muted-foreground">
              If you have any questions about our cookie policy, please{' '}
              <Link to="/contact" className="text-primary hover:underline">
                contact us
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        {/* Loading State */}
        {(cookiesLoading || preferencesLoading) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading cookie preferences...</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
