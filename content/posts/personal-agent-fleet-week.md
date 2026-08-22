---
title: "What I Actually Shipped With a Personal Agent Fleet This Week"
slug: "what-i-actually-shipped-with-a-personal-agent-fleet-this-week"
date: 2026-08-22T01:00:00Z
description: "A week of running a CEO-style front-door agent over specialist Cursor and Grok bots: a real portfolio sample, a retargeted Fiverr gig, an AgentMail inbox, a newsletter page, and the hard limits of automating marketplaces."
summary: "I ran a personal agent fleet this week instead of treating chat like a search box. Here's what actually left the machine — and the three failure modes I will not repeat."
categories: [AI Agents, Career Development]
tags: [AI agents, Cursor, Grok, AgentMail, Next.js, portfolio, Fiverr, MCP, newsletter]
keywords: [personal AI agents, Cursor agents, Grok Bot, AgentMail, Next.js landing page, AI lead capture, Mason Prince, offensive security, AI engineering]
showToc: true
TocOpen: true
draft: false
---

I'm an offensive security engineer spending more of my week on AI, programming, and generalist shipping. This week I stopped treating the models like a smarter search box and ran them as a small fleet: a front-door "CEO" agent that hands work to specialist bots in Cursor and Grok.

Not a product launch. Not a 10x story. A list of artifacts that left the machine, plus the places automation died on contact with the real internet.

## The front door

The useful part was not a new model. It was a routing habit.

One agent owns the inbox of work — ship the pottery sample, rewrite the Fiverr gig, find the zombie subscriptions — and it is not allowed to do the specialist work itself. It delegates. Code goes to a Cursor agent. Copy and research go to a Grok bot. I stay in the loop for anything that spends money, deletes data, or talks to a customer.

If that sounds like a junior PM with extra steps, it is. The difference is I can spawn three specialists at once, and I have to write the approval rules down or they will invent their own.

## Cedar & Kiln: a real page, labeled as a sample

I wanted a public artifact I can send someone, not another "I could build that" paragraph.

[Cedar & Kiln](https://cedar-kiln-sample.vercel.app) is a Next.js landing page for a fictional Oak Cliff pottery studio. The page itself says it: **portfolio sample, not a client site**, invented address, do not show up. There is a demo AI inquiry widget on it — the lead-capture pattern I want to sell, sitting on a page that looks like a neighborhood studio instead of a component gallery.

That constraint mattered. Agents are happy to generate a generic SaaS hero. They are less happy when you make them write a studio that refuses to be a lifestyle brand. I had to keep sending them back to the brief.

## Fiverr: same packages, different offer

I retargeted my Fiverr gig toward the thing I just built: Next.js landing pages with AI lead capture. The packages are still Basic / Standard / Premium. The public gig is here:

[Build a responsive landing page for your business](https://www.fiverr.com/masonprince_93/build-a-responsive-landing-page-for-your-business)

I am a new seller. It is quiet so far. I am not going to invent order volume, reviews, or earnings to make this section look better. The useful change this week was the offer, not a dashboard screenshot.

## AgentMail: bots stay out of personal Gmail

Personal Gmail is a bad home for bots. They read threads they should not see, they draft from the wrong context, and I do not want a cleanup script anywhere near family mail.

I connected AgentMail and stood up a dedicated inbox: [mason-ceo@agentmail.to](mailto:mason-ceo@agentmail.to). That is the address the fleet uses. If a bot needs to send or receive, it happens there.

## Newsletter, without pretending RSS was missing

The site already had RSS. What it did not have was a public "email me when I write something worth sending" path.

There is a [/newsletter/](/newsletter/) page now. Subscribe by emailing [mason-ceo@agentmail.to](mailto:mason-ceo@agentmail.to?subject=Subscribe) with the subject **Subscribe**. Unsubscribe is the same address, subject **Unsubscribe**. Occasional notes, not a daily blast. Feeds are still at [/index.xml](/index.xml) and [/posts/index.xml](/posts/index.xml).

## Receipt forensics, with a numbered gate

I pointed an agent at personal AI-tool receipts. High level, not a spreadsheet dump: zombie charges on tools I had already stopped using, and a duplicate cloud-storage AI plan I was paying for twice under slightly different names.

The agent was good at the forensics — grouping charges, spotting the duplicate, drafting the cancel list. The part that mattered was the rule: **numbered approval before anything gets cancelled**. "Cancel the obvious ones" is how you kill the one subscription you still use. I made it print a numbered list and wait.

## Hard lessons I will not relearn

**Fiverr's PerimeterX "Press & Hold" challenge will stop an agent that thinks a marketplace is just a form.** Do not spend a week teaching a bot to click a bot wall. Do that part yourself.

**Do not one-shot a week of work into a single prompt and hope.** Iterate the brief until the specialist is boringly correct, then schedule the run. The first prompt is a draft of the task, not the task.

**Cleanup bots will delete with enthusiasm.** Never give delete — or cancel, or send — without a numbered approval step. Same rule as the receipt audit. I am not interested in learning this one twice.

## Reading list

Pieces I actually used as guardrails this week, not a dump of tabs.

- [Best practices for Claude Code](https://www.anthropic.com/engineering/claude-code-best-practices) — plan-then-implement, close the loop with a check the agent can run, and keep `CLAUDE.md` short enough that the model still obeys it. One-shot prompts skip this on purpose and then act surprised.
- [Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents) — Wilson Lin / Cursor, Jan 2026. Coordinating many concurrent agents. Flat lock-file coordination dies; planner/worker (plus a judge) is the pattern that holds. That is the front-door habit I am copying at personal scale.
- [Introducing the Codex app](https://openai.com/index/introducing-the-codex-app) — Codex as a multi-agent command center. One place to dispatch specialists instead of a pile of unrelated chat tabs.
- [MCP security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) — official checklist: OAuth done correctly, confused-deputy on proxy servers, least privilege. If a bot is going to hold tokens, start here.
- [MCP server security](https://generalanalysis.com/guides/mcp-server-security) — May 2026 threat model and supply-chain controls. Treat server install like a privileged dependency, not a chatbot plugin.
- [The next two years of software engineering](https://addyosmani.com/blog/next-two-years/) — Addy Osmani. T-shaped depth plus breadth beats niche-only and beats "pure generalist." Offsec plus shipping is the shape I want, not another title change.
- [Stop being skeptical about AI for development](https://newsletter.pragmaticengineer.com/p/stop-being-skeptical-about-ai-for) — Charity Majors via Pragmatic Engineer. Codegen got cheap; verification is the bottleneck. Numbered approval is the cheap version of that.
- [The Agent Development Lifecycle](https://blog.cloudflare.com/agent-development-lifecycle/) — agents have to own plan → deploy → maintain, not just codegen. A PR from Cursor is not a running system.

Still useful, shorter:

- [Stateless MCP has recaptured my interest](https://simonwillison.net/2026/Jul/31/stateless-mcp/) — Simon Willison. Stateless tools are easier to audit than handing an agent a raw shell.
- [There are no lossless transformations of natural-language text](https://simonwillison.net/2026/Aug/11/there-are-no-lossless-transformations-of-natural-language-text/) — Sophie Alpert, via Willison. Stand behind every sentence a model helped write.

## What this is, and isn't

None of this is a company. It is me using the same habit I use on web apps: assume the agent will do the most confident wrong thing unless you constrain it.

If you want the pottery sample, [it is live](https://cedar-kiln-sample.vercel.app). If you want the occasional note, the [newsletter page](/newsletter/) is up. If you want to talk shop about agent harnesses or the offsec-to-generalist path, you know where to find me.

---

**Want to talk shop?**

- **Email**: [mason-ceo@agentmail.to](mailto:mason-ceo@agentmail.to) (agent inbox) or [mason.a.prince@gmail.com](mailto:mason.a.prince@gmail.com)
- **X/Twitter**: [@MasePrace93](https://x.com/MasePrace93)
- **LinkedIn**: [masonaprince](https://www.linkedin.com/in/masonaprince/)
- **GitHub**: [masalepri98](https://github.com/masalepri98)

Cheers!
