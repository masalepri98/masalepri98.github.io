# Newsletter page

## Problem

The site has RSS but no public way to join an email list. People should be able to subscribe to occasional notes from Mason Prince, sent from `mason-ceo@agentmail.to`, without a third-party ESP embed or a fake backend.

## Approach

- Add a static PaperMod page at `/newsletter/` (`content/newsletter.md`).
- Subscribe and unsubscribe are `mailto:` links to `mason-ceo@agentmail.to` with subjects `Subscribe` and `Unsubscribe`.
- Mention existing RSS (`/index.xml`, `/posts/index.xml`).
- Link only real posts already in the repo.
- Add a `Newsletter` item to `menu.main` in `hugo.toml`.
- Do not change homepage profile branding, do not add API keys, and do not invent a sending domain.

## Out of scope

- Custom sending domain or AgentMail API integration
- Paid ESPs, subscriber counts, or a form backend
- Homepage copy or offsec branding changes
