# Hire package — agent brief

Public page: [`content/hire.md`](../content/hire.md) → `/hire/`.

This folder is **not** published by Hugo. Use it after someone buys (or asks to start) the **$850 Standard — Next.js landing page + AI inquiry widget** package.

| File | Use |
| --- | --- |
| [intake.md](intake.md) | Client intake fields. Copy into an email, issue, or form. |
| [delivery-checklist.md](delivery-checklist.md) | Delivery and launch checklist for the builder. |

Do **not** mix Cobalt / pentest / offensive-security offers into this package or the `/hire` page.

## Stripe Payment Link (site CTA)

The buy buttons on `/hire` read **one string**:

`hugo.toml` → `[params.hire]` → `stripePaymentLink`

Today it is the placeholder `YOUR_STRIPE_PAYMENT_LINK`. After Mason creates a Payment Link in the Stripe Dashboard, replace that value with the full `https://buy.stripe.com/...` URL and deploy. No other file needs to change for checkout to go live.
