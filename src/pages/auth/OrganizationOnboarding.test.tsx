import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrganizationOnboarding from './OrganizationOnboarding';
import { vi, describe, it, expect } from 'vitest';

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-org-id', email: 'org@example.com' },
  }),
}));

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

    expect(submitBtn).toHaveTextContent('Saving...');

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        org_type: 'Non-Profit (NGO)',
        cac_number: 'RC 123456',
      });
    });
  });
});
