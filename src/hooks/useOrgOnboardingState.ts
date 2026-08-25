import { useMemo } from 'react';

export const useOrgOnboardingState = (organization: any, stats: any) => {
  return useMemo(() => {
    const hasProfile = !!organization?.bio && !!organization?.logo_url;
    const hasContact = !!organization?.contact_phone && !!organization?.location;
    const hasDocs = !!organization?.cac_number || organization?.verification_status === 'verified';
    const hasGigs = (stats?.activeGigs || 0) > 0;

    return {
      hasProfile,
      hasContact,
      hasDocs,
      hasGigs,
      isComplete: hasProfile && hasContact && hasDocs && hasGigs,
    };
  }, [organization, stats]);
};
