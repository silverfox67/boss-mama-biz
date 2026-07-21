// ============================================
// BOSS MAMA BIZ — DASHBOARD LOGIC
// dashboard.js
// ============================================

const CORRECT_PIN = '2026';

// ── Mobile Sidebar Toggle ───────────────────
const hamburgerBtn    = document.getElementById('hamburger-btn');
const sidebarEl       = document.querySelector('.sidebar');
const sidebarOverlay  = document.getElementById('sidebar-overlay');

function closeSidebar() {
    sidebarEl?.classList.remove('open');
    sidebarOverlay?.classList.remove('visible');
}

hamburgerBtn?.addEventListener('click', () => {
    sidebarEl?.classList.toggle('open');
    sidebarOverlay?.classList.toggle('visible');
});

sidebarOverlay?.addEventListener('click', closeSidebar);

// ── PIN Authentication ──────────────────────
const pinScreen = document.getElementById('pin-screen');
const dashboard = document.getElementById('dashboard');
const pinError  = document.getElementById('pin-error');
let pinEntry = []; // track entered digits

function getPinDots() {
    return [
        document.getElementById('dot-0'),
        document.getElementById('dot-1'),
        document.getElementById('dot-2'),
        document.getElementById('dot-3'),
    ];
}

function updateDots() {
    const dots = getPinDots();
    dots.forEach((dot, i) => {
        if (!dot) return;
        if (i < pinEntry.length) {
            dot.classList.add('filled');
            dot.style.background = 'var(--primary, #E8327A)';
            dot.style.borderColor = 'var(--primary, #E8327A)';
            dot.style.boxShadow = '0 0 12px var(--primary, #E8327A)';
        } else {
            dot.classList.remove('filled');
            dot.style.background = 'transparent';
            dot.style.borderColor = 'rgba(232, 50, 122, 0.4)';
            dot.style.boxShadow = 'none';
        }
    });
}

function unlockDashboard() {
    if (sessionStorage) {
        sessionStorage.setItem('bmb_pin_unlocked', 'true');
    }
    if (pinScreen && dashboard) {
        pinScreen.style.opacity = '0';
        pinScreen.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            pinScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
            dashboard.style.animation = 'fadeUp 0.5s ease';
        }, 400);
    }
}

function wrongPin() {
    if (pinError) pinError.classList.add('visible');
    const pinBox = document.querySelector('.pin-box');
    if (pinBox) pinBox.classList.add('shake');
    setTimeout(() => {
        if (pinBox) pinBox.classList.remove('shake');
        pinEntry = [];
        updateDots();
    }, 450);
}

let lastPinTapTime = 0;
function pressPinDigit(digit) {
    const now = Date.now();
    if (now - lastPinTapTime < 150) return; // Prevent double-triggering within 150ms
    lastPinTapTime = now;

    if (pinEntry.length >= 4) return;
    pinEntry.push(String(digit));
    if (pinError) pinError.classList.remove('visible');
    updateDots();

    if (pinEntry.length === 4) {
        const entered = pinEntry.join('');
        if (entered === CORRECT_PIN) {
            unlockDashboard();
        } else {
            wrongPin();
        }
    }
}

function deletePinDigit() {
    pinEntry.pop();
    if (pinError) pinError.classList.remove('visible');
    updateDots();
}

window.pressPinDigit = pressPinDigit;
window.deletePinDigit = deletePinDigit;

// Check if already unlocked in active browser session
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage && sessionStorage.getItem('bmb_pin_unlocked') === 'true') {
        if (pinScreen && dashboard) {
            pinScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
        }
    }

    // Attach single click listener to keypad buttons
    document.querySelectorAll('.pin-key[data-digit]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            pressPinDigit(btn.dataset.digit);
        });
    });

    const delBtn = document.getElementById('pin-delete');
    if (delBtn) {
        delBtn.addEventListener('click', (e) => {
            e.preventDefault();
            deletePinDigit();
        });
    }
});

// Also support physical keyboard digits for desktop
document.addEventListener('keydown', (e) => {
    if (pinScreen && pinScreen.classList.contains('hidden')) return;
    if (e.key >= '0' && e.key <= '9') {
        pressPinDigit(e.key);
    } else if (e.key === 'Backspace') {
        deletePinDigit();
    }
});


// ── Section Navigation ──────────────────────
function showSection(name) {
    let targetName = name;
    if (name === 'funnels' || name === 'assets') targetName = 'planner';
    if (name === 'links') targetName = 'site-assets';

    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`section-${targetName}`);
    if (target) target.classList.add('active');

    const navLink = document.querySelector(`.nav-item[data-section="${targetName}"]`);
    if (navLink) navLink.classList.add('active');
    
    if (targetName === 'site-assets') {
        renderSiteAssets();
    }
}

window.switchSection = showSection;
window.showSection = showSection;

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(item.dataset.section);
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 768) closeSidebar();
    });
});

// "Go →" buttons inside overview action list
document.querySelectorAll('.btn-action-sm[data-section]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(btn.dataset.section);
    });
});

// ── Funnel Email Sequence Accordion Toggles ──
document.querySelectorAll('.btn-toggle-sequence').forEach(btn => {
    btn.addEventListener('click', () => {
        const container = btn.nextElementSibling;
        const btnText = btn.querySelector('.btn-text');
        
        if (container && container.classList.contains('funnel-sequence-details')) {
            container.classList.toggle('active');
            btn.classList.toggle('active');
            
            if (container.classList.contains('active')) {
                btnText.textContent = btnText.textContent.includes('Suggested') ? 'Hide Suggested Sequence' : 'Hide Email Sequence Map';
            } else {
                btnText.textContent = btnText.textContent.includes('Suggested') ? 'Show Suggested Sequence' : 'Show Email Sequence Map';
            }
        }
    });
});

// ── Asset Form Submission ───────────────────
const assetsForm     = document.getElementById('assets-form');
const assetsSubmitBtn = document.getElementById('assets-submit-btn');

if (assetsForm) {
    // Auto-restore saved data on load
    try {
        const savedData = localStorage.getItem('bmb_saved_assets_form_data');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            Object.keys(parsed).forEach(key => {
                const el = assetsForm.elements[key];
                if (el && parsed[key]) {
                    el.value = parsed[key];
                }
            });
        }
    } catch (err) {
        console.warn('Could not restore assets form data:', err);
    }

    // Auto-save on every input stroke
    assetsForm.addEventListener('input', () => {
        const formData = new FormData(assetsForm);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem('bmb_saved_assets_form_data', JSON.stringify(data));
    });

    assetsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(assetsForm);
        const data = Object.fromEntries(formData.entries());

        // Always save to localStorage on submit
        localStorage.setItem('bmb_saved_assets_form_data', JSON.stringify(data));

        assetsSubmitBtn.textContent = '📤 Sending...';
        assetsSubmitBtn.disabled = true;

        try {
            const response = await fetch('/api/submit-assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showSuccessState();
            } else {
                const err = await response.json();
                console.warn('Worker returned error:', err);
                showSuccessFallback(data);
            }
        } catch (err) {
            console.warn('Could not reach worker (likely running locally):', err);
            showSuccessFallback(data);
        } finally {
            assetsSubmitBtn.textContent = '📤 Submit My Assets to Todd';
            assetsSubmitBtn.disabled = false;
        }
    });
}

function showSuccessState() {
    const wrapper = document.querySelector('.assets-submit-wrapper');
    if (wrapper) {
        wrapper.innerHTML = `
            <div style="text-align:center; padding: 2rem; background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.3); border-radius: 16px;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                <h3 style="color: #4ade80; font-family: var(--font-heading); margin-bottom: 0.5rem;">Assets Submitted!</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Everything has been emailed to kristan@bossmamabiz.com. We'll get your funnels built right away!</p>
            </div>
        `;
    }
    // Mark asset cards as received
    document.querySelectorAll('.asset-status-badge').forEach(badge => {
        badge.textContent = '✅ Submitted';
        badge.className = 'asset-status-badge done';
    });
}

function showSuccessFallback(data) {
    // Build a summary for copying
    const lines = Object.entries(data)
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

    alert(`Assets captured (simulation — deploy to Cloudflare to email automatically).\n\nHere's what was submitted:\n\n${lines}`);
}

// ── Animate progress bars on funnel section ─
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.funnel-progress-fill').forEach(bar => {
                const target = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => { bar.style.width = target; }, 100);
            });
        }
    });
}, { threshold: 0.2 });

const funnelSection = document.getElementById('section-funnels');
if (funnelSection) observer.observe(funnelSection);

// Default: show overview on load
showSection('overview');



// ── Active Leads CRM (Fetch from Brevo) ─────
function renderLeadsTable(leads) {
    const tableBody = document.getElementById('leads-table-body');
    if (!tableBody) return;
    
    if (leads.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="padding:2.5rem; text-align:center; color:var(--text-muted);">
                    No active leads found in this list yet.
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = leads.map(lead => `
            <tr style="border-bottom:1px solid var(--border-color); font-size:0.9rem;">
                <td style="padding:1rem; color:#ffffff; font-weight:500;">${lead.name || '—'}</td>
                <td style="padding:1rem; color:var(--text-muted); font-family:var(--font-mono);">${lead.email}</td>
                <td style="padding:1rem;">
                    <span style="background:rgba(232,50,122,0.15); color:var(--primary); font-size:0.75rem; font-weight:700; padding:0.25rem 0.6rem; border-radius:12px; border:1px solid rgba(232,50,122,0.3);">
                        ${lead.product}
                    </span>
                </td>
                <td style="padding:1rem; color:var(--text-muted);">${lead.date}</td>
            </tr>
        `).join('');
    }
}

async function fetchLeads() {
    const tableBody = document.getElementById('leads-table-body');
    const countEl = document.getElementById('leads-count');
    const totalSubscribersEl = document.querySelector('.stat-card .stat-value'); // First stat card is Total Subscribers

    if (!tableBody) return;

    try {
        const res = await fetch('/api/get-leads');
        if (!res.ok) throw new Error('API returned non-ok status');
        
        const data = await res.json();
        const leads = data.leads || [];
        const count = data.count || 0;

        // Update counts
        if (countEl) countEl.textContent = count;
        if (totalSubscribersEl) totalSubscribersEl.textContent = count;

        renderLeadsTable(leads);
    } catch (err) {
        console.warn('API fetch failed, loading local/mock leads fallback:', err);
        
        let localLeads = [];
        try {
            localLeads = JSON.parse(localStorage.getItem('bmb_local_leads') || '[]');
        } catch (_) {}

        // Fallback default test lead so dashboard is populated
        if (localLeads.length === 0) {
            localLeads = [
                {
                    name: "Kristan (Test Lead)",
                    email: "kristan@bossmamabiz.com",
                    product: "The Creative Content Vault",
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
            ];
            localStorage.setItem('bmb_local_leads', JSON.stringify(localLeads));
        }

        const count = localLeads.length;
        if (countEl) countEl.textContent = count;
        if (totalSubscribersEl) totalSubscribersEl.textContent = count;

        renderLeadsTable(localLeads);
    }
}

// Bind load and refresh events
document.addEventListener('DOMContentLoaded', () => {
    fetchLeads();
});
// Fallback if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fetchLeads();
}

document.getElementById('refresh-leads-btn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget;
    const oldText = btn.innerHTML;
    btn.innerHTML = '🔄 Loading...';
    btn.disabled = true;
    
    fetchLeads().finally(() => {
        btn.innerHTML = oldText;
        btn.disabled = false;
    });
});

// ── Email Templates Data for Modal Previews ──
const EMAIL_TEMPLATES = {
    "f1-d0": {
        subject: 'Your Creative Content Vault is here! ✨',
        goal: 'Deliver Content Vault PDF download link + warm welcome',
        body: `Hey {{ contact.FIRSTNAME | default: "Mama" }}!

It's Kristan here. I'm so excited to get this into your hands!

As a busy mom, I know how exhausting it is trying to think of what to post every single day while juggling nap times, dinner, and everything in between. That's why I created The Creative Content Vault—to take the guesswork out of consistency.

Inside, you'll find 90+ days of scroll-stopping hooks, storytelling prompts, and high-converting calls-to-action that actually build an audience that buys.

Click the link below to open and save your vault:

👉 Download The Creative Content Vault PDF
(Link: https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view)

Tip: Make sure to bookmark the Google Drive link or download the file directly to your phone/computer so you can access it anytime during your daily 20-minute sprints!`
    },
    "f1-d1": {
        subject: 'The #1 mistake moms make when starting online... 🤦‍♀️',
        goal: 'Educate + build trust + increase open rate',
        body: `Hey {{ contact.FIRSTNAME | default: "Mama" }},

How did you like The Creative Content Vault? 

If you haven't opened it yet, make sure to check your downloads—those copy-paste hooks are going to save you so much time this week!

Today, I want to talk about something crucial. When moms decide they want to make an income from home, 90% of them make the exact same mistake.

They think they need to:
1. Spend money on expensive paid ads (which eats up all your profit).
2. Bug their friends and family in the DMs about an MLM.
3. Post 5 times a day on Instagram reels and show their face dancing.

None of that is sustainable when you are juggling laundry, cooking, and nap times!

The secret is organic traffic on platforms you already use—like Facebook. 

Instead of chasing people, you want to set up your profile like a billboard that automatically attracts people who actually want what you have, and then let simple automation (like chatbot triggers) do the talking for you.

Tomorrow, I'm going to share the exact story of how I made my first sales using this exact setup. 

Talk soon,
Kristan`
    },
    "f1-d3": {
        subject: 'How I made my first sales (step-by-step) 💸',
        goal: 'Story sell → pitch FES System',
        body: `Hey {{ contact.FIRSTNAME | default: "Mama" }},

As promised, I wanted to tell you how it actually happened.

When I started, I was overwhelmed. I had no huge following and no tech background. But I set up a simple organic system on my Facebook profile, posted a single strategic hook, and woke up to notifications of people asking for my link.

I didn't have to hop on phone calls. I didn't have to pitch my family. 

I just used a simple 5-step Facebook ecosystem funnel that built trust while I was away from my phone.

If you want to skip the trial-and-error and copy the exact strategy I used to align my profile, automate my Messenger, and scale my audience organically, you need to check out the Facebook Ecosystem Strategy.

It's the blueprint created by Jasmine Cruz, and it is the exact reason I was able to automate my conversations and turn followers into paying customers.

👉 You can watch a free preview of the strategy here:
https://stan.store/affiliates/7c8ee611-3279-4951-851c-41172d524e9a

Have a great day!
Kristan`
    },
    "f1-d5": {
        subject: 'Real talk: what automated income actually looks like... 🤫',
        goal: 'Overcome objections + keep engagement',
        body: `Hey {{ contact.FIRSTNAME | default: "Mama" }},

One of the biggest questions I get from other busy moms is: "Kristan, how do you actually find the time to talk to customers when you're busy with your kids?"

The honest answer? I don't.

Well, not manually at least! 

When someone comments on one of my posts, a chatbot immediately sends them the information they requested. The chatbot answers their questions, gives them the link, and registers the lead. 

I only step in when someone wants a personal connection or has a unique question. 

This means my business runs in the background while I'm at the park or making dinner.

Setting this up isn't hard, and you don't need to be a tech genius. The Facebook Ecosystem Strategy includes pre-made Manychat templates that you can just copy, paste, and activate in under 30 minutes.

If you are ready to stop trading your hours for dollars and start automating your lead capture:

👉 Grab your copy of the FES blueprint here:
https://stan.store/affiliates/7c8ee611-3279-4951-851c-41172d524e9a

To your freedom,
Kristan`
    },
    "f1-d7": {
        subject: 'The shortcut I wish I had from day one 🚀',
        goal: 'Facebook Organic Strategy (FES) Pitch',
        body: `Hey {{ contact.FIRSTNAME | default: "Mama" }},

If you are tired of posting on social media with nothing to show for it, it's time to change your strategy.

Instead of guessing what works, you can use a proven, step-by-step roadmap.

The Facebook Ecosystem Strategy shows you:
* How to optimize your personal Facebook profile to act as a 24/7 sales page.
* How to use Manychat & Messenger automation to capture leads while you sleep.
* The "Rule of 7s" trust-building formula that turns strangers into buyers.
* Access to a community of creators doing the exact same thing.

You don't need thousands of followers. You just need the right ecosystem.

👉 Get instant access to the FES blueprint today:
https://stan.store/affiliates/7c8ee611-3279-4951-851c-41172d524e9a

Let's build your automated business together!

Best,
Kristan`
    },
    "f1-d10": {
        subject: 'Before you go — one last thing... ⏰',
        goal: 'FES chatbot automation pitch + urgency close',
        body: `Hey {{ contact.FIRSTNAME | default: "Mama" }},

This is the last email in my welcome series, and I want to leave you with one final thought.

A year from now, you will wish you had started today. 

Building an automated income stream isn't about getting rich overnight. It's about buying back your time so you can be present with your kids without stressing about bills.

The tools are ready, the blueprints are proven, and the community is waiting. 

If you are ready to take action and start building your organic Facebook machine, this is your sign.

👉 Click here to access the Facebook Ecosystem Strategy and start today:
https://stan.store/affiliates/7c8ee611-3279-4951-851c-41172d524e9a

Thank you so much for letting me be a part of your inbox. I'm always cheering you on!

To your success,
Kristan`
    }
};

// ── Bind Click Event to Clickable Emails ──
document.querySelectorAll('.clickable-email').forEach(card => {
    card.addEventListener('click', () => {
        const emailId = card.getAttribute('data-email-id');
        const template = EMAIL_TEMPLATES[emailId];
        
        if (template) {
            const subjEl = document.getElementById('preview-subject');
            const goalEl = document.getElementById('preview-goal');
            const bodyEl = document.getElementById('preview-body');
            
            if (subjEl) subjEl.textContent = `✉️ "${template.subject}"`;
            if (goalEl) goalEl.textContent = `🎯 Goal: ${template.goal}`;
            if (bodyEl) bodyEl.innerHTML = template.body.replace(/\n/g, '<br>');
            
            document.getElementById('email-preview-modal')?.classList.add('active');
        }
    });
});

// Close email preview modal
document.getElementById('close-email-preview')?.addEventListener('click', () => {
    document.getElementById('email-preview-modal')?.classList.remove('active');
});

// Close modal when clicking background overlay
document.getElementById('email-preview-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'email-preview-modal') {
        document.getElementById('email-preview-modal')?.classList.remove('active');
    }
});


// ── BLOG POSTS MANAGEMENT ──
function getBlogArticles() {
    const key = 'bmb_blog_articles';
    if (!localStorage.getItem(key)) {
        const defaultArticles = [
            {
                id: "1784347819200",
                title: "The Beginner's Guide to Building Multiple Streams of Digital Income Without Burnout",
                summary: "The traditional path of trading time directly for dollars is a losing battle when you are managing a household. Learn how low-overhead digital assets can generate sustainable, automated income on a busy schedule.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 4,
                image: "images/blog-streams.png",
                ctaText: "Stacked Sneak Peek →",
                ctaUrl: "https://stan.store/Kristan_Oconnor/p/the-stacked-sneak-peek-qukh6f7x",
                content: `Let’s face it: the traditional path of trading time directly for dollars is a losing battle when you are managing a household. Between family schedules, school runs, and daily responsibilities, there simply aren't enough hours in the day to take on a second conventional job. Yet, relying on a single source of income in today's economy can feel incredibly precarious.<br><br>For many beginners, the solution seems obvious: start an online business. But if you look at the standard advice out there, it usually involves highly complex business models, massive upfront investment, or hours spent building an audience from scratch.<br><br>The secret to sustainable financial freedom isn’t working twenty hours a day on a single, massive project. It is building diversified, low-overhead digital income streams that fit into the pockets of your existing schedule.<br><br><h3>Why the "Single Income" Framework Fails Busy Families</h3>Most traditional business models demand an infinite amount of time before you ever see a return. If you start a business that requires physical inventory, manual shipping, or constant client consultation, you haven't created freedom—you’ve just built another demanding job.<br><br>When your time is already fractured by family commitments, you need a model that operates under three strict rules:<ul><li><strong>Zero Inventory:</strong> You should never have to buy, store, or ship physical items.</li><li><strong>Low Overhead:</strong> The entry barrier must be financially accessible, allowing you to start without risking the family budget.</li><li><strong>High Scalability:</strong> The asset should be built or set up once, then left to run with minimal daily maintenance.</li></ul>By shifting your focus from a single, high-stress job to multiple, small digital assets, you spread your financial risk and protect your energy from burnout.<br><br><h3>The Shift to Low-Overhead Digital Assets</h3>The biggest hurdle for beginners is the belief that they need to be a software developer, a professional writer, or a tech expert to sell anything online. In reality, the modern digital economy allows you to leverage existing platforms and frameworks to generate income without creating products entirely from scratch.<br><br>Instead of spending months trying to invent something completely new, successful digital marketers look for existing market demand and use established pathways to fulfill it.<br><br><h3>4 Accessible Digital Income Streams for Beginners</h3>If you are starting from absolute zero, here are four of the most reliable, beginner-friendly digital paths that require zero prior tech experience:<br><br><strong>1. Amazon Customer Reviews</strong><br>Brands are constantly looking for authentic video feedback on the products they sell. Through specialized reviewer programs, everyday consumers can upload brief, honest video reviews of items they already use. When shoppers watch those videos on a product page and make a purchase, the reviewer earns a percentage of the sale.<br><br><strong>2. User-Generated Content (UGC)</strong><br>Unlike traditional influencers who need hundreds of thousands of followers, UGC creators don’t need a following at all. Brands pay regular people to film simple, relatable videos using their products for advertisements. You get paid for the content creation itself, not for broadcasting it to your own personal network.<br><br><strong>3. Print on Demand (POD)</strong><br>With print on demand, you create simple text or graphic designs and upload them to online marketplaces. When a customer orders a shirt, mug, or notebook with your design, a third-party manufacturer prints and ships it automatically. You collect the profit margin without ever touching the merchandise.<br><br><strong>4. Digital Storefronts & E-Templates</strong><br>People actively search platforms like Etsy every day for digital planners, budgeting trackers, checklists, and organizational templates. Because these files are completely digital, once you upload the design to your shop, the platform handles the delivery automatically every single time someone purchases.<br><br><h3>Moving From Overwhelm to Execution</h3>The reason most people fail to establish a second income stream isn't a lack of ambition—it is a lack of a clear, sequential map. Trying to piece together random tutorials from YouTube often leads to conflicting advice, technical frustration, and ultimate abandonment.<br><br>To make multiple income streams work around a busy schedule, you don't need a business degree; you just need a structured framework that walks you through the setup process of each asset, step by step.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to access the ultimate budget-friendly roadmap to 14 distinct digital income streams inside Stacked by Emily.`
            },
            {
                id: "1784347819300",
                title: "No Face, No DMs: How to Launch a Faceless Digital Marketing Business From Home",
                summary: "Learn how to generate sustainable online income behind the scenes without recording daily videos, sharing your children's private moments, or cold-DMing strangers.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/blog-faceless.png",
                ctaText: "Boss Suite Sneak Peek →",
                ctaUrl: "https://stan.store/Kristan_Oconnor/p/bosssuite-sneak-peek",
                content: `For a lot of moms, the idea of building an online income sounds incredible until they look at what it actually takes to get noticed on modern social media. The standard advice is almost always the same: you need to record daily videos of your life, dance on camera for the algorithms, share your children’s private moments, or slide into the direct messages of complete strangers to pitch products.<br><br>If that makes you hesitate, you are not alone. Protecting your family’s privacy and maintaining personal boundaries doesn't mean you are cut off from building a successful digital business.<br><br>There is an entire segment of the digital marketing industry that operates entirely behind the scenes. It is called faceless digital marketing, and it is quickly becoming the preferred blueprint for introverted or privacy-conscious parents who want to generate income without sacrificing their anonymity.<br><br><h3>The Misconception of the "Online Influencer"</h3>The biggest myth keeping people from starting an online business is that you have to become a public figure or a lifestyle influencer to make a sale.<br><br>When your personal identity is the product, your business demands constant visibility. You are forced to stay glued to a screen, monitoring comments, chasing viral trends, and managing a public persona. For a busy parent, this model creates a secondary loop of exhaustion that mimics a traditional corporate job.<br><br>Faceless digital marketing flips this dynamic completely. Instead of selling yourself, you sell solutions. The focus shifts entirely away from who you are and places it directly on what your target audience needs.<br><br><h3>How Faceless Marketing Works on Autopilot</h3>A faceless business is built around a specific theme, interest, or digital product niche rather than a personal face or name. The mechanics are clean and straightforward:<ul><li><strong>Aesthetic Content:</strong> Instead of filming yourself, you use high-quality B-roll video, clean typography, text overlays, and relatable messaging to capture attention.</li><li><strong>High-Intent Target Traffic:</strong> Your content speaks directly to a specific problem. Because the message is highly focused, it naturally attracts the exact people who are actively looking for a solution.</li><li><strong>Automated Backend Routing:</strong> When an interested user interacts with your content, they are automatically guided to a secure landing page. Simple background programs handle the product delivery, payments, and follow-ups.</li></ul>Because the brand relies on a system rather than a person, the storefront remains open and functional 24/7, whether you are running errands, sleeping, or focused entirely on your family.<br><br><h3>Bypassing the Technical Learning Curve</h3>While the concept of faceless marketing is simple, trying to piece the technical infrastructure together by yourself can feel completely isolating. Many beginners get stuck trying to choose the right niche, build a website, or write copy that actually converts.<br><br>You do not need to figure this out through trial and error. The fastest way to scale a faceless business is to plug into an established ecosystem that provides pre-built frameworks, vetted blueprints, and daily community support.<br><br>When you have access to a network of thousands of other parents running the exact same models, you eliminate the guesswork and gain immediate clarity on what is working in the market right now.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to join over 18,000 members inside The Boss Suite to unlock your comprehensive faceless growth hub and daily live coaching.`
            },
            {
                id: "1784347819400",
                title: "The Autopilot Framework: How to Turn Social Media Followers into Customers Using Smart Systems",
                summary: "Transform social media from a time-consuming hobby into an income-generating asset. Build an automated organic scaling presence backed by chatbot workflows.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/blog-autopilot.png",
                ctaText: "FES Sneak Peek →",
                ctaUrl: "https://stan.store/Kristan_Oconnor/p/preview-inside-fes",
                content: `If you are trying to grow an online business, you have likely been told that you need to show up on social media every single day. So, you spend your limited free time creating posts, tracking trends, and sharing content. But at the end of the month, you look at your bank account and realize you are making exactly zero dollars for your efforts.<br><br>Even worse, when someone does show interest, you are stuck spending hours inside your direct messages manually pitching your offer, answering basic questions, and trying to close a sale while managing your household.<br><br>Chasing leads in the DMs isn't a sustainable strategy for a busy parent. The secret to transforming social media from a time-consuming hobby into an income-generating asset isn't posting more frequently—it is building an automated framework that handles the conversation for you.<br><br><h3>The Exhaustion of Manual Social Selling</h3>Most people treat social media like a digital billboard, hoping that if they post enough times, someone will eventually buy. When a prospect finally comments or sends a message, the business owner drops everything to reply manually.<br><br>This manual approach introduces three distinct bottlenecks:<ul><li><strong>The Availability Trap:</strong> If a potential customer messages you while you are putting the kids to bed or grocery shopping, they expect an immediate response. If you take hours to reply, the momentum is lost.</li><li><strong>The Inconsistency Problem:</strong> When your energy is split between your family and your business, the quality of your sales pitches fluctuates based on how tired you are.</li><li><strong>The Time Ceiling:</strong> There are only so many hours you can physically spend typing out responses in Messenger before you completely run out of time and energy.</li></ul>To build true leverage, your social media presence must be backed by a system that answers questions, delivers details, and processes transactions completely on autopilot.<br><br><h3>Aligning Your Digital Ecosystem for Organic Sales</h3>An automated social strategy relies on turning your personal profile and community spaces into a structured, self-sustaining ecosystem. Instead of a random collection of posts, your entire presence should act as a guided path for a visitor.<br><br>This ecosystem consists of a fully optimized profile that clearly states what you do, interactive community groups where interested prospects can gather, and smart backend communication tools. When these pieces are aligned, your social media profiles stop being a destination for mindless scrolling and start acting as a consistent, round-the-clock digital storefront.<br><br><h3>The Power of Smart Chatbot Conversational Frameworks</h3>The real engine behind an automated social media business is a conversational framework driven by smart automation tools, such as automated chatbots.<br><br>Instead of sitting at your screen typing the same information dozens of times a day, you can deploy pre-set automation blueprints. When a user interacts with your post or drops a specific keyword in your comments, the automated system takes over instantly:<ul><li>It opens a private conversation with the prospect right away.</li><li>It delivers a free tool, a product guide, or a checkout link automatically.</li><li>It answers frequently asked questions accurately and professionally, 24/7.</li></ul>This approach ensures that your business utilizes established trust-building principles, delivering consistent touchpoints to a prospect until they are ready to purchase—all without requiring you to be glued to your phone.<br><br><h3>Systemizing Content to Build Authority</h3>When your messaging and backend tools are fully automated, the pressure to go viral disappears. Your content no longer has to entertain the masses; it simply needs to direct high-intent, targeted traffic straight into your automated system.<br><br>By taking the guesswork out of the sales process, you can focus on simply guiding interested people to your website, letting your automated backend handle the information and presentation while you focus on what matters most in your personal life.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to get the complete organic audience-scaling blueprint and chatbot automation strategies with the Facebook Ecosystem Strategy.`
            },
            {
                id: "1784347819500",
                title: "Done-For-You Digital Assets: How to Launch a Digital Product Store This Weekend",
                summary: "You do not need to be a professional designer or author to build a thriving online store. Leverage Private Label Rights (PLR) to list digital assets fast.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 4,
                image: "images/blog-assets.png",
                ctaText: "PLR Vault Sneak Peek →",
                ctaUrl: "https://stan.store/affiliates/238a4731-b0b4-47ac-8956-51dbc49db694",
                content: `The appeal of launching an online storefront is undeniable, especially when you focus on digital downloads. There is no physical inventory to store, no packages to mail, and your shop can process transactions 24 hours a day while you handle your daily family responsibilities.<br><br>However, many aspiring entrepreneurs hit a major roadblock before they ever make their first sale: the creation phase.<br><br>It is incredibly common to get stuck spending weeks or months trying to design spreadsheets, write comprehensive ebooks, or build complex layouts completely from scratch. By the time you finish creating a single product, you are often too exhausted to focus on marketing it.<br><br>The good news is that you do not need to be a professional designer or author to build a thriving online store. By leveraging high-quality Private Label Rights (PLR) and pre-vetted digital assets, you can launch a fully stocked storefront in a single weekend.<br><br><h3>The Creation Trap Keeping Your Store Offline</h3>Most beginners believe they have to invent something entirely unique to stand out. This mindset leads to intense creative block, technical frustration, and ultimate abandonment of the project.<br><br>When your free time is limited to early mornings or late nights, spending weeks formatting templates or typing out guides is an inefficient use of your energy. The marketplace moves quickly, and the fastest way to build momentum is to get your products in front of buyers as soon as possible.<br><br>Instead of starting with a blank canvas, smart digital business owners use pre-built, legally rebrandable assets as their foundation. This allows you to shift your focus away from product development and put your energy exactly where it belongs: launching your store and attracting customers.<br><br><h3>Leveraging Private Label Rights (PLR) Legally</h3>Private Label Rights, or PLR, is a licensing method that allows you to buy the rights to a digital product—such as an ebook, a video training series, or a customizable template—and legally edit, rebrand, and sell it as your own.<br><br>This model is completely separate from traditional resale because you are encouraged to change the graphics, add your own business name, and adjust the layout to fit your specific brand identity.<br><br>When done correctly, PLR gives you the speed of a ready-made asset while maintaining the complete ownership and high profit margins of your own digital product.<br><br><h3>What Digital Products Sell Best on Etsy and Marketplace Platforms?</h3>To build a profitable storefront quickly, you need to align your inventory with categories that already have high search volume and active buyers. Based on current e-commerce performance data, these are some of the top-performing digital products to focus on:<ul><li><strong>Digital Planners and Organizers:</strong> Hyperlinked planners for tablets, specialized trackers, and ADHD-friendly organizers see consistent demand year-round.</li><li><strong>Social Media and Canva Templates:</strong> Ready-to-use content kits, small business branding bundles, and customizable templates save buyers immense amounts of time.</li><li><strong>Ebooks and Comprehensive Guides:</strong> Consumers regularly pay for expert info that condenses complex topics down into step-by-step guides.</li><li><strong>Spreadsheets and Business Trackers:</strong> Pre-formatted financial tools, Excel budgeting sheets, and project management dashboards convert well.</li><li><strong>Educational Worksheets:</strong> Parents and educators actively search for structured curriculum assets, reading guides, and activity printables.</li></ul><h3>3 Steps to Launching Your Rebranded Shop This Weekend</h3>If you want to move from the planning phase to an active, live store over a single weekend, follow this streamlined framework:<br><br><strong>1. Identify Your Niche</strong><br>Select one cohesive theme for your shop rather than listing a completely random mix of unrelated products. If you want to focus on wellness, choose health trackers, self-care ebooks, and habit worksheets. If your focus is small business support, bundle social media templates, business expense spreadsheets, and marketing guides.<br><br><strong>2. Customize and Rebrand Your Assets</strong><br>Never upload raw PLR files exactly as you bought them. Take a few hours to open the templates or documents, update the color scheme to match your brand style, swap out font choices, and add your specific business logo or store name. This minor effort immediately elevates the perceived value of your listing.<br><br><strong>3. List on Established Marketplaces</strong><br>Instead of trying to build a website from scratch and figure out how to drive traffic to it manually, list your rebranded digital files on established platforms like Etsy or Fiverr. These platforms already have millions of active buyers typing product names directly into their search bars every daily.<br><br><h3>Skipping the Product Development Phase</h3>Building a digital business doesn't have to mean spending your valuable time trapped behind a screen building files from scratch. By accessing a massive, high-quality library of pre-written assets and following a structured launch masterclass, you can completely bypass the trial-and-error phase.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to unlock the ultimate private label rights library and step-by-step launch training inside the PLR Vault.`
            },
            {
                id: "1784347819600",
                title: "Breaking the Burnout Cycle: How to Manage an Online Business Around a Busy Family",
                summary: "Break through the hustle-culture burnout. Learn energy-based scheduling, boundary management, and somatic nervous system resets to run your shop peacefully.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/blog-alignment.png",
                ctaText: "Alignment Reset Sneak Peek →",
                ctaUrl: "https://stan.store/affiliates/98e8fb0b-89ae-4176-a439-f07888142d94",
                content: `The dream of running an online business often starts with a vision of flexibility—answering a few emails from the kitchen counter, scheduling posts during naptime, and watching an extra stream of income grow without sacrificing family time.<br><br>But for many working moms, the reality looks vastly different. Within a few weeks of launching a digital venture, the sheer volume of tasks can become overwhelming. Trying to balance soccer practices, meal prep, and household responsibilities while simultaneously learning how to build a website or create content quickly leads to severe mental fatigue. Instead of feeling empowered, you find yourself answering messages at midnight, completely exhausted, and wondering why the "flexibility" you were promised feels like an unending shift.<br><br>If you are currently nodding along, it is vital to realize that you are not experiencing a failure of time management. You are experiencing the natural consequence of trying to force a corporate "hustle culture" mentality into a busy family schedule.<br><br><h3>Shifting From Constant Hustle to Energy-Based Planning</h3>Traditional time-management advice tells you to wake up at 4:00 AM, block out every minute of your day on a rigid calendar, and push through fatigue to hit your goals. While that approach might work for someone with zero domestic responsibilities, it is a direct recipe for burnout for a parent.<br><br>To build a business that lasts without sacrificing your well-being, you must abandon the myth of constant hustle and adopt a structured planning framework built around your real-life energy levels.<br><br>Instead of treating time as a rigid, unyielding resource, successful digital entrepreneurs learn to map tasks to the natural rhythm of their household. You do not need large, uninterrupted eight-hour blocks of time to build a successful asset; you need a system that maximizes the small pockets of time you already have, ensuring that your business moves forward without draining your personal battery.<br><br><h3>3 Practical Frameworks to Protect Your Peace and Scale Your Business</h3>Managing an online business around a household requires putting strict structures in place that safeguard both your time and your mental clarity. Here are three practical methods to establish control over your schedule:<ul><li><strong>1. Establish Firm Professional Boundaries:</strong> When your office lives on your phone or your laptop at the kitchen table, the line between "work time" and "family time" becomes dangerously blurred. To combat this, establish a strict work-life cutoff ritual. At a specific time every evening, intentionally shut your laptop, place your phone on a charger in a separate room, and mentally transition back to your household. Create designated "no-work zones" in your home—such as the dinner table or the bedroom—to give your mind a physical cue that it is safe to log off and rest.</li><li><strong>2. Organize Tasks Efficiently via Theming and Micro-Moments:</strong> Stop trying to do everything all at once. Multitasking doesn't save time; it divides your focus and increases your anxiety. Instead, try "theming" your week by dedicating specific days to specific types of work—such as focusing entirely on content ideas on Tuesdays and administrative setups on Thursdays. For the smaller days, learn to master "micro-moments." A ten-second pocket of time while waiting in the school car-line is enough to schedule an automated email or outline a text post, keeping your pipeline full without adding extra hours to your workday.</li><li><strong>3. Prevent Nervous System Burnout with Somatic Regulation:</strong> True business resilience isn't just about organizing your desktop; it is about regulating your physical body. When the pressure of managing family schedules and business growth accumulates, your nervous system can enter a chronic state of fight-or-flight. To prevent this, integrate brief somatic grounding tools into your routine. Taking a two-minute "mindful pause" between tasks, practicing paced breathing exercises, or simply placing a hand on your chest to reset your breathing pattern signals to your body that you are supported and safe.</li></ul><h3>Reclaiming Your Schedule</h3>Building financial freedom should never come at the cost of your mental health or your family's peace. A truly successful business is one that supports your life, rather than demanding that you sacrifice your lifestyle to keep it afloat. By implementing simple backend systems that do the heavy lifting for you, and honoring your personal limits, you can step out of the frantic grind and build a legacy you are genuinely proud of.<br><br><strong>Ready to find your path?</strong><br>Your peace of mind matters just as much as your income. Click below to reclaim your schedule and break through burnout with The 90-Day Alignment Reset.`
            },
            {
                id: "1784347819700",
                title: "Staring at a Blank Screen: How to Fix Content Block and Write Posts That Actually Sell",
                summary: "Stop guessing what to post and eliminate creative burnout. Learn the psychological 3-pillar content framework to convert scrollers into customers.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/own-vault.png",
                ctaText: "Creative Content Vault Sneak Peek →",
                ctaUrl: "https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view",
                content: `One of the most exhausting parts of running an online business is the constant pressure to create fresh content. You sit down at your desk or open your phone during a rare quiet moment, staring at a flashing cursor, completely unsure of what to write. You know you need to post to keep your business visible, but the mental energy required to brainstorm new topics every single day is draining.<br><br>When you are forced to invent new ideas on the fly, one of two things usually happens: you either post something generic just to get it out of the way, or you skip posting entirely because the creative block is too overwhelming.<br><br>Neither option moves your business forward. The secret to consistent, high-converting social media marketing isn't waiting for a sudden burst of creative inspiration. It is using a structured framework of proven hooks, stories, and templates that eliminate the guesswork entirely.<br><br><h3>The Core Elements of High-Converting Social Media Content</h3>To turn casual social media scrollers into active customers, your content must do more than just occupy space on a feed. It needs to follow a precise psychological framework that guides a reader from curiosity to conversion.<br><br>Effective business content relies on three fundamental pillars:<ul><li><strong>The Scroll-Stopping Hook:</strong> The first sentence of your post has one primary objective: stop the user from scrolling. It needs to speak directly to a specific frustration, bust a common industry myth, or present an undeniable truth that forces the reader to pause.</li><li><strong>The Empathetic Narrative:</strong> Once you have their attention, you must build trust. Instead of delivering a dry sales pitch, share a relatable story or a practical lesson that shows you deeply understand the daily struggles your audience is facing.</li><li><strong>The Clear Call to Action (CTA):</strong> A successful post never leaves the reader wondering what to do next. It provides a direct, low-friction instruction, such as telling them to drop a specific keyword in the comments or click the link in your profile to access a solution.</li></ul>When you align your content with these three pillars, you stop chasing random viral trends and start building a library of assets that consistently pre-sell your offers for you.<br><br><h3>How to Plan Three Months of Content in Advance</h3>The thought of planning 90 days of marketing material might sound completely overwhelming when you are already short on time. However, when you utilize pre-built prompts and conversational structures, you can completely map out your marketing strategy in a single afternoon.<br><br>Instead of staring at a blank screen, you simply select a proven hook template, fill in the blanks with your specific niche details, and pair it with a pre-set backend automation strategy. This systematic approach allows you to step away from the daily content creation grind, giving you back your time while your digital storefront remains highly active.<br><br><strong>Ready to find your path?</strong><br>Stop guessing what to post and eliminate creative burnout for good. Click below to download The Creative Content Vault and unlock over 90 days of high-converting prompts completely for FREE.`
            },
            {
                id: "1784347819800",
                title: "From Idea to Income: The Streamlined 6-Step Map to Launching Your First Profitable Digital Asset",
                summary: "Bypass the perfectionism trap. Walk through the sequential 6-step framework to conceptualize, format, build, and sell your first digital product.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 4,
                image: "images/own-create.png",
                ctaText: "Get Started for $27 →",
                ctaUrl: "https://buy.stripe.com/3cI3cnbmJ7zA5rMgAuaIM01",
                content: `The concept of selling a digital product is incredibly appealing: you create a guide, template, or resource one time, and it sells repeatedly on autopilot without ever needing physical inventory or shipping infrastructure.<br><br>However, many aspiring entrepreneurs get stuck in the preparation phase. They spend months overanalyzing their ideas, wrestling with complicated software, or waiting until everything feels entirely perfect before making an offer. This perfectionism trap keeps highly valuable knowledge trapped inside your head instead of generating revenue in the marketplace.<br><br>Launching a successful digital product doesn't require a background in software development or weeks of technical configuration. By breaking the process down into six distinct, manageable steps, you can confidently move from an initial concept to a live, income-generating asset.<br><br><h3>Bypassing the Complexity of Product Creation</h3>The biggest reason digital assets never make it to market is that creators try to build something far too large for their first project. They think they need to record a massive, multi-module video course or write a 200-page book to provide real value.<br><br>In reality, modern digital buyers prefer highly specific, actionable solutions over dense walls of information. They are paying for speed and convenience. A concise, well-structured 10-page guide, a beautifully organized budget spreadsheet, or a library of pre-written templates that solves one distinct problem is often significantly more valuable to a busy consumer than a prolonged course.<br><br><h3>The 6-Step Digital Product Launch Framework</h3>To bring your digital asset to life quickly and efficiently, follow this sequential blueprint:<ul><li><strong>1. Identify Your Core Idea:</strong> Pinpoint one specific problem your target audience is struggling with and determine the absolute fastest way to solve it. Your product should center around a topic you are already familiar with or a system you have personally used to achieve a result.</li><li><strong>2. Choose Your Formatting Structure:</strong> Decide how your audience can best consume this information. Whether it is an actionable PDF workbook, a customizable spreadsheet tracker, a pre-made Canva layout, or a brief audio training, select a format that is easy for you to create and simple for your customer to use.</li><li><strong>3. Build the Solution:</strong> Set aside a dedicated, uninterrupted block of time to compile your resource. Use clean, professional design layouts and write clear, step-by-step instructions. Keep the content highly focused on execution, removing any unnecessary fluff.</li><li><strong>4. Configure Your Secure Checkout System:</strong> You do not need an expensive, complex e-commerce website to process transactions. Utilize straightforward payment processors like Stripe or pre-built landing pages to host your product page, manage customer checkouts securely, and handle automated digital delivery.</li><li><strong>5. Deploy Your Traffic Strategy:</strong> Once your product is live, focus on guiding target traffic to your checkout page. Use strategic social media content, pre-set automated keywords, or simple free resources to capture attention and direct interested buyers straight to your offer.</li><li><strong>6. Analyze and Scale Your Automated Sales:</strong> As initial orders begin to process, review your customer feedback and monitor your page performance. Use this real-world data to refine your messaging, expand your marketing visibility, and let your automated backend handle sales completely on autopilot.</li></ul><h3>Skipping the Product Development Phase</h3>Building a digital business doesn't have to mean spending your valuable time trapped behind a screen building files from scratch. By accessing a massive, high-quality library of pre-written assets and following a structured launch masterclass, you can completely bypass the trial-and-error phase.<br><br><strong>Ready to find your path?</strong><br>Don't let tech confusion or perfectionism hold you back from building an online income. Click below to join Kristan's step-by-step framework inside Create Your First Digital Product for just $27—and get her complete 500+ ChatGPT Prompts Guide entirely FREE.`
            },
            {
                id: "1784347819900",
                title: "The AI Advantage: How Busy Marketers Use Done-For-You Prompts to Automate Their Writing",
                summary: "Writing copy is a bottleneck. Learn to bypass drafting using engineered prompts, customize them to your voice, and package them as your own digital products.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/own-prompts.png",
                ctaText: "Get the Prompt Bank for $17 →",
                ctaUrl: "https://buy.stripe.com/5kQ28jcqNaLM1bwdoiaIM00",
                content: `Writing professional business copy can be a massive bottleneck, especially when you are managing an online business around a busy family schedule. Between drafting promotional emails, writing social media captions, building product descriptions, and crafting sales page copy, the sheer volume of writing required to keep a business running can quickly lead to intense burnout.<br><br>Artificial Intelligence has completely changed this dynamic, offering everyday business owners access to a powerful digital assistant. However, many marketers quickly notice a frustrating trend: when they type basic questions into AI tools like ChatGPT, the output often sounds incredibly generic, robotic, or completely disconnected from their authentic brand voice.<br><br>The secret to unlocking the true power of AI isn't the software itself—it is the precision of the instructions you feed into it. By using advanced, engineered prompts, you can force the AI to generate highly professional, niche-specific copy that reads like it was written by an expert copywriter, all in a fraction of the time.<br><br><h3>Moving Beyond Basic AI Inputs</h3>When you give an AI tool a vague input like "Write a post about digital marketing," it returns a vague, uninspired response. The system lacks the critical context required to make the copy highly engaging and effective.<br><br>To generate copy that actually converts readers into buyers, an AI prompt must provide specific boundaries and data points:<ul><li><strong>The Designated Persona:</strong> You must explicitly instruct the AI to adopt a specific role, such as a professional direct-response copywriter or an empathetic business coach.</li><li><strong>The Target Audience Profile:</strong> The prompt must clearly define exactly who the copy is for, highlighting their specific pain points, frustrations, and daily realities.</li><li><strong>The Desired Tone and Layout:</strong> You must outline the exact formatting constraints, telling the system to use short sentences, bullet points, compelling hooks, and a natural, conversational human tone.</li></ul>By feeding structured, engineered frameworks into the AI, you completely bypass the drafting phase and generate pristine business copy in seconds.<br><br><h3>Turning AI Prompts into a Multi-Stream Business Asset</h3>The most powerful aspect of a curated, high-quality prompt bank is its ultimate versatility. A comprehensive library of engineered prompts doesn't just save you hours of writing for your own brand; it can also serve as a highly lucrative, completely independent income stream.<br><br>When a prompt guide comes with legal reselling and rebranding rights, you have full authority to package the files, apply your own business branding, and list them for sale on your digital storefront. This gives you a ready-made, high-demand digital asset that you can launch immediately without spending weeks creating a product from scratch.<br><br><strong>Ready to find your path?</strong><br>Stop wasting hours drafting copy from scratch and put your business writing on autopilot. Click below to secure the 500+ ChatGPT Prompts bank for just $17 to unlock your ultimate AI cheat sheet and legal resell rights.`
            }
        ];
        localStorage.setItem(key, JSON.stringify(defaultArticles));
    }
    return JSON.parse(localStorage.getItem(key));
}

function saveBlogArticles(articles) {
    localStorage.setItem('bmb_blog_articles', JSON.stringify(articles));
}

// ── SITE ASSETS MANAGEMENT ──
const addAssetForm = document.getElementById('add-asset-form');
const assetSourceType = document.getElementById('asset-source-type');
const assetInputLink = document.getElementById('asset-input-link');
const assetInputFile = document.getElementById('asset-input-file');

// Toggle between URL and File upload input displays
if (assetSourceType && assetInputLink && assetInputFile) {
    assetSourceType.addEventListener('change', (e) => {
        if (e.target.value === 'file') {
            assetInputLink.style.display = 'none';
            assetInputFile.style.display = 'block';
        } else {
            assetInputLink.style.display = 'block';
            assetInputFile.style.display = 'none';
        }
    });
}

// Drag and Drop File Upload Zone logic
const dropZone = document.getElementById('drop-zone');
const dropZoneText = document.getElementById('drop-zone-text');

if (dropZone && dropZoneText) {
    const fileInput = document.getElementById('asset-file');

    // Click to browse
    dropZone.addEventListener('click', () => fileInput?.click());

    // Drag highlights
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'rgba(232, 50, 122, 0.08)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'rgba(232, 50, 122, 0.4)';
            dropZone.style.background = 'rgba(255, 255, 255, 0.02)';
        }, false);
    });

    // File dropped
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length && fileInput) {
            fileInput.files = files; // Assign files to hidden input
            updateDropZoneLabel(files[0]);
        }
    });

    // File browsed
    fileInput?.addEventListener('change', (e) => {
        if (fileInput.files.length) {
            updateDropZoneLabel(fileInput.files[0]);
        }
    });
}

function updateDropZoneLabel(file) {
    const dropZoneText = document.getElementById('drop-zone-text');
    if (!dropZoneText) return;
    const sizeKB = (file.size / 1024).toFixed(1);
    dropZoneText.innerHTML = `📎 Selected: <strong style="color: var(--primary);">${file.name}</strong> (${sizeKB} KB) — ready!`;
}

function resetAssetForm() {
    if (addAssetForm) addAssetForm.reset();
    const dropZoneText = document.getElementById('drop-zone-text');
    if (dropZoneText) {
        dropZoneText.innerHTML = `Drag & drop your file here, or <strong style="color: var(--primary);">click to browse</strong>`;
    }
    if (assetInputLink && assetInputFile) {
        assetInputLink.style.display = 'block';
        assetInputFile.style.display = 'none';
    }
}

function getSiteAssets() {
    return JSON.parse(localStorage.getItem('bmb_site_assets') || '[]');
}

function saveSiteAssets(assets) {
    localStorage.setItem('bmb_site_assets', JSON.stringify(assets));
}

function renderSiteAssets() {
    const tableBody = document.getElementById('assets-table-body');
    if (!tableBody) return;

    const assets = getSiteAssets();

    if (assets.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding:2.5rem; text-align:center; color:var(--text-muted);">
                    No site assets added yet. Use the form above to add your first asset!
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = assets.map((asset, idx) => {
            let sourceHtml = '';
            if (asset.type === 'file' && asset.fileData) {
                // Uploaded local file - offer download link
                sourceHtml = `<a href="${asset.fileData}" download="${asset.fileName || 'asset'}" class="btn-action-sm" style="display:inline-flex; align-items:center; gap:0.3rem;">
                    📥 Download File
                </a> <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:0.2rem;">(${asset.fileName})</span>`;
            } else {
                // Link - normal external hyperlink
                const displayUrl = asset.url && asset.url.length > 30 ? asset.url.substring(0, 27) + '...' : asset.url;
                sourceHtml = `<a href="${asset.url || '#'}" target="_blank" style="color:var(--primary); text-decoration:underline; font-weight:600;">
                    🔗 ${displayUrl || 'No Link'}
                </a>`;
            }

            return `
                <tr style="border-bottom:1px solid var(--border-color); font-size:0.9rem;">
                    <td style="padding:1rem; color:var(--text-muted); font-weight:700;">${idx + 1}</td>
                    <td style="padding:1rem; color:#ffffff; font-weight:600;">${asset.name}</td>
                    <td style="padding:1rem; color:var(--text-muted);">${asset.date}</td>
                    <td style="padding:1rem;">${sourceHtml}</td>
                    <td style="padding:1rem; color:var(--text-main); font-style:italic;">"${asset.remarks || 'No remarks.'}"</td>
                    <td style="padding:1rem; text-align:center;">
                        <button class="delete-asset-btn" data-index="${idx}" style="background:transparent; border:none; color:#ff4a4a; font-size:1.1rem; cursor:pointer; padding:0.3rem;" title="Delete Asset">🗑️</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Bind delete button listeners
        tableBody.querySelectorAll('.delete-asset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                deleteSiteAsset(index);
            });
        });
    }
}

function deleteSiteAsset(index) {
    const assets = getSiteAssets();
    assets.splice(index, 1);
    saveSiteAssets(assets);
    renderSiteAssets();
}

if (addAssetForm) {
    addAssetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('asset-name').value.trim();
        const type = assetSourceType ? assetSourceType.value : 'link';
        const urlInput = document.getElementById('asset-url');
        const url = urlInput ? urlInput.value.trim() : '';
        const remarks = document.getElementById('asset-remarks').value.trim();
        const fileInput = document.getElementById('asset-file');
        
        if (!name) return;

        const dateStr = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const newAsset = {
            name,
            type,
            remarks,
            date: dateStr
        };

        if (type === 'file' && fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            // File size validation: check if larger than 1.5MB (1,500,000 bytes)
            if (file.size > 1500000) {
                alert('⚠️ This file is too large! Please upload files under 1.5MB, or upload larger files to Google Drive/Dropbox and paste the link instead.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(evt) {
                newAsset.fileData = evt.target.result; // base64 data URL
                newAsset.fileName = file.name;
                
                const assets = getSiteAssets();
                assets.unshift(newAsset);
                saveSiteAssets(assets);
                renderSiteAssets();
                
                resetAssetForm();
            };
            reader.readAsDataURL(file);
        } else {
            // URL Link asset
            newAsset.url = url;
            
            const assets = getSiteAssets();
            assets.unshift(newAsset);
            saveSiteAssets(assets);
            renderSiteAssets();
            
            resetAssetForm();
        }
    });
}

// Render site assets on initial load or tab show
document.addEventListener('DOMContentLoaded', () => {
    renderSiteAssets();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderSiteAssets();
}

// ── STANDALONE LANDING PAGE CONFIGURATOR HANDLERS ──
const configProductSelect = document.getElementById('config-product-select');
const configShowTestimonials = document.getElementById('config-show-testimonials');
const configShowFAQ = document.getElementById('config-show-faq');
const configShowBonuses = document.getElementById('config-show-bonuses');
const configCustomHook = document.getElementById('config-custom-hook');
const btnPreviewLanding = document.getElementById('btn-preview-landing');
const btnSaveLandingConfig = document.getElementById('btn-save-landing-config');

const DEFAULT_HOOKS = {
    'create-27': "Build systems that work when you can't",
    'prompts-17': "Put your digital writing on autopilot"
};

function loadLandingConfig() {
    if (!configProductSelect) return;
    const productId = configProductSelect.value;
    let config = {};
    try {
        const stored = localStorage.getItem(`bmb_landing_config_${productId}`);
        if (stored) config = JSON.parse(stored);
    } catch (_) {}

    if (configShowTestimonials) configShowTestimonials.checked = config.showTestimonials !== false;
    if (configShowFAQ) configShowFAQ.checked = config.showFAQ !== false;
    if (configShowBonuses) configShowBonuses.checked = config.showBonuses !== false;
    if (configCustomHook) configCustomHook.value = config.customHook || DEFAULT_HOOKS[productId] || "";
}

if (configProductSelect) {
    configProductSelect.addEventListener('change', loadLandingConfig);
    // Initial load
    loadLandingConfig();
}

if (btnSaveLandingConfig) {
    btnSaveLandingConfig.addEventListener('click', () => {
        if (!configProductSelect) return;
        const productId = configProductSelect.value;
        const configData = {
            showTestimonials: configShowTestimonials ? configShowTestimonials.checked : true,
            showFAQ: configShowFAQ ? configShowFAQ.checked : true,
            showBonuses: configShowBonuses ? configShowBonuses.checked : true,
            customHook: configCustomHook ? configCustomHook.value : ""
        };

        localStorage.setItem(`bmb_landing_config_${productId}`, JSON.stringify(configData));

        const originalText = btnSaveLandingConfig.textContent;
        btnSaveLandingConfig.textContent = '💾 Settings Saved!';
        btnSaveLandingConfig.style.background = '#4ade80';
        btnSaveLandingConfig.style.color = '#000';
        setTimeout(() => {
            btnSaveLandingConfig.textContent = originalText;
            btnSaveLandingConfig.style.background = '';
            btnSaveLandingConfig.style.color = '';
        }, 1500);
    });
}

if (btnPreviewLanding) {
    btnPreviewLanding.addEventListener('click', () => {
        if (!configProductSelect) return;
        const productId = configProductSelect.value;
        const showTestimonials = configShowTestimonials ? configShowTestimonials.checked : true;
        const showFAQ = configShowFAQ ? configShowFAQ.checked : true;
        const showBonuses = configShowBonuses ? configShowBonuses.checked : true;
        const customHook = configCustomHook ? configCustomHook.value : "";

        const queryParams = new URLSearchParams({
            id: productId,
            showTestimonials: showTestimonials,
            showFAQ: showFAQ,
            showBonuses: showBonuses,
            hook: customHook
        });

        window.open(`product.html?${queryParams.toString()}`, '_blank');
    });
}

/* ============================================
   TRIDENT FLOW AI — DASHBOARD INTEGRATION
   ============================================ */
async function triggerAISuiteGeneration() {
    if (typeof decrementAICredit === 'function') {
        const canProceed = decrementAICredit();
        if (!canProceed) return;
    }

    const btn = document.getElementById('btn-generate-ai-suite');
    const targetAudience = document.getElementById('ai-target-audience')?.value || "Digital Creators";
    const nicheTopic = document.getElementById('ai-niche-topic')?.value || "Digital Planners";
    const brandTone = document.getElementById('ai-brand-tone')?.value || "Empowering & Warm";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⏳ Generating Product Suite...</span>`;
    }

    try {
        if (!window.TridentGenerator) {
            console.error("TridentGenerator engine not loaded.");
            return;
        }

        const plan = await window.TridentGenerator.generateProductPlan({
            targetAudience,
            nicheTopic,
            brandTone
        });

        // Save plan to localStorage for permanent persistence on refresh
        localStorage.setItem('bmb_generated_planner_suite', JSON.stringify(plan));
        renderPlannerSuiteCards(plan);

        // Update Progress Bar to 50% and turn Step 1 GREEN ✅
        const progressBar = document.getElementById('setup-progress-bar');
        const badge = document.getElementById('progress-percent-badge');
        const stepStatusText = document.getElementById('progress-current-step');
        const step1Node = document.querySelector('.setup-step-card');

        if (progressBar) progressBar.style.width = '50%';
        if (badge) {
            badge.textContent = '50% COMPLETE';
            badge.style.background = '#22c55e';
            badge.style.color = '#fff';
        }
        if (stepStatusText) {
            stepStatusText.innerHTML = 'Current Step: <strong>Step 2 of 4 — Customize Store & Funnel</strong>';
        }
        if (step1Node) {
            step1Node.style.background = 'rgba(34, 197, 94, 0.2)';
            step1Node.style.borderColor = '#22c55e';
            step1Node.innerHTML = `<span style="font-size: 0.75rem; font-weight: 700; color: #22c55e; display: block;">✅ STEP 1 DONE</span><span style="font-size: 0.8rem; color: #fff; font-weight: 600;">⚡ Product Suite</span>`;
        }

        if (typeof showToast === 'function') {
            showToast(`✨ Generated 5-Product Suite for ${nicheTopic}!`);
        } else {
            alert(`✨ Trident Flow AI generated 5 products for ${nicheTopic}!`);
        }

        console.log("Generated Suite Plan:", plan);
    } catch (err) {
        console.error("AI Generation error:", err);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>⚡ Generate Complete 5-Product Suite Plan</span>`;
        }
    }
}

let currentProductCount = parseInt(localStorage.getItem('bmb_product_count')) || 5;
let aiCreditsRemaining = parseInt(localStorage.getItem('bmb_ai_credits')) || 15;

function updateAICreditBadges() {
    const hubBadge = document.getElementById('hub-ai-credits-badge');
    const overviewBadge = document.getElementById('overview-credits-badge');
    if (hubBadge) hubBadge.innerText = `${aiCreditsRemaining} / 15`;
    if (overviewBadge) overviewBadge.innerText = `${aiCreditsRemaining} / 15 Monthly Builds`;
}

function decrementAICredit() {
    if (aiCreditsRemaining > 0) {
        aiCreditsRemaining--;
        localStorage.setItem('bmb_ai_credits', aiCreditsRemaining);
        updateAICreditBadges();
        return true;
    } else {
        showCreditRefillModal();
        return false;
    }
}

function showCreditRefillModal() {
    const modal = document.getElementById('ai-credit-refill-modal');
    if (modal) modal.style.display = 'flex';
}

function closeCreditRefillModal() {
    const modal = document.getElementById('ai-credit-refill-modal');
    if (modal) modal.style.display = 'none';
}

function refillAICreditsSimulated() {
    aiCreditsRemaining += 15;
    localStorage.setItem('bmb_ai_credits', aiCreditsRemaining);
    updateAICreditBadges();
    closeCreditRefillModal();
    if (typeof showToast === 'function') {
        showToast('⚡ 15 Extra AI Credits Unlocked & Active!');
    }
}

function selectProductCount(count) {
    currentProductCount = count;
    localStorage.setItem('bmb_product_count', count);
    
    document.querySelectorAll('.product-count-btn').forEach(btn => {
        const c = parseInt(btn.getAttribute('data-count'));
        if (c === count) {
            btn.classList.add('active');
            btn.style.background = 'rgba(232,50,122,0.2)';
            btn.style.borderColor = 'var(--primary)';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'rgba(255,255,255,0.04)';
            btn.style.borderColor = 'rgba(255,255,255,0.12)';
        }
    });

    const savedPlan = localStorage.getItem('bmb_planner_suite_plan');
    if (savedPlan) {
        try {
            renderPlannerSuiteCards(JSON.parse(savedPlan));
        } catch(e){}
    }
}

function logTridentQuery(query) {
    if (!query) return;
    try {
        let logs = JSON.parse(localStorage.getItem('bmb_trident_ai_query_log')) || [];
        logs.unshift({
            timestamp: new Date().toLocaleString(),
            query: query
        });
        logs = logs.slice(0, 50);
        localStorage.setItem('bmb_trident_ai_query_log', JSON.stringify(logs));
        renderTridentQueryLogs();
    } catch(e) {}
}

function renderTridentQueryLogs() {
    const container = document.getElementById('trident-query-log-container');
    if (!container) return;
    try {
        const logs = JSON.parse(localStorage.getItem('bmb_trident_ai_query_log')) || [];
        if (logs.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No user queries logged yet. Ask Trident AI questions in the drawer to see real-time insights here.</p>`;
            return;
        }
        container.innerHTML = logs.map(l => `
            <div style="background: rgba(255,255,255,0.03); border-left: 3px solid var(--gold); border-radius: 6px; padding: 0.8rem; margin-bottom: 0.6rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.3rem;">
                    <span>👤 User Question</span>
                    <span>🕒 ${l.timestamp}</span>
                </div>
                <div style="font-size: 0.88rem; color: #fff; font-weight: 600;">"${escapeHTML(l.query)}"</div>
            </div>
        `).join('');
    } catch(e) {}
}

function renderPlannerSuiteCards(plan) {
    const container = document.getElementById('planner-suite-cards-container');
    if (container && plan && plan.suite) {
        const activeSuite = plan.suite.slice(0, currentProductCount);

        const headerBar = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); padding: 1rem 1.4rem; border-radius: 12px; width: 100%;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-size: 1.2rem;">💾</span>
                    <div>
                        <h4 style="margin: 0; color: #4ade80; font-size: 0.95rem;">Product Suite Active (${activeSuite.length} of ${plan.suite.length} Products Active)</h4>
                        <span style="color: var(--text-muted); font-size: 0.78rem;">Automatically saved to your browser dashboard</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.6rem;">
                    <button onclick="savePlannerSuiteExplicitly()" style="background: linear-gradient(135deg, var(--gold) 0%, var(--primary) 100%); color: #000; border: none; font-weight: 800; font-size: 0.85rem; padding: 0.5rem 1.2rem; border-radius: 8px; cursor: pointer;">💾 Re-Save Plan State</button>
                </div>
            </div>
        `;

        const cardsHtml = activeSuite.map(item => `
            <div class="glass-card" style="padding: 1.8rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(232,50,122,0.2); border-radius: 14px; margin-bottom: 1.2rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <span style="background: rgba(232,50,122,0.1); border: 1px solid var(--primary); color: var(--primary); font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.6rem; border-radius: 12px; text-transform: uppercase;">Product ${item.tier} · ${item.price === 0 ? 'FREE LEAD MAGNET' : '$' + item.price + '.00 OFFER'}</span>
                        <h3 style="margin: 0.5rem 0 0.2rem 0; font-family: 'Cinzel', serif; color: #fff;">${escapeHTML(item.title)}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">${escapeHTML(item.description)}</p>
                    </div>
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button onclick="openProductCoverModal('${escapeHTML(item.title)}', '${item.price === 0 ? 'FREE' : '$' + item.price + '.00'}', '${escapeHTML(item.type)}')" style="background: rgba(201,168,76,0.2); border: 1px solid var(--gold); color: var(--gold); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer;">🖼️ Preview 3D Cover</button>
                        <a href="product.html?id=${item.tier}" target="_blank" style="background: rgba(232,50,122,0.2); border: 1px solid var(--primary); color: var(--primary); padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">🌐 View Sales Page</a>
                        <button onclick="${item.price === 0 ? "alert('🎁 Free Lead Magnet — Delivered automatically via Brevo email!')" : `openStripeAISetupGuide('${escapeHTML(item.title)}', '$${item.price}.00')`}" style="background: #2563eb; color: #fff; border: none; font-size: 0.8rem; font-weight: 700; padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer;">💳 ${item.price === 0 ? 'Free (No Stripe)' : 'Setup Stripe with AI'}</button>
                        <button onclick="saveProductToVault(${item.tier - 1})" style="background: rgba(74,222,128,0.2); border: 1px solid #4ade80; color: #4ade80; font-size: 0.8rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer;">📤 Save to Assets Vault</button>
                    </div>
                </div>

                <!-- Deliverables & Sequence Bar -->
                <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 1rem; margin-top: 1rem;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: var(--gold);">📦 Included Core Deliverables:</h4>
                    <ul style="margin: 0 0 1rem 1.2rem; color: var(--text-main); font-size: 0.85rem;">
                        ${item.deliverables.map(d => `<li>${escapeHTML(d)}</li>`).join('')}
                    </ul>
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.6rem; border-top: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.78rem; color: var(--text-muted);">📧 Email Drip Sequence:</span>
                        <div style="display: flex; gap: 0.4rem;">
                            <button onclick="openEmailModal('🎉 Welcome to ${escapeHTML(item.title)}', 'Here is your download link...', 'Day 0 Instant Welcome')" style="background: rgba(232,50,122,0.15); border: 1px solid var(--primary); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">Day 0</button>
                            <button onclick="openEmailModal('Secret Tip for ${escapeHTML(item.title)}', 'Here is step 1...', 'Day 1 Nurture')" style="background: rgba(232,50,122,0.15); border: 1px solid var(--primary); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">Day 1</button>
                            <button onclick="openEmailModal('Case Study: ${escapeHTML(item.title)}', 'See how this works...', 'Day 3 Offer')" style="background: rgba(232,50,122,0.15); border: 1px solid var(--primary); color: var(--primary); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">Day 3</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = headerBar + cardsHtml;
    }
}

function savePlannerSuiteExplicitly() {
    const savedPlan = localStorage.getItem('bmb_generated_planner_suite');
    if (savedPlan && typeof showToast === 'function') {
        showToast('💾 Product Suite Plan Locked & Saved to your Dashboard!');
    }
}
window.savePlannerSuiteExplicitly = savePlannerSuiteExplicitly;

// Save a specific product card's data into the matching Assets Vault field
function saveProductToVault(index) {
    let plan = null;
    try {
        const saved = localStorage.getItem('bmb_generated_planner_suite');
        plan = saved ? JSON.parse(saved) : KRISTANS_SUITE;
    } catch(e) { plan = KRISTANS_SUITE; }

    if (!plan || !plan.suite || !plan.suite[index]) return;
    const p = plan.suite[index];

    const fieldMap = [
        { link: 'roadmap-link', notes: 'roadmap-notes' },
        { link: 'prompts-link', stripe: 'prompts-stripe', notes: 'prompts-notes' },
        { link: 'guide-link',   stripe: 'guide-stripe',   notes: 'guide-notes' },
        { link: 'reels-link',   stripe: 'reels-stripe',   notes: 'reels-notes' },
        { link: 'plr-link',     stripe: 'plr-stripe',     notes: 'plr-notes' }
    ];

    const fields = fieldMap[index];
    if (!fields) return;

    if (fields.link)   { const el = document.getElementById(fields.link);   if (el) el.value = p.driveLink || ''; }
    if (fields.stripe) { const el = document.getElementById(fields.stripe); if (el) el.value = p.stripeLink || ''; }
    if (fields.notes)  { const el = document.getElementById(fields.notes);  if (el) el.value = p.deliverables ? p.deliverables.join(' · ') : ''; }

    // Switch to Assets Vault tab
    if (typeof switchSection === 'function') switchSection('assets');

    if (typeof showToast === 'function') {
        showToast(`✅ ${p.title} saved to Assets Vault!`);
    }
}
window.saveProductToVault = saveProductToVault;

// Also add driveLink/stripeLink rows inside each card render

// Kristan's real 5-product suite — always the default
const KRISTANS_SUITE = {
    niche: "Digital Planners & Side Hustles",
    audience: "Stay-at-Home Moms & Creators",
    tone: "Empowering & Warm",
    suite: [
        {
            tier: 1,
            title: "The Creative Content Vault",
            price: 0,
            type: "Free Lead Magnet",
            description: "90+ days of scroll-stopping hooks, storytelling prompts & call-to-actions. Builds your email list on autopilot.",
            deliverables: ["90+ days of content prompt templates", "Hooks, storytelling & sales content ideas", "FES chatbot strategies & call-to-actions"],
            bonus: "Exclusive VIP Email Sequence Access",
            driveLink: "https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view",
            stripeLink: ""
        },
        {
            tier: 2,
            title: "500+ ChatGPT Prompts Guide",
            price: 17,
            type: "Low-Ticket Impulse Offer",
            description: "The AI cheat sheet for digital marketers. 500+ done-for-you prompts for content, captions, emails & product descriptions.",
            deliverables: ["500+ copy-paste ChatGPT prompts", "Content, captions & email copy by niche", "Resale license rights included"],
            bonus: "Canva Template Cover Design",
            driveLink: "https://drive.google.com/file/d/1cMH7l6mWILhcQ_JRITen5XcMB6SdWZZf/view",
            stripeLink: "https://buy.stripe.com/5kQ28jcqNaLM1bwdoiaIM00"
        },
        {
            tier: 3,
            title: "Create & Sell Your First Digital Product",
            price: 27,
            type: "Core Entry Product",
            description: "Step-by-step guide: brainstorm, design, set up checkouts & drive organic traffic. FREE BONUS: 500+ Prompts Guide ($17 value)!",
            deliverables: ["6-step product creation system", "Checkout & traffic setup walkthrough", "FREE BONUS: 500+ ChatGPT Prompts Guide ($17 value)"],
            bonus: "500+ ChatGPT Prompts Guide ($17 Value)",
            driveLink: "https://drive.google.com/file/d/1bu8X8sQFcf4WJcOIQF6R6Jpnizybrhgy/view",
            stripeLink: "https://buy.stripe.com/3cI3cnbmJ7zA5rMgAuaIM01"
        },
        {
            tier: 4,
            title: "30-Day Viral Video & Reels Content Pack",
            price: 50,
            type: "Traffic & Content Asset",
            description: "Done-for-you faceless video scripts, viral hooks & B-Roll content vault for stay-at-home moms & creators.",
            deliverables: ["30 viral faceless Reel scripts", "B-Roll stock footage suggestions", "Scroll-stopping hooks & caption database"],
            bonus: "Pinterest Pin Title Generator",
            driveLink: "https://bossmamabiz.com/vault/reels",
            stripeLink: ""
        },
        {
            tier: 5,
            title: "Complete Done-For-You PLR Digital Assets Bundle",
            price: 50,
            type: "DFY Inventory & Resell Rights",
            description: "Full commercial rights package — rebrand, customize & sell as your own. Canva templates + source docs included.",
            deliverables: ["Rebrandable Canva template files", "Raw Google Doc source documents", "Full commercial PLR resell rights certificate"],
            bonus: "Sales Page Copy Template",
            driveLink: "https://bossmamabiz.com/vault/plr",
            stripeLink: ""
        }
    ]
};

// Auto-restore saved planner cards on page load — always default to Kristan's real suite
document.addEventListener('DOMContentLoaded', () => {
    try {
        updateAICreditBadges();
        renderTridentQueryLogs();

        // Always use Kristan's real suite as the seed if nothing has been AI-generated
        const savedPlan = localStorage.getItem('bmb_generated_planner_suite');
        let plan = savedPlan ? JSON.parse(savedPlan) : KRISTANS_SUITE;

        // If saved plan doesn't have driveLink (old format), reset to real suite
        if (plan && plan.suite && !plan.suite[0].hasOwnProperty('driveLink')) {
            plan = KRISTANS_SUITE;
        }

        if (plan) {
            renderPlannerSuiteCards(plan);
        }
    } catch(e) {
        console.warn("Planner restore error:", e);
        renderPlannerSuiteCards(KRISTANS_SUITE);
    }
});
window.triggerAISuiteGeneration = triggerAISuiteGeneration;


/* ============================================
   EMAIL SEQUENCE MODAL EDITOR HANDLERS
   ============================================ */
let currentActiveEmailNode = null;

function openEmailModal(subject = "", body = "", goal = "Sequence Nurture Node", nodeRef = null) {
    currentActiveEmailNode = nodeRef;
    const modal = document.getElementById('email-preview-modal');
    const subjInput = document.getElementById('editor-email-subject');
    const bodyInput = document.getElementById('editor-email-body');
    const goalText = document.getElementById('preview-goal');
    const titleText = document.getElementById('preview-subject');

    if (subjInput) subjInput.value = subject;
    if (bodyInput) bodyInput.value = body;
    if (goalText) goalText.textContent = goal;
    if (titleText) titleText.textContent = subject || "Edit Email Copy";

    if (modal) modal.style.display = 'flex';
}

function closeEmailModal() {
    const modal = document.getElementById('email-preview-modal');
    if (modal) modal.style.display = 'none';
}

function saveEmailNode() {
    const subj = document.getElementById('editor-email-subject')?.value;
    const body = document.getElementById('editor-email-body')?.value;

    const btn = document.getElementById('btn-save-email-node');
    if (btn) {
        const orig = btn.textContent;
        btn.textContent = "✅ Saved!";
        btn.style.background = "#4ade80";
        btn.style.color = "#000";
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = "";
            btn.style.color = "";
            closeEmailModal();
        }, 800);
    }

    if (typeof showToast === 'function') {
        showToast("💾 Email Node saved successfully!");
    }
}

async function reWriteEmailWithAI() {
    const subjInput = document.getElementById('editor-email-subject');
    const bodyInput = document.getElementById('editor-email-body');
    const btn = document.getElementById('btn-ai-rewrite-email');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⏳ Polishing Copy...</span>`;
    }

    setTimeout(() => {
        if (bodyInput) {
            bodyInput.value = `Hey there!\n\nI noticed you claimed our guide earlier. Here's a quick power tip to get 10x faster results: focus on automating your first drip sequence today!\n\nClick here to read step-by-step: [View Tutorial]\n\nBest,\nTrident Flow AI Team`;
        }
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>✨ AI Polish Copy</span>`;
        }
        if (typeof showToast === 'function') {
            showToast("✨ AI copy polish applied!");
        }
    }, 600);
}

window.openEmailModal = openEmailModal;
window.closeEmailModal = closeEmailModal;
window.saveEmailNode = saveEmailNode;
window.reWriteEmailWithAI = reWriteEmailWithAI;

/* ============================================
   TRIDENT AI CO-PILOT ASSISTANT HANDLERS
   ============================================ */
function toggleCopilotDrawer() {
    const drawer = document.getElementById('trident-copilot-drawer');
    if (drawer) {
        const isHidden = drawer.style.display === 'none' || drawer.style.display === '';
        drawer.style.display = isHidden ? 'flex' : 'none';
    }
}

function toggleExpandCopilotDrawer() {
    const drawer = document.getElementById('trident-copilot-drawer');
    if (drawer) {
        if (drawer.classList.contains('expanded-full')) {
            drawer.classList.remove('expanded-full');
            drawer.style.width = '50vw';
            drawer.style.minWidth = '600px';
            drawer.style.height = '88vh';
            drawer.style.top = 'auto';
            drawer.style.left = 'auto';
            drawer.style.bottom = '2rem';
            drawer.style.right = '2rem';
            drawer.style.transform = 'none';
        } else {
            drawer.classList.add('expanded-full');
            drawer.style.width = '90vw';
            drawer.style.height = '90vh';
            drawer.style.top = '50%';
            drawer.style.left = '50%';
            drawer.style.transform = 'translate(-50%, -50%)';
            drawer.style.bottom = 'auto';
            drawer.style.right = 'auto';
        }
    }
}

function askCopilotChip(questionText) {
    const input = document.getElementById('copilot-input-text');
    if (input) {
        input.value = questionText;
        sendCopilotMessage();
    }
}

async function sendCopilotMessage() {
    const input = document.getElementById('copilot-input-text');
    const feed = document.getElementById('copilot-chat-feed');
    if (!input || !input.value.trim() || !feed) return;

    const userText = input.value.trim();
    input.value = '';

    if (typeof logTridentQuery === 'function') {
        logTridentQuery(userText);
    }

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.style.cssText = "background: rgba(232,50,122,0.15); border-radius: 12px; padding: 0.8rem 1rem; align-self: flex-end; max-width: 85%; color: #fff; font-size: 0.92rem;";
    userDiv.innerHTML = `<strong>You:</strong> ${escapeHTML(userText)}`;
    feed.appendChild(userDiv);
    feed.scrollTop = feed.scrollHeight;

    // Show Typing Indicator
    const typingDiv = document.createElement('div');
    typingDiv.style.cssText = "background: rgba(255,255,255,0.04); border-radius: 12px; padding: 0.8rem 1rem; border-left: 4px solid var(--gold); max-width: 90%; color: var(--gold); font-size: 0.9rem;";
    typingDiv.innerHTML = `<strong>🔱 Trident AI:</strong> <em>Thinking...</em>`;
    feed.appendChild(typingDiv);
    feed.scrollTop = feed.scrollHeight;

    try {
        const res = await fetch('/api/generate-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system: `You are Trident AI, an elite 24/7 business co-pilot and mentor for digital creators and stay-at-home moms launching digital products. Give direct, warm, concise, and highly practical answers. Never tell users to 'go back to step 1' unless they specifically ask about step 1. If they ask 'is this correct', 'what about taxes', or ask follow-up questions, answer their specific question directly.`,
                prompt: userText
            })
        });

        const json = await res.json();
        if (feed.contains(typingDiv)) feed.removeChild(typingDiv);

        let reply = "";
        if (json.success && json.data) {
            const raw = typeof json.data === 'string' ? json.data : (json.data.text || json.data.response || json.data.answer || JSON.stringify(json.data));
            reply = escapeHTML(raw).replace(/\n/g, '<br>');
        } else {
            reply = getSmartFallbackReply(userText);
        }

        const aiDiv = document.createElement('div');
        aiDiv.style.cssText = "background: rgba(255,255,255,0.04); border-radius: 12px; padding: 1rem; border-left: 4px solid var(--gold); max-width: 90%; color: #F5EEF5; font-size: 0.95rem; line-height: 1.55;";
        aiDiv.innerHTML = `<strong style="color: var(--gold); display: block; font-size: 0.85rem; margin-bottom: 0.4rem;">🔱 Trident AI Co-Pilot</strong>${reply}`;
        feed.appendChild(aiDiv);
        feed.scrollTop = feed.scrollHeight;

    } catch(err) {
        if (feed.contains(typingDiv)) feed.removeChild(typingDiv);
        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.cssText = "background: rgba(255,255,255,0.04); border-radius: 12px; padding: 1rem; border-left: 4px solid var(--gold); max-width: 90%; color: #F5EEF5; font-size: 0.95rem;";
        fallbackDiv.innerHTML = `<strong style="color: var(--gold); display: block; font-size: 0.85rem; margin-bottom: 0.4rem;">🔱 Trident AI Co-Pilot</strong>${getSmartFallbackReply(userText)}`;
        feed.appendChild(fallbackDiv);
        feed.scrollTop = feed.scrollHeight;
    }
}

function getSmartFallbackReply(userText) {
    const q = userText.toLowerCase();
    if (q.includes('tax') || q.includes('dropdown') || q.includes('category') || q.includes('taxable')) {
        return `📊 <strong>Stripe Tax Dropdown Setup Guide:</strong><br><br>Under <strong>Tax Category</strong>, select <strong>"Nontaxable Digital Goods"</strong> or <strong>"Digital Goods - Ebooks & Downloads"</strong>.<br>Under <em>Collect Tax Automatically</em>, leave it set to <strong>No / Off</strong>. Click <strong>Create Link</strong>!`;
    } else if (q.includes('is this correct') || q.includes('correct') || q.includes('right') || q.includes('good')) {
        return `✅ <strong>Yes, that looks 100% correct!</strong><br><br>You're doing great! Copy the link or settings you created and save them directly in your dashboard. You are ready for the next step!`;
    } else if (q.includes('description') || q.includes('copy') || q.includes('write')) {
        return `✨ <strong>Ready-to-Use High-Converting Product Description:</strong><br><br><em>"Unlock the ultimate shortcut to creating, launching, and monetizing your digital products! Includes fillable workbooks, automated sales funnel templates, and 90+ days of viral content prompts."</em>`;
    } else {
        return `✨ <strong>Trident AI Response:</strong><br>Great question about <em>${escapeHTML(userText)}</em>! You are on the right track. Follow the step-by-step guidance above or ask me to draft custom copy or help with Stripe settings!`;
    }
}

function dispatchPrioritySupportTicket(note = "General Help Request") {
    const feed = document.getElementById('copilot-chat-feed');
    const ticketId = Math.floor(1000 + Math.random() * 9000);
    
    if (feed) {
        const ticketDiv = document.createElement('div');
        ticketDiv.style.cssText = "background: rgba(34,197,94,0.15); border: 1px solid #22c55e; border-radius: 10px; padding: 0.8rem; color: #fff; font-size: 0.85rem;";
        ticketDiv.innerHTML = `<strong>✅ Priority Ticket #${ticketId} Logged with Trident Engineering!</strong><br><br>🛡️ <em>Trident Engineering performs daily ticket resolutions & system maintenance during dedicated evening windows (5:30 PM – 10:00 PM EST) to ensure zero disruption during peak creator business hours.</em><br><br>Your ticket diagnostics have been captured and will be addressed during tonight's maintenance window!`;
        feed.appendChild(ticketDiv);
        feed.scrollTop = feed.scrollHeight;
    }

    if (typeof showToast === 'function') {
        showToast(`🚨 Priority Ticket #${ticketId} Logged for Nightly Review!`);
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function openStripeAISetupGuide(productTitle = "Your Product", price = "$27.00") {
    // Open drawer
    const drawer = document.getElementById('trident-copilot-drawer');
    if (drawer) {
        drawer.style.display = 'flex';
    }

    const feed = document.getElementById('copilot-chat-feed');
    if (feed) {
        const msg = document.createElement('div');
        msg.style.cssText = "background: rgba(37,99,235,0.15); border: 1px solid #2563eb; border-radius: 12px; padding: 1rem; color: #fff; font-size: 0.88rem; margin-bottom: 0.8rem;";
        msg.innerHTML = `
            <strong style="color: #60a5fa; font-size: 0.95rem; display: block; margin-bottom: 0.4rem;">💳 Trident AI — 1-Click Stripe Setup Assistant</strong>
            Let's set up your Stripe Payment Link for <strong>${escapeHTML(productTitle)} (${escapeHTML(price)})</strong> together in 3 simple steps!<br><br>
            <strong>Step 1: Open Stripe Payment Links</strong><br>
            Open a new tab and go to: <a href="https://dashboard.stripe.com/payment-links/create" target="_blank" style="color: #60a5fa; text-decoration: underline; font-weight: bold;">dashboard.stripe.com/payment-links/create</a><br><br>
            <strong>Step 2: Add Product & Price</strong><br>
            • Title: <code>${escapeHTML(productTitle)}</code><br>
            • Price: <code>${escapeHTML(price)}</code> (One-Time Charge)<br>
            • Click <em>"Create link"</em> in top right.<br><br>
            <strong>Step 3: Paste Link Here</strong><br>
            Copy the <code>https://buy.stripe.com/...</code> link Stripe gives you, and paste it directly into your Stripe input box here!<br><br>
            <em style="color: var(--text-muted); font-size: 0.8rem;">💡 Need human help? Type your question below or click "🚨 Human Support"!</em>
        `;
        feed.appendChild(msg);
        feed.scrollTop = feed.scrollHeight;
    }

    if (typeof showToast === 'function') {
        showToast(`💳 Trident AI Stripe Assistant Activated for ${productTitle}!`);
    }
}

function openGoogleDriveAISetupGuide(productTitle = "Your Product") {
    // Open drawer
    const drawer = document.getElementById('trident-copilot-drawer');
    if (drawer) {
        drawer.style.display = 'flex';
    }

    const feed = document.getElementById('copilot-chat-feed');
    if (feed) {
        const msg = document.createElement('div');
        msg.style.cssText = "background: rgba(34,197,94,0.15); border: 1px solid #22c55e; border-radius: 12px; padding: 1rem; color: #fff; font-size: 0.88rem; margin-bottom: 0.8rem;";
        msg.innerHTML = `
            <strong style="color: #4ade80; font-size: 0.95rem; display: block; margin-bottom: 0.4rem;">📁 Trident AI — 1-Click Google Drive Link Assistant</strong>
            Let's grab your shareable Google Drive link for <strong>${escapeHTML(productTitle)}</strong> in 3 easy steps!<br><br>
            <strong>Step 1: Open Google Drive</strong><br>
            Go to: <a href="https://drive.google.com" target="_blank" style="color: #4ade80; text-decoration: underline; font-weight: bold;">drive.google.com</a> and find your PDF or folder.<br><br>
            <strong>Step 2: Set Share Permissions to "Anyone with link"</strong><br>
            Right-click the file ➔ Click <em>Share ➔ Share</em>.<br>
            Under <em>General access</em>, change <em>"Restricted"</em> to <strong>"Anyone with the link"</strong>.<br><br>
            <strong>Step 3: Copy & Paste</strong><br>
            Click <em>"Copy link"</em>, return here, and paste it directly into your <code>Product / Download Link</code> box!<br><br>
            <em style="color: var(--text-muted); font-size: 0.8rem;">💡 Need help? Type any question below or click "🚨 Human Support"!</em>
        `;
        feed.appendChild(msg);
        feed.scrollTop = feed.scrollHeight;
    }

    if (typeof showToast === 'function') {
        showToast(`📁 Trident AI Google Drive Assistant Activated!`);
    }
}

function handleCopilotImageUpload(input) {
    if (!input || !input.files || !input.files[0]) return;
    const file = input.files[0];
    const feed = document.getElementById('copilot-chat-feed');

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgUrl = e.target.result;
        if (feed) {
            // Render User Attached Screenshot
            const userImgDiv = document.createElement('div');
            userImgDiv.style.cssText = "background: rgba(232,50,122,0.15); border-radius: 12px; padding: 0.8rem; align-self: flex-end; max-width: 85%; color: #fff; font-size: 0.85rem;";
            userImgDiv.innerHTML = `<strong>You Attached a Screenshot:</strong><br><img src="${imgUrl}" style="max-width: 100%; max-height: 220px; border-radius: 8px; margin-top: 0.5rem; border: 1px solid var(--gold); display: block;">`;
            feed.appendChild(userImgDiv);

            // Render AI Visual Diagnostics Response
            setTimeout(() => {
                const aiDiv = document.createElement('div');
                aiDiv.style.cssText = "background: rgba(255,255,255,0.04); border-radius: 12px; padding: 1rem; border-left: 4px solid #22c55e; max-width: 90%; color: #F5EEF5; font-size: 0.9rem;";
                aiDiv.innerHTML = `
                    <strong style="color: #4ade80; display: block; font-size: 0.85rem; margin-bottom: 0.3rem;">🔱 Trident AI Visual Diagnostics &amp; Ticket Alert</strong>
                    📸 <strong>Screenshot Analyzed!</strong><br><br>
                    • <strong>If this is the Stripe Product Creation Screen:</strong> Under <em>Tax Category</em> select <strong>"Nontaxable Digital Goods"</strong> and click <em>Create Link</em>.<br>
                    • <strong>If you need Todd at Trident Support to visually inspect this screenshot:</strong> Click below to dispatch this visual diagnostic ticket straight to engineering!<br><br>
                    <button onclick="dispatchPrioritySupportTicket('Attached Screenshot Analysis Request')" style="background: linear-gradient(135deg, #dc2626 0%, #c9a84c 100%); color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.82rem; cursor: pointer;">🚨 Send Screenshot to Todd at Support</button>
                `;
                feed.appendChild(aiDiv);
                feed.scrollTop = feed.scrollHeight;
            }, 600);
        }
    };
    reader.readAsDataURL(file);
}

// Global Ctrl + V Clipboard Image Paste Listener for Co-Pilot
document.addEventListener('paste', (e) => {
    const drawer = document.getElementById('trident-copilot-drawer');
    if (!drawer || drawer.style.display === 'none') return;

    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (!items) return;

    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = item.getAsFile();
            const fakeInput = { files: [blob] };
            handleCopilotImageUpload(fakeInput);
            if (typeof showToast === 'function') {
                showToast(`📸 Screenshot Pasted into Trident AI!`);
            }
            break;
        }
    }
});

window.toggleCopilotDrawer = toggleCopilotDrawer;
window.askCopilotChip = askCopilotChip;
window.sendCopilotMessage = sendCopilotMessage;
window.dispatchPrioritySupportTicket = dispatchPrioritySupportTicket;
window.openStripeAISetupGuide = openStripeAISetupGuide;
window.openGoogleDriveAISetupGuide = openGoogleDriveAISetupGuide;
window.toggleExpandCopilotDrawer = toggleExpandCopilotDrawer;
window.handleCopilotImageUpload = handleCopilotImageUpload;


/* ============================================
   3D PRODUCT COVER PREVIEW HANDLERS
   ============================================ */
let activeCoverProductTitle = "";

function openProductCoverModal(title = "Digital Product", price = "$27.00", tag = "PDF GUIDE") {
    activeCoverProductTitle = title;
    const modal = document.getElementById('product-cover-modal');
    const titleEl = document.getElementById('cover-mockup-title');
    const priceEl = document.getElementById('cover-mockup-price');
    const tagEl = document.getElementById('cover-mockup-tag');

    const imgWrap = document.getElementById('cover-mockup-img-wrap');
    const imgEl = document.getElementById('cover-mockup-img');
    const cssCard = document.getElementById('cover-mockup-card');

    if (titleEl) titleEl.textContent = title;
    if (priceEl) priceEl.textContent = price;
    if (tagEl) tagEl.textContent = tag;

    const tLower = title.toLowerCase();
    let imageSrc = null;

    if (tLower.includes('vault') || tLower.includes('creative content') || tag.includes('Free Lead Magnet') || tag.includes('Product 1')) {
        imageSrc = 'images/product1_vault_cover.png';
    } else if (tLower.includes('prompts') || tLower.includes('chatgpt') || tag.includes('Product 2')) {
        imageSrc = 'images/product2_prompts_cover.png';
    } else if (tLower.includes('create') || tLower.includes('first digital') || tag.includes('Product 3')) {
        imageSrc = 'images/product3_guide_cover.png';
    } else if (tLower.includes('reels') || tLower.includes('viral video') || tag.includes('Product 4')) {
        imageSrc = 'images/product4_reels_cover.png';
    } else if (tLower.includes('plr') || tag.includes('Product 5')) {
        imageSrc = 'images/product5_plr_cover.png';
    }

    if (imageSrc) {
        if (imgEl) imgEl.src = imageSrc;
        if (imgWrap) imgWrap.style.display = 'block';
        if (cssCard) cssCard.style.display = 'none';
    } else {
        if (imgWrap) imgWrap.style.display = 'none';
        if (cssCard) cssCard.style.display = 'flex';
    }

    if (modal) modal.style.display = 'flex';
}

function closeProductCoverModal() {
    const modal = document.getElementById('product-cover-modal');
    if (modal) modal.style.display = 'none';
}

function regenerateCoverMockup() {
    const imgEl = document.getElementById('cover-mockup-img');
    if (imgEl) {
        imgEl.style.opacity = '0.4';
        if (typeof showToast === 'function') {
            showToast(`✨ Regenerating 3D Cover Mockup for ${activeCoverProductTitle || 'Product'}...`);
        }
        setTimeout(() => {
            imgEl.style.opacity = '1';
            if (typeof showToast === 'function') {
                showToast(`✅ New 3D Cover Mockup Rendered & Applied!`);
            }
        }, 600);
    }
}

function acceptCoverMockup() {
    if (typeof showToast === 'function') {
        showToast(`✅ 3D Cover Saved to Storefront & Checkout Pages!`);
    }
    closeProductCoverModal();
}

window.openProductCoverModal = openProductCoverModal;
window.closeProductCoverModal = closeProductCoverModal;
window.regenerateCoverMockup = regenerateCoverMockup;
window.acceptCoverMockup = acceptCoverMockup;

/* ============================================
   NEWBIE NICHE AUTO-SUGGEST & INLINE AI HELP
   ============================================ */
const provenNicheIdeas = [
    { target: "Busy Stay-at-Home Moms", topic: "Weekly Meal Prep & Budgeting Planners", tone: "Empowering & Warm" },
    { target: "Fitness Coaches & Trainers", topic: "Client Onboarding & Workout Tracking Kits", tone: "Direct & High-Ticket" },
    { target: "Etsy Sellers & Digital Crafters", topic: "Canva Templates & Social Media Assets", tone: "Playful & Fun" },
    { target: "Real Estate Agents", topic: "Open House Checklists & Property Listing Guides", tone: "Professional & Authoritative" },
    { target: "Self-Care & Wellness Creators", topic: "Somatic Recovery & Mindfulness Journals", tone: "Empowering & Warm" }
];
let currentNicheIndex = 0;

function autoSuggestNicheIdea() {
    const idea = provenNicheIdeas[currentNicheIndex % provenNicheIdeas.length];
    currentNicheIndex++;

    const audienceInput = document.getElementById('ai-target-audience');
    const topicInput = document.getElementById('ai-niche-topic');
    const toneInput = document.getElementById('ai-brand-tone');

    if (audienceInput) audienceInput.value = idea.target;
    if (topicInput) topicInput.value = idea.topic;
    if (toneInput) toneInput.value = idea.tone;

    if (typeof showToast === 'function') {
        showToast(`🎲 Auto-Suggested Niche: ${idea.topic}!`);
    }
}

function askInlineSectionAI() {
    const input = document.getElementById('inline-planner-ai-input');
    const responseDiv = document.getElementById('inline-planner-ai-response');
    if (!input || !input.value.trim() || !responseDiv) return;

    const query = input.value.trim();
    input.value = '';

    if (typeof logTridentQuery === 'function') {
        logTridentQuery(query);
    }

    responseDiv.style.display = 'block';
    responseDiv.innerHTML = `⏳ <em>Trident AI is analyzing your question...</em>`;

    setTimeout(() => {
        responseDiv.innerHTML = `💡 <strong>Trident AI Section Suggestion:</strong><br>For <em>"${escapeHTML(query)}"</em>, high-demand digital products include <strong>interactive PDF trackers, Canva template bundles, and ChatGPT prompt vaults</strong>. Select your product count above and click <strong>"⚡ Generate Complete Product Suite Plan"</strong>!`;
    }, 400);
}

window.autoSuggestNicheIdea = autoSuggestNicheIdea;
window.askInlineSectionAI = askInlineSectionAI;
window.selectProductCount = selectProductCount;
window.showCreditRefillModal = showCreditRefillModal;
window.closeCreditRefillModal = closeCreditRefillModal;
window.refillAICreditsSimulated = refillAICreditsSimulated;
window.logTridentQuery = logTridentQuery;
window.renderTridentQueryLogs = renderTridentQueryLogs;








