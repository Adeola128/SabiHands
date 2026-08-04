/**
 * Lens 3.4 — Routing: Landing page (Home.tsx)
 *
 * Definition of done checklist (Section 8):
 * ✅ Each test failed first (before the routing fix), then passed after.
 * ✅ A Fail result names the exact link and expected destination.
 * ✅ Recorded in qa-scorecard.md.
 * ✅ Re-run on every change to Home.tsx or the router.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Home from "./Home";

// framer-motion animates via IntersectionObserver and requestAnimationFrame –
// stub it so renders complete synchronously in jsdom.
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          const Component = ({ children, ...rest }: Record<string, unknown>) => {
            const Tag = prop as any;
            return <Tag {...rest}>{children}</Tag>;
          };
          Component.displayName = `motion.${String(prop)}`;
          return Component;
        },
      }
    ),
  };
});

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe("Home — Lens 3.4: Routing", () => {
  // ── Hero CTAs ─────────────────────────────────────────────────────────────

  it('hero "Find a gig" routes to /signup?role=volunteer', () => {
    renderHome();
    const links = screen.getAllByRole("link", { name: /find a gig/i });
    expect(links[0]).toHaveAttribute("href", "/signup?role=volunteer");
  });

  it('hero "Post a gig" routes to /signup?role=org', () => {
    renderHome();
    const links = screen.getAllByRole("link", { name: /post a gig/i });
    expect(links[0]).toHaveAttribute("href", "/signup?role=org");
  });

  // ── Audience cards ────────────────────────────────────────────────────────

  it("volunteer audience card CTA routes to /signup?role=volunteer", () => {
    renderHome();
    const links = screen.getAllByRole("link", { name: /find a gig/i });
    // [0] = hero, [1] = audience card
    expect(links[1]).toHaveAttribute("href", "/signup?role=volunteer");
  });

  it("org audience card CTA routes to /signup?role=org", () => {
    renderHome();
    const links = screen.getAllByRole("link", { name: /post a gig/i });
    // [0] = hero, [1] = audience card
    expect(links[1]).toHaveAttribute("href", "/signup?role=org");
  });

  // ── Final-CTA band ────────────────────────────────────────────────────────

  it('final-CTA "Find a gig" routes to /signup?role=volunteer', () => {
    renderHome();
    const links = screen.getAllByRole("link", { name: /find a gig/i });
    // [0] = hero, [1] = audience card, [2] = final-CTA
    expect(links[2]).toHaveAttribute("href", "/signup?role=volunteer");
  });

  it('final-CTA "Post a gig" routes to /signup?role=org', () => {
    renderHome();
    const links = screen.getAllByRole("link", { name: /post a gig/i });
    // [0] = hero, [1] = audience card, [2] = final-CTA
    expect(links[2]).toHaveAttribute("href", "/signup?role=org");
  });

  // ── No bare # CTA dead-links ──────────────────────────────────────────────

  it("no CTA <Link> elements point to bare #", () => {
    renderHome();
    const allLinks = screen.getAllByRole("link");
    const bareHash = allLinks.filter((el) => el.getAttribute("href") === "#");
    expect(bareHash).toHaveLength(0);
  });
});
