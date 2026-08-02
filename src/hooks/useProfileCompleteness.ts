import { useMemo } from 'react';

// Define the fields required for 100% completeness
const VOLUNTEER_FIELDS = [
  { key: 'full_name', label: 'Full Name', weight: 10 },
  { key: 'location', label: 'Location', weight: 10 },
  { key: 'phone', label: 'Phone Number', weight: 10 },
  { key: 'headline', label: 'Headline', weight: 15 },
  { key: 'bio', label: 'About Me (Bio)', weight: 15 },
  { key: 'skills', label: 'Skills', weight: 10 },
  { key: 'interests', label: 'Causes / Interests', weight: 10 },
  { key: 'avatar_url', label: 'Profile Picture', weight: 10 },
  { key: 'linkedin_url', label: 'LinkedIn Profile', weight: 10 }
];

const ORG_FIELDS = [
  { key: 'name', label: 'Organization Name', weight: 10 },
  { key: 'location', label: 'Location', weight: 10 },
  { key: 'org_type', label: 'Organization Type', weight: 10 },
  { key: 'bio', label: 'About Us', weight: 20 },
  { key: 'website', label: 'Website', weight: 10 },
  { key: 'contact_email', label: 'Contact Email', weight: 10 },
  { key: 'contact_phone', label: 'Contact Phone', weight: 10 },
  { key: 'logo_url', label: 'Organization Logo', weight: 20 }
];

export const useProfileCompleteness = (profile: any, role: 'volunteer' | 'organization') => {
  return useMemo(() => {
    if (!profile) return { score: 0, missingFields: [], isComplete: false };

    const fieldsToTrack = role === 'volunteer' ? VOLUNTEER_FIELDS : ORG_FIELDS;
    
    let currentScore = 0;
    const missingFields: { key: string, label: string }[] = [];

    fieldsToTrack.forEach(field => {
      const val = profile[field.key];
      // Check if field is filled (not null, not undefined, not empty string, not empty array)
      const isFilled = val !== null && val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
      
      if (isFilled) {
        currentScore += field.weight;
      } else {
        missingFields.push({ key: field.key, label: field.label });
      }
    });

    // Ensure it doesn't exceed 100 due to floating point or weight tweaks
    const finalScore = Math.min(100, Math.round(currentScore));

    return {
      score: finalScore,
      missingFields,
      isComplete: finalScore === 100,
      nextStep: missingFields.length > 0 ? missingFields[0].label : null
    };
  }, [profile, role]);
};
