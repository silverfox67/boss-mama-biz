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
                ctaText: "Enroll in Stacked by Emily →",
                ctaUrl: "https://stan.store/affiliates/8f9bdd55-e647-44d1-89cf-78f3b3750daa",
                content: `Let’s face it: the traditional path of trading time directly for dollars is a losing battle when you are managing a household. Between family schedules, school runs, and daily responsibilities, there simply aren't enough hours in the day to take on a second conventional job. Yet, relying on a single source of income in today's economy can feel incredibly precarious.<br><br>For many beginners, the solution seems obvious: start an online business. But if you look at the standard advice out there, it usually involves highly complex business models, massive upfront investment, or hours spent building an audience from scratch.<br><br>The secret to sustainable financial freedom isn’t working twenty hours a day on a single, massive project. It is building diversified, low-overhead digital income streams that fit into the pockets of your existing schedule.<br><br><h3>Why the "Single Income" Framework Fails Busy Families</h3>Most traditional business models demand an infinite amount of time before you ever see a return. If you start a business that requires physical inventory, manual shipping, or constant client consultation, you haven't created freedom—you’ve just built another demanding job.<br><br>When your time is already fractured by family commitments, you need a model that operates under three strict rules:<ul><li><strong>Zero Inventory:</strong> You should never have to buy, store, or ship physical items.</li><li><strong>Low Overhead:</strong> The entry barrier must be financially accessible, allowing you to start without risking the family budget.</li><li><strong>High Scalability:</strong> The asset should be built or set up once, then left to run with minimal daily maintenance.</li></ul>By shifting your focus from a single, high-stress job to multiple, small digital assets, you spread your financial risk and protect your energy from burnout.<br><br><h3>The Shift to Low-Overhead Digital Assets</h3>The biggest hurdle for beginners is the belief that they need to be a software developer, a professional writer, or a tech expert to sell anything online. In reality, the modern digital economy allows you to leverage existing platforms and frameworks to generate income without creating products entirely from scratch.<br><br>Instead of spending months trying to invent something completely new, successful digital marketers look for existing market demand and use established pathways to fulfill it.<br><br><h3>4 Accessible Digital Income Streams for Beginners</h3>If you are starting from absolute zero, here are four of the most reliable, beginner-friendly digital paths that require zero prior tech experience:<br><br><strong>1. Amazon Customer Reviews</strong><br>Brands are constantly looking for authentic video feedback on the products they sell. Through specialized reviewer programs, everyday consumers can upload brief, honest video reviews of items they already use. When shoppers watch those videos on a product page and make a purchase, the reviewer earns a percentage of the sale.<br><br><strong>2. User-Generated Content (UGC)</strong><br>Unlike traditional influencers who need hundreds of thousands of followers, UGC creators don’t need a following at all. Brands pay regular people to film simple, relatable videos using their products for advertisements. You get paid for the content creation itself, not for broadcasting it to your own personal network.<br><br><strong>3. Print on Demand (POD)</strong><br>With print on demand, you create simple text or graphic designs and upload them to online marketplaces. When a customer orders a shirt, mug, or notebook with your design, a third-party manufacturer prints and ships it automatically. You collect the profit margin without ever touching the merchandise.<br><br><strong>4. Digital Storefronts & E-Templates</strong><br>People actively search platforms like Etsy every day for digital planners, budgeting trackers, checklists, and organizational templates. Because these files are completely digital, once you upload the design to your shop, the platform handles the delivery automatically every single time someone purchases.<br><br><h3>Moving From Overwhelm to Execution</h3>The reason most people fail to establish a second income stream isn't a lack of ambition—it is a lack of a clear, sequential map. Trying to piece together random tutorials from YouTube often leads to conflicting advice, technical frustration, and ultimate abandonment.<br><br>To make multiple income streams work around a busy schedule, you don't need a business degree; you just need a structured framework that walks you through the setup process of each asset, step by step.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to access the ultimate budget-friendly roadmap to 14 distinct digital income streams inside Stacked by Emily.`
            },
            {
                id: "1784347819300",
                title: "No Face, No DMs: How to Launch a Faceless Digital Marketing Business From Home",
                summary: "Learn how to generate sustainable online income behind the scenes without recording daily videos, sharing your children's private moments, or cold-DMing strangers.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/blog-faceless.png",
                ctaText: "Access The Boss Suite →",
                ctaUrl: "https://stan.store/affiliates/81495b81-cf82-4813-8634-7f8d9f4369ba",
                content: `For a lot of moms, the idea of building an online income sounds incredible until they look at what it actually takes to get noticed on modern social media. The standard advice is almost always the same: you need to record daily videos of your life, dance on camera for the algorithms, share your children’s private moments, or slide into the direct messages of complete strangers to pitch products.<br><br>If that makes you hesitate, you are not alone. Protecting your family’s privacy and maintaining personal boundaries doesn't mean you are cut off from building a successful digital business.<br><br>There is an entire segment of the digital marketing industry that operates entirely behind the scenes. It is called faceless digital marketing, and it is quickly becoming the preferred blueprint for introverted or privacy-conscious parents who want to generate income without sacrificing their anonymity.<br><br><h3>The Misconception of the "Online Influencer"</h3>The biggest myth keeping people from starting an online business is that you have to become a public figure or a lifestyle influencer to make a sale.<br><br>When your personal identity is the product, your business demands constant visibility. You are forced to stay glued to a screen, monitoring comments, chasing viral trends, and managing a public persona. For a busy parent, this model creates a secondary loop of exhaustion that mimics a traditional corporate job.<br><br>Faceless digital marketing flips this dynamic completely. Instead of selling yourself, you sell solutions. The focus shifts entirely away from who you are and places it directly on what your target audience needs.<br><br><h3>How Faceless Marketing Works on Autopilot</h3>A faceless business is built around a specific theme, interest, or digital product niche rather than a personal face or name. The mechanics are clean and straightforward:<ul><li><strong>Aesthetic Content:</strong> Instead of filming yourself, you use high-quality B-roll video, clean typography, text overlays, and relatable messaging to capture attention.</li><li><strong>High-Intent Target Traffic:</strong> Your content speaks directly to a specific problem. Because the message is highly focused, it naturally attracts the exact people who are actively looking for a solution.</li><li><strong>Automated Backend Routing:</strong> When an interested user interacts with your content, they are automatically guided to a secure landing page. Simple background programs handle the product delivery, payments, and follow-ups.</li></ul>Because the brand relies on a system rather than a person, the storefront remains open and functional 24/7, whether you are running errands, sleeping, or focused entirely on your family.<br><br><h3>Bypassing the Technical Learning Curve</h3>While the concept of faceless marketing is simple, trying to piece the technical infrastructure together by yourself can feel completely isolating. Many beginners get stuck trying to choose the right niche, build a website, or write copy that actually converts.<br><br>You do not need to figure this out through trial and error. The fastest way to scale a faceless business is to plug into an established ecosystem that provides pre-built frameworks, vetted blueprints, and daily community support.<br><br>When you have access to a network of thousands of other parents running the exact same models, you eliminate the guesswork and gain immediate clarity on what is working in the market right now.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to join over 18,000 members inside The Boss Suite to unlock your comprehensive faceless growth hub and daily live coaching.`
            },
            {
                id: "1784347819400",
                title: "The Autopilot Framework: How to Turn Social Media Followers into Customers Using Smart Systems",
                summary: "Transform social media from a time-consuming hobby into an income-generating asset. Build an automated organic scaling presence backed by chatbot workflows.",
                date: new Date().toISOString().split('T')[0], // Published today
                readtime: 3,
                image: "images/blog-autopilot.png",
                ctaText: "Unlock Facebook Ecosystem Strategy →",
                ctaUrl: "https://stan.store/affiliates/7c8ee611-3279-4951-851c-41172d524e9a",
                content: `If you are trying to grow an online business, you have likely been told that you need to show up on social media every single day. So, you spend your limited free time creating posts, tracking trends, and sharing content. But at the end of the month, you look at your bank account and realize you are making exactly zero dollars for your efforts.<br><br>Even worse, when someone does show interest, you are stuck spending hours inside your direct messages manually pitching your offer, answering basic questions, and trying to close a sale while managing your household.<br><br>Chasing leads in the DMs isn't a sustainable strategy for a busy parent. The secret to transforming social media from a time-consuming hobby into an income-generating asset isn't posting more frequently—it is building an automated framework that handles the conversation for you.<br><br><h3>The Exhaustion of Manual Social Selling</h3>Most people treat social media like a digital billboard, hoping that if they post enough times, someone will eventually buy. When a prospect finally comments or sends a message, the business owner drops everything to reply manually.<br><br>This manual approach introduces three distinct bottlenecks:<ul><li><strong>The Availability Trap:</strong> If a potential customer messages you while you are putting the kids to bed or grocery shopping, they expect an immediate response. If you take hours to reply, the momentum is lost.</li><li><strong>The Inconsistency Problem:</strong> When your energy is split between your family and your business, the quality of your sales pitches fluctuates based on how tired you are.</li><li><strong>The Time Ceiling:</strong> There are only so many hours you can physically spend typing out responses in Messenger before you completely run out of time and energy.</li></ul>To build true leverage, your social media presence must be backed by a system that answers questions, delivers details, and processes transactions completely on autopilot.<br><br><h3>Aligning Your Digital Ecosystem for Organic Sales</h3>An automated social strategy relies on turning your personal profile and community spaces into a structured, self-sustaining ecosystem. Instead of a random collection of posts, your entire presence should act as a guided path for a visitor.<br><br>This ecosystem consists of a fully optimized profile that clearly states what you do, interactive community groups where interested prospects can gather, and smart backend communication tools. When these pieces are aligned, your social media profiles stop being a destination for mindless scrolling and start acting as a consistent, round-the-clock digital storefront.<br><br><h3>The Power of Smart Chatbot Conversational Frameworks</h3>The real engine behind an automated social media business is a conversational framework driven by smart automation tools, such as automated chatbots.<br><br>Instead of sitting at your screen typing the same information dozens of times a day, you can deploy pre-set automation blueprints. When a user interacts with your post or drops a specific keyword in your comments, the automated system takes over instantly:<ul><li>It opens a private conversation with the prospect right away.</li><li>It delivers a free tool, a product guide, or a checkout link automatically.</li><li>It answers frequently asked questions accurately and professionally, 24/7.</li></ul>This approach ensures that your business utilizes established trust-building principles, delivering consistent touchpoints to a prospect until they are ready to purchase—all without requiring you to be glued to your phone.<br><br><h3>Systemizing Content to Build Authority</h3>When your messaging and backend tools are fully automated, the pressure to go viral disappears. Your content no longer has to entertain the masses; it simply needs to direct high-intent, targeted traffic straight into your automated system.<br><br>By taking the guesswork out of the sales process, you can focus on simply guiding interested people to your website, letting your automated backend handle the information and presentation while you focus on what matters most in your personal life.<br><br><strong>Ready to find your path?</strong><br>Scroll down to take our 60-second interactive energy qualifier, or click below to get the complete organic audience-scaling blueprint and chatbot automation strategies with the Facebook Ecosystem Strategy.`
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

