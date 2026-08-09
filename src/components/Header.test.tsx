/**
 * Lens 3.4 — Routing: Navigation header (Header.tsx)
 *
 * Definition of done checklist (Section 8):
 * ✅ Tests verify both real-route links and intentional in-page anchors.
 * ✅ Recorded in qa-scorecard.md.
 * ✅ Re-run on every change to Header.tsx or the router.
 */
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Header from "./Header";

const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );

describe("Header — Lens 3.4: Navigation routing", () => {
  it('logo "Gigway" routes to /', () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /Gigway/i })).toHaveAttribute("href", "/");
  });

  it('"Get started" routes to /login', () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute("href", "/login");
  });

  // In-page anchor links — intentional scrolling behaviour on the home page.
  // These use plain <a href="#..."> which is correct for same-page scrolling.
  // If they are ever converted to <Link to="/#..."> for cross-page support,
  // update these tests accordingly.

  it('"How it works" is an in-page anchor (#how)', () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /how it works/i })).toHaveAttribute("href", "#how");
  });

  it('"For volunteers" is an in-page anchor (#audiences)', () => {
    renderHeader();
    const links = screen.getAllByRole("link", { name: /for volunteers/i });
    expect(links[0]).toHaveAttribute("href", "#audiences");
  });

  it('"For NGOs & companies" is an in-page anchor (#audiences)', () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /for ngos/i })).toHaveAttribute("href", "#audiences");
  });

  it('"The certificate" is an in-page anchor (#certificate)', () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /the certificate/i })).toHaveAttribute(
      "href",
      "#certificate"
    );
  });

  it("no nav links point to bare #", () => {
    renderHeader();
    const allLinks = screen.getAllByRole("link");
    // The only # values should be the intentional in-page anchors above.
    // A bare "#" with no fragment is a dead link.
    const bareHash = allLinks.filter((el) => el.getAttribute("href") === "#");
    expect(bareHash).toHaveLength(0);
  });
});

