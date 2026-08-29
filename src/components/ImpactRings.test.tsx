import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImpactRings } from './ImpactRings';
import '@testing-library/jest-dom';

describe('ImpactRings Component', () => {
  it('renders correctly with incomplete goal', () => {
    render(
      <ImpactRings 
        targetGigs={5} 
        completedGigs={2} 
        periodStart="Aug 1" 
        periodEnd="Aug 31" 
      />
    );
    
    expect(screen.getByText('Monthly Impact Goal')).toBeInTheDocument();
    expect(screen.getByText('Aug 1 - Aug 31')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // current
    expect(screen.getByText('5')).toBeInTheDocument(); // target
    expect(screen.getByText(/Complete 3 more gigs/i)).toBeInTheDocument();
  });

  it('renders correctly with completed goal', () => {
    render(
      <ImpactRings 
        targetGigs={5} 
        completedGigs={5} 
        periodStart="Aug 1" 
        periodEnd="Aug 31" 
      />
    );
    
    expect(screen.getByText('Goal Reached! Bonus Unlocked.')).toBeInTheDocument();
  });
});
