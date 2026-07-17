# 🔱 Trident Flow™ — SAAS Product Blueprint
*A lightweight, blazing-fast, and simple alternative to GoHighLevel and Kajabi for digital product creators & affiliate marketers.*

---

## 🎯 The Core Vision
Most beginners fail because existing SAAS platforms (like GoHighLevel or Kajabi) are too bloated, slow, and expensive ($97–$297/month). 

**Trident Flow™** is a "Biz-in-a-Box" solution designed to get creators up and running in minutes with:
1. A premium, custom-coded, ultra-fast website hosted on Cloudflare (free monthly overhead).
2. A dead-simple CRM and lead capture database.
3. An integrated email marketer (using Brevo's background engine).
4. Automated tools to help them generate traffic on social media.

---

## 💵 Beta Launch Pricing Strategy
Targeting stayed-at-home moms and beginner creators who are price-sensitive:

* **Setup Fee**: **$299** (one-time)
  * *Includes*: Complete website customization, linking domain, importing lead capture popups, and setting up initial email automations.
* **Monthly Fee**: **$29/month**
  * *Includes*: Ultra-fast hosting, access to the custom admin dashboard, email sender engine, and basic customer support.
  * *Profit Margin*: ~100% (Since Cloudflare Pages, KV, and Brevo free tiers cost $0 to run at this scale).
* **Done-For-You SEO Upgrade (Upsell)**: **+$75** (one-time check-box)
  * *Includes*: Manual Google Search Console domain verification, sitemap submission, initial indexing request, and Google Analytics setup.

---

## 🛠️ Feature Roadmap

### Phase 1: Simplified CRM & Drip Sequences (Consolidated Dashboard)
* **Unified Funnels Tab**: Merge "Sales Funnels" and "Email Sequences" into a single, clean view in the admin panel.
* **Email Sequence Pills**: Show email nodes (Day 0, Day 1, Day 3...) directly inside the funnel cards.
* **Direct Email Editor**: Clicking an email pill opens a popup modal allowing the client to edit the subject line and body text. Saves instantly to the database.

### Phase 2: Dynamic Website Engine (Supabase / Cloudflare KV)
* **Database Integration**: Integrate **Supabase** (free tier PostgreSQL database & Auth) to store all product data, client accounts, and email templates.
* **Dynamic Homepage**: Rewrite the website homepage to fetch active product cards from the database on load, instead of hardcoding HTML.
* **"Add Product" Form**: Add a simple form in the dashboard where she can add a new product title, description, pricing, perks, and custom email sequence. The product card automatically appears on the homepage instantly.

### Phase 3: Built-in AI Traffic Generator
* **AI Social Media Planner**: An in-dashboard AI assistant powered by your master OpenAI API key. The client inputs their product details, and the AI generates 30 days of:
  * Instagram Reels & TikTok hooks.
  * Faceless video concepts & B-roll ideas.
  * Pinterest Pin descriptions and titles.
* **Simplified Metrics Board**: A simple stat card displaying:
  * Daily Page Visitors
  * Total Leads Captured
  * Conversion Rate %

### Phase 4: Auto-Sitemap & GSC Setup
* **Dynamic Sitemap**: The website dynamically updates and generates its `sitemap.xml` whenever a new product is added.
* **Google Verification Tool**: Simple DNS TXT verification helpers inside the dashboard, with a "Submit Sitemap" button for clients who do the setup themselves.

---

## 🖥️ Technology Stack
* **Frontend**: HTML5, Vanilla CSS, Javascript.
* **Hosting**: Cloudflare Pages (free, secure, globally distributed).
* **Database & Auth**: Supabase (PostgreSQL, free tier up to 50k users, easy visual tables).
* **Email Engine**: Brevo Transactional SMTP API (for delivering welcome templates and drip campaigns).
* **Scheduler**: External cron service (e.g. `cron-job.org` calling `/api/send-drip-emails` daily to trigger emails on delays).
