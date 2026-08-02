import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VolunteerOnboarding from './VolunteerOnboarding';
import { vi, describe, it, expect } from 'vitest';

// Mock the AuthContext
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}));

// Mock Supabase client
const { mockUpdate } = vi.hoisted(() => ({
  mockUpdate: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: mockUpdate,
    }),
  },
}));

describe('VolunteerOnboarding Component', () => {
  it('submits the onboarding form successfully', async () => {
    render(
      <MemoryRouter>
        <VolunteerOnboarding />
      </MemoryRouter>
    );

    // Fill out the form
    const locationSelect = screen.getByRole('combobox', { name: /Where are you based in Nigeria/i });
    fireEvent.change(locationSelect, { target: { value: 'ikeja' } });

    const availabilitySelect = screen.getAllByRole('radio');
    fireEvent.click(availabilitySelect[0]); // Click the first availability radio (Weekends only)

    // Select an interest
    const interestPill = screen.getByText('Web/App Development');
    fireEvent.click(interestPill);

    // Submit the form
    const submitBtn = screen.getByRole('button', { name: /Complete Profile/i });
    fireEvent.click(submitBtn);

    // Verify loading state
    expect(submitBtn).toHaveTextContent('Saving...');

    // Wait for the mock to be called
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        location: 'ikeja',
        interests: ['Web/App Development'],
      }));
    });
  });
});
