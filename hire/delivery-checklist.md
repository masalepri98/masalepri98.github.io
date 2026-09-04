# Delivery checklist — $850 Standard

Use this while building the Next.js landing page + AI inquiry widget. Check items off in a PR, issue, or local notes. The public marketing page is `/hire/`; this file is for the builder.

**Sample vs client:** [Cedar & Kiln](https://cedar-kiln-sample.vercel.app) is a **portfolio sample** (fictional Oak Cliff pottery studio). Do not present it as a client. Do not ship its copy, address, or images on a paid site.

---

## 1. Repo and hosting

- [ ] Client (or Mason, then transfer) Git repo created; client has owner or admin access
- [ ] Vercel (or agreed host) project linked to that repo
- [ ] Production domain documented from [intake.md](intake.md)
- [ ] DNS / domain connect steps listed for the client if they own the registrar
- [ ] Env vars live only in the host dashboard — not committed
- [ ] README in the client repo: local run, env names, how to edit copy

## 2. Next.js scaffold

- [ ] Current Next.js app router (or the stack already used for Cedar & Kiln, if reuse is faster)
- [ ] Landing sections present: hero, offer, about/proof, visit or contact
- [ ] Brand notes from intake applied (colors, type, logo/wordmark)
- [ ] Mobile layout checked at a phone width and a desktop width
- [ ] Primary CTA label matches intake
- [ ] No marketplace / Fiverr branding
- [ ] No offensive-security or Cobalt offers on the client page

## 3. AI inquiry widget

- [ ] Widget embedded on the landing page (not a separate product site)
- [ ] Answers grounded in **client-supplied** FAQs, hours, offer, location — not Cedar & Kiln
- [ ] Collects at least: name, email, the ask
- [ ] Inquiries delivered to the contact or webhook from intake
- [ ] Refusal / “I don’t know — here’s how to reach us” path when content doesn’t cover the question
- [ ] No invented prices, hours, or medical/legal/financial advice
- [ ] Widget key / provider credentials are env vars, not in git

## 4. Stripe Payment Link wiring

Two different links. Do not mix them.

### A. Mason’s `/hire` checkout (this site)

- [ ] In the **personal site** repo (`masalepri98.github.io`): `hugo.toml` → `[params.hire]` → `stripePaymentLink`
- [ ] Value is **not** `YOUR_STRIPE_PAYMENT_LINK` once Mason has created the live Payment Link
- [ ] Value is the full Stripe URL (typically `https://buy.stripe.com/...`)
- [ ] Both `/hire` CTAs (`hire-cta` shortcode) open that same string — no second copy of the URL
- [ ] Test click from a preview deploy after the swap

### B. Client offer (only if intake has one)

- [ ] If the client sells via their own Payment Link, their Next.js CTA uses **their** URL
- [ ] Placeholder or Mason’s `/hire` link is **not** on the client production site
- [ ] If they have no Payment Link, use the intake CTA (form / email / phone) instead of inventing Stripe

## 5. Sample vs production content

- [ ] No “Cedar & Kiln”, Oak Cliff sample address, or “fictional studio” lines on production
- [ ] No “portfolio sample” badge left on a live business (that badge is for the sample only)
- [ ] Photos are the client’s (or licensed); no leftover sample assets
- [ ] Hours, prices, and location match intake
- [ ] Widget corpus is production FAQs, not sample FAQs
- [ ] Client confirmed the “this is a real operating business” intake line

## 6. Launch checks

- [ ] Production URL loads over HTTPS
- [ ] Primary CTA works (form submit, mailto, tel, or client Stripe link)
- [ ] Widget opens, answers one real FAQ, and delivers a test inquiry
- [ ] Test inquiry deleted or marked so the client doesn’t treat it as a lead
- [ ] 404 / missing image check on the landing page
- [ ] `meta` title and description are the client’s business, not Mason’s blog
- [ ] Mobile: tap targets, no horizontal scroll, readable type
- [ ] Two revision rounds recorded (or unused and noted)
- [ ] Client can edit copy (README or obvious content files)
- [ ] Handoff note sent: repo URL, host dashboard, env var names, how to change the widget corpus
- [ ] `/hire` on masonprince93.com still sells **only** this package (no pentest add-on)

## Out of scope (do not quietly add)

- Logo / identity system
- Cart, accounts, dashboards
- SEO retainer or ads
- Custom CRM / ESP
- Same-week rush without a written agreement
- Any cobalt / pentest / red-team deliverable
