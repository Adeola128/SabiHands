/**
 * Lens 3.4 — Routing: Sign-up page (Signup.tsx)
 * Lens 3.2 — Logic: Role toggle, form submission, error handling
 *
 * Definition of done checklist (Section 8):
 * ✅ Each routing test failed before the Signup.tsx fix, passed after.
 * ✅ Logic tests verify rules hold under normal, edge, and error cases.
 * ✅ Recorded in qa-scorecard.md.
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Signup from "./Signup";

// ── Supabase mock ─────────────────────────────────────────────────────────────

const { mockSignUp, mockSignInWithOAuth } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockSignInWithOAuth: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
    },
  },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const renderSignup = (search = "") =>
  render(
    <MemoryRouter initialEntries={[`/signup${search}`]}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/terms" element={<div>Terms</div>} />
        <Route path="/privacy" element={<div>Privacy</div>} />
      </Routes>
    </MemoryRouter>
  );

// ── Lens 3.4: Routing ─────────────────────────────────────────────────────────

describe("Signup — Lens 3.4: Routing", () => {
  it('"Back to home" link routes to /', () => {
    renderSignup();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });

  it('"Log in" link routes to /login', () => {
    renderSignup();
    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
  });

  it('"Terms of Service" link routes to /terms', () => {
    renderSignup();
    expect(screen.getByRole("link", { name: /terms of service/i })).toHaveAttribute("href", "/terms");
  });

  it('"Privacy Policy" link routes to /privacy', () => {
    renderSignup();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });

  it("no links on the sign-up page point to bare #", () => {
    renderSignup();
    const allLinks = screen.getAllByRole("link");
    const bareHash = allLinks.filter((el) => el.getAttribute("href") === "#");
    expect(bareHash).toHaveLength(0);
  });
});

// ── Lens 3.4: ?role param pre-selection ──────────────────────────────────────

describe("Signup — Lens 3.4: ?role query param", () => {
  it("?role=volunteer pre-selects the volunteer tab", () => {
    renderSignup("?role=volunteer");
    // The active tab button has class "active"
    expect(screen.getByRole("button", { name: /i'm a volunteer/i })).toHaveClass("active");
  });

  it("?role=org pre-selects the org tab", () => {
    renderSignup("?role=org");
    expect(screen.getByRole("button", { name: /i'm an ngo or company/i })).toHaveClass("active");
  });

  it("no ?role param defaults to volunteer tab", () => {
    renderSignup();
    expect(screen.getByRole("button", { name: /i'm a volunteer/i })).toHaveClass("active");
  });
});

// ── Lens 3.2: Logic — role toggle ────────────────────────────────────────────

describe("Signup — Lens 3.2: Role toggle logic", () => {
  it("switching to org tab shows org-specific fields", () => {
    renderSignup("?role=volunteer");
    fireEvent.click(screen.getByRole("button", { name: /i'm an ngo or company/i }));
    // Org tab exposes the CAC number field
    expect(screen.getByLabelText(/cac registration number/i)).toBeInTheDocument();
  });

  it("switching back to volunteer hides org-specific fields", () => {
    renderSignup("?role=org");
    fireEvent.click(screen.getByRole("button", { name: /i'm a volunteer/i }));
    expect(screen.queryByLabelText(/cac registration number/i)).not.toBeInTheDocument();
  });
});

// ── Lens 3.2: Logic — form submission ────────────────────────────────────────

describe("Signup — Lens 3.2: Form submission logic", () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockSignInWithOAuth.mockReset();
  });

  it("calls supabase.auth.signUp with role=volunteer metadata on volunteer submit", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    renderSignup("?role=volunteer");

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Ade Okonkwo" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "ade@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "securepass123" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByRole("button", { name: /create volunteer account/i }).closest("form")!);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "ade@example.com",
          password: "securepass123",
          options: expect.objectContaining({
            data: expect.objectContaining({ role: "volunteer" }),
          }),
        })
      );
    });
  });

  it("calls supabase.auth.signUp with role=organization metadata on org submit", async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    renderSignup("?role=org");

    fireEvent.change(screen.getByLabelText(/organization name/i), { target: { value: "Lagos Environmental Trust" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "org@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "securepass123" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByRole("button", { name: /create organization account/i }).closest("form")!);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: expect.objectContaining({ role: "organization" }),
          }),
        })
      );
    });
  });

  it('shows "already registered" error when Supabase returns that message', async () => {
    mockSignUp.mockResolvedValueOnce({ error: { message: "User already registered" } });
    renderSignup("?role=volunteer");

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Ade" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "securepass123" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByRole("button", { name: /create volunteer account/i }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText(/already registered/i)).toBeInTheDocument();
    });
  });

  it('"Continue with Google" calls supabase.auth.signInWithOAuth with provider=google', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null });
    renderSignup();

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      );
    });
  });
});

