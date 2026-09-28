/* ============================================
   BOSS MAMA BIZ — COMMAND CENTER (NEW SETUP)
   Clean, Fast & Lightweight Controller
   ============================================ */

const CORRECT_PIN = '2026';

// ── Her Own Proprietary Products (Stripe Powered) ──
const OWN_PRODUCTS = [
    {
        id: 'own-vault',
        title: 'The Creative Content Vault',
        subtitle: '90+ Days of Content Prompts',
        badge: '★ Free Lead Magnet',
        desc: 'Never wonder what to post again. 90+ days of scroll-stopping hooks, storytelling prompts, and high-converting calls-to-action with built-in FES chatbot strategies.',
        price: 'FREE',
        type: 'Direct Email Opt-in',
        img: 'images/own-vault.png',
        stripeUrl: '',
        driveUrl: 'https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view'
    },
    {
        id: 'own-create',
        title: 'Create Your First Digital Product',
        subtitle: 'In 6 Simple Steps — With Me',
        badge: '★ Her Own Product',
        desc: 'Go from idea to income in 6 easy steps. Includes her complete 500+ ChatGPT Prompts guide ($17 Value) FREE as a special launch bundle! Direct Stripe checkout.',
        price: '$27',
        type: 'Stripe Checkout',
        img: 'images/own-create.png',
        stripeUrl: 'https://buy.stripe.com/3cI3cnbmJ7zA5rMgAuaIM01',
        driveUrl: 'https://drive.google.com/file/d/1bu8X8sQFcf4WJcOIQF6R6Jpnizybrhgy/view'
    },
    {
        id: 'own-prompts',
        title: '500+ ChatGPT Prompts',
        subtitle: 'For Your Digital Business',
        badge: '★ Her Own Product',
        desc: 'The AI cheat sheet for digital marketers. 500+ done-for-you prompts for content, captions, emails, product descriptions, and sales pages for any niche.',
        price: '$17',
        type: 'Stripe Checkout',
        img: 'images/own-prompts.png',
        stripeUrl: 'https://buy.stripe.com/5kQ28jcqNaLM1bwdoiaIM00',
        driveUrl: 'https://drive.google.com/file/d/1cMH7l6mWILhcQ_JRITen5XcMB6SdWZZf/view'
    }
];

// ── Recommended Partner Programs (Stan Store) ──
const STAN_PRODUCTS = [
    {
        id: 'stacked',
        title: 'Stacked by Emily',
        badge: 'Master Resell Rights (MRR)',
        desc: 'The ultimate budget-friendly roadmap to 14 digital income streams by Emily Hiatt. Learn Amazon reviews, UGC, and Etsy storefronts with step-by-step video modules.',
        price: '$267 (MRR)',
        url: 'https://stan.store/Kristan_Oconnor/p/stacked-by-emily'
    },
    {
        id: 'boss-suite',
        title: 'The Boss Suite',
        badge: 'Most Popular',
        desc: 'All-in business growth hub by Madison Hatten. Join 18k+ members covering 15+ income streams (faceless UGC, Amazon reviews) with daily mentorship and weekly live coaching.',
        price: 'Core Community',
        url: 'https://stan.store/Kristan_Oconnor/p/bosssuite-sneak-peek'
    },
    {
        id: 'fes',
        title: 'Facebook Ecosystem Strategy',
        badge: 'Hot Right Now',
        desc: 'The organic audience-scaling blueprint by Jasmine Cruz. Align profiles, groups, and Manychat bots to build authority and convert followers on autopilot.',
        price: 'Automation Guide',
        url: 'https://stan.store/Kristan_Oconnor/p/preview-inside-fes'
    },
    {
        id: 'plr-vault',
        title: 'PLR Vault',
        badge: 'Done For You',
        desc: 'Private label rights library and setup masterclass by Courtney Milam. Massive vault of rebrandable ebooks, videos, and articles plus 8+ hours of video launch training.',
        price: 'Rebrandable Library',
        url: 'https://stan.store/affiliates/238a4731-b0b4-47ac-8956-51dbc49db694'
    },
    {
        id: 'alignment-reset',
        title: 'The 90-Day Alignment Reset™',
        badge: 'Mindset & Action',
        desc: 'Transformational blueprint to break through burnout and reclaim energy. Somatic nervous system tools, boundary frameworks, and strategic planning workbooks.',
        price: 'Flagship Guide',
        url: 'https://stan.store/Kristan_Oconnor'
    }
];

// ── Default Leads ──────────────────────────
const DEFAULT_LEADS = [
    { name: 'Sarah Jenkins', email: 'sarah.j.creative@gmail.com', source: 'Freebie Opt-in (Popup)', date: '2026-09-24', status: 'Delivered' },
    { name: 'Michelle Gomez', email: 'm.gomez.momlife@outlook.com', source: 'Quiz Completion', date: '2026-09-25', status: 'Delivered' },
    { name: 'Ashley Campbell', email: 'ashleyc_biz@yahoo.com', source: 'Freebie Opt-in (Hero)', date: '2026-09-26', status: 'Delivered' },
    { name: 'Danielle Miller', email: 'dmiller.home@gmail.com', source: 'Homepage Footer', date: '2026-09-27', status: 'Delivered' },
    { name: 'Jessica Taylor', email: 'jtaylor.designs@icloud.com', source: 'Quiz Completion', date: '2026-09-28', status: 'Delivered' }
];

// ── Automated Email Sequences (Brevo List #10) ──
const EMAIL_SEQUENCES = [
    {
        id: 'email-1',
        day: 'Email 1 • Day 0 (Immediate)',
        title: 'Your Free Guide + Welcome to Boss Mama Biz',
        timingBadge: 'Immediate Delivery (< 60s)',
        subject: 'Here is your download link! 🌸 (Welcome inside)',
        target: 'All Freebie Opt-ins & Quiz Leads',
        summary: 'Sent within 60 seconds of sign-up. Delivers their starter PDF download link to Google Drive and introduces Kristan.',
        ctaUrl: 'https://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view',
        ctaText: 'Open Creative Content Vault (Google Drive)',
        body: `Hey mama,\n\nWelcome to the Boss Mama Biz family! 🌸\n\nYour free copy of The Creative Content Vault is officially ready. You can access the entire library of 90+ prompt templates, storytelling hooks, and chatbot conversion prompts right here:\n\n👉 Click Here to Open Your Creative Content Vault:\nhttps://drive.google.com/file/d/16ghn0fLMiAL72yz_JwCaLGR9ASeZRFQz/view\n\nHere is what you’ll find inside:\n• 90+ Days of Plug-and-Play Prompts (Never stare at a blank screen again)\n• Storytelling Hooks designed to stop the scroll in under 3 seconds\n• High-converting Calls-to-Action to guide followers directly to your offers\n\nPro Tip: Bookmark the Google Drive link or download the PDF to your phone or computer right now so you always have it handy when you're creating content during naptime or between errands!\n\nOver the next few days, I'll be sharing a few quick insights into how I run this business without spending 8 hours a day glued to my phone.\n\nSo excited to have you here!\n\nWith love & clarity,\nKristan O'Connor\nFounder, Boss Mama Biz\nbossmamabiz.com`
    },
    {
        id: 'email-2',
        day: 'Email 2 • Day 1 (24h Delay)',
        title: 'The Real Reason Most Digital Side Hustles Fail',
        timingBadge: '24 Hours After Sign-up',
        subject: 'Stop posting 5x a day... do this instead',
        target: 'All Subscribers',
        summary: 'Breaks the myth of needing 10,000 followers or hours in DMs. Introduces her $27 beginner guide "Create Your First Digital Product".',
        ctaUrl: 'https://buy.stripe.com/3cI3cnbmJ7zA5rMgAuaIM01',
        ctaText: 'Get Started for $27 (Stripe Checkout)',
        body: `Hey mama,\n\nReal talk for a minute:\n\nWhen most women start looking into digital income, they get told the same exhausting advice:\n"Post 5 reels a day, dance in front of the camera, and spend 3 hours a day in people's DMs."\n\nI don't know about you, but as a busy mom, I simply don't have time for that. And honestly? It's the #1 reason women burn out and quit after 3 weeks.\n\nHere's the secret nobody talks about:\nYou don't need a huge following or endless posting to make real money online. You just need a simple digital asset that works quietly in the background while you live your life.\n\nWhether it's a $17 prompt bank, a $27 beginner guide, or an affiliate program you believe in—once you set up the link and the automated delivery, the system does the heavy lifting for you.\n\nIf you've been wondering how to actually build and launch your very first digital product from scratch, I put together my exact 6-step blueprint:\n\n👉 Create Your First Digital Product ($27):\nhttps://buy.stripe.com/3cI3cnbmJ7zA5rMgAuaIM01\n(Includes my complete 500+ ChatGPT Prompts Guide for FREE as a special launch bundle!)\n\nTake your time going through the Content Vault today, and remember: work smarter, not harder.\n\nWarmly,\nKristan O'Connor\nFounder, Boss Mama Biz`
    },
    {
        id: 'email-3',
        day: 'Email 3 • Day 3 (72h Delay)',
        title: 'Sneak Peek: Inside The Boss Suite & Stacked',
        timingBadge: 'Day 3 After Sign-up',
        subject: 'Look inside my favorite system (sneak peek)',
        target: 'All Subscribers',
        summary: 'Explains why you do not have to create everything yourself. Introduces The Boss Suite and Stacked with behind-the-scenes previews.',
        ctaUrl: 'https://stan.store/Kristan_Oconnor/p/bosssuite-sneak-peek',
        ctaText: 'Sneak Peek: The Boss Suite & Stacked',
        body: `Hey mama,\n\nOne of the biggest questions I get in my inbox is:\n"Kristan, how do you know what to sell if you don't want to create everything yourself?"\n\nHere's the truth: You DON'T have to create everything from scratch!\n\nSome of the most successful digital marketers and moms I know make incredible income using proven programs that are already built, tested, and high-converting.\n\nTwo systems that completely changed the game for me and my community:\n\n1. The Boss Suite (by Madison Hatten)\nAn incredible community of 18,000+ members covering 15+ income streams (including faceless UGC and Amazon reviews) with daily mentorship and weekly live coaching Zooms.\n👉 Sneak Peek Inside The Boss Suite:\nhttps://stan.store/Kristan_Oconnor/p/bosssuite-sneak-peek\n\n2. Stacked (by Emily Hiatt)\nThe ultimate budget-friendly roadmap to 14 digital income streams with short, digestible video modules that fit into busy mom schedules.\n👉 Check Out Stacked by Emily:\nhttps://stan.store/Kristan_Oconnor/p/stacked-by-emily\n\nYou don't have to do this alone from your kitchen counter. Having a step-by-step roadmap and a supportive community makes all the difference in the world.\n\nTake a look at the sneak peeks and see what clicks with your goals!\n\nCheering you on,\nKristan O'Connor\nBoss Mama Biz`
    },
    {
        id: 'email-4',
        day: 'Email 4 • Day 5 (120h Delay)',
        title: 'Your 90-Day Reset Plan & Direct Support',
        timingBadge: 'Day 5 After Sign-up',
        subject: 'Your 90-day reset plan starts today',
        target: 'All Subscribers',
        summary: 'Empowers subscribers to take action, introduces The 90-Day Alignment Reset™, and invites direct email replies with questions.',
        ctaUrl: 'https://stan.store/Kristan_Oconnor',
        ctaText: 'Explore The 90-Day Alignment Reset',
        body: `Hey mama,\n\nChecking in on you! 🌸\n\nHave you had a chance to test out any of the prompts from your Creative Content Vault yet?\n\nBuilding a digital business isn't about rushing or feeling overwhelmed. It's about taking small, intentional steps each day.\n\nWhen I first started, the biggest challenge wasn't the technology—it was managing my own energy, avoiding burnout, and setting healthy boundaries between my business, my family, and my mental health.\n\nThat's exactly why I created The 90-Day Alignment Reset™:\nA somatic nervous system workbook and boundary-setting framework to help you build your income without losing your peace of mind.\n\n👉 Check out The 90-Day Alignment Reset:\nhttps://stan.store/Kristan_Oconnor\n\nAnd remember: My inbox is always open!\nIf you're stuck on choosing a niche, setting up your links, or figuring out your first offer, just hit "REPLY" to this email and let me know what you're working on. I read and answer every single message personally.\n\nYou've got this, and I'm right here in your corner.\n\nBig hugs,\nKristan O'Connor\nFounder, Boss Mama Biz\nbossmamabiz.com`
    }
];

// ── State Variables ────────────────────────
let pinEntry = [];
let leadsData = [];
let pendingRequests = [];
let currentEmailModalIndex = 0;

// ── Initialization ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initProducts();
    initLeads();
    initRequests();
    initEmails();
});

// ============================================
// 1. PIN AUTHENTICATION
// ============================================
function initAuth() {
    const pinScreen = document.getElementById('pin-screen');
    const dashboard = document.getElementById('dashboard');

    // Check if already unlocked in this session
    if (sessionStorage.getItem('bmb_pin_unlocked') === 'true') {
        pinScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        return;
    }

    // Keypad button clicks
    document.querySelectorAll('.pin-key[data-digit]').forEach(btn => {
        btn.addEventListener('click', () => {
            handlePinInput(btn.dataset.digit);
        });
    });

    // Delete button
    const deleteBtn = document.getElementById('pin-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handlePinDelete);
    }

    // Physical keyboard input
    window.addEventListener('keydown', (e) => {
        if (!pinScreen.classList.contains('hidden')) {
            if (/^[0-9]$/.test(e.key)) {
                handlePinInput(e.key);
            } else if (e.key === 'Backspace') {
                handlePinDelete();
            }
        }
    });
}

function handlePinInput(digit) {
    if (pinEntry.length >= 4) return;
    pinEntry.push(digit);
    updatePinDots();

    if (pinEntry.length === 4) {
        setTimeout(verifyPin, 100);
    }
}

function handlePinDelete() {
    if (pinEntry.length > 0) {
        pinEntry.pop();
        updatePinDots();
        hidePinError();
    }
}

function updatePinDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < pinEntry.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function verifyPin() {
    const entered = pinEntry.join('');
    if (entered === CORRECT_PIN) {
        sessionStorage.setItem('bmb_pin_unlocked', 'true');
        const pinScreen = document.getElementById('pin-screen');
        const dashboard = document.getElementById('dashboard');

        pinScreen.style.opacity = '0';
        pinScreen.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            pinScreen.classList.add('hidden');
            dashboard.classList.remove('hidden');
        }, 300);
    } else {
        showPinError();
        pinEntry = [];
        updatePinDots();
    }
}

function showPinError() {
    const err = document.getElementById('pin-error');
    if (err) err.classList.add('visible');
}

function hidePinError() {
    const err = document.getElementById('pin-error');
    if (err) err.classList.remove('visible');
}

// ============================================
// 2. NAVIGATION & TABS (Icon-Free, Pure Typography)
// ============================================
const TAB_TITLES = {
    'overview': { title: 'Overview', subtitle: 'Your central hub for products, leads, and store performance.' },
    'products': { title: 'My Products', subtitle: 'Manage your active offers and request new funnels.' },
    'leads':    { title: 'Leads & Customers', subtitle: 'Direct view of contacts who opted in across your website.' },
    'emails':   { title: 'Email Sequences', subtitle: 'Automated 4-part nurture sequences delivered to your subscribers.' },
    'vault':    { title: 'Vault & Brand Assets', subtitle: 'Your brand hex codes, typography specs, and account links.' }
};

function initNavigation() {
    document.querySelectorAll('.nav-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(link.dataset.tab);
            closeSidebarMobile();
        });
    });

    // Mobile Hamburger
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

function switchTab(tabId) {
    if (!TAB_TITLES[tabId]) return;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.tab === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update visible tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) activePane.classList.add('active');

    // Update Topbar Title
    const titleEl = document.getElementById('page-title');
    const subEl = document.getElementById('page-subtitle');
    if (titleEl) titleEl.textContent = TAB_TITLES[tabId].title;
    if (subEl) subEl.textContent = TAB_TITLES[tabId].subtitle;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeSidebarMobile() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 900) {
        sidebar.classList.remove('open');
    }
}

// ============================================
// 3. PRODUCTS MANAGEMENT
// ============================================
function initProducts() {
    // 1. Render Her Own Flagship Products (Stripe Powered)
    const ownContainer = document.getElementById('own-products-container');
    if (ownContainer) {
        ownContainer.innerHTML = OWN_PRODUCTS.map(p => `
            <div class="product-card">
                <img src="${p.img}" alt="${escapeHtml(p.title)}" class="product-card-img-preview">
                <div class="product-card-top">
                    <span class="product-badge">${escapeHtml(p.badge)}</span>
                    <span style="font-weight:800; font-size:1.1rem; color:var(--primary);">${escapeHtml(p.price)}</span>
                </div>
                <h3 class="product-card-title">${escapeHtml(p.title)}</h3>
                <p style="font-size:0.82rem; color:var(--text-muted); font-weight:600; margin-bottom:0.5rem;">${escapeHtml(p.subtitle)}</p>
                <p class="product-card-desc">${escapeHtml(p.desc)}</p>
                
                <div class="product-card-links">
                    ${p.stripeUrl ? `
                    <div class="product-link-row">
                        <span class="product-link-title">Stripe Checkout</span>
                        <div style="display:flex; gap:0.4rem;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="copyToClipboard('${p.stripeUrl}', 'Stripe link copied!')">
                                Copy Link
                            </button>
                            <a href="${p.stripeUrl}" target="_blank" class="btn btn-primary btn-sm">
                                Test Checkout ↗
                            </a>
                        </div>
                    </div>
                    ` : `
                    <div class="product-link-row">
                        <span class="product-link-title">Freebie Opt-in</span>
                        <span style="font-size:0.8rem; color:var(--status-active); font-weight:700;">Direct Delivery via Email</span>
                    </div>
                    `}

                    ${p.driveUrl ? `
                    <div class="product-link-row">
                        <span class="product-link-title">Deliverable Asset</span>
                        <div style="display:flex; gap:0.4rem;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="copyToClipboard('${p.driveUrl}', 'Drive link copied!')">
                                Copy Link
                            </button>
                            <a href="${p.driveUrl}" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--text-primary);">
                                Open Drive ↗
                            </a>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // 2. Render Recommended Partner Programs (Stan Store)
    const stanContainer = document.getElementById('stan-products-container');
    if (stanContainer) {
        stanContainer.innerHTML = STAN_PRODUCTS.map(p => `
            <div class="product-card">
                <div class="product-card-top">
                    <span class="product-badge">${escapeHtml(p.badge)}</span>
                    <span style="font-weight:700; font-size:0.85rem; color:var(--text-primary);">${escapeHtml(p.price)}</span>
                </div>
                <h3 class="product-card-title">${escapeHtml(p.title)}</h3>
                <p class="product-card-desc">${escapeHtml(p.desc)}</p>
                
                <div class="product-card-links">
                    <div class="product-link-row">
                        <span class="product-link-title">Stan Store Page</span>
                        <div style="display:flex; gap:0.4rem;">
                            <button type="button" class="btn btn-secondary btn-sm" onclick="copyToClipboard('${p.url}', 'Stan Store link copied!')">
                                Copy Link
                            </button>
                            <a href="${p.url}" target="_blank" class="btn btn-primary btn-sm">
                                Visit ↗
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const totalProducts = OWN_PRODUCTS.length + STAN_PRODUCTS.length;
    const countBadge = document.getElementById('sidebar-product-count');
    const statBadge = document.getElementById('stat-products-count');
    if (countBadge) countBadge.textContent = totalProducts;
    if (statBadge) statBadge.textContent = `${totalProducts}`;
}

// ============================================
// 4. REQUEST PRODUCT (Concierge Bridge for Kris)
// ============================================
function openRequestModal() {
    const modal = document.getElementById('request-modal');
    if (modal) modal.classList.add('active');
}

function closeRequestModal() {
    const modal = document.getElementById('request-modal');
    if (modal) modal.classList.remove('active');
}

function handleRequestSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('req-title').value.trim();
    const price = document.getElementById('req-price').value;
    const desc = document.getElementById('req-description').value.trim();
    const link = document.getElementById('req-link').value.trim();

    if (!title) return;

    const newRequest = {
        id: 'req_' + Date.now(),
        title,
        price,
        desc,
        link,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'In Production'
    };

    pendingRequests.unshift(newRequest);
    localStorage.setItem('bmb_pending_requests', JSON.stringify(pendingRequests));

    renderPendingRequests();
    closeRequestModal();
    document.getElementById('product-request-form').reset();

    showToast('Request received! Trident team is on it 🛠️');

    // Switch to products tab so she sees her pending request
    switchTab('products');
}

function initRequests() {
    try {
        const saved = localStorage.getItem('bmb_pending_requests');
        pendingRequests = saved ? JSON.parse(saved) : [];
    } catch (err) {
        pendingRequests = [];
    }
    renderPendingRequests();
}

function renderPendingRequests() {
    const section = document.getElementById('pending-requests-section');
    const list = document.getElementById('pending-requests-list');
    if (!section || !list) return;

    if (pendingRequests.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    list.innerHTML = pendingRequests.map(req => `
        <div class="card" style="padding:1.2rem; background:#FFFFFF; border:1px solid var(--border-warm); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div>
                <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.2rem;">
                    <strong style="font-size:1.05rem; color:var(--text-primary);">${escapeHtml(req.title)}</strong>
                    <span class="status-pill status-pending">${escapeHtml(req.status)}</span>
                </div>
                <p style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(req.price)} • Submitted on ${escapeHtml(req.date)}</p>
                <p style="font-size:0.85rem; color:var(--text-body); margin-top:0.4rem;">${escapeHtml(req.desc)}</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="removeRequest('${req.id}')" title="Dismiss">
                Dismiss
            </button>
        </div>
    `).join('');
}

function removeRequest(id) {
    pendingRequests = pendingRequests.filter(r => r.id !== id);
    localStorage.setItem('bmb_pending_requests', JSON.stringify(pendingRequests));
    renderPendingRequests();
    showToast('Request dismissed');
}

// ============================================
// 5. LEADS MANAGEMENT & CSV EXPORT
// ============================================
function initLeads() {
    try {
        const saved = localStorage.getItem('bmb_local_leads');
        leadsData = saved ? JSON.parse(saved) : DEFAULT_LEADS;
    } catch (err) {
        leadsData = DEFAULT_LEADS;
    }

    renderLeads(leadsData);

    const searchInput = document.getElementById('lead-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = leadsData.filter(l => 
                l.name.toLowerCase().includes(query) || 
                l.email.toLowerCase().includes(query)
            );
            renderLeads(filtered);
        });
    }
}

function renderLeads(leads) {
    const tbody = document.getElementById('leads-table-body');
    const badge = document.getElementById('sidebar-lead-count');
    const statBadge = document.getElementById('stat-leads-count');
    
    if (badge) badge.textContent = leadsData.length;
    if (statBadge) statBadge.textContent = leadsData.length;

    if (!tbody) return;

    if (leads.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:2.5rem; color:var(--text-muted);">
                    No contacts match your search.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = leads.map(l => `
        <tr>
            <td style="font-weight:700; color:var(--text-primary);">${escapeHtml(l.name)}</td>
            <td><a href="mailto:${escapeHtml(l.email)}" style="color:var(--text-primary);">${escapeHtml(l.email)}</a></td>
            <td style="color:var(--text-muted);">${escapeHtml(l.source)}</td>
            <td style="color:var(--text-muted);">${escapeHtml(l.date)}</td>
            <td><span class="status-pill status-active">${escapeHtml(l.status)}</span></td>
        </tr>
    `).join('');
}

function exportLeadsCSV() {
    if (leadsData.length === 0) {
        showToast('No leads to export');
        return;
    }

    const headers = ['Name', 'Email', 'Source', 'Date Added', 'Status'];
    const rows = leadsData.map(l => [
        `"${l.name.replace(/"/g, '""')}"`,
        `"${l.email.replace(/"/g, '""')}"`,
        `"${l.source.replace(/"/g, '""')}"`,
        `"${l.date}"`,
        `"${l.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `boss_mama_biz_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Leads CSV exported successfully!');
}

// ============================================
// 6. EMAIL SEQUENCES MANAGEMENT & PREVIEW
// ============================================
function initEmails() {
    const container = document.getElementById('email-sequences-container');
    if (!container) return;

    container.innerHTML = EMAIL_SEQUENCES.map((em, index) => `
        <div class="card" style="padding:1.6rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.8rem; margin-bottom:0.8rem;">
                <div>
                    <span style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:0.2rem;">
                        ${escapeHtml(em.day)}
                    </span>
                    <h3 style="font-size:1.15rem; color:var(--text-primary);">${escapeHtml(em.title)}</h3>
                </div>
                <span class="status-pill status-active">Active in Brevo</span>
            </div>

            <p style="font-size:0.88rem; color:var(--text-muted); line-height:1.5; margin-bottom:1rem;">
                ${escapeHtml(em.summary)}
            </p>

            <!-- Subject Line Bar -->
            <div style="background:var(--bg-cream-tint); padding:0.7rem 1rem; border-radius:8px; border:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.6rem; margin-bottom:1.2rem;">
                <div style="font-size:0.85rem; color:var(--text-body);">
                    <strong style="color:var(--text-primary);">Subject:</strong> ${escapeHtml(em.subject)}
                </div>
                <button type="button" class="btn btn-secondary btn-sm" onclick="copyToClipboard('${escapeHtml(em.subject).replace(/'/g, "\\'")}', 'Subject line copied!')">
                    Copy Subject
                </button>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex; gap:0.6rem; align-items:center;">
                <button type="button" class="btn btn-primary btn-sm" onclick="openEmailModal(${index})">
                    Read Full Email Copy ↗
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="copyEmailText(${index})">
                    Copy Full Text
                </button>
            </div>
        </div>
    `).join('');
}

function openEmailModal(index) {
    const email = EMAIL_SEQUENCES[index];
    if (!email) return;

    currentEmailModalIndex = index;
    const modal = document.getElementById('email-preview-modal');
    const timingEl = document.getElementById('modal-email-timing');
    const titleEl = document.getElementById('modal-email-title');
    const subjectEl = document.getElementById('modal-email-subject');
    const targetEl = document.getElementById('modal-email-target');
    const bodyEl = document.getElementById('modal-email-body');

    if (timingEl) timingEl.textContent = email.timingBadge;
    if (titleEl) titleEl.textContent = email.title;
    if (subjectEl) subjectEl.textContent = email.subject;
    if (targetEl) targetEl.textContent = email.target;
    
    // Auto-linkify URLs in body preview
    if (bodyEl) {
        let formattedBody = escapeHtml(email.body);
        formattedBody = formattedBody.replace(/(https:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        bodyEl.innerHTML = formattedBody;
    }

    if (modal) modal.classList.add('active');
}

function closeEmailModal() {
    const modal = document.getElementById('email-preview-modal');
    if (modal) modal.classList.remove('active');
}

function copyCurrentModalEmail() {
    copyEmailText(currentEmailModalIndex);
}

function copyEmailText(index) {
    const email = EMAIL_SEQUENCES[index];
    if (!email) return;

    const fullMessage = `Subject: ${email.subject}\n\n${email.body}`;
    copyToClipboard(fullMessage, `Email #${index + 1} copy copied to clipboard!`);
}

// ============================================
// 7. UTILITY HELPERS
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

function copyToClipboard(text, successMsg) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(successMsg || 'Copied to clipboard!');
        }).catch(() => {
            fallbackCopy(text, successMsg);
        });
    } else {
        fallbackCopy(text, successMsg);
    }
}

function fallbackCopy(text, successMsg) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(successMsg || 'Copied to clipboard!');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.switchTab = switchTab;
window.openRequestModal = openRequestModal;
window.closeRequestModal = closeRequestModal;
window.handleRequestSubmit = handleRequestSubmit;
window.removeRequest = removeRequest;
window.copyToClipboard = copyToClipboard;
window.exportLeadsCSV = exportLeadsCSV;
window.openEmailModal = openEmailModal;
window.closeEmailModal = closeEmailModal;
window.copyCurrentModalEmail = copyCurrentModalEmail;
window.copyEmailText = copyEmailText;
window.EMAIL_SEQUENCES = EMAIL_SEQUENCES;
window.OWN_PRODUCTS = OWN_PRODUCTS;
window.STAN_PRODUCTS = STAN_PRODUCTS;

