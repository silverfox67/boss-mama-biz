// Quiz Database
const quizData = [
    {
        question: "What is your main business goal right now?",
        options: [
            { text: "I want client work where I get hired for services", value: "va" },
            { text: "I want to sell my own templates and guides", value: "digital" },
            { text: "I want an all-in-one resell business with high commissions", value: "boss" }
        ]
    },
    {
        question: "How many hours a day can you dedicate to your side hustle?",
        options: [
            { text: "1 to 2 hours (I need it to run on autopilot)", value: "boss" },
            { text: "2 to 4 hours (I can do work for clients)", value: "va" },
            { text: "I want to work at my own pace whenever I have a minute", value: "digital" }
        ]
    },
    {
        question: "What is your comfort level with technology?",
        options: [
            { text: "I want zero-tech (just download, upload, and sell)", value: "digital" },
            { text: "I'm willing to learn client tools (like email or calendar booking)", value: "va" },
            { text: "I want automated systems built for me", value: "boss" }
        ]
    }
];

// Quiz Variables
let currentQuestionIndex = 0;
let userAnswers = [];

// DOM Elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const progressBar = document.getElementById("quiz-progress-bar");
const quizContent = document.getElementById("quiz-content");

// Initialize Quiz
function initQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    showQuestion();
}

function showQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    if (!questionText || !optionsContainer || !progressBar) return;
    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = "";
    
    // Update progress bar
    const progressPercent = (currentQuestionIndex / quizData.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    currentQuestion.options.forEach(option => {
        const button = document.createElement("button");
        button.classList.add("quiz-option");
        button.textContent = option.text;
        button.addEventListener("click", () => handleOptionClick(option.value));
        optionsContainer.appendChild(button);
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
    if (!progressBar || !quizContent) return;
    progressBar.style.width = "100%";
    
    // Calculate most frequent answer
    const counts = {};
    let maxCount = 0;
    let recommendation = "digital";

    userAnswers.forEach(ans => {
        counts[ans] = (counts[ans] || 0) + 1;
        if (counts[ans] > maxCount) {
            maxCount = counts[ans];
            recommendation = ans;
        }
    });

    let title = "";
    let desc = "";
    let buttonText = "";
    let targetLink = "";
    let carouselIndex = 0;

    if (recommendation === "va") {
        title = "Your Path: Virtual Assistant";
        desc = "You like active skills, offering services, and building client relationships. The Virtual Assistant path gets you hired faster because business owners always need administrative help.";
        buttonText = "Explore VA Training Academy";
        targetLink = "#offers";
        carouselIndex = 2; // Boss VA Training Academy
    } else if (recommendation === "boss") {
        title = "Your Path: The Boss Suite";
        desc = "You want high-leverage commissions, pre-built products, and automated checkouts that make sales on autopilot. You should focus on ready-to-sell business models.";
        buttonText = "Check Out The Boss Suite";
        targetLink = "#offers";
        carouselIndex = 3; // The Boss Suite
    } else {
        title = "Your Path: Digital Creator";
        desc = "You want to design simple templates, planners, or cheat sheets in Canva, list them for sale, and keep 100% of the profits with zero tech setup.";
        buttonText = "Explore Digital Product Guide";
        targetLink = "#offers";
        carouselIndex = 1; // Create & Sell Your First Product
    }

    quizContent.innerHTML = `
        <div class="text-center" style="padding: 1rem 0;">
            <h3 style="font-size: 1.8rem; color: var(--primary); margin-bottom: 1rem;">${title}</h3>
            <p style="margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto;">${desc}</p>
            <a href="${targetLink}" class="btn btn-primary" id="quiz-cta" data-carousel-index="${carouselIndex}">${buttonText}</a>
            <button class="btn btn-secondary" id="restart-quiz-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; font-size: 0.85rem; display: block; margin-left: auto; margin-right: auto;">Restart Quiz</button>
        </div>
    `;

    document.getElementById("restart-quiz-btn").addEventListener("click", () => {
        location.reload(); // Quick reset for simulation
    });

    // Smooth scroll to offers + navigate carousel to the correct card
    document.getElementById("quiz-cta").addEventListener("click", (e) => {
        e.preventDefault();
        const targetIndex = parseInt(e.currentTarget.getAttribute("data-carousel-index"));
        document.getElementById("offers").scrollIntoView({ behavior: 'smooth' });
        // Small delay to let scroll happen before snapping the carousel
        setTimeout(() => {
            if (typeof window._carouselGoTo === "function") {
                window._carouselGoTo(targetIndex);
            }
        }, 400);
    });
}

// --- Stripe Checkout Simulation ---
const checkoutModal = document.getElementById("checkout-modal");
const closeBtn = document.getElementById("modal-close-btn");
const payBtn = document.getElementById("checkout-pay-btn");
const bumpCheckbox = document.getElementById("bump-checkbox");
const bumpRow = document.getElementById("checkout-bump-row");
const checkoutTotal = document.getElementById("checkout-total-price");
const checkoutProductName = document.getElementById("summary-product-name");
const checkoutProductPrice = document.getElementById("summary-product-price");
const checkoutTitle = document.getElementById("checkout-product-title");

let currentBasePrice = 0;

document.querySelectorAll(".checkout-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".offer-card");
        const productName = card.querySelector("h3").textContent;
        const price = parseInt(btn.getAttribute("data-price"));

        currentBasePrice = price;
        checkoutProductName.textContent = productName;
        checkoutProductPrice.textContent = `$${price}.00`;
        checkoutTitle.textContent = `Checkout for ${productName}`;

        if (bumpCheckbox) bumpCheckbox.checked = false;
        if (bumpRow) bumpRow.style.display = "none";
        updateTotal();

        if (checkoutModal) checkoutModal.classList.add("active");
    });
});

function updateTotal() {
    let total = currentBasePrice;
    if (bumpCheckbox && bumpCheckbox.checked) {
        total += 9.99;
    }
    if (checkoutTotal) checkoutTotal.textContent = `$${total.toFixed(2)}`;
}

if (bumpCheckbox) {
    bumpCheckbox.addEventListener("change", () => {
        if (bumpCheckbox.checked) {
            if (bumpRow) bumpRow.style.display = "flex";
        } else {
            if (bumpRow) bumpRow.style.display = "none";
        }
        updateTotal();
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        if (checkoutModal) checkoutModal.classList.remove("active");
    });
}

window.addEventListener("click", (e) => {
    if (e.target === checkoutModal) {
        if (checkoutModal) checkoutModal.classList.remove("active");
    }
});

if (payBtn) {
    payBtn.addEventListener("click", () => {
        payBtn.textContent = "Processing Payment...";
        payBtn.disabled = true;
        
        setTimeout(() => {
            alert("Payment Successful!\nStripe Checkout simulation completed.\nAn email containing your digital delivery details has been sent (Simulated webhook triggered for Brevo).");
            if (checkoutModal) checkoutModal.classList.remove("active");
            payBtn.textContent = "Pay Securely";
            payBtn.disabled = false;
        }, 2000);
    });
}

// --- Lead Gen Form Automation ---
const leadForm = document.getElementById("lead-form");
if (leadForm) {
    leadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = leadForm.querySelector("input").value;
        const submitBtn = leadForm.querySelector("button");
        
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                alert(`Successfully Opted-In!\nYour Free Side Hustle Roadmap is on its way to your inbox!`);
                leadForm.reset();
            } else {
                const errorData = await response.json();
                console.warn('Subscription API returned error, running simulation fallback:', errorData.error);
                triggerSimulation(email);
            }
        } catch (err) {
            console.warn('Could not contact subscription worker (likely running locally), running simulation:', err);
            triggerSimulation(email);
        } finally {
            submitBtn.textContent = "Send My Roadmap";
            submitBtn.disabled = false;
        }
    });
}

function triggerSimulation(email) {
    alert(`Successfully Opted-In (Simulation Mode)!\nEmail ${email} captured.\n\n(Once deployed to Cloudflare with BREVO_API_KEY set, this will add directly to your Brevo list).`);
    leadForm.reset();
}

// --- FAQ Accordion Logic ---
document.querySelectorAll(".faq-question").forEach(item => {
    item.addEventListener("click", () => {
        const parent = item.parentElement;
        
        if (parent.classList.contains("active")) {
            parent.classList.remove("active");
        } else {
            // Close other items
            document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("active"));
            parent.classList.add("active");
        }
    });
});

// --- 3D Carousel Logic ---
function initCarousel() {
    const track = document.getElementById("carousel-track");
    if (!track) return;

    const cards = Array.from(track.getElementsByClassName("offer-card"));
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const dotLabels = document.querySelectorAll(".carousel-dot-label");
    
    let currentIndex = 0;

    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.remove("active", "prev", "next", "hidden-left", "hidden-right");

            if (index === currentIndex) {
                card.classList.add("active");
            } else if (index === currentIndex - 1) {
                card.classList.add("prev");
            } else if (index === currentIndex + 1) {
                card.classList.add("next");
            } else if (index < currentIndex) {
                card.classList.add("hidden-left");
            } else {
                card.classList.add("hidden-right");
            }
        });

        dotLabels.forEach((label, index) => {
            if (index === currentIndex) {
                label.classList.add("active");
            } else {
                label.classList.remove("active");
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentIndex < cards.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });
    }

    dotLabels.forEach((label, index) => {
        label.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
        });
    });

    cards.forEach((card, index) => {
        card.addEventListener("click", (e) => {
            // Only navigate carousel if click is NOT on a button or form element, and card is not already active
            const clickedBtn = e.target.closest(".checkout-btn");
            if (!clickedBtn && e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT" && index !== currentIndex) {
                currentIndex = index;
                updateCarousel();
            }
        });
    });

    updateCarousel();

    // Expose global navigation function for checkout button handler
    window._carouselGoTo = function(index) {
        if (index >= 0 && index < cards.length) {
            currentIndex = index;
            updateCarousel();
        }
    };
}

// Start Quiz and Carousel on page load
initQuiz();
initCarousel();
