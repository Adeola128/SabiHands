import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrganizationOnboarding from './OrganizationOnboarding';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-org-id', email: 'org@example.com' },
  }),
}));

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      upsert: mockUpsert,
    }),
    auth: {
      updateUser: vi.fn().mockResolvedValue({ data: { user: {} }, error: null })
    }
  },
}));

describe('OrganizationOnboarding Component', () => {
  it('submits the org onboarding form successfully', async () => {
    render(
      <MemoryRouter>
        <OrganizationOnboarding />
      </MemoryRouter>
    );

    const orgTypeSelect = screen.getByLabelText(/Organization Type/i);
    fireEvent.change(orgTypeSelect, { target: { value: 'Non-Profit (NGO)' } });

    const cacInput = screen.getByLabelText(/CAC Registration Number/i);
    fireEvent.change(cacInput, { target: { value: 'RC 123456' } });

    const submitBtn = screen.getByRole('button', { name: /Complete Setup/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith({
        user_id: 'test-org-id',
        name: 'Organization',
        org_type: 'Non-Profit (NGO)',
        cac_number: 'RC 123456'
      }, expect.objectContaining({ onConflict: 'user_id' }));
    });
  });
});
