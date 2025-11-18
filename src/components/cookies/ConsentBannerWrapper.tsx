import { useLocation } from 'react-router-dom';
import { useConsentBannerState } from '@/hooks/useCookies';
import { ConsentBanner } from './ConsentBanner';

export function ConsentBannerWrapper() {
  const location = useLocation();
  const { data: bannerState, isLoading } = useConsentBannerState();

  // Don't show banner on cookie policy page
  if (location.pathname === '/cookies') {
    return null;
  }

  if (isLoading || !bannerState?.isVisible) {
    return null;
  }

  return <ConsentBanner />;
}
