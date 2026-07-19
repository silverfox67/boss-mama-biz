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

// ── BUILD REQUESTS MANAGEMENT ──
let currentRequestFunnel = '';

function getBuildRequests() {
    return JSON.parse(localStorage.getItem('bmb_build_requests') || '[]');
}

function saveBuildRequests(requests) {
    localStorage.setItem('bmb_build_requests', JSON.stringify(requests));
}

function renderBuildRequests() {
    const requests = getBuildRequests();
    const badgeEl = document.getElementById('requests-badge');
    const emptyStateEl = document.getElementById('requests-empty-state');
    const listEl = document.getElementById('requests-checklist');
    const dotEl = document.getElementById('requests-dot');
    
    if (!badgeEl || !listEl || !emptyStateEl) return;
    
    // Update Badge & Sidebar dot
    if (requests.length === 0) {
        badgeEl.textContent = '🔴 0 Pending Builds';
        badgeEl.className = 'requests-badge-status status-red';
        emptyStateEl.style.display = 'block';
        listEl.innerHTML = '';
        if (dotEl) {
            dotEl.className = 'dot-indicator dot-green';
        }
    } else {
        badgeEl.textContent = `🟢 ${requests.length} Pending ${requests.length === 1 ? 'Build' : 'Builds'}`;
        badgeEl.className = 'requests-badge-status status-green';
        emptyStateEl.style.display = 'none';
        if (dotEl) {
            dotEl.className = 'dot-indicator dot-red';
        }
        
        listEl.innerHTML = requests.map((req, idx) => `
            <li class="requests-checklist-item" style="display:flex; justify-content:space-between; align-items:flex-start; padding:1.2rem; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px;">
                <div class="requests-checklist-content" style="display:flex; align-items:flex-start; gap:1rem;">
                    <span class="requests-checklist-num" style="margin-top:0.1rem;">${idx + 1}</span>
                    <div>
                        <div style="font-weight:700; color:#ffffff; font-size:1rem;">Unlock &amp; Build: ${req.funnel}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">Requested on ${req.date}</div>
                        <div style="font-size:0.9rem; color:var(--text-main); margin-top:0.6rem; padding:0.6rem 0.8rem; background:rgba(255,255,255,0.03); border-radius:6px; border-left:3px solid var(--primary); font-style:italic;">
                            "${req.notes}"
                        </div>
                    </div>
                </div>
                <input type="checkbox" class="requests-checkbox" data-index="${idx}" style="margin-top:0.3rem;">
            </li>
        `).join('');
        
        // Add checkboxes listeners to complete requests
        listEl.querySelectorAll('.requests-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'));
                completeBuildRequest(idx);
            });
        });
    }
}

function openRequestModal(funnelName) {
    currentRequestFunnel = funnelName;
    const titleEl = document.getElementById('request-funnel-title');
    const textareaEl = document.getElementById('request-note-text');
    
    if (titleEl) titleEl.textContent = `Unlock: ${funnelName}`;
    if (textareaEl) textareaEl.value = '';
    
    document.getElementById('request-notes-modal')?.classList.add('active');
}

function submitRequestNotes() {
    const textareaEl = document.getElementById('request-note-text');
    const notesVal = textareaEl ? textareaEl.value.trim() : '';
    
    const requests = getBuildRequests();
    
    // Add to requests list
    const newRequest = {
        funnel: currentRequestFunnel,
        notes: notesVal || 'No additional notes provided.',
        date: new Date().toLocaleDateString()
    };
    
    requests.push(newRequest);
    saveBuildRequests(requests);
    renderBuildRequests();
    
    // Close Modal
    document.getElementById('request-notes-modal')?.classList.remove('active');
    
    // Trigger Email Compose Window
    const subject = `Unlock Request: ${currentRequestFunnel}`;
    const body = `Hey Todd,\n\nI want to unlock and build the ${currentRequestFunnel} in my dashboard!\n\nHere are the details/instructions:\n\n"${notesVal || 'No additional notes provided.'}"\n\nBest,\nKristan`;
    window.open(`mailto:todddavis923@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
}

function completeBuildRequest(index) {
    const requests = getBuildRequests();
    requests.splice(index, 1);
    saveBuildRequests(requests);
    renderBuildRequests();
}

// Bind event listeners to request buttons
document.querySelectorAll('.funnel-request-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const funnelCard = e.currentTarget.closest('.funnel-card');
        const funnelName = funnelCard ? funnelCard.querySelector('h3').textContent : 'Suggested Funnel';
        openRequestModal(funnelName);
    });
});

// Bind modal action buttons
document.getElementById('submit-request-btn')?.addEventListener('click', () => {
    submitRequestNotes();
});

document.getElementById('close-request-modal')?.addEventListener('click', () => {
    document.getElementById('request-notes-modal')?.classList.remove('active');
});

document.getElementById('request-notes-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'request-notes-modal') {
        document.getElementById('request-notes-modal')?.classList.remove('active');
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
                ctaText: "Create Your First Digital Product Sneak Peek →",
                ctaUrl: "https://stan.store/Kristan_Oconnor/p/create-your-1st-digital-product-in-6-simple-steps",
                content: `The concept of selling a digital product is incredibly appealing: you create a guide, template, or resource one time, and it sells repeatedly on autopilot without ever needing physical inventory or shipping infrastructure.<br><br>However, many aspiring entrepreneurs get stuck in the preparation phase. They spend months overanalyzing their ideas, wrestling with complicated software, or waiting until everything feels entirely perfect before making an offer. This perfectionism trap keeps highly valuable knowledge trapped inside your head instead of generating revenue in the marketplace.<br><br>Launching a successful digital product doesn't require a background in software development or weeks of technical configuration. By breaking the process down into six distinct, manageable steps, you can confidently move from an initial concept to a live, income-generating asset.<br><br><h3>Bypassing the Complexity of Product Creation</h3>The biggest reason digital assets never make it to market is that creators try to build something far too large for their first project. They think they need to record a massive, multi-module video course or write a 200-page book to provide real value.<br><br>In reality, modern digital buyers prefer highly specific, actionable solutions over dense walls of information. They are paying for speed and convenience. A concise, well-structured 10-page guide, a beautifully organized budget spreadsheet, or a library of pre-written templates that solves one distinct problem is often significantly more valuable to a busy consumer than a prolonged course.<br><br><h3>The 6-Step Digital Product Launch Framework</h3>To bring your digital asset to life quickly and efficiently, follow this sequential blueprint:<ul><li><strong>1. Identify Your Core Idea:</strong> Pinpoint one specific problem your target audience is struggling with and determine the absolute fastest way to solve it. Your product should center around a topic you are already familiar with or a system you have personally used to achieve a result.</li><li><strong>2. Choose Your Formatting Structure:</strong> Decide how your audience can best consume this information. Whether it is an actionable PDF workbook, a customizable spreadsheet tracker, a pre-made Canva layout, or a brief audio training, select a format that is easy for you to create and simple for your customer to use.</li><li><strong>3. Build the Solution:</strong> Set aside a dedicated, uninterrupted block of time to compile your resource. Use clean, professional design layouts and write clear, step-by-step instructions. Keep the content highly focused on execution, removing any unnecessary fluff.</li><li><strong>4. Configure Your Secure Checkout System:</strong> You do not need an expensive, complex e-commerce website to process transactions. Utilize straightforward payment processors like Stripe or pre-built landing pages to host your product page, manage customer checkouts securely, and handle automated digital delivery.</li><li><strong>5. Deploy Your Traffic Strategy:</strong> Once your product is live, focus on guiding target traffic to your checkout page. Use strategic social media content, pre-set automated keywords, or simple free resources to capture attention and direct interested buyers straight to your offer.</li><li><strong>6. Analyze and Scale Your Automated Sales:</strong> As initial orders begin to process, review your customer feedback and monitor your page performance. Use this real-world data to refine your messaging, expand your marketing visibility, and let your automated backend handle sales completely on autopilot.</li></ul><h3>Skipping the Product Development Phase</h3>Building a digital business doesn't have to mean spending your valuable time trapped behind a screen building files from scratch. By accessing a massive, high-quality library of pre-written assets and following a structured launch masterclass, you can completely bypass the trial-and-error phase.<br><br><strong>Ready to find your path?</strong><br>Don't let tech confusion or perfectionism hold you back from building an online income. Click below to join Kristan's step-by-step framework inside Create Your First Digital Product for just $27—and get her complete 500+ ChatGPT Prompts Guide entirely FREE.`
            },
            {
                id: "1784347819900",
                title: "The AI Advantage: How Busy Marketers Use Done-For-You Prompts to Automate Their Writing",
                summary: "Writing copy is a bottleneck. Learn to bypass drafting using engineered prompts, customize them to your voice, and package them as your own digital products.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/own-prompts.png",
                ctaText: "ChatGPT Prompts Sneak Peek →",
                ctaUrl: "https://stan.store/Kristan_Oconnor/p/500-chatgpt-prompts-for-your-digital-business",
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

function renderBlogArticlesAdmin() {
    const articles = getBlogArticles();
    const emptyEl = document.getElementById('blog-articles-empty');
    const listEl = document.getElementById('blog-articles-list');
    
    if (!emptyEl || !listEl) return;
    
    if (articles.length === 0) {
        emptyEl.style.display = 'block';
        listEl.innerHTML = '';
    } else {
        emptyEl.style.display = 'none';
        
        // Sort articles by publish date (newest/latest first)
        const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const today = new Date().toISOString().split('T')[0];
        
        listEl.innerHTML = sorted.map(art => {
            const isScheduled = art.date > today;
            const statusLabel = isScheduled ? '⏳ Scheduled' : '🟢 Published';
            const statusClass = isScheduled ? 'status-red' : 'status-green';
            
            return `
                <div class="glass-card" style="padding:1rem; border-color:rgba(255,255,255,0.05); display:flex; flex-direction:column; gap:0.5rem; background:rgba(255,255,255,0.01);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="requests-badge-status ${statusClass}" style="font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px;">${statusLabel}</span>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${art.date} • ${art.readtime} min</span>
                    </div>
                    <h4 style="margin:0.2rem 0 0; color:#ffffff; font-size:0.95rem; font-family:var(--font-heading);">${art.title}</h4>
                    <p style="margin:0; font-size:0.8rem; color:var(--text-muted); line-height:1.4;">${art.summary}</p>
                    <div style="display:flex; gap:0.5rem; margin-top:0.5rem; justify-content:flex-end;">
                        <button class="btn btn-secondary blog-edit-btn" data-id="${art.id}" style="padding:0.3rem 0.6rem; font-size:0.75rem; font-weight:600;">Edit</button>
                        <button class="btn btn-primary blog-delete-btn" data-id="${art.id}" style="padding:0.3rem 0.6rem; font-size:0.75rem; font-weight:600; background:linear-gradient(135deg, #ff4a4a, #c22828); box-shadow:none;">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Bind Edit buttons
        listEl.querySelectorAll('.blog-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const art = articles.find(a => a.id === id);
                if (art) {
                    document.getElementById('blog-post-id').value = art.id;
                    document.getElementById('blog-title').value = art.title;
                    document.getElementById('blog-summary').value = art.summary;
                    document.getElementById('blog-date').value = art.date;
                    document.getElementById('blog-readtime').value = art.readtime;
                    document.getElementById('blog-image').value = art.image || 'images/own-create.png';
                    document.getElementById('blog-content').value = art.content;
                    
                    document.getElementById('blog-form-title').textContent = 'Edit Blog Post';
                    document.getElementById('blog-submit-btn').textContent = 'Update & Schedule →';
                    document.getElementById('blog-cancel-btn').style.display = 'inline-block';
                }
            });
        });

        // Bind Delete buttons
        listEl.querySelectorAll('.blog-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this blog post?')) {
                    deleteBlogArticle(id);
                }
            });
        });
    }
}

function deleteBlogArticle(id) {
    let articles = getBlogArticles();
    articles = articles.filter(art => art.id !== id);
    saveBlogArticles(articles);
    renderBlogArticlesAdmin();
}

function resetBlogForm() {
    document.getElementById('blog-post-id').value = '';
    document.getElementById('blog-title').value = '';
    document.getElementById('blog-summary').value = '';
    document.getElementById('blog-date').value = '';
    document.getElementById('blog-readtime').value = '3';
    document.getElementById('blog-image').value = 'images/own-create.png';
    document.getElementById('blog-content').value = '';
    
    document.getElementById('blog-form-title').textContent = 'Create Blog Post';
    document.getElementById('blog-submit-btn').textContent = 'Save & Schedule →';
    document.getElementById('blog-cancel-btn').style.display = 'none';
}

// Bind blog form submit
document.getElementById('blog-post-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const idVal = document.getElementById('blog-post-id').value;
    const titleVal = document.getElementById('blog-title').value.trim();
    const summaryVal = document.getElementById('blog-summary').value.trim();
    const dateVal = document.getElementById('blog-date').value;
    const readtimeVal = parseInt(document.getElementById('blog-readtime').value);
    const imageVal = document.getElementById('blog-image').value;
    const contentVal = document.getElementById('blog-content').value.trim();
    
    let articles = getBlogArticles();
    
    if (idVal) {
        // Edit Mode
        articles = articles.map(art => {
            if (art.id === idVal) {
                return { ...art, title: titleVal, summary: summaryVal, date: dateVal, readtime: readtimeVal, image: imageVal, content: contentVal };
            }
            return art;
        });
    } else {
        // Create Mode
        const newArt = {
            id: Date.now().toString(),
            title: titleVal,
            summary: summaryVal,
            date: dateVal,
            readtime: readtimeVal,
            image: imageVal,
            content: contentVal
        };
        articles.push(newArt);
    }
    
    saveBlogArticles(articles);
    resetBlogForm();
    renderBlogArticlesAdmin();
    alert('Blog post saved successfully!');
});

// ============================================================
//  BOSS AI BLOG COACH & ARTICLE GENERATOR
// ============================================================
const aiBlogTemplates = {
    pyramid: {
        title: "Is Affiliate Marketing a Pyramid Scheme? An Honest Breakdown",
        summary: "You've probably seen posts promising big payouts. Read this honest comparison to understand the crucial difference between legitimate affiliate marketing and MLMs.",
        readtime: 4,
        image: "images/blog-streams.png",
        ctaText: "Qualifier Quiz Sneak Peek →",
        ctaUrl: "/index.html#quiz",
        content: `You've probably seen posts on Instagram or Facebook promising that you can make thousands of dollars working from your phone. And if you're like most sensible moms, your first thought was: "Is this another pyramid scheme?"<br><br>The skepticism is entirely valid. The internet is full of "get-rich-quick" programs and multi-level marketing (MLM) companies that require you to recruit your friends, buy piles of inventory, and sit in peoples' direct messages all day. It's exhausting, and for most moms, it leads to burnout rather than business.<br><br>But there is a legitimate, clean alternative that does not involve recruiting, inventory, or messaging your high school friends: <strong>Affiliate Marketing</strong>. Here is the honest breakdown of how they differ.<br><br><h3>The MLM / Pyramid Scheme Model (Recruiting Focus)</h3>In a pyramid scheme or MLM, the primary way to make real money is by recruiting a "downline" of other distributors. You are forced to buy a minimum amount of product inventory each month just to stay qualified. The emphasis is on building a team, not selling a valuable product. If the system relies on recruiting others to make money, it's a pyramid structure.<br><br><h3>The Affiliate Marketing Model (Sales Focus)</h3>Affiliate marketing is completely different. You simply recommend a product or service that you like. When someone purchases it through your custom tracking link, the company pays you a direct sales commission. <ul><li><strong>No Recruiting:</strong> You do not build a team. You earn only on direct sales you generate.</li><li><strong>No Inventory:</strong> You never purchase or ship physical products.</li><li><strong>Zero Monthly Minimums:</strong> There are no quotas or pressure.</li></ul><h3>The Golden Rule of Legitimate Digital Business</h3>A real affiliate business focuses on connecting buyers to high-quality training and systems. You don't need a massive social media following or MLM tactics if you follow a clean, automated system.<br><br><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>↓ Not sure which path fits your schedule? Click here to take our 60-second income qualifier quiz on the homepage:</strong><br><br><a href="/#quiz" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Take 60-Second Quiz →</a></div>`
    },
    faceless: {
        title: "How to Sell Digital Products Without Showing Your Face (A Guide to Faceless Marketing)",
        summary: "Camera shy? You do not need to post family pictures or talk to the camera to run a successful store. Learn how to launch a faceless marketing business today.",
        readtime: 3,
        image: "images/blog-faceless.png",
        ctaText: "Browse PLR Products →",
        ctaUrl: "/index.html#tools",
        content: `The dream of running an online business sounds amazing, until you realize that most marketing gurus tell you to record daily videos, dance on camera, and share your personal family life online.<br><br>For many busy moms, that is a dealbreaker. You want to build an income stream, but you also want to protect your family's privacy and avoid being glued to your phone recording selfies.<br><br>The good news? You do not need to show your face to build a thriving online store. Here is the complete framework for faceless digital marketing.<br><br><h3>1. Use Aesthetic Stock Video Clips</h3>You don't need to record yourself typing or making coffee. You can use beautiful, high-quality, pre-recorded stock video libraries (like Canva, Pexels, or specialized faceless aesthetic libraries). These videos feature cozy work setups, kitchen counters, or nature scenes that match a high-end brand aesthetic.<br><br><h3>2. Focus on Strong Hooks and Text-on-Screen</h3>Because you aren't talking directly to the camera, your text-on-screen hook must do the heavy lifting. Address your ideal customer's exact frustration immediately (e.g. <em>"How I set up a passive income stream during naptime without ever showing my face"</em>). Use clean, minimalist fonts that are easy to read.<br><br><h3>3. Leverage Done-For-You (PLR) Digital Products</h3>Building a digital product from scratch is time-consuming. By purchasing high-quality Private Label Rights (PLR) guides, spreadsheets, or templates, you buy the legal license to rebrand and resell them under your own name. You get to keep 100% of the profits without spending weeks designing products.<br><br><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>💡 Ready to start? Click here to browse and filter high-converting done-for-you products inside the PLR Library:</strong><br><br><a href="/#tools" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Browse PLR Products →</a></div>`
    },
    "creator-block": {
        title: "What to Post When You Have Zero Content Ideas (How to Fix Creator Block)",
        summary: "Staring at a flashing cursor is exhausting. Use this simple 'Hook, Story, Offer' framework to write sales posts in less than 5 minutes.",
        readtime: 3,
        image: "images/own-vault.png",
        ctaText: "Creative Content Vault Sneak Peek →",
        ctaUrl: "https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view",
        content: `You sit down at your desk during a rare quiet moment while the kids are napping, open your phone, and... nothing. You stare at a flashing cursor, completely unsure of what to write.<br><br>You know you need to post to keep your business visible, but the mental energy required to brainstorm new ideas every single day is draining. You either post something generic just to get it out of the way, or you skip posting entirely because the creative block is too overwhelming.<br><br>Here is the secret to consistent social media marketing: stop waiting for inspiration, and use a structured framework.<br><br><h3>The Hook, Story, Offer Framework</h3>Every high-converting post follows three simple stages:<ul><li><strong>1. The Hook:</strong> A scroll-stopping sentence that targets a specific pain point or desire (e.g. <em>"I used to spend 3 hours writing copy, now I do it in 5 minutes."</em>).</li><li><strong>2. The Story:</strong> A short paragraph sharing a personal lesson, customer win, or quick tip that builds trust and adds value.</li><li><strong>3. The Offer (CTA):</strong> A clear instruction on what action to take next. Never write a post without a call-to-action!</li></ul><h3>Putting Your Content on Autopilot</h3>You don't need to invent hooks and story starters daily. By utilizing a pre-vetted bank of scroll-stopping hooks and copy-paste templates, you can write weeks of social media content in a single afternoon.<br><br><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>📬 Get 90+ days of scroll-stopping hooks, storytelling prompts, and high-converting calls-to-action completely FREE in our Creative Content Vault:</strong><br><br><a href="/#offers" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Download Free Content Vault →</a></div>`
    }
};

// Alternative SEO-optimized Blog Templates (Regeneration Bank)
const aiBlogTemplatesAlt = {
    pyramid: {
        title: "Pyramid Scheme vs. Affiliate Marketing: Why Recruiting is Dead",
        summary: "Tired of MLMs filling your inbox asking you to pitch friends? Discover the clean, honest way moms make passive commissions without recruiting.",
        readtime: 3,
        image: "images/blog-streams.png",
        ctaText: "Check Your Income Matches →",
        ctaUrl: "/index.html#quiz",
        content: `Let's talk about that message you got in your inbox last night from a high school friend you haven't spoken to in a decade. "Hey mama, I've got this amazing opportunity..."<br><br>If your alarm bells went off, good. You are a smart business owner in the making. In 2026, the market is saturated with MLM schemes disguised as 'social retail' or 'direct sales'.<br><br>The key difference is recruiting vs selling. If you must build a team to make a profit, you're in an MLM. If you just promote high-quality products or systems for direct commission, you're doing affiliate marketing. It is that clean, and that simple.<br><br><h3>Why Busy Moms Choose True Affiliate Marketing</h3>True affiliate marketing fits into your life without the pressure:<ul><li><strong>No Messaging Friends:</strong> You build an audience of people who actually want to buy, instead of pitch-spamming family.</li><li><strong>No Stockpiles:</strong> No physical shipping, no boxes in your garage.</li><li><strong>Keep 100% Focus on Sales:</strong> You are not responsible for training or mentoring a massive downline.</li></ul><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>🎯 Ready to see if you have the ideal matching background? Take our 60-second quiz on the homepage:</strong><br><br><a href="/#quiz" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Take the Income Quiz →</a></div>`
    },
    faceless: {
        title: "The Camera-Shy Mom's Path to Passive Income: A Faceless Store Guide",
        summary: "You don't need to post personal photos or selfies online to build a successful store. Learn how to design a high-converting faceless brand today.",
        readtime: 3,
        image: "images/blog-faceless.png",
        ctaText: "Browse PLR Products →",
        ctaUrl: "/index.html#tools",
        content: `Many busy moms love the idea of running a passive storefront, but hates the idea of record selfie videos, dancing, and posting pictures of their kids online. Your privacy is non-negotiable.<br><br>Fortunately, faceless marketing is a booming business structure. You can earn an extra income by focusing on digital product delivery, clean aesthetics, and valuable guides without ever showing your face.<br><br><h3>The Faceless Growth Pillars</h3>To scale a faceless brand, keep these three areas aligned:<ul><li><strong>1. Aesthetic Visuals:</strong> Choose high-end stock videos that convey peaceful routines, working spaces, or home designs.</li><li><strong>2. Copywriting is King:</strong> Since you aren't talking to the camera, your text hooks must capture direct attention. Call out maternal pain points immediately.</li><li><strong>3. PLR & Templates:</strong> Use Private Label Rights (PLR) files to fill your store instantly. Customize the cover, set your price, and start selling.</li></ul><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>💡 Want to view pre-made digital guides you can resell as your own? Browse the PLR catalog:</strong><br><br><a href="/#tools" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Browse PLR Products →</a></div>`
    },
    "creator-block": {
        title: "Bypass the Flashing Cursor: 3 Simple Formulas for Daily Sales Posts",
        summary: "Stop spending hours brainstorming social media posts. Use these plug-and-play copy frameworks to write high-converting copy in minutes.",
        readtime: 3,
        image: "images/own-vault.png",
        ctaText: "Creative Content Vault Sneak Peek →",
        ctaUrl: "https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view",
        content: `We've all been there: sitting down to write during naptime, staring at a blank screen, and feeling the precious free minutes slip away without posting anything.<br><br>The secret to copywriting isn't inspiration—it's formulas. When you use proven copywriting frameworks, writing posts takes less than five minutes.<br><br><h3>The 3 Go-To Mom Copy Templates</h3>Here are three simple styles you can alternate:<ul><li><strong>The Story-Lesson:</strong> Share a quick personal obstacle you overcame (e.g. <em>"How I automated my funnel so it makes sales while I'm at the playground"</em>).</li><li><strong>The Myth Buster:</strong> Call out a common misconception in your niche (e.g. <em>"You don't need a 10k following to sell digital guides"</em>).</li><li><strong>The Checklist:</strong> Give 3-4 bullet-point tips that solve a direct struggle.</li></ul><br>Always close with a direct call to action directing readers to grab your lead magnet or visit your link in bio!<br><br><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>📬 Get over 90+ scroll-stopping hooks and copy-paste captions ready to use. Download the Free Vault:</strong><br><br><a href="/#offers" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Download Free Content Vault →</a></div>`
    }
};

// Tracks state for regenerating
let currentAIEditorSource = {
    type: 'template',
    value: 'pyramid',
    isAlternative: false
};

function generateCustomArticle(promptText, alternative = false) {
    const formattedPrompt = promptText.trim();
    if (!formattedPrompt) return null;
    
    let title = "";
    let summary = "";
    let content = "";
    
    if (alternative) {
        title = "Mastering " + formattedPrompt.replace(/\b\w/g, c => c.toUpperCase()) + ": A Busy Mom's Blueprint";
        summary = `Struggling with ${formattedPrompt}? Skip the trial-and-error. Here is the exact daily productivity checklist to master this side-hustle step.`;
        content = `Let's cut straight to the point: as a busy mom, you do not have 8 hours a day to spend figuring out <strong>${formattedPrompt}</strong>. You need direct, actionable steps that you can implement in a 30-minute naptime window.<br><br>Here is your blueprint to automate, simplify, and scale your approach to ${formattedPrompt} without sacrificing your family schedule.<br><br><h3>1. Time-Blocking over Multi-Tasking</h3>Multi-tasking is a myth. Set a timer for 25 minutes, close all tabs, and focus exclusively on executing one small piece of this goal. Complete it, check it off, and close your laptop. Consistent micro-steps win the race.<h3>2. Automate the Infrastructure</h3>Your website, product sales, and email delivery should run completely in the background. Use automated landing pages and direct templates so you are only focused on creating short content or checking commissions.<h3>3. Find the Step-by-Step Checklist</h3>Don't guess what to do. Use proven prompts, templates, and pre-built workflows to complete the work in a fraction of the time.<br><br><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>↓ Need a custom roadmap tailored to your specific schedule and target income? Take our 60-second quiz:</strong><br><br><a href="/#quiz" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Take 60-Second Quiz →</a></div>`;
    } else {
        title = "The Busy Mom's Guide to " + formattedPrompt.replace(/\b\w/g, c => c.toUpperCase());
        summary = `Struggling with ${formattedPrompt}? Learn the exact step-by-step systems and productivity frameworks to master this side-hustle obstacle without losing family time.`;
        content = `Managing a side business around a busy family schedule is a massive balancing act. When you are trying to tackle challenges like <strong>${formattedPrompt}</strong>, it is incredibly easy to hit a roadblock and feel completely overwhelmed.<br><br>But the secret isn't working longer hours—it is about working smarter by building structured, automated systems. Let's break down exactly how you can handle ${formattedPrompt} in just 1-2 hours a day.<br><br><h3>Step 1: Simplify and Focus</h3>First, strip away the noise. You don't need to do everything at once. Focus on one specific solution that moves your business forward. Automate your scheduling, use templates, and protect your working hours during naptime or early mornings.<br><br><h3>Step 2: Use Pre-Built Assets</h3>Don't build your product or content from scratch. Bypassing the creation phase by using high-quality done-for-you templates or prompts can save you up to 80% of your time, letting you focus on what actually generates revenue.<br><br><h3>Step 3: Connect with the Right Community</h3>Having step-by-step mentorship is the fastest way to avoid mistakes and get sales. Connect with other side-hustling moms who have already walked this path and built consistent passive income.<br><br><div style="background: rgba(232, 50, 122, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 12px; margin: 2rem 0; text-align: center;"><strong>↓ Ready to find your path? Click here to take our 60-second income qualifier quiz on the homepage to unlock your custom roadmap:</strong><br><br><a href="/#quiz" class="btn btn-primary" style="display:inline-block; margin-top:0.8rem; text-decoration:none;">Find My Roadmap Now →</a></div>`;
    }
    
    return { title, summary, readtime: 3, image: "images/blog-autopilot.png", ctaText: "Take the Qualifier Quiz →", ctaUrl: "/index.html#quiz", content };
}

function openAIEmailEditor(draft, source = null) {
    const modal = document.getElementById('ai-article-editor-modal');
    if (!modal) return;
    
    if (source) {
        currentAIEditorSource = {
            type: source.type,
            value: source.value,
            isAlternative: source.isAlternative || false
        };
    }
    
    document.getElementById('ai-art-title').value = draft.title;
    document.getElementById('ai-art-summary').value = draft.summary;
    document.getElementById('ai-art-readtime').value = draft.readtime;
    document.getElementById('ai-art-image').value = draft.image;
    document.getElementById('ai-art-ctatext').value = draft.ctaText || "Take the Qualifier Quiz →";
    document.getElementById('ai-art-ctaurl').value = draft.ctaUrl || "/index.html#quiz";
    document.getElementById('ai-art-content').value = draft.content;
    
    // Set default schedule date as next Sunday if it's empty
    const dateInput = document.getElementById('ai-art-date');
    if (dateInput && !dateInput.value) {
        const today = new Date();
        const nextSunday = new Date();
        nextSunday.setDate(today.getDate() + (7 - today.getDay()) % 7);
        if (today.getDay() === 0) {
            nextSunday.setDate(today.getDate() + 7);
        }
        dateInput.value = nextSunday.toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Bind UI event listeners for generator
document.querySelectorAll('.ai-template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const topic = btn.getAttribute('data-topic');
        const draft = aiBlogTemplates[topic];
        if (draft) {
            openAIEmailEditor(draft, { type: 'template', value: topic, isAlternative: false });
        }
    });
});

document.getElementById('btn-generate-ai-blog')?.addEventListener('click', () => {
    const promptInput = document.getElementById('ai-blog-prompt');
    const val = promptInput.value.trim();
    if (!val) { alert('Please enter a custom topic idea first!'); return; }
    
    const draft = generateCustomArticle(val, false);
    if (draft) {
        promptInput.value = '';
        openAIEmailEditor(draft, { type: 'custom', value: val, isAlternative: false });
    }
});

// Regenerate click event listener
document.getElementById('btn-regenerate-ai-blog')?.addEventListener('click', () => {
    currentAIEditorSource.isAlternative = !currentAIEditorSource.isAlternative;
    
    let draft = null;
    if (currentAIEditorSource.type === 'template') {
        const templates = currentAIEditorSource.isAlternative ? aiBlogTemplatesAlt : aiBlogTemplates;
        draft = templates[currentAIEditorSource.value];
    } else if (currentAIEditorSource.type === 'custom') {
        draft = generateCustomArticle(currentAIEditorSource.value, currentAIEditorSource.isAlternative);
    }
    
    if (draft) {
        document.getElementById('ai-art-title').value = draft.title;
        document.getElementById('ai-art-summary').value = draft.summary;
        document.getElementById('ai-art-readtime').value = draft.readtime;
        document.getElementById('ai-art-image').value = draft.image;
        document.getElementById('ai-art-ctatext').value = draft.ctaText || "Take the Qualifier Quiz →";
        document.getElementById('ai-art-ctaurl').value = draft.ctaUrl || "/index.html#quiz";
        document.getElementById('ai-art-content').value = draft.content;
        
        // Add a visual flash effect to show it updated
        const formEl = document.getElementById('ai-article-form');
        if (formEl) {
            formEl.style.opacity = '0.3';
            setTimeout(() => { formEl.style.opacity = '1'; }, 200);
        }
    }
});

// Close listeners for AI editor modal
const closeAIModal = () => {
    const modal = document.getElementById('ai-article-editor-modal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
};
document.getElementById('btn-close-ai-editor')?.addEventListener('click', closeAIModal);
document.querySelector('#ai-article-editor-modal .modal-close')?.addEventListener('click', closeAIModal);
document.getElementById('ai-article-editor-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('ai-article-editor-modal')) {
        closeAIModal();
    }
});

// AI Article Form Submit Handler
document.getElementById('ai-article-form')?.addEventListener('submit', e => {
    e.preventDefault();
    
    const titleVal = document.getElementById('ai-art-title').value.trim();
    const summaryVal = document.getElementById('ai-art-summary').value.trim();
    const dateVal = document.getElementById('ai-art-date').value;
    const readtimeVal = parseInt(document.getElementById('ai-art-readtime').value);
    const imageVal = document.getElementById('ai-art-image').value;
    const ctaTextVal = document.getElementById('ai-art-ctatext').value.trim();
    const ctaUrlVal = document.getElementById('ai-art-ctaurl').value.trim();
    const contentVal = document.getElementById('ai-art-content').value.trim();
    
    let articles = getBlogArticles();
    
    const newArt = {
        id: Date.now().toString(),
        title: titleVal,
        summary: summaryVal,
        date: dateVal,
        readtime: readtimeVal,
        image: imageVal,
        ctaText: ctaTextVal,
        ctaUrl: ctaUrlVal,
        content: contentVal
    };
    
    articles.push(newArt);
    saveBlogArticles(articles);
    renderBlogArticlesAdmin();
    
    // Close modal
    const modal = document.getElementById('ai-article-editor-modal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
    
    alert('✅ SEO Blog post generated and scheduled successfully!');
});

// Bind cancel button
document.getElementById('blog-cancel-btn')?.addEventListener('click', () => {
    resetBlogForm();
});

// Run render on load
document.addEventListener('DOMContentLoaded', () => {
    renderBuildRequests();
    renderBlogArticlesAdmin();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    renderBuildRequests();
    renderBlogArticlesAdmin();
}

