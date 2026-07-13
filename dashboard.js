// ============================================
// BOSS MAMA BIZ — DASHBOARD LOGIC
// dashboard.js
// ============================================

const CORRECT_PIN = '2026';

// ── PIN Authentication ──────────────────────
const pinScreen   = document.getElementById('pin-screen');
const dashboard   = document.getElementById('dashboard');
const pinInput    = document.getElementById('pin-input');
const pinError    = document.getElementById('pin-error');
const pinDots     = [
    document.getElementById('dot-0'),
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3'),
];

// Focus the hidden input on any click
document.addEventListener('click', () => {
    if (pinScreen && !pinScreen.classList.contains('hidden')) {
        pinInput.focus();
    }
});

if (pinInput) {
    pinInput.addEventListener('input', () => {
        const val = pinInput.value;

        // Update dots
        pinDots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < val.length);
        });

        // Hide error when typing
        pinError.classList.remove('visible');

        // Check PIN when 4 digits entered
        if (val.length === 4) {
            if (val === CORRECT_PIN) {
                pinScreen.style.opacity = '0';
                pinScreen.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    pinScreen.classList.add('hidden');
                    dashboard.classList.remove('hidden');
                    dashboard.style.animation = 'fadeUp 0.5s ease';
                }, 450);
            } else {
                // Wrong PIN
                pinError.classList.add('visible');
                document.querySelector('.pin-box').classList.add('shake');
                setTimeout(() => {
                    document.querySelector('.pin-box').classList.remove('shake');
                    pinInput.value = '';
                    pinDots.forEach(d => d.classList.remove('filled'));
                }, 450);
            }
        }
    });
}

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
    });
});

// "Go →" buttons inside overview action list
document.querySelectorAll('.btn-action-sm[data-section]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(btn.dataset.section);
    });
});

// ── Email Funnel Tabs ───────────────────────
document.querySelectorAll('.email-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const funnel = tab.dataset.funnel;

        document.querySelectorAll('.email-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.email-funnel-content').forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const content = document.getElementById(`email-funnel-${funnel}`);
        if (content) content.classList.add('active');
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
