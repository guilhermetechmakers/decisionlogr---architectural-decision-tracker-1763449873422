import { useEffect, useState } from 'react';
import { useAcceptanceStatus, useCurrentTermsOfService } from '@/hooks/useTerms';
import { TosUpdateDialog } from './TosUpdateDialog';

/**
 * Wrapper component that checks if user needs to accept updated ToS
 * and shows the update dialog if needed.
 * 
 * This should be included in the app layout or dashboard to ensure
 * users are prompted to accept updated terms.
 */
export function TosUpdateWrapper() {
  const { data: acceptanceStatus, isLoading } = useAcceptanceStatus();
  const { data: terms } = useCurrentTermsOfService();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Only show dialog if:
    // 1. User is authenticated (acceptanceStatus exists)
    // 2. User needs to accept (needsAcceptance is true)
    // 3. Terms are loaded
    // 4. Not currently loading
    if (
      !isLoading &&
      acceptanceStatus?.needsAcceptance &&
      terms &&
      !showDialog
    ) {
      // Small delay to avoid showing immediately on page load
      const timer = setTimeout(() => {
        setShowDialog(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [acceptanceStatus, terms, isLoading, showDialog]);

  const handleAccept = () => {
    setShowDialog(false);
    // Optionally refresh the page or update UI
    window.location.reload();
  };

  if (!acceptanceStatus?.needsAcceptance || !terms) {
    return null;
  }

  return (
    <TosUpdateDialog
      open={showDialog}
      onOpenChange={setShowDialog}
      onAccept={handleAccept}
    />
  );
}
