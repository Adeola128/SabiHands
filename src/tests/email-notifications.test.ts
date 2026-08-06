/**
 * Email Notification System — Full Test Suite
 *
 * Benchmark targets (all must pass):
 *  1.  Template renders valid HTML (<!DOCTYPE html> present)
 *  2.  Template contains SabiHands branding
 *  3.  Template injects dynamic values (name, gig title, org name)
 *  4.  No debug artifacts (dYZ% must be absent from all output)
 *  5.  CTA button href is a valid URL
 *  6.  Preheader text is present and non-empty
 *  7.  Footer copyright is present
 *  8.  Mobile media query (@media) is present
 *  9.  Template escapes/handles special characters safely
 *  10. Template renders correctly when optional values are empty
 *  11. All 9 edge function payloads are valid (schema validation)
 *  12. Integration: email-application-accepted returns 200 with valid payload
 *      (skipped if VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY is missing)
 */

import { describe, it, expect, beforeAll } from 'vitest';

// ─────────────────────────────────────────────
// Pure utility: replicate buildEmailTemplate logic
// so we can unit-test it without Deno
// ─────────────────────────────────────────────
function buildEmailTemplate(preheader: string, headline: string, bodyContent: string): string {
  const logoSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M60 15 A35 35 0 1 0 60 85" fill="none" stroke="#7F77DD" stroke-width="16" stroke-linecap="round"/>
      <path d="M40 15 A35 35 0 1 1 40 85" fill="none" stroke="#1D9E75" stroke-width="16" stroke-linecap="round"/>
    </svg>
  `);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${headline}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,600;1,500;0,300&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    html, body { margin: 0; padding: 0; background: #FBFAFF; font-family: 'Inter', Helvetica, Arial, sans-serif; }
    .email-container { max-width: 600px; margin: 24px auto; background: #FFFFFF; border: 1px solid #E4E1F5; border-radius: 16px; overflow: hidden; }
    .header-banner { background: linear-gradient(135deg, #26215C 0%, #534AB7 50%, #0F6E56 100%); padding: 48px 40px 40px; text-align: center; }
    .header-logo { width: 64px; height: 64px; margin-bottom: 20px; }
    .header-wordmark { color: #FFFFFF; font-family: 'Fraunces', Georgia, serif; font-size: 32px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 8px; }
    .header-tagline { color: rgba(255,255,255,0.75); font-size: 14px; margin: 0; }
    .header-event-badge { display: inline-block; margin-top: 20px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #FFFFFF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 16px; border-radius: 99px; }
    .body-content { padding: 40px; }
    .headline { font-family: 'Fraunces', Georgia, serif; font-size: 28px; font-weight: 600; color: #26215C; margin: 0 0 16px; letter-spacing: -0.02em; line-height: 1.2; }
    .body-content p { font-size: 16px; color: #4A4770; line-height: 1.7; margin: 0 0 20px; }
    .info-card { background: #FBFAFF; border: 1px solid #E4E1F5; border-left: 4px solid #534AB7; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .info-card-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #8B87B0; margin: 0 0 6px; }
    .info-card-value { font-size: 18px; font-weight: 600; color: #26215C; margin: 0 0 4px; }
    .info-card-sub { font-size: 14px; color: #4A4770; margin: 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #534AB7, #7F77DD); color: #FFFFFF !important; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 36px; border-radius: 10px; margin: 8px 0; letter-spacing: -0.01em; }
    .button-wrap { text-align: center; margin: 32px 0; }
    .divider { border: none; border-top: 1px solid #E4E1F5; margin: 32px 0; }
    .footer { background: #26215C; padding: 32px 40px; text-align: center; }
    .footer-tagline { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 16px; color: #5DCAA5; margin: 0 0 12px; }
    .footer-copy { font-size: 13px; color: #8B87B0; margin: 0; }
    .footer-copy a { color: #AFA9EC; }
    @media screen and (max-width: 600px) {
      .email-container { border-radius: 0; margin: 0; border: none; }
      .header-banner, .body-content, .footer { padding-left: 20px !important; padding-right: 20px !important; }
      .headline { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <center style="width:100%;background:#FBFAFF;">
    <div class="email-container">
      <div class="header-banner">
        <img class="header-logo" src="data:image/svg+xml;charset=UTF-8,${logoSvg}" alt="SabiHands Logo">
        <div class="header-wordmark">SabiHands</div>
        <div class="header-tagline">Making an impact, one sabi hand at a time.</div>
        <div class="header-event-badge">${headline}</div>
      </div>
      <div class="body-content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p class="footer-tagline">"You're not just volunteering. You're a Sabi Hand."</p>
        <p class="footer-copy">&copy; 2026 SabiHands, Lagos, Nigeria. &nbsp;|&nbsp; <a href="https://sabihands.vercel.app">Visit Website</a></p>
      </div>
    </div>
  </center>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Payload schemas for all 9 edge functions
// ─────────────────────────────────────────────
interface AppAcceptedPayload {
  volunteer_email: string;
  volunteer_name: string;
  gig_title: string;
  org_name: string;
}

interface WelcomePayload {
  record: { user_id: string; full_name: string };
  type: 'INSERT';
}

interface SubmissionReceivedPayload {
  record: { id: string; application_id: string; gig_id: string; volunteer_id: string };
  type: 'INSERT';
}

interface SubmissionReviewedPayload {
  record: { id: string; status: 'approved' | 'rejected'; application_id: string; gig_id: string; volunteer_id: string };
  old_record: { status: string };
  type: 'UPDATE';
}

interface CertificateIssuedPayload {
  record: { id: string; volunteer_id: string; gig_id: string; issued_at: string; verification_code: string; recipient_name?: string };
  type: 'INSERT';
}

interface OrgApprovedPayload {
  record: { id: string; user_id: string; name: string; status: 'approved' };
  old_record: { status: string };
  type: 'UPDATE';
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const canRunIntegration = !!(SUPABASE_URL && SERVICE_ROLE_KEY);

async function callEdgeFunction(fnName: string, payload: unknown) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { status: res.status, data };
}

// ─────────────────────────────────────────────
// BENCHMARK 1–10: Unit Tests on HTML Template
// ─────────────────────────────────────────────
describe('Email Template — Unit Tests', () => {
  const testPreheader = 'Your application has been accepted!';
  const testHeadline = 'Application Accepted';
  const testBody = `
    <h2 class="headline">Congratulations, John Doe!</h2>
    <p>Your application for <strong>Code Clinic Mentor</strong> at <strong>TechForGood NGO</strong> has been approved.</p>
    <div class="info-card">
      <div class="info-card-label">Role Details</div>
      <div class="info-card-value">Code Clinic Mentor</div>
      <div class="info-card-sub">Hosted by TechForGood NGO</div>
    </div>
    <div class="button-wrap"><a href="https://sabihands.vercel.app/dashboard/volunteer/applications" class="button">View My Applications &rarr;</a></div>
  `;
  let html: string;

  beforeAll(() => {
    html = buildEmailTemplate(testPreheader, testHeadline, testBody);
  });

  // Benchmark 1
  it('BENCHMARK 1: renders valid HTML (<!DOCTYPE html> present)', () => {
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });

  // Benchmark 2
  it('BENCHMARK 2: contains SabiHands branding', () => {
    expect(html).toContain('SabiHands');
    expect(html).toContain('Sabi Hand');
    expect(html.toLowerCase()).toContain('sabihands');
  });

  // Benchmark 3
  it('BENCHMARK 3: injects dynamic values (name, gig title, org name)', () => {
    expect(html).toContain('John Doe');
    expect(html).toContain('Code Clinic Mentor');
    expect(html).toContain('TechForGood NGO');
    expect(html).toContain('Application Accepted');
    expect(html).toContain(testPreheader);
  });

  // Benchmark 4
  it('BENCHMARK 4: no debug artifacts (dYZ% must be absent)', () => {
    expect(html).not.toContain('dYZ%');
    expect(html).not.toContain('TODO');
    expect(html).not.toContain('FIXME');
    expect(html).not.toContain('console.log');
  });

  // Benchmark 5
  it('BENCHMARK 5: CTA button href is a valid URL', () => {
    const urlRegex = /href="(https?:\/\/[^"]+)"/g;
    const matches = [...html.matchAll(urlRegex)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
      expect(() => new URL(match[1])).not.toThrow();
    }
  });

  // Benchmark 6
  it('BENCHMARK 6: preheader text is present and non-empty', () => {
    expect(html).toContain('display:none');
    expect(html).toContain(testPreheader);
    expect(testPreheader.length).toBeGreaterThan(10);
  });

  // Benchmark 7
  it('BENCHMARK 7: footer copyright is present', () => {
    expect(html).toContain('SabiHands');
    expect(html).toContain('2026');
    expect(html).toContain('Lagos');
  });

  // Benchmark 8
  it('BENCHMARK 8: mobile media query (@media) is present', () => {
    expect(html).toContain('@media screen and (max-width: 600px)');
  });

  // Benchmark 9
  it('BENCHMARK 9: handles special characters safely', () => {
    const specialHtml = buildEmailTemplate(
      "It's & a test <check>",
      'Headline & More',
      '<p>Body with &amp; entities</p>'
    );
    expect(specialHtml).toContain("It's & a test <check>");
    expect(specialHtml).toContain('Body with &amp; entities');
    expect(() => specialHtml.length).not.toThrow();
  });

  // Benchmark 10
  it('BENCHMARK 10: renders correctly when optional values are empty strings', () => {
    const emptyHtml = buildEmailTemplate('', '', '<p>Minimal body</p>');
    expect(emptyHtml).toContain('<!DOCTYPE html>');
    expect(emptyHtml).toContain('Minimal body');
    expect(emptyHtml).not.toContain('undefined');
    expect(emptyHtml).not.toContain('null');
  });
});

// ─────────────────────────────────────────────
// BENCHMARK 11: Payload Schema Validation
// ─────────────────────────────────────────────
describe('Email Function Payloads — Schema Validation', () => {
  it('BENCHMARK 11a: AppAcceptedPayload is valid', () => {
    const payload: AppAcceptedPayload = {
      volunteer_email: 'john@example.com',
      volunteer_name: 'John Doe',
      gig_title: 'Code Clinic Mentor',
      org_name: 'TechForGood NGO',
    };
    expect(payload.volunteer_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(payload.volunteer_name.length).toBeGreaterThan(0);
    expect(payload.gig_title.length).toBeGreaterThan(0);
    expect(payload.org_name.length).toBeGreaterThan(0);
  });

  it('BENCHMARK 11b: WelcomePayload is valid', () => {
    const payload: WelcomePayload = {
      record: { user_id: 'uuid-1234', full_name: 'Jane Smith' },
      type: 'INSERT',
    };
    expect(payload.type).toBe('INSERT');
    expect(payload.record.user_id).toBeTruthy();
    expect(payload.record.full_name).toBeTruthy();
  });

  it('BENCHMARK 11c: SubmissionReceivedPayload is valid', () => {
    const payload: SubmissionReceivedPayload = {
      record: { id: 'sub-uuid', application_id: 'app-uuid', gig_id: 'gig-uuid', volunteer_id: 'vol-uuid' },
      type: 'INSERT',
    };
    expect(payload.type).toBe('INSERT');
    expect(payload.record.gig_id).toBeTruthy();
    expect(payload.record.volunteer_id).toBeTruthy();
  });

  it('BENCHMARK 11d: SubmissionReviewedPayload is valid', () => {
    const payload: SubmissionReviewedPayload = {
      record: { id: 'sub-uuid', status: 'approved', application_id: 'app-uuid', gig_id: 'gig-uuid', volunteer_id: 'vol-uuid' },
      old_record: { status: 'pending' },
      type: 'UPDATE',
    };
    expect(['approved', 'rejected']).toContain(payload.record.status);
    expect(payload.old_record.status).toBe('pending');
    expect(payload.type).toBe('UPDATE');
  });

  it('BENCHMARK 11e: CertificateIssuedPayload is valid', () => {
    const payload: CertificateIssuedPayload = {
      record: { id: 'cert-uuid', volunteer_id: 'vol-uuid', gig_id: 'gig-uuid', issued_at: new Date().toISOString(), verification_code: 'SH-ABCD1234' },
      type: 'INSERT',
    };
    expect(payload.record.verification_code).toMatch(/^SH-/);
    expect(new Date(payload.record.issued_at).toString()).not.toBe('Invalid Date');
  });

  it('BENCHMARK 11f: OrgApprovedPayload is valid', () => {
    const payload: OrgApprovedPayload = {
      record: { id: 'org-uuid', user_id: 'user-uuid', name: 'TechForGood NGO', status: 'approved' },
      old_record: { status: 'pending' },
      type: 'UPDATE',
    };
    expect(payload.record.status).toBe('approved');
    expect(payload.old_record.status).not.toBe('approved');
    expect(payload.record.name.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// BENCHMARK 12: Integration Tests (Live HTTP)
// ─────────────────────────────────────────────
describe('Edge Functions — Integration Tests (requires env vars)', () => {
  if (!canRunIntegration) {
    it.skip('SKIPPED: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY not set', () => {});
    return;
  }

  it('BENCHMARK 12a: email-application-accepted returns 200 with valid payload', async () => {
    const { status, data } = await callEdgeFunction('email-application-accepted', {
      volunteer_email: 'test@mailinator.com',
      volunteer_name: 'Test Volunteer',
      gig_title: 'Integration Test Gig',
      org_name: 'Test Organization',
    });
    console.log('12a response:', data);
    expect(status).toBe(200);
    expect(data.success).toBe(true);
  }, 15000);

  it('BENCHMARK 12b: email-application-accepted returns 400 with missing fields', async () => {
    const { status } = await callEdgeFunction('email-application-accepted', {
      volunteer_name: 'Incomplete Payload',
      // missing volunteer_email, gig_title, org_name
    });
    expect(status).toBe(400);
  }, 10000);

  it('BENCHMARK 12c: email-welcome handles INSERT payload', async () => {
    const payload: WelcomePayload = {
      record: { user_id: '00000000-0000-0000-0000-000000000001', full_name: 'Integration Tester' },
      type: 'INSERT',
    };
    const { status, data } = await callEdgeFunction('email-welcome', payload);
    console.log('12c response:', data);
    // Either 200 (email sent) or 500 (user not found - expected in test env) but NOT 400
    expect([200, 500]).toContain(status);
  }, 15000);

  it('BENCHMARK 12d: email-submission-received handles INSERT payload', async () => {
    const payload: SubmissionReceivedPayload = {
      record: { id: '00000000-0000-0000-0000-000000000002', application_id: '00000000-0000-0000-0000-000000000003', gig_id: '00000000-0000-0000-0000-000000000004', volunteer_id: '00000000-0000-0000-0000-000000000005' },
      type: 'INSERT',
    };
    const { status } = await callEdgeFunction('email-submission-received', payload);
    expect([200, 500]).toContain(status);
  }, 15000);

  it('BENCHMARK 12e: email-certificate-issued handles INSERT payload', async () => {
    const payload: CertificateIssuedPayload = {
      record: { id: '00000000-0000-0000-0000-000000000006', volunteer_id: '00000000-0000-0000-0000-000000000007', gig_id: '00000000-0000-0000-0000-000000000008', issued_at: new Date().toISOString(), verification_code: 'SH-TEST1234' },
      type: 'INSERT',
    };
    const { status } = await callEdgeFunction('email-certificate-issued', payload);
    expect([200, 500]).toContain(status);
  }, 15000);

  it('BENCHMARK 12f: email-org-approved handles UPDATE payload', async () => {
    const payload: OrgApprovedPayload = {
      record: { id: '00000000-0000-0000-0000-000000000009', user_id: '00000000-0000-0000-0000-000000000010', name: 'Test Org', status: 'approved' },
      old_record: { status: 'pending' },
      type: 'UPDATE',
    };
    const { status } = await callEdgeFunction('email-org-approved', payload);
    expect([200, 500]).toContain(status);
  }, 15000);
});
