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
const pinDots   = [
    document.getElementById('dot-0'),
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3'),
];

let pinEntry = []; // track entered digits

function updateDots() {
    pinDots.forEach((dot, i) => {
        dot.classList.toggle('filled', i < pinEntry.length);
    });
}

function unlockDashboard() {
    pinScreen.style.opacity = '0';
    pinScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        pinScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        dashboard.style.animation = 'fadeUp 0.5s ease';
    }, 450);
}

function wrongPin() {
    pinError.classList.add('visible');
    document.querySelector('.pin-box').classList.add('shake');
    setTimeout(() => {
        document.querySelector('.pin-box').classList.remove('shake');
        pinEntry = [];
        updateDots();
    }, 450);
}

// Keypad button clicks
document.querySelectorAll('.pin-key[data-digit]').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (pinEntry.length >= 4) return;
        pinEntry.push(btn.dataset.digit);
        pinError.classList.remove('visible');
        updateDots();

        if (pinEntry.length === 4) {
            const entered = pinEntry.join('');
            if (entered === CORRECT_PIN) {
                unlockDashboard();
            } else {
                wrongPin();
            }
        }
    });
});

// Delete key
document.getElementById('pin-delete')?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pinEntry.pop();
    pinError.classList.remove('visible');
    updateDots();
});

// Also support physical keyboard for desktop
document.addEventListener('keydown', (e) => {
    if (pinScreen.classList.contains('hidden')) return;
    if (e.key >= '0' && e.key <= '9' && pinEntry.length < 4) {
        pinEntry.push(e.key);
        pinError.classList.remove('visible');
        updateDots();
        if (pinEntry.length === 4) {
            pinEntry.join('') === CORRECT_PIN ? unlockDashboard() : wrongPin();
        }
    } else if (e.key === 'Backspace') {
        pinEntry.pop();
        updateDots();
    }
});


// ── Section Navigation ──────────────────────
function showSection(name) {
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`section-${name}`);
    if (target) target.classList.add('active');

    const navLink = document.querySelector(`.nav-item[data-section="${name}"]`);
    if (navLink) navLink.classList.add('active');
}

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
    assetsForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(assetsForm);
        const data = Object.fromEntries(formData.entries());

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

// ── Client Call Notes (localStorage) ───────
const addNoteForm   = document.getElementById('add-note-form');
const notesTimeline = document.getElementById('notes-timeline');
const NOTES_KEY     = 'bmb_call_notes';

function loadSavedNotes() {
    const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    saved.forEach(note => prependNoteCard(note, false));
}

function prependNoteCard({ date, summary, actions }, save = true) {
    if (!summary) return;

    const formattedDate = date
        ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No date';

    const actionLines = actions
        ? actions.split('\n').filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`).join('')
        : '';

    const card = document.createElement('div');
    card.className = 'glass-card note-card';
    card.innerHTML = `
        <div class="note-header">
            <div class="note-date-badge">${formattedDate}</div>
            <div class="note-tag">Call Note</div>
        </div>
        <p class="note-summary">${summary}</p>
        ${actionLines ? `
        <div class="note-actions-block">
            <span class="note-actions-label">Action Items:</span>
            <ul>${actionLines}</ul>
        </div>` : ''}
    `;

    // Insert at the top (newest first)
    const firstCard = notesTimeline.querySelector('.note-card');
    if (firstCard) {
        notesTimeline.insertBefore(card, firstCard);
    } else {
        notesTimeline.appendChild(card);
    }

    if (save) {
        const existing = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
        existing.unshift({ date, summary, actions });
        localStorage.setItem(NOTES_KEY, JSON.stringify(existing));
    }
}

if (addNoteForm) {
    // Set today's date as default
    const dateInput = document.getElementById('note-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    addNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date    = document.getElementById('note-date').value;
        const summary = document.getElementById('note-summary').value.trim();
        const actions = document.getElementById('note-actions').value.trim();

        if (!summary) return;

        prependNoteCard({ date, summary, actions });
        addNoteForm.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
    });

    loadSavedNotes();
}

// ── Active Leads CRM (Fetch from Brevo) ─────
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

        // Render table
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
    } catch (err) {
        console.error('Failed to load leads:', err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="padding:2.5rem; text-align:center; color:#ff4a4a;">
                    ⚠️ Failed to load active leads. Verify BREVO_API_KEY is configured in Cloudflare.
                </td>
            </tr>
        `;
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

