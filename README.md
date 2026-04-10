# n8n-nodes-glimpse

This is an [n8n](https://n8n.io/) community node. It lets you use [Glimpse](https://www.glimpsehq.io) in your n8n workflows.

Glimpse is a competitive intelligence platform that monitors your competitors across 20+ signal types - from blog posts and pricing changes to job postings, ad campaigns, tech stack updates, and more. This node lets you pull those signals into n8n workflows and trigger automations when new competitive activity is detected.

[n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Credentials

You need a Glimpse API key to authenticate:

1. Log into [Glimpse](https://app.www.glimpsehq.io)
2. Go to **Settings > Integrations**
3. Under **API Keys**, click **Create new key**
4. Give it a name (e.g. "n8n") and copy the key (starts with `glmp_`)
5. In n8n, create a new **Glimpse API** credential and paste the key

> The key is only shown once at creation. Store it securely.

| Field | Description |
|-------|-------------|
| API Key | Your `glmp_...` key from Glimpse settings |
| Base URL | Default: `https://app.www.glimpsehq.io`. Override for staging or self-hosted. |

## Operations

### Glimpse node

The Glimpse node supports reading competitors and signals.

**Competitor**

| Operation | Description |
|-----------|-------------|
| Get All | List all monitored competitors in your organization |
| Get | Retrieve a single competitor by ID |

**Signal**

| Operation | Description |
|-----------|-------------|
| Get All | Fetch competitive signals with optional filters |

Signal filters:

- **Competitor IDs** - comma-separated UUIDs to scope results
- **Signal Types** - filter by one or more of 23 signal types
- **Days** - only return signals from the last N days
- **Limit** - max results per request (up to 500)

### Glimpse Trigger node

The Glimpse Trigger node polls for new competitive signals and fires when new activity is detected.

| Field | Description |
|-------|-------------|
| Competitor IDs | Optional. Comma-separated UUIDs to watch. Leave empty for all. |
| Signal Types | Optional. Multi-select filter. Leave empty for all types. |

The trigger uses n8n's built-in polling interval (default: 5 minutes). On each poll, it fetches the latest signals and only emits ones that are newer than the last poll.

## Supported signal types

| Signal | Description |
|--------|-------------|
| blog_post | New blog article published |
| pricing_change | Pricing page updated |
| job_posting | New job listing detected |
| job_removed | Job listing taken down |
| tech_added | New technology detected in stack |
| tech_removed | Technology removed from stack |
| tech_stack_update | General stack change |
| news_mention | Competitor mentioned in the news |
| newsletter | Newsletter issue sent |
| ebook | New ebook or gated content |
| webinar | New webinar recording |
| webinar_upcoming | Upcoming webinar announced |
| linkedin_ad | New LinkedIn ad detected |
| social_post | Social media post |
| youtube_video | New YouTube video published |
| instagram_post | New Instagram post |
| facebook_post | New Facebook post |
| facebook_ad | New Facebook ad detected |
| google_ad | New Google ad detected |
| user_review | New user review on G2, Capterra, etc. |
| sitemap_update | Website sitemap changed |
| page_change | Monitored page content changed |
| leadership_change | Leadership team update |

## Example workflows

**Slack alert on pricing changes**
Glimpse Trigger (types: pricing_change) -> Slack: Send Message

**Weekly competitor digest to email**
Schedule (weekly) -> Glimpse: Get All Signals (days: 7) -> Gmail: Send Email

**Log new signals to Google Sheets**
Glimpse Trigger -> Google Sheets: Append Row

**Enrich with AI summary**
Glimpse Trigger -> OpenAI: Summarize -> Slack: Send Message

## Compatibility

- Minimum n8n version: **1.0.0**
- Tested with: n8n 1.x

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Glimpse website](https://www.glimpsehq.io)
- [Glimpse API documentation](https://www.glimpsehq.io/docs/api)

## License

[MIT](LICENSE)
