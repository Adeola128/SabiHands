import React from 'react';

interface OrgOnboardingProps {
  organization: any;
  stats: any;
}

const OrgOnboarding: React.FC<OrgOnboardingProps> = () => {
  // Disabled per UI Audit (Phase 1). We now use the inline OnboardingChecklist exclusively.
  return null;
};

export default OrgOnboarding;
