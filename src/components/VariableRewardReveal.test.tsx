import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VariableRewardReveal } from './VariableRewardReveal';
import '@testing-library/jest-dom';

describe('VariableRewardReveal Component', () => {
  it('renders mystery box initially and handles reveal', async () => {
    const handleClaim = vi.fn();
    
    render(
      <VariableRewardReveal 
        basePoints={500} 
        bonusPoints={200} 
        onClaim={handleClaim} 
      />
    );
    
    // Initial State
    expect(screen.getByText('Gig Completed!')).toBeInTheDocument();
    expect(screen.getByText('You earned 500 base points.')).toBeInTheDocument();
    expect(screen.getByText('Tap to reveal your mystery bonus!')).toBeInTheDocument();
    
    // Trigger Reveal
    const mysteryBox = screen.getByText('Gig Completed!').parentElement;
    if (mysteryBox) {
      fireEvent.click(mysteryBox);
    }
    
    // Revealed State (wait for exit animation to finish)
    expect(await screen.findByText('+200 Bonus Points!')).toBeInTheDocument();
    expect(screen.getByText('700 Points')).toBeInTheDocument(); // total (500+200)
    
    // Claim Button
    const claimButton = screen.getByText('Claim Points');
    fireEvent.click(claimButton);
    expect(handleClaim).toHaveBeenCalledTimes(1);
  });
});
