// ============================================================
//  BOSS MAMA BIZ — script.js v6.0
//  Quiz · Carousel · Bridge Funnel · 4 Tools · Usage Limits · Boss AI
// ============================================================

// ---- BREVO CONFIG (add your keys to activate email capture) ----
// Get your API key from: https://app.brevo.com/settings/keys/api
// Get your List ID from: https://app.brevo.com/contact/list
const BREVO_API_KEY = ''; // e.g. 'xkeysib-abc123...'
const BREVO_LIST_ID = 2;  // Replace with your Brevo list ID number

// ---- AFFILIATE LINKS ----
const LINKS = {
    quiz:      'https://stan.store/Kristan_Oconnor/p/which-income-stream-matches-your-energy-w4rgsje8',
    stacked:   { peek: 'https://stan.store/Kristan_Oconnor/p/the-stacked-sneak-peek-qukh6f7x', buy: 'https://stan.store/affiliates/8f9bdd55-e647-44d1-89cf-78f3b3750daa' },
    boss:      { peek: 'https://stan.store/Kristan_Oconnor/p/bosssuite-sneak-peek', buy: 'https://stan.store/affiliates/81495b81-cf82-4813-8634-7f8d9f4369ba' },
    fes:       { peek: 'https://stan.store/Kristan_Oconnor/p/preview-inside-fes', buy: 'https://stan.store/affiliates/7c8ee611-3279-4951-851c-41172d524e9a' },
    plr:       { buy: 'https://stan.store/affiliates/238a4731-b0b4-47ac-8956-51dbc49db694' },
    alignment: { buy: 'https://stan.store/affiliates/98e8fb0b-89ae-4176-a439-f07888142d94' },
    create27:  'https://stan.store/Kristan_Oconnor/p/create-your-1st-digital-product-in-6-simple-steps',
    chatgpt:   'https://stan.store/Kristan_Oconnor/p/500-chatgpt-prompts-for-your-digital-business'
};

// ============================================================
//  USAGE LIMIT SYSTEM  (localStorage — 3 free uses/day/tool)
// ============================================================
const USAGE_LIMIT = 3;

function getUsage(toolId) {
    const today = new Date().toDateString();
    const key = `bmb_usage_${toolId}_${today}`;
    return parseInt(localStorage.getItem(key) || '0');
}

function incrementUsage(toolId) {
    const today = new Date().toDateString();
    const key = `bmb_usage_${toolId}_${today}`;
    const used = getUsage(toolId) + 1;
    localStorage.setItem(key, used);
    return used;
}

function isUnlocked() {
    return localStorage.getItem('bmb_unlocked') === 'true';
}

function unlockTools() {
    localStorage.setItem('bmb_unlocked', 'true');
}

function checkLimit(toolId) {
    if (isUnlocked()) return true;
    const used = getUsage(toolId);
    return used < USAGE_LIMIT;
}

function updateUsageBars() {
    ['calc', 'niche', 'plr', 'ai'].forEach(id => {
        const used = isUnlocked() ? 0 : getUsage(id);
        const fill = document.getElementById(`${id}-usage-fill`);
        const label = document.getElementById(`${id}-usage-label`);
        if (!fill || !label) return;
        if (isUnlocked()) {
            fill.style.width = '0%';
            fill.style.background = 'var(--primary)';
            label.textContent = '✅ Unlimited access unlocked';
        } else {
            const pct = (used / USAGE_LIMIT) * 100;
            fill.style.width = pct + '%';
            const remaining = USAGE_LIMIT - used;
            if (remaining > 0) {
                label.textContent = `${remaining} free use${remaining !== 1 ? 's' : ''} remaining today`;
                fill.style.background = pct >= 66 ? '#E8327A' : 'var(--primary)';
            } else {
                label.textContent = '⚠ Limit reached — unlock free access below';
                fill.style.background = '#E8327A';
            }
        }
    });
}

// ---- TOOL MODAL OPEN/CLOSE ----
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
}

function tryOpenTool(toolId, modalId) {
    if (checkLimit(toolId)) {
        incrementUsage(toolId);
        updateUsageBars();
        openModal(modalId);
    } else {
        openModal('email-gate-modal');
    }
}

// Close buttons for all tool modals
document.querySelectorAll('.tool-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        if (modalId) closeModal(modalId);
    });
});

// Close modals clicking outside
document.querySelectorAll('.tool-modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal.id);
    });
});

// ============================================================
//  EMAIL GATE
// ============================================================
const emailGateForm = document.getElementById('email-gate-form');
if (emailGateForm) {
    emailGateForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('gate-name').value;
        const email = document.getElementById('gate-email').value;
        const btn = emailGateForm.querySelector('button[type="submit"]');
        btn.textContent = 'Unlocking...';
        btn.disabled = true;
        try {
            await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, list: 'tools-unlock' })
            });
        } catch (_) { /* silent — unlock anyway */ }
        unlockTools();
        updateUsageBars();
        closeModal('email-gate-modal');
        btn.textContent = 'Unlock Free Access →';
        btn.disabled = false;
        emailGateForm.reset();
        showToast('✅ Unlimited access unlocked! All tools are now free for you.');
    });
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'bmb-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('visible'), 100);
    setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 500); }, 4000);
}

// ============================================================
//  TOOL BUTTONS
// ============================================================
document.getElementById('open-calculator')?.addEventListener('click', () => tryOpenTool('calc', 'calculator-modal'));
document.getElementById('open-niche-finder')?.addEventListener('click', () => tryOpenTool('niche', 'niche-finder-modal'));
document.getElementById('open-plr-filter')?.addEventListener('click', () => tryOpenTool('plr', 'plr-filter-modal'));
document.getElementById('open-boss-ai')?.addEventListener('click', () => tryOpenTool('ai', 'boss-ai-modal'));
document.getElementById('open-plr-filter-from-card')?.addEventListener('click', () => tryOpenTool('plr', 'plr-filter-modal'));
document.getElementById('boss-ai-bubble')?.addEventListener('click', () => tryOpenTool('ai', 'boss-ai-modal'));

// ============================================================
//  TOOL 1: INCOME POTENTIAL CALCULATOR
// ============================================================
const hoursSlider = document.getElementById('calc-hours');
const hoursLabel = document.getElementById('calc-hours-label');
if (hoursSlider && hoursLabel) {
    hoursSlider.addEventListener('input', () => {
        hoursLabel.textContent = `${hoursSlider.value} hours/week`;
    });
}

document.getElementById('run-calculator')?.addEventListener('click', () => {
    const hours = parseInt(document.getElementById('calc-hours').value);
    const goal = parseInt(document.getElementById('calc-goal').value);
    const budget = parseInt(document.getElementById('calc-budget').value);
    const tech = parseInt(document.getElementById('calc-tech').value);

    let rec, recLink, recText, timeline, low, high;

    // Income estimation (simplified but realistic)
    const weeklyHours = hours;
    if (weeklyHours <= 3) {
        low = 200; high = 800;
        timeline = '2–4 months to first consistent sales';
    } else if (weeklyHours <= 8) {
        low = 500; high = 2000;
        timeline = '6–10 weeks to first sales, scaling by month 3';
    } else {
        low = 1500; high = 5000;
        timeline = '3–6 weeks to first sales if you follow the system';
    }

    // Recommendation logic
    if (budget === 0 || budget === 27) {
        if (tech === 1) {
            rec = 'Stacked by Emily'; recLink = LINKS.stacked.peek;
            recText = "It's the most beginner-friendly path on the market — short videos that show you exactly what to do. Perfect starting point for your budget.";
        } else {
            rec = 'Create & Sell Your First Digital Product ($27)'; recLink = LINKS.create27;
            recText = "At $27, this is Kristan's own guide that takes you from zero to your first product and first sale. The lowest-risk entry point that builds a real asset you own.";
        }
    } else if (goal >= 2500) {
        rec = 'The Boss Suite'; recLink = LINKS.boss.peek;
        recText = "For goals of $2,500+/month you need a complete system, not just a course. Boss Suite gives you done-for-you products, funnels, and resell rights — built to scale.";
    } else if (tech === 1 && weeklyHours <= 5) {
        rec = 'PLR Vault + PLR Filter Tool'; recLink = LINKS.plr.buy;
        recText = "Done-for-you products you rebrand and resell. Zero creation. Use the PLR Filter above to find the right niche and you could be selling within days.";
    } else {
        rec = 'Facebook Ecosystem Strategy (FES)'; recLink = LINKS.fes.peek;
        recText = "You have time and some comfort with tech — FES turns your existing Facebook presence into an income machine. This is often where people 2x their results fastest.";
    }

    const resultsEl = document.getElementById('calculator-results');
    resultsEl.innerHTML = `
        <div class="tool-result-card">
            <div class="result-income-range">
                <span class="result-label">Estimated Monthly Potential</span>
                <span class="result-range">$${low.toLocaleString()} – $${high.toLocaleString()}</span>
                <span class="result-timeline">${timeline}</span>
            </div>
            <div class="result-rec">
                <span class="result-rec-label">🎯 Your Recommended Path</span>
                <strong>${rec}</strong>
                <p>${recText}</p>
                <a href="${recLink}" target="_blank" class="btn btn-primary" style="display:inline-block;margin-top:1rem;">See ${rec.split(' ')[0]} ${rec.split(' ')[1] || ''} →</a>
            </div>
            <p class="result-disclaimer">*Estimates based on industry averages for digital affiliate marketing. Results vary by effort, niche, and consistency. No income is guaranteed.</p>
        </div>
    `;
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ============================================================
//  TOOL 2: NICHE FINDER
// ============================================================
const nicheData = {
    health:    { emoji:'🌿', title:'Health & Wellness', products:['30-Day Wellness Journals','Hormone Balance Guides','Stress Relief Workbooks','Gut Health Reset Programs','Sleep Improvement Guides','Anti-Inflammatory Meal Plans','Mental Health Check-In Journals','Detox Challenge Bundles'], offer:'Create & Sell', link: LINKS.create27 },
    parenting: { emoji:'👶', title:'Parenting & Family', products:['Toddler Activity Packs','Chore Chart Template Sets','Potty Training Step-by-Step Guides','Back to School Organization Kits','Calm Parenting Strategy Guides','Kids Routine Visual Card Sets','Family Meeting Agenda Templates','Screen Time Balance Guides'], offer:'PLR Vault', link: LINKS.plr.buy },
    finance:   { emoji:'💰', title:'Personal Finance', products:['Zero-Based Budget Guides','Debt Snowball Tracker Templates','Emergency Fund Blueprints','Side Hustle Income Trackers','Savings Challenge Printables','Bill Payment Calendars','Financial Freedom Journals','Investment Basics for Beginners Guides'], offer:'Create & Sell', link: LINKS.create27 },
    business:  { emoji:'🚀', title:'Online Business & Marketing', products:['Social Media Content Calendars','Email Swipe File Collections','Client Onboarding Packet Templates','Canva Brand Kit Template Packs','Lead Generation Checklists','How to Price Your Services Guides','90-Day Business Launch Plans','Content Repurposing Strategy Guides'], offer:'Stacked by Emily', link: LINKS.stacked.peek },
    beauty:    { emoji:'💄', title:'Beauty & Self-Care', products:['Skincare Routine Guides by Skin Type','Clean Beauty Shopping Lists','DIY Face Mask Recipe Books','Self-Care Sunday Ritual Templates','Hair Care by Hair Type Guides','Makeup Inventory Trackers','Beauty Budget Worksheets','Glow-Up Challenge Calendars'], offer:'PLR Vault', link: LINKS.plr.buy },
    fitness:   { emoji:'💪', title:'Fitness & Weight Loss', products:['30-Day Home Workout Plans','Postpartum Fitness Programs','Beginner Running Schedules','HIIT Workout Collections','Macro Tracking Templates','Body Measurement Trackers','12-Week Transformation Programs','Fitness Habit Stacking Guides'], offer:'PLR Vault', link: LINKS.plr.buy },
    food:      { emoji:'🍽️', title:'Food & Cooking', products:['30-Minute Family Dinner Recipe Books','Meal Prep for Busy Moms Guides','Budget-Friendly Recipe Collections','Gluten-Free Family Cooking Books','Weekly Meal Planning Templates','Grocery List Printable Sets','Toddler Meal Idea Guides','Instant Pot Recipe Bundles'], offer:'Create & Sell', link: LINKS.create27 },
    spiritual: { emoji:'✨', title:'Spirituality & Mindset', products:['Morning Manifestation Journals','Abundance Mindset Reset Programs','Daily Affirmation Card Sets','Vision Board Planning Kits','Gratitude Practice Templates','Law of Attraction Workbooks','Chakra Healing Basics Guides','Daily Devotionals for Moms'], offer:'90-Day Alignment', link: LINKS.alignment.buy },
    education: { emoji:'📚', title:'Education & Kids Learning', products:['Homeschool Lesson Plan Templates','Reading Readiness Activity Packs','STEM Activity Collections for Kids','Alphabet & Number Practice Sheets','Student Progress Tracker Templates','Homeschool Schedule Templates','Reading Log Printables','Summer Learning Activity Packs'], offer:'PLR Vault', link: LINKS.plr.buy },
    relationships: { emoji:'❤️', title:'Relationships & Family Wellness', products:['Communication in Marriage Guides','Date Night Planning Templates','Love Language Discovery Journals','Conflict Resolution Workbooks','Couple Vision Board Worksheets','Reconnection Challenge Calendars','Family Values Alignment Guides','Newlywed First Year Planners'], offer:'Create & Sell', link: LINKS.create27 },
    crafts:    { emoji:'🎨', title:'Crafts, DIY & Hobbies', products:['Crochet Pattern Collections','DIY Home Décor Project Guides','Printable Planner &amp; Journal Templates','Candle &amp; Soap Making Recipe Books','Digital Scrapbooking Template Packs','Sewing Pattern Starter Guides','Wreath Making Video Tutorial Scripts','Party Planning Template Bundles'], offer:'PLR Vault', link: LINKS.plr.buy },
    pets:      { emoji:'🐾', title:'Pets & Animal Care', products:['New Puppy Training Guides','Cat Care Basics Books','Pet Health Symptom Trackers','Dog Training Schedule Templates','Pet Nutrition Guides by Breed','Vet Appointment Checklists','Puppy Socialization Plans','Senior Pet Care Guides'], offer:'Create & Sell', link: LINKS.create27 }
};

document.getElementById('run-niche-finder')?.addEventListener('click', () => {
    const interest = document.getElementById('niche-interest').value;
    const audience = document.getElementById('niche-audience').value;
    if (!interest) { alert('Please select your main interest first!'); return; }
    const data = nicheData[interest];
    const audienceMap = { moms:'Stay-at-Home &amp; Busy Moms', women:'Women 25–45', beginners:'Complete Beginners', entrepreneurs:'Side Hustlers', students:'Students', seniors:'40+ / Empty Nesters' };
    const audienceLabel = audienceMap[audience] || audience;

    const resultsEl = document.getElementById('niche-results');
    resultsEl.innerHTML = `
        <div class="tool-result-card">
            <div class="niche-result-header">
                <span style="font-size:2.5rem;">${data.emoji}</span>
                <div>
                    <strong style="font-size:1.1rem;color:var(--primary);">${data.title}</strong>
                    <p style="font-size:0.85rem;color:var(--text-muted);">Optimized for: ${audienceLabel}</p>
                </div>
            </div>
            <p style="margin:1rem 0 0.5rem;font-weight:700;font-size:0.9rem;">🏆 Top Products to Create or Sell in This Niche:</p>
            <ul class="niche-product-list">
                ${data.products.map(p => `<li>${p}</li>`).join('')}
            </ul>
            <div class="niche-rec-box">
                <span>Ready to get started?</span>
                <a href="${data.link}" target="_blank" class="btn btn-primary" style="margin-top:0.75rem;display:inline-block;">→ ${data.offer}</a>
            </div>
        </div>
    `;
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ============================================================
//  TOOL 3: PLR PRODUCT FILTER
// ============================================================
const plrData = {
    health: {
        ebook:['30-Day Wellness Journal','The Complete Guide to Hormone Balance','Stress Relief & Self-Care Ebook','Sleep Better Tonight Guide','Anti-Inflammatory Eating Guide','Mental Health Reset Workbook','Natural Remedies for Common Ailments'],
        templates:['Weekly Meal Planning Templates','Symptom Tracking Sheets','Wellness Goal Setting Worksheets','Supplement Tracker Templates','Daily Health Habit Checkers','Self-Care Routine Planner'],
        social:['30 Days of Wellness Social Posts','Health & Wellness Story Templates','Motivational Quote Packs for Health','Before & After Template Sets','Wellness Tip Graphic Series'],
        worksheets:['Gut Health Reset Workbook','Stress Management Planner','Self-Care Bingo Sheets','Body Positivity Journal Pages','Mindfulness Practice Worksheets'],
        bundles:['Complete Wellness Starter Kit','Health Coaching Client Welcome Pack','28-Day Challenge Bundle','Wellness Blogger Launch Bundle'],
        courses:['Beginner Yoga at Home Video Course','Introduction to Mindful Eating Course','30-Day Wellness Challenge Video Program']
    },
    parenting: {
        ebook:['The Calm Parenting Guide','Screen Time Balance Ebook','Raising Confident Kids Guide','First Year Baby Handbook','Toddler Behavior Solutions Guide','Mom Self-Care Essentials'],
        templates:['Chore Chart Templates by Age','Family Meeting Agenda Templates','Potty Training Tracker Charts','Kids Routine Visual Cards','Homework Helper Templates','Reward Chart Sets'],
        social:['30 Days of Parenting Tips Posts','Family Quote Graphic Packs','Back to School Countdown Posts','Mom Life Relatable Meme Templates'],
        worksheets:['Family Goals Workbook','Kids Feelings Journal Pages','Homeschool Lesson Planner','Summer Activity Bingo Sheets','Positive Parenting Affirmation Cards'],
        bundles:['Complete Mom Life Planner Bundle','Back to School Prep Kit','New Parent Survival Bundle','Toddler Mom Mega Bundle'],
        courses:['Gentle Parenting Basics Course','Homeschool Starter Program','Toddler Language Development Course']
    },
    finance: {
        ebook:['Zero-Based Budget Guide','The Debt-Free Roadmap','Side Hustle Income Guide','First-Time Investor Basics','Emergency Fund Blueprint','Frugal Living Without Feeling Broke'],
        templates:['Monthly Budget Spreadsheets','Debt Snowball Tracker','Savings Challenge Printables','Bill Payment Calendar','Net Worth Tracker','50/30/20 Budget Template'],
        social:['Financial Freedom Quote Packs','Budgeting Tips Social Post Series','Money Mindset Post Templates','Debt-Free Journey Milestone Graphics'],
        worksheets:['Financial Goals Workbook','Spending Audit Worksheets','Credit Score Improvement Planner','Retirement Planning Worksheet','Irregular Income Budget Planner'],
        bundles:['Complete Financial Freedom Bundle','Debt-Free Journey Starter Kit','Budget Boss Toolkit','Family Finance Mega Bundle'],
        courses:['Budgeting for Beginners Course','Side Hustle Starter Program','Investing Basics for Women Course']
    },
    business: {
        ebook:['Launch Your Online Business Guide','Social Media Content Strategy Ebook','Email Marketing for Beginners','How to Price Your Services','Client Attraction Blueprint','Passive Income Playbook'],
        templates:['Social Media Content Calendars','Email Swipe File Collections','Client Onboarding Packet Templates','Invoice & Contract Templates','Brand Kit Template Pack','90-Day Launch Plan Templates'],
        social:['90 Days of Business Tips Posts','Entrepreneur Motivation Packs','Case Study Post Templates','Behind the Scenes Content Templates'],
        worksheets:['Business Plan Workbook','Ideal Client Avatar Worksheet','Content Strategy Planner','Revenue Goal Tracker','Brand Voice Discovery Worksheet'],
        bundles:['Complete Business Startup Kit','Content Creator Launch Bundle','Coaching Business Starter Pack','Digital Marketer Resource Bundle'],
        courses:['Instagram Marketing for Beginners','Email List Building from Zero Course','Canva Design Basics for Non-Designers']
    },
    beauty: {
        ebook:['Skincare Routine for Beginners','Clean Beauty Guide','DIY Beauty Recipes Book','Hair Care by Hair Type Guide','The Glow-Up Blueprint'],
        templates:['Skincare Routine Tracker','Makeup Inventory Templates','Beauty Product Review Cards','Self-Care Sunday Checklist','Hair Growth Progress Journal'],
        social:['Beauty Tutorial Post Templates','Skincare Tips Social Series','Product Review Graphic Templates','Glow-Up Challenge Content Calendar'],
        worksheets:['Skincare Goal Tracker','Beauty Budget Worksheet','Clean Beauty Swap Checklist','Seasonal Skincare Routine Planner'],
        bundles:['Complete Beauty Blogger Starter Kit','Skincare Coach Client Bundle','DIY Beauty Recipe Bundle','Beauty Content Creator Launch Pack'],
        courses:['Skincare Basics Course','Clean Beauty Transition Program','DIY Beauty Recipes Video Course']
    },
    fitness: {
        ebook:['30-Day Home Workout Plan','Beginner Guide to Strength Training','Running for Beginners Program','Post-Baby Body Guide','HIIT Workout Collection'],
        templates:['Weekly Workout Planner','Fitness Progress Tracker','Macro Tracking Templates','30-Day Challenge Calendars','Body Measurement Tracker'],
        social:['Fitness Motivation Post Series','Workout Tip Graphics Pack','Progress Celebration Templates','Fitness Challenge Social Calendar'],
        worksheets:['Fitness Goal Setting Workbook','Body Measurement Tracker Journal','Meal & Workout Journal Pages','Mindset & Fitness Reset Worksheets'],
        bundles:['Complete Home Fitness Bundle','Fitness Coach Client Pack','12-Week Transformation Program','Mom Fitness Reset Bundle'],
        courses:['Home Workout Basics for Beginners','Postpartum Fitness Return Course','Nutrition & Fitness Foundations']
    },
    food: {
        ebook:['One Pot Meal Collection','30-Minute Family Dinners Cookbook','Meal Prep for Busy Moms','Budget-Friendly Recipes Guide','Gluten-Free Family Cooking'],
        templates:['Weekly Meal Planning Templates','Grocery List Printables','Recipe Card Templates','Meal Prep Checklist Sheets','Pantry Inventory Sheets'],
        social:['Recipe of the Day Posts','Food Photography Tip Graphics','Seasonal Recipe Post Series','Foodie Content Calendar Templates'],
        worksheets:['Family Meal Planning Workbook','Food Budget Tracker','Healthy Eating Habit Tracker','Favorite Family Recipes Journal'],
        bundles:['Complete Meal Planning Bundle','Food Blogger Starter Kit','Family Dinner Solution Bundle','Healthy Eating Mega Bundle'],
        courses:['Meal Prep Basics for Beginners','Budget Cooking Masterclass','Healthy Family Meals Course']
    },
    spiritual: {
        ebook:['Morning Manifestation Guide','Abundance Mindset Reset','Law of Attraction Journal Guide','Chakra Healing Basics','Daily Devotional for Busy Moms'],
        templates:['Manifestation Journal Pages','Gratitude Journal Templates','Vision Board Planning Sheets','Daily Affirmation Cards','Moon Cycle Planner Templates'],
        social:['30 Days of Affirmation Posts','Spiritual Motivation Quote Packs','Moon Cycle Content Calendar','Faith & Mindset Graphic Series'],
        worksheets:['Mindset Reset Workbook','Values Alignment Worksheet','Life Purpose Discovery Guide','Daily Spiritual Habit Tracker'],
        bundles:['Complete Mindset Transformation Bundle','Spiritual Life Coach Client Pack','Daily Ritual Starter Kit','Faith-Based Business Bundle'],
        courses:['Introduction to Manifestation Course','Mindset Reset 30-Day Program','Morning Routine for Success Course']
    },
    education: {
        ebook:['Reading Readiness Guide for Toddlers','Homeschool Curriculum Supplement','STEM Activities for Kids','Learning Styles Parent Guide'],
        templates:['Lesson Plan Templates','Student Progress Trackers','Homeschool Schedule Templates','Reading Log Printables','Reward Chart Templates'],
        social:['Educational Activity Tip Posts','Homeschool Resource Graphics','Learning Milestone Celebration Posts','Back to School Content Calendar'],
        worksheets:['Alphabet & Number Practice Sheets','Homeschool Goal Setting Workbook','Learning Activity Planning Pages','Summer Learning Journal Pages'],
        bundles:['Complete Homeschool Starter Bundle','Tutoring Business Client Pack','Kids Activity Mega Bundle','Reading & Writing Foundations Bundle'],
        courses:['Homeschool Beginner Orientation Course','Reading Readiness for Kids Program','Early Math Skills for Toddlers']
    },
    relationships: {
        ebook:['Communication in Marriage Guide','Rebuilding Trust After Conflict','Date Night Ideas for Busy Parents','Love Language Discovery Guide'],
        templates:['Date Night Planner Templates','Couple Goal Setting Worksheets','Relationship Check-In Cards','Family Gratitude Journal Pages'],
        social:['Relationship Tips Post Series','Love & Marriage Quote Graphics','Date Night Idea Post Templates','Couple Challenge Content Calendar'],
        worksheets:['Couples Vision Board Worksheet','Conflict Resolution Workbook','Family Values Alignment Worksheet','Marriage Gratitude Journal Pages'],
        bundles:['Complete Relationship Coach Bundle','Marriage Enrichment Kit','Family Harmony Bundle','Couple Goal Setting Mega Bundle'],
        courses:['Communication Skills for Couples Course','Love Language Discovery Program','Building a Stronger Marriage Course']
    }
};

document.getElementById('run-plr-filter')?.addEventListener('click', () => {
    const niche = document.getElementById('plr-niche').value;
    const format = document.getElementById('plr-format').value;
    if (!niche) { alert('Please select a niche first!'); return; }

    const nicheDisplay = document.getElementById('plr-niche').options[document.getElementById('plr-niche').selectedIndex].text;
    const data = plrData[niche];
    if (!data) return;

    let products = [];
    if (format === 'all') {
        Object.values(data).forEach(arr => products.push(...arr.slice(0, 3)));
    } else if (data[format]) {
        products = data[format];
    } else {
        products = data.ebook || [];
    }

    const resultsEl = document.getElementById('plr-results');
    resultsEl.innerHTML = `
        <div class="tool-result-card">
            <p style="font-weight:700;margin-bottom:1rem;color:var(--primary);">✅ ${products.length} PLR Products Found for "${nicheDisplay}"</p>
            <ul class="plr-product-list">
                ${products.map(p => `<li>📦 ${p}</li>`).join('')}
            </ul>
            <div class="plr-vault-cta">
                <p>Find all of these inside the PLR Vault — hundreds of products, all ready to rebrand and resell.</p>
                <a href="${LINKS.plr.buy}" target="_blank" class="btn btn-primary" style="margin-top:1rem;display:inline-block;">Browse the PLR Vault →</a>
            </div>
        </div>
    `;
    resultsEl.style.display = 'block';
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ============================================================
//  TOOL 4: BOSS AI INCOME COACH
// ============================================================
const aiFlow = [
    {
        id: 'start',
        bot: "Hey mama! 👋 I'm Boss AI — your personal income coach. Let's figure out your best path to online income. What's your #1 goal right now?",
        options: [
            { text: '💸 Make my first online income ASAP', next: 'speed' },
            { text: '📱 Turn my social media into actual money', next: 'social' },
            { text: '🤔 Figure out which business model to pick', next: 'explore' },
            { text: '🚫 Done with MLMs — want something safe', next: 'safe' }
        ]
    },
    {
        id: 'speed',
        bot: "Love the energy! ⚡ How much can you invest to get started?",
        options: [
            { text: '$0 — Starting completely free', next: 'speed_free' },
            { text: '$27 — I can start small', next: 'speed_27' },
            { text: "$100+ — I'm ready to invest", next: 'speed_invest' }
        ]
    },
    {
        id: 'speed_free', result: 'stacked' },
    {
        id: 'speed_27', result: 'create27' },
    {
        id: 'speed_invest', result: 'boss' },
    {
        id: 'social',
        bot: "That's a smart move — your audience is already there. Which platform are you mainly on?",
        options: [
            { text: '📘 Facebook — I post but get nothing', next: 'social_fb' },
            { text: '📸 Instagram / TikTok', next: 'social_ig' },
            { text: "🌐 I'm not really on any platform yet", next: 'social_none' }
        ]
    },
    { id: 'social_fb', result: 'fes' },
    { id: 'social_ig', result: 'stacked' },
    { id: 'social_none', result: 'stacked' },
    {
        id: 'explore',
        bot: "Smart to research first! 👏 How much time can you dedicate per week?",
        options: [
            { text: '1–3 hours (need it mostly automated)', next: 'explore_low' },
            { text: '4–10 hours (willing to put in the work)', next: 'explore_med' },
            { text: "10+ hours (I'm serious about this)", next: 'explore_high' }
        ]
    },
    { id: 'explore_low', result: 'plr' },
    { id: 'explore_med', result: 'stacked' },
    { id: 'explore_high', result: 'boss' },
    {
        id: 'safe',
        bot: "I hear you — and you're RIGHT to be cautious. 💪 What burned you most about your last experience?",
        options: [
            { text: 'Recruiting family and friends', next: 'safe_mlm' },
            { text: 'Monthly quotas and auto-purchases', next: 'safe_mlm' },
            { text: 'Spent money on courses that didn\'t work', next: 'safe_course' }
        ]
    },
    { id: 'safe_mlm', result: 'fes' },
    { id: 'safe_course', result: 'create27' }
];

const aiResults = {
    stacked: {
        title: '⭐ Your Path: Stacked by Emily',
        desc: "This is literally built for where you are. Short videos, multiple income streams covered, beginner-friendly, and mentorship included. You'll go from confused to confident — fast.",
        peek: LINKS.stacked.peek, buy: LINKS.stacked.buy, peekLabel: 'Get a Sneak Peek', buyLabel: 'Enroll Now'
    },
    boss: {
        title: '🔥 Your Path: The Boss Suite',
        desc: "You're ready to go all in. Boss Suite gives you done-for-you products, built funnels, and resell rights — everything you need to build a real business that runs without you.",
        peek: LINKS.boss.peek, buy: LINKS.boss.buy, peekLabel: 'See What\'s Inside', buyLabel: 'Enroll Now'
    },
    fes: {
        title: '📘 Your Path: Facebook Ecosystem Strategy',
        desc: "You're already on Facebook — we just need to make it work FOR you. FES teaches you to set up a system that sells, without going viral or sitting in DMs all day.",
        peek: LINKS.fes.peek, buy: LINKS.fes.buy, peekLabel: 'Preview Inside FES', buyLabel: 'Enroll Now'
    },
    plr: {
        title: '📦 Your Path: PLR Vault',
        desc: "Done-for-you products you rebrand and sell as your own. Zero creation, zero tech overwhelm. Use the PLR Filter to find your niche and you can be selling within days.",
        peek: null, buy: LINKS.plr.buy, peekLabel: null, buyLabel: 'Browse the Vault'
    },
    create27: {
        title: '🛠 Your Path: Create & Sell Your First Digital Product',
        desc: "At just $27, Kristan walks you through creating and selling your first digital product in 6 steps. This is the lowest-risk entry point that builds an asset you OWN forever.",
        peek: null, buy: LINKS.create27, peekLabel: null, buyLabel: 'Get Started for $27'
    }
};

let aiCurrentNode = null;

function initBossAI() {
    const messagesEl = document.getElementById('boss-ai-messages');
    const optionsEl = document.getElementById('boss-ai-options');
    if (!messagesEl || !optionsEl) return;
    messagesEl.innerHTML = '';
    optionsEl.innerHTML = '';
    aiCurrentNode = 'start';
    showAINode('start');
}

function addBotMessage(text) {
    const el = document.getElementById('boss-ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-message bot-message';
    div.innerHTML = `<span class="ai-avatar">🤖</span><div class="ai-bubble">${text}</div>`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
}

function addUserMessage(text) {
    const el = document.getElementById('boss-ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-message user-message';
    div.innerHTML = `<div class="ai-bubble user-bubble">${text}</div>`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
}

function showAIOptions(options) {
    const el = document.getElementById('boss-ai-options');
    el.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'ai-option-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => {
            addUserMessage(opt.text);
            el.innerHTML = '';
            setTimeout(() => showAINode(opt.next), 600);
        });
        el.appendChild(btn);
    });
}

function showAIResult(resultKey) {
    const r = aiResults[resultKey];
    if (!r) return;
    const el = document.getElementById('boss-ai-messages');
    const div = document.createElement('div');
    div.className = 'ai-message bot-message';
    div.innerHTML = `
        <span class="ai-avatar">🤖</span>
        <div class="ai-bubble ai-result-bubble">
            <strong style="color:var(--primary);display:block;margin-bottom:0.5rem;">${r.title}</strong>
            <p style="font-size:0.9rem;">${r.desc}</p>
            <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:1rem;">
                ${r.peek ? `<a href="${r.peek}" target="_blank" class="btn btn-primary" style="text-align:center;font-size:0.85rem;">${r.peekLabel} →</a>` : ''}
                <a href="${r.buy}" target="_blank" class="btn btn-secondary" style="text-align:center;font-size:0.85rem;">${r.buyLabel} →</a>
            </div>
        </div>
    `;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;

    const optionsEl = document.getElementById('boss-ai-options');
    const restartBtn = document.createElement('button');
    restartBtn.className = 'ai-option-btn';
    restartBtn.textContent = '🔄 Start Over';
    restartBtn.addEventListener('click', initBossAI);
    optionsEl.appendChild(restartBtn);
}

function showAINode(nodeId) {
    const node = aiFlow.find(n => n.id === nodeId);
    if (!node) return;
    if (node.result) {
        setTimeout(() => {
            addBotMessage("Great — based on your answers, here's your recommendation:");
            setTimeout(() => showAIResult(node.result), 800);
        }, 400);
        return;
    }
    setTimeout(() => {
        addBotMessage(node.bot);
        showAIOptions(node.options);
    }, 400);
}

// Init AI when its modal opens
document.getElementById('open-boss-ai')?.addEventListener('click', () => {
    setTimeout(initBossAI, 100);
});
document.getElementById('boss-ai-bubble')?.addEventListener('click', () => {
    setTimeout(initBossAI, 100);
});

// ============================================================
//  QUIZ
// ============================================================
const quizData = [
    {
        question: "What's your biggest frustration with online business right now?",
        options: [
            { text: "I post constantly but make zero sales", value: "fes" },
            { text: "I don't know where to even start", value: "stacked" },
            { text: "I want products without creating from scratch", value: "plr" },
            { text: "I need a complete system that runs itself", value: "boss" }
        ]
    },
    {
        question: "How would you describe your current situation?",
        options: [
            { text: "I'm already on Facebook — it just doesn't make money", value: "fes" },
            { text: "I want step-by-step guidance without overwhelm", value: "stacked" },
            { text: "I'm serious — I want to go all in with a full system", value: "boss" },
            { text: "I want to create my very own digital product", value: "create" }
        ]
    },
    {
        question: "What outcome would change your life right now?",
        options: [
            { text: "My first $500–$1,000 online", value: "stacked" },
            { text: "Turn my time on Facebook into actual income", value: "fes" },
            { text: "Build a product library to sell on autopilot", value: "plr" },
            { text: "Replace my income with a full business system", value: "boss" }
        ]
    }
];

let currentQuestionIndex = 0;
let userAnswers = [];
const quizContent = document.getElementById('quiz-content');

function initQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    if (quizContent) {
        quizContent.innerHTML = `
            <div class="quiz-question" id="question-text">Loading question...</div>
            <div class="quiz-options" id="options-container"></div>
        `;
    }
    showQuestion();
}

function showQuestion() {
    const q = quizData[currentQuestionIndex];
    const qText = document.getElementById('question-text');
    const optsContainer = document.getElementById('options-container');
    const progressBar = document.getElementById('quiz-progress-bar');
    if (!qText || !optsContainer || !progressBar) return;
    
    qText.textContent = q.question;
    optsContainer.innerHTML = '';
    const pct = (currentQuestionIndex / quizData.length) * 100;
    progressBar.style.width = `${pct}%`;
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('quiz-option');
        btn.textContent = opt.text;
        btn.addEventListener('click', () => handleOptionClick(opt.value));
        optsContainer.appendChild(btn);
    });
}

function handleOptionClick(value) {
    userAnswers.push(value);
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const progressBar = document.getElementById('quiz-progress-bar');
    if (!progressBar || !quizContent) return;
    progressBar.style.width = '100%';
    const counts = {};
    userAnswers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    const rec = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];

    const resultMap = {
        fes:     { title:'Your Path: Facebook Ecosystem Strategy', desc:'You\'re already putting in the work on Facebook — FES teaches you to build a system that actually converts. No huge following needed.', btn:'Get a Sneak Peek →', link: LINKS.fes.peek, ci: 2 },
        stacked: { title:'Your Path: Stacked by Emily', desc:'Perfect for where you are. Stacked is beginner-friendly, step-by-step, and covers multiple income streams so you\'re not locked into one path.', btn:'Get a Sneak Peek →', link: LINKS.stacked.peek, ci: 0 },
        plr:     { title:'Your Path: PLR Vault', desc:'Done-for-you products you rebrand and sell as your own. Zero creation time. Use the PLR Filter to find your niche and start selling fast.', btn:'Browse the Vault →', link: LINKS.plr.buy, ci: 3 },
        boss:    { title:'Your Path: The Boss Suite', desc:'You\'re ready to go all in. Boss Suite is the complete system — done-for-you products, automated funnels, and resell rights included.', btn:'Get a Sneak Peek →', link: LINKS.boss.peek, ci: 1 },
        create:  { title:'Your Path: Create & Sell Your First Product', desc:'Kristan\'s own $27 guide walks you through creating and selling your first digital product in 6 steps — from scratch, screen by screen.', btn:'Get Started for $27 →', link: LINKS.create27, ci: 0 }
    };

    const r = resultMap[rec] || resultMap['stacked'];

    quizContent.innerHTML = `
        <div class="text-center" style="padding:1rem 0;">
            <h3 style="font-size:1.6rem;color:var(--primary);margin-bottom:1rem;">${r.title}</h3>
            <p style="margin-bottom:2rem;max-width:500px;margin-left:auto;margin-right:auto;">${r.desc}</p>
            <a href="${r.link}" target="_blank" class="btn btn-primary" id="quiz-cta" data-carousel-index="${r.ci}" style="text-decoration:none;">${r.btn}</a>
            <button class="btn btn-secondary" id="restart-quiz-btn" style="margin-top:1rem;padding:0.5rem 1rem;font-size:0.85rem;display:block;margin-left:auto;margin-right:auto;">Restart Quiz</button>
        </div>
    `;
    
    document.getElementById('restart-quiz-btn').addEventListener('click', initQuiz);
    document.getElementById('quiz-cta').addEventListener('click', e => {
        const idx = parseInt(e.currentTarget.getAttribute('data-carousel-index'));
        document.getElementById('offers').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => { if (typeof window._carouselGoTo === 'function') window._carouselGoTo(idx); }, 400);
    });
}

// ============================================================
//  CAROUSEL
// ============================================================
function initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;
    const cards = Array.from(track.getElementsByClassName('offer-card'));
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dotLabels = document.querySelectorAll('.carousel-dot-label');
    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');
            if (i === currentIndex) card.classList.add('active');
            else if (i === currentIndex - 1) card.classList.add('prev');
            else if (i === currentIndex + 1) card.classList.add('next');
            else if (i < currentIndex) card.classList.add('hidden-left');
            else card.classList.add('hidden-right');
        });
        dotLabels.forEach((l, i) => l.classList.toggle('active', i === currentIndex));
    }

    prevBtn?.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; updateCarousel(); } });
    nextBtn?.addEventListener('click', () => { if (currentIndex < cards.length - 1) { currentIndex++; updateCarousel(); } });
    dotLabels.forEach((l, i) => l.addEventListener('click', () => { currentIndex = i; updateCarousel(); }));
    cards.forEach((card, i) => {
        card.addEventListener('click', e => {
            if (!e.target.closest('a') && !e.target.closest('button') && i !== currentIndex) {
                currentIndex = i; updateCarousel();
            }
        });
    });
    updateCarousel();
    window._carouselGoTo = i => { if (i >= 0 && i < cards.length) { currentIndex = i; updateCarousel(); } };
}

// ============================================================
//  CHECKOUT MODAL (for direct Stripe products)
// ============================================================
const checkoutModal = document.getElementById('checkout-modal');
const closeBtn = document.getElementById('modal-close-btn');
const payBtn = document.getElementById('checkout-pay-btn');
const checkoutTotal = document.getElementById('checkout-total-price');
const checkoutProductName = document.getElementById('summary-product-name');
const checkoutProductPrice = document.getElementById('summary-product-price');
const checkoutTitle = document.getElementById('checkout-product-title');
let currentBasePrice = 0;

document.querySelectorAll('.checkout-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('.offer-card, .own-product-card');
        const productName = card?.querySelector('h3')?.textContent || 'Product';
        const price = parseInt(btn.getAttribute('data-price'));
        currentBasePrice = price;
        if (checkoutProductName) checkoutProductName.textContent = productName;
        if (checkoutProductPrice) checkoutProductPrice.textContent = `$${price}.00`;
        if (checkoutTitle) checkoutTitle.textContent = `Checkout for ${productName}`;
        if (checkoutTotal) checkoutTotal.textContent = `$${price}.00`;
        if (checkoutModal) checkoutModal.classList.add('active');
    });
});

closeBtn?.addEventListener('click', () => checkoutModal?.classList.remove('active'));
window.addEventListener('click', e => { if (e.target === checkoutModal) checkoutModal?.classList.remove('active'); });

payBtn?.addEventListener('click', () => {
    payBtn.textContent = 'Processing...';
    payBtn.disabled = true;
    setTimeout(() => {
        alert('Payment Successful!\nYour digital product delivery is on its way to your email.');
        checkoutModal?.classList.remove('active');
        payBtn.textContent = 'Pay Securely →';
        payBtn.disabled = false;
    }, 2000);
});

// ============================================================
//  FAQ ACCORDION
// ============================================================
document.querySelectorAll('.faq-question').forEach(item => {
    item.addEventListener('click', () => {
        const parent = item.parentElement;
        if (parent.classList.contains('active')) {
            parent.classList.remove('active');
        } else {
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            parent.classList.add('active');
        }
    });
});

// ============================================================
//  BRIDGE MODAL — Email Capture Before Affiliate Redirect
// ============================================================
// ============================================================
//  BRIDGE MODAL — Email Capture Before Affiliate Redirect
// ============================================================
let _bridgeDestURL = '';

function openBridgeModal(productName, tagline, destUrl, badge, icon, buttonText, perks) {
    _bridgeDestURL = destUrl;
    const title = document.getElementById('bridge-title');
    const tag   = document.getElementById('bridge-tagline');
    const modal = document.getElementById('bridge-modal');
    const badgeEl = document.getElementById('bridge-badge-text');
    const iconEl  = document.getElementById('bridge-visual-icon');
    const btnEl   = document.getElementById('bridge-submit');
    const perksEl = document.getElementById('bridge-perks-list');

    if (title) title.textContent = productName;
    if (tag)   tag.textContent   = tagline;
    if (badgeEl && badge) badgeEl.innerHTML = `<i class="ph-fill ph-lightning"></i> ${badge}`;
    if (iconEl && icon) iconEl.innerHTML = `<i class="ph-fill ph-${icon}"></i>`;
    if (btnEl && buttonText) btnEl.textContent = buttonText;
    
    if (perksEl && perks) {
        perksEl.innerHTML = perks.split(';').map(p => {
            return `<span><i class="ph-fill ph-check-circle"></i> ${p.trim()}</span>`;
        }).join('');
    }

    if (modal) { modal.classList.add('active'); }
    setTimeout(() => document.getElementById('bridge-email')?.focus(), 100);
}

function closeBridgeModal() {
    const modal = document.getElementById('bridge-modal');
    if (modal) modal.classList.remove('active');
    document.getElementById('bridge-form')?.reset();
    _bridgeDestURL = '';
    
    // Reset modal contents to defaults
    const badgeEl = document.getElementById('bridge-badge-text');
    const iconEl  = document.getElementById('bridge-visual-icon');
    const btnEl   = document.getElementById('bridge-submit');
    const perksEl = document.getElementById('bridge-perks-list');
    
    if (badgeEl) badgeEl.innerHTML = `<i class="ph-fill ph-lightning"></i> You're Almost There!`;
    if (iconEl) iconEl.innerHTML = `<i class="ph-fill ph-sketch-logo"></i>`;
    if (btnEl) btnEl.textContent = `Yes! Take Me There →`;
    if (perksEl) {
        perksEl.innerHTML = `
            <span><i class="ph-fill ph-check-circle"></i> Get Kristan's exclusive tips &amp; resources</span>
            <span><i class="ph-fill ph-check-circle"></i> First to hear about new offers &amp; deals</span>
            <span><i class="ph-fill ph-check-circle"></i> Free income-building guides delivered to you</span>
        `;
    }
}

function goToDest() {
    if (_bridgeDestURL) window.open(_bridgeDestURL, '_blank', 'noopener');
    closeBridgeModal();
}

async function captureBrevoContact(email, firstName, productInterest) {
    try {
        await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name: firstName, product: productInterest })
        });
    } catch (_) { /* silent fail — redirect happens regardless */ }
}

// Intercept all bridge-link clicks
document.querySelectorAll('.bridge-link').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const product = btn.getAttribute('data-product') || '';
        const tagline = btn.getAttribute('data-tagline') || '';
        const url     = btn.getAttribute('data-url') || '#';
        const badge   = btn.getAttribute('data-badge') || '';
        const icon    = btn.getAttribute('data-icon') || '';
        const button  = btn.getAttribute('data-button') || '';
        const perks   = btn.getAttribute('data-perks') || '';
        // If already captured this session, go straight through
        if (localStorage.getItem('bmb_bridge_done') === 'true') {
            window.open(url, '_blank', 'noopener');
            return;
        }
        openBridgeModal(product, tagline, url, badge, icon, button, perks);
    });
});

// Bridge form submit
document.getElementById('bridge-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const email     = (document.getElementById('bridge-email')?.value || '').trim();
    const firstName = (document.getElementById('bridge-name')?.value  || '').trim();
    const product   = document.getElementById('bridge-title')?.textContent || '';
    const submitBtn = document.getElementById('bridge-submit');
    if (!email) return;

    if (submitBtn) { submitBtn.textContent = 'On your way! 🚀'; submitBtn.disabled = true; }

    // Persist so bridge doesn't re-fire this session
    localStorage.setItem('bmb_bridge_done', 'true');
    localStorage.setItem('bmb_email', email);

    // Fire Brevo (async, don't block the user)
    captureBrevoContact(email, firstName, product);

    // Small delight delay then redirect
    setTimeout(() => {
        goToDest();
        if (submitBtn) { submitBtn.textContent = 'Yes! Take Me There →'; submitBtn.disabled = false; }
    }, 700);
});

// Bridge skip, close, outside-click
document.getElementById('bridge-skip')?.addEventListener('click',  goToDest);
document.getElementById('bridge-close')?.addEventListener('click', closeBridgeModal);
document.getElementById('bridge-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('bridge-modal')) closeBridgeModal();
});

// ============================================================
//  INIT
// ============================================================
updateUsageBars();
initQuiz();
initCarousel();

// ============================================================
//  EVERGREEN BONUS COUNTDOWN — 4-hour rolling window
// ============================================================
(function initBonusBar() {
    const BONUS_DURATION = 4 * 60 * 60; // 4 hours in seconds
    const STORAGE_KEY    = 'bmb_bonus_start';

    const bar        = document.getElementById('bonus-bar');
    const hoursEl    = document.getElementById('bar-hours');
    const minsEl     = document.getElementById('bar-mins');
    const secsEl     = document.getElementById('bar-secs');
    const dismissBtn = document.getElementById('bonus-bar-dismiss');
    if (!bar) return;

    // Init or resume timer
    let startTime = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    const now = Math.floor(Date.now() / 1000);
    if (!startTime || (now - startTime) >= BONUS_DURATION) {
        startTime = now;
        localStorage.setItem(STORAGE_KEY, startTime.toString());
    }

    function getRemaining() {
        const elapsed = Math.floor(Date.now() / 1000) - startTime;
        let remaining = BONUS_DURATION - elapsed;
        if (remaining <= 0) {
            startTime = Math.floor(Date.now() / 1000);
            localStorage.setItem(STORAGE_KEY, startTime.toString());
            remaining = BONUS_DURATION;
        }
        return remaining;
    }

    function updateDisplay() {
        const r = getRemaining();
        const h = Math.floor(r / 3600);
        const m = Math.floor((r % 3600) / 60);
        const s = r % 60;
        if (hoursEl) hoursEl.textContent = h.toString().padStart(2, '0');
        if (minsEl)  minsEl.textContent  = m.toString().padStart(2, '0');
        if (secsEl)  secsEl.textContent  = s.toString().padStart(2, '0');
        // Bridge modal mini-timer
        const bm = document.getElementById('bridge-timer-mins');
        const bs = document.getElementById('bridge-timer-secs');
        if (bm) bm.textContent = m.toString().padStart(2, '0');
        if (bs) bs.textContent = s.toString().padStart(2, '0');
    }

    // Show bar when user scrolls past hero
    const hero = document.querySelector('.hero');
    const wasDismissed = sessionStorage.getItem('bmb_bar_dismissed');

    if (!wasDismissed && hero) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) {
                    bar.style.display = '';
                    requestAnimationFrame(() => bar.classList.add('visible'));
                } else {
                    bar.classList.remove('visible');
                }
            });
        }, { threshold: 0.05 });
        io.observe(hero);
    }

    dismissBtn?.addEventListener('click', () => {
        bar.classList.remove('visible');
        sessionStorage.setItem('bmb_bar_dismissed', 'true');
    });

    // Inject mini timer into bridge modal
    const bridgeForm = document.getElementById('bridge-form');
    if (bridgeForm && !document.getElementById('bridge-bonus-timer')) {
        const timerEl = document.createElement('div');
        timerEl.id = 'bridge-bonus-timer';
        timerEl.className = 'bridge-bonus-timer';
        timerEl.innerHTML = `⏱ Bonus hold expires in <span id="bridge-timer-mins">00</span>:<span id="bridge-timer-secs">00</span>`;
        bridgeForm.insertAdjacentElement('beforebegin', timerEl);
    }

    updateDisplay();
    setInterval(updateDisplay, 1000);
})();

// ============================================================
//  EMAILJS CONFIG — fill in after creating account at emailjs.com
// ============================================================
const EMAILJS_SERVICE_ID  = '';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = '';   // e.g. 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = '';   // e.g. 'AbCdEfGhIjKlMnOp'

if (EMAILJS_PUBLIC_KEY) { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); }

// ============================================================
//  REVIEW SUBMISSION MODAL
// ============================================================
const openReviewBtn  = document.getElementById('open-review-modal');
const reviewModal    = document.getElementById('review-modal');
const reviewCloseBtn = document.getElementById('review-modal-close');
const reviewForm     = document.getElementById('review-submit-form');

openReviewBtn?.addEventListener('click', () => reviewModal?.classList.add('active'));
reviewCloseBtn?.addEventListener('click', () => reviewModal?.classList.remove('active'));
reviewModal?.addEventListener('click', e => { if (e.target === reviewModal) reviewModal.classList.remove('active'); });

// Star picker inside submit form
let submitStars = 5;
document.querySelectorAll('#star-picker .star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        submitStars = parseInt(btn.getAttribute('data-val'));
        document.getElementById('rev-stars').value = submitStars;
        document.querySelectorAll('#star-picker .star-btn').forEach(b => {
            b.style.color = parseInt(b.getAttribute('data-val')) <= submitStars ? '#f5a623' : 'rgba(255,255,255,0.3)';
        });
    });
});
// Set initial star color
document.querySelectorAll('#star-picker .star-btn').forEach(b => { b.style.color = '#f5a623'; });

// Review form submit
reviewForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('rev-name')?.value.trim();
    const product = document.getElementById('rev-product')?.value;
    const stars   = document.getElementById('rev-stars')?.value;
    const quote   = document.getElementById('rev-quote')?.value.trim();
    const email   = document.getElementById('rev-email')?.value.trim();
    const btn     = document.getElementById('review-submit-btn');

    if (!name || !product || !quote || !email) return;
    if (quote.length < 20) { alert('Please write a little more about your experience.'); return; }

    btn.textContent = 'Sending...'; btn.disabled = true;

    try {
        if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                reviewer_name: name,
                reviewer_email: email,
                product: product,
                stars: stars,
                review_text: quote
            });
        }
    } catch (_) { /* silent - still show success */ }

    btn.textContent = 'Review Submitted! Thank you!';
    btn.style.background = 'linear-gradient(135deg,#2d7a46,#1a4d2e)';
    setTimeout(() => {
        reviewModal?.classList.remove('active');
        btn.textContent = 'Submit My Story ->'; btn.disabled = false;
        btn.style.background = '';
        reviewForm.reset();
        submitStars = 5;
        document.querySelectorAll('#star-picker .star-btn').forEach(b => { b.style.color = '#f5a623'; });
    }, 2500);
});

// ============================================================
//  LOAD LIVE REVIEWS FROM ADMIN DASHBOARD (localStorage)
// ============================================================
function loadLiveReviews() {
    const REVIEWS_KEY = 'bmb_published_reviews';
    try {
        const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
        const grid = document.getElementById('live-reviews-grid');
        if (!grid || !reviews.length) return;

        grid.style.display = 'grid';
        grid.innerHTML = reviews.map(r => `
            <div class="testimonial-card glass-card">
                <div class="testimonial-stars">${'&#9733;'.repeat(r.stars)}${'&#9734;'.repeat(5-r.stars)}</div>
                <p class="testimonial-quote">"${r.quote}"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">${r.initials || r.name.substring(0,2).toUpperCase()}</div>
                    <div>
                        <div class="testimonial-name">${r.name}</div>
                        <div class="testimonial-product">&#10003; ${r.product}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch(_) {}
}
loadLiveReviews();
