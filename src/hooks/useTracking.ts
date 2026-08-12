import posthog from 'posthog-js';

export const useTracking = () => {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.capture(eventName, properties);
    } else {
      console.log(`[Tracking] ${eventName}`, properties);
    }
  };

  const identifyUser = (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.identify(userId, traits);
    }
  };

  return { trackEvent, identifyUser };
};
