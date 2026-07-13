/* ----------------------------------------------------
   PRIME PAGES LANDING PAGE JS
   Logic: Slider, Interactive Calculator, Specs, Form
   Supports dynamic Supabase queries with LocalStorage fallback
---------------------------------------------------- */

// ==========================================
// SUPABASE CONFIGURATION
// Paste your credentials below to connect your database.
// If left blank, the app will run in "Local Mock Mode" (saves data in browser cache).
// ==========================================
const SUPABASE_URL = "https://gkpaczynbbcxkknxftlh.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_0-NoMa4sP6xvQtkAeFe7gQ_-M_PUbRc";

// State
let isSupabaseConfigured = false;
let supabaseClient = null;

// Mock database storage keys
const STORAGE_KEYS = {
    PRICES: 'prime_pages_prices',
    SHOWCASE: 'prime_pages_showcase',
    INQUIRIES: 'prime_pages_inquiries'
};

// Default pricing values
const DEFAULT_PRICES = {
    notebook: 350,
    magazine: 499,
    travel: 499,
    album: 149,
    softcover: 0,
    hardcover: 350,
    leather: 800,
    paperIvory: 4,
    paperMatte: 6,
    paperLustre: 8
};

// Check if credentials are provided
if (SUPABASE_URL && SUPABASE_ANON_KEY && typeof supabase !== 'undefined') {
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isSupabaseConfigured = true;
    } catch (err) {
        console.error("Supabase init error:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('open')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }

    // Active Navigation Highlight on Scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });


    // 3. Hero Gallery Carousel
    const galleryCards = document.querySelectorAll('.gallery-card');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let activeIndex = 0;
    let autoSlideInterval;

    function showSlide(index) {
        if (galleryCards.length === 0) return;
        galleryCards.forEach(card => card.classList.remove('active'));
        
        activeIndex = index;
        if (activeIndex >= galleryCards.length) activeIndex = 0;
        if (activeIndex < 0) activeIndex = galleryCards.length - 1;

        galleryCards[activeIndex].classList.add('active');
    }

    function nextSlide() {
        showSlide(activeIndex + 1);
    }

    function prevSlide() {
        showSlide(activeIndex - 1);
    }

    if (prevBtn && nextBtn && galleryCards.length > 0) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoSlide();
        });
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoSlide();
        });

        // Auto slide
        startAutoSlide();
    }

    function startAutoSlide() {
        if (galleryCards.length === 0) return;
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }


    // 4. Interactive Calculator & Quote Builder
    const productOptions = document.querySelectorAll('#product-options .option-card');
    const coverOptions = document.querySelectorAll('#cover-options .option-card');
    const sizeSelect = document.getElementById('config-size');
    const paperSelect = document.getElementById('config-paper');
    const bindingSelect = document.getElementById('config-binding');
    const deliverySelect = document.getElementById('config-delivery');
    const pageSlider = document.getElementById('config-pages');
    const pageValueDisp = document.getElementById('page-value');

    // Summary displays
    const summaryProduct = document.getElementById('summary-product');
    const summaryCover = document.getElementById('summary-cover');
    const summarySize = document.getElementById('summary-size');
    const summaryPaper = document.getElementById('summary-paper');
    const summaryBinding = document.getElementById('summary-binding');
    const summaryDelivery = document.getElementById('summary-delivery');
    const summaryPageCount = document.getElementById('summary-page-count');
    const summaryPrice = document.getElementById('summary-price');
    const userSpecTextarea = document.getElementById('user-spec');

    let selectedProduct = {
        name: 'Notebook',
        basePrice: 450
    };

    let selectedCover = {
        name: 'Premium Softcover',
        addonPrice: 0
    };

    let selectedBinding = {
        name: 'Normal Spiral',
        addonPrice: 0
    };

    let selectedDelivery = {
        name: 'Inside Chattogram',
        charge: 80
    };

    function updateCoverOptionsVisibility(productValue) {
        const softcoverCard = document.querySelector('#cover-options .option-card[data-value="softcover"]');
        const hardcoverCard = document.querySelector('#cover-options .option-card[data-value="hardcover"]');
        const leatherCard = document.querySelector('#cover-options .option-card[data-value="leather"]');

        if (!softcoverCard || !hardcoverCard || !leatherCard) return;

        // Reset visibility
        softcoverCard.style.display = 'flex';
        hardcoverCard.style.display = 'flex';
        leatherCard.style.display = 'flex';

        // Update hardcover label text based on product type
        if (productValue === 'magazine' || productValue === 'travel') {
            hardcoverCard.querySelector('span').innerText = 'Premium Hardcover';
        } else {
            hardcoverCard.querySelector('span').innerText = 'Linen Hardcover';
        }

        // Hide leather for notebooks, photo magazines, and travel magazines
        if (productValue === 'notebook' || productValue === 'magazine' || productValue === 'travel') {
            leatherCard.style.display = 'none';

            // If leather was selected, reset selection to softcover
            if (leatherCard.classList.contains('selected')) {
                leatherCard.classList.remove('selected');
                softcoverCard.classList.add('selected');
                selectedCover.name = softcoverCard.querySelector('span').innerText;
                selectedCover.addonPrice = parseFloat(softcoverCard.dataset.addPrice || 0);
            }
        }
    }

    function updatePageLimitsAndBindings(productValue) {
        if (!pageSlider || !bindingSelect) return;

        const minLimitLabel = document.querySelector('.slider-limits span:first-child');
        const maxLimitLabel = document.querySelector('.slider-limits span:last-child');

        // Clear existing binding options
        bindingSelect.innerHTML = '';

        let bindings = [];
        let pageSettings = { min: 20, max: 200, value: 70, step: 10 };

        if (productValue === 'notebook') {
            pageSettings = { min: 20, max: 300, value: 70, step: 10 };
            bindings = [
                { name: 'Normal Spiral', value: 'normal-spiral', price: 0 },
                { name: 'Premium Spiral', value: 'premium-spiral', price: 80 },
                { name: 'Perfect Glue Binding', value: 'perfect-glue', price: 150 }
            ];
            // Select standard paper by default
            if (paperSelect) paperSelect.value = 'ivory-120';
        } else if (productValue === 'magazine' || productValue === 'travel') {
            pageSettings = { min: 4, max: 16, value: 10, step: 2 };
            bindings = [
                { name: 'Stapler Binding', value: 'stapler', price: 0 },
                { name: 'Glue Binding', value: 'glue', price: 100 }
            ];
            // Select Glossy Premium paper by default
            if (paperSelect) paperSelect.value = 'glossy-200';
        } else if (productValue === 'album') {
            pageSettings = { min: 10, max: 100, value: 20, step: 5 };
            bindings = [
                { name: 'Premium Lay-flat Board Binding', value: 'layflat-board', price: 400 },
                { name: 'Spiral Binding', value: 'spiral', price: 0 }
            ];
            // Select Photo Lustre paper by default
            if (paperSelect) paperSelect.value = 'lustre-200';
        }

        // Apply page range settings
        pageSlider.min = pageSettings.min;
        pageSlider.max = pageSettings.max;
        pageSlider.step = pageSettings.step;
        pageSlider.value = pageSettings.value;
        pageValueDisp.innerText = pageSettings.value;

        if (minLimitLabel) minLimitLabel.innerText = `${pageSettings.min} pages`;
        if (maxLimitLabel) maxLimitLabel.innerText = `${pageSettings.max} pages`;

        // Populate bindings dropdown
        bindings.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.value;
            opt.dataset.addPrice = b.price;
            opt.text = `${b.name} (+BDT ${b.price})`;
            bindingSelect.appendChild(opt);
        });

        // Set initial selected binding state
        if (bindings.length > 0) {
            selectedBinding.name = bindings[0].name;
            selectedBinding.addonPrice = bindings[0].price;
        }
    }

    // Product cards selection listeners
    productOptions.forEach(card => {
        card.addEventListener('click', () => {
            productOptions.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedProduct.name = card.querySelector('span').innerText;
            selectedProduct.basePrice = parseFloat(card.dataset.price);
            
            // Filter cover options dynamically based on product selection
            updateCoverOptionsVisibility(card.dataset.value);
            // Filter pages and bindings dynamically
            updatePageLimitsAndBindings(card.dataset.value);
            
            calculatePrice();
        });
    });

    // Cover material selection listeners
    coverOptions.forEach(card => {
        card.addEventListener('click', () => {
            coverOptions.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCover.name = card.querySelector('span').innerText;
            selectedCover.addonPrice = parseFloat(card.dataset.addPrice);
            calculatePrice();
        });
    });

    // Page count slider listener
    if (pageSlider && pageValueDisp) {
        pageSlider.addEventListener('input', () => {
            pageValueDisp.innerText = pageSlider.value;
            calculatePrice();
        });
    }

    // Select options listener
    if (sizeSelect && paperSelect && bindingSelect && deliverySelect) {
        sizeSelect.addEventListener('change', calculatePrice);
        paperSelect.addEventListener('change', calculatePrice);
        
        bindingSelect.addEventListener('change', () => {
            const opt = bindingSelect.options[bindingSelect.selectedIndex];
            selectedBinding.name = opt.text.split(' (+')[0];
            selectedBinding.addonPrice = parseFloat(opt.dataset.addPrice || 0);
            calculatePrice();
        });

        deliverySelect.addEventListener('change', () => {
            const opt = deliverySelect.options[deliverySelect.selectedIndex];
            selectedDelivery.name = opt.text.split(' (+')[0];
            selectedDelivery.charge = parseFloat(opt.dataset.charge || 80);
            calculatePrice();
        });
    }

    function calculatePrice() {
        if (!pageSlider) return;
        const pages = parseInt(pageSlider.value);
        
        // Size format multiplier
        const selectedSizeOption = sizeSelect.options[sizeSelect.selectedIndex];
        const sizeName = selectedSizeOption.text.split(' (')[0];
        const sizeMultiplier = parseFloat(selectedSizeOption.dataset.multiplier);

        // Paper type page rate
        const selectedPaperOption = paperSelect.options[paperSelect.selectedIndex];
        const paperName = selectedPaperOption.text.split(' (')[0];
        const paperPagePrice = parseFloat(selectedPaperOption.dataset.addPagePrice);

        // Formulate Price:
        // (Base price of product + cover addon + binding addon + extra pages cost) * size multiplier + flat delivery charge
        let basePages = 20;
        const prodLower = selectedProduct.name.toLowerCase();
        if (prodLower.includes('notebook')) {
            basePages = 70;
        } else if (prodLower.includes('magazine') || prodLower.includes('travel')) {
            basePages = 12;
        } else if (prodLower.includes('album')) {
            basePages = 20;
        }
        
        const extraPages = Math.max(0, pages - basePages);
        const pagesCost = extraPages * paperPagePrice;
        
        const rawTotal = (selectedProduct.basePrice + selectedCover.addonPrice + selectedBinding.addonPrice + pagesCost) * sizeMultiplier + selectedDelivery.charge;
        const totalEstimate = Math.round(rawTotal);

        // Update Spec summary card
        summaryProduct.innerText = selectedProduct.name;
        summaryCover.innerText = selectedCover.name;
        summaryBinding.innerText = selectedBinding.name;
        summarySize.innerText = sizeName;
        summaryPaper.innerText = paperName;
        summaryDelivery.innerText = `${selectedDelivery.name} (+BDT ${selectedDelivery.charge})`;
        summaryPageCount.innerText = `${pages} Pages`;
        summaryPrice.innerText = totalEstimate.toLocaleString();

        // Update Spec Textbox for order form
        const specSummaryText = 
`Product: ${selectedProduct.name}
Cover Type: ${selectedCover.name}
Binding Method: ${selectedBinding.name}
Size Format: ${sizeName}
Paper Quality: ${paperName}
Delivery: ${selectedDelivery.name} (+BDT ${selectedDelivery.charge})
Pages Count: ${pages} Pages
Estimated Price: BDT ${totalEstimate}`;
        
        userSpecTextarea.value = specSummaryText;
    }
    window.calculatePrice = calculatePrice;


    // 5. Spec & Quote copy to Contact Form
    const btnInquire = document.getElementById('btn-inquire');
    if (btnInquire) {
        btnInquire.addEventListener('click', () => {
            calculatePrice(); // Ensure specs are fresh
            const contactSection = document.getElementById('contact');
            
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Add highlight/flash effect to the form spec card
                userSpecTextarea.classList.add('flash-highlight');
                setTimeout(() => {
                    userSpecTextarea.classList.remove('flash-highlight');
                }, 1500);

                // Focus on name input
                document.getElementById('user-name').focus();
            }
        });
    }


    // 6. Form Submission (Email client redirect AND database inquiry storage with Supabase Storage upload)
    const inquiryForm = document.getElementById('inquiry-form');
    const successOverlay = document.getElementById('form-success');
    const userFilesInput = document.getElementById('user-files');
    const btnSubmitForm = document.getElementById('btn-submit-form');

    if (inquiryForm) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('user-name').value;
            const email = document.getElementById('user-email').value;
            const phone = document.getElementById('user-phone').value;
            const address = document.getElementById('user-delivery').value;
            const specifications = userSpecTextarea.value;
            const userMessage = document.getElementById('user-message').value;

            // Handle file upload if present
            const file = userFilesInput ? userFilesInput.files[0] : null;
            let fileUrl = "";

            if (file) {
                if (btnSubmitForm) {
                    btnSubmitForm.disabled = true;
                    btnSubmitForm.innerHTML = `Uploading Files... <i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px;"></i>`;
                }

                if (isSupabaseConfigured) {
                    try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
                        const { data, error } = await supabaseClient.storage
                            .from('order-files')
                            .upload(fileName, file);

                        if (!error) {
                            const { data: urlData } = supabaseClient.storage
                                .from('order-files')
                                .getPublicUrl(fileName);
                            fileUrl = urlData.publicUrl;
                        } else {
                            console.error("Supabase Storage upload error:", error.message);
                            alert("File upload failed, but order submission will continue.");
                        }
                    } catch (err) {
                        console.error("Storage error:", err);
                    }
                } else {
                    // Local Mock Mode fallback
                    fileUrl = `[Mock Upload] ${file.name}`;
                }
            }

            // Formulate email content for mailto link (as client side fallback)
            const subject = encodeURIComponent(`Prime Pages Order Inquiry - ${name}`);
            const body = encodeURIComponent(
`Order Specifications:
-------------------------
${specifications}

Uploaded File Link:
-------------------------
${fileUrl ? fileUrl : 'No file uploaded'}

Customer Details:
-------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Delivery Address: ${address}

Custom Instructions / Notes:
-------------------------
${userMessage}
`);
            
            // Recipient email
            const recipientEmail = "thisisprimepages@gmail.com";
            const mailtoUrl = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

            // Save inquiry into database
            const inquiryData = {
                name,
                email,
                phone,
                address,
                specifications,
                message: userMessage,
                fileUrl: fileUrl,
                created_at: new Date().toISOString()
            };

            await saveInquiryToDatabase(inquiryData);

            // Restore submit button state
            if (btnSubmitForm) {
                btnSubmitForm.disabled = false;
                btnSubmitForm.innerHTML = `Send Order Inquiry <i class="fa-solid fa-paper-plane" style="margin-left: 8px;"></i>`;
            }

            // Open mail app
            window.location.href = mailtoUrl;

            // Display custom success overlay
            if (successOverlay) {
                successOverlay.classList.remove('hide');
            }
        });
    }

    // Reset overlay function
    window.resetForm = () => {
        if (inquiryForm) {
            inquiryForm.reset();
            if (userFilesInput) userFilesInput.value = '';
            calculatePrice(); // Reset specs block
        }
        if (successOverlay) {
            successOverlay.classList.add('hide');
        }
    };

    // Quick selection from products catalog grid
    window.quickSelect = (productType) => {
        // Find corresponding card in wizard
        const productOptionCard = document.querySelector(`#product-options .option-card[data-value="${productType}"]`);
        if (productOptionCard) {
            // Trigger click event to activate all sub logic
            productOptionCard.click();
            
            // Scroll to calculator
            document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 7. Testimonials Slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevSlideBtn = document.querySelector('.prev-slide-btn');
    const nextSlideBtn = document.querySelector('.next-slide-btn');
    const slideDots = document.querySelectorAll('.slider-dots .dot');
    let currentSlide = 0;
    let testimonialInterval;

    function showTestimonial(index) {
        if (testimonialSlides.length === 0) return;
        
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        slideDots.forEach(dot => dot.classList.remove('active'));

        currentSlide = index;
        if (currentSlide >= testimonialSlides.length) currentSlide = 0;
        if (currentSlide < 0) currentSlide = testimonialSlides.length - 1;

        testimonialSlides[currentSlide].classList.add('active');
        if (slideDots[currentSlide]) slideDots[currentSlide].classList.add('active');
    }

    function nextTestimonial() {
        showTestimonial(currentSlide + 1);
    }

    function prevTestimonial() {
        showTestimonial(currentSlide - 1);
    }

    function startTestimonialTimer() {
        if (testimonialSlides.length > 0) {
            testimonialInterval = setInterval(nextTestimonial, 12000);
        }
    }

    function resetTestimonialTimer() {
        clearInterval(testimonialInterval);
        startTestimonialTimer();
    }

    if (nextSlideBtn && prevSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            nextTestimonial();
            resetTestimonialTimer();
        });
        prevSlideBtn.addEventListener('click', () => {
            prevTestimonial();
            resetTestimonialTimer();
        });

        slideDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetSlide = parseInt(dot.dataset.slide);
                showTestimonial(targetSlide);
                resetTestimonialTimer();
            });
        });

        startTestimonialTimer();
    }

    // 8. FAQ Accordion
    const faqHeaders = document.querySelectorAll('.faq-header');
    
    faqHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const faqItem = header.parentElement;
            const faqBody = faqItem.querySelector('.faq-body');
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-body').style.maxHeight = '0';
            });

            // Toggle current FAQ item
            if (!isActive) {
                faqItem.classList.add('active');
                // Calculate actual content height
                faqBody.style.maxHeight = faqBody.scrollHeight + 'px';
            } else {
                faqItem.classList.remove('active');
                faqBody.style.maxHeight = '0';
            }
        });
    });

    // Load Dynamic Data on Startup
    loadDynamicData();

// ==========================================
// DYNAMIC DATA INGESTION & DATABASE OPERATIONS
// ==========================================

async function loadDynamicData() {
    // 1. Fetch and apply pricing settings
    const prices = await fetchPrices();
    applyPricesToUI(prices);

    // 2. Fetch and apply portfolio showcase items
    const showcaseItems = await fetchShowcase();
    renderPortfolioShowcase(showcaseItems);
}

// Fetch Prices
async function fetchPrices() {
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabaseClient
                .from('prices')
                .select('*')
                .single();
            if (data) return data;
        } catch (err) {
            console.error("Failed to load prices from Supabase:", err);
        }
    }

    const localPrices = localStorage.getItem(STORAGE_KEYS.PRICES);
    if (localPrices) {
        const parsed = JSON.parse(localPrices);
        if (parsed.notebook === 450 || parsed.album === 1800) {
            localStorage.removeItem(STORAGE_KEYS.PRICES);
            return DEFAULT_PRICES;
        }
        return parsed;
    }
    return DEFAULT_PRICES;
}

function applyPricesToUI(prices) {
    // Product Base Prices
    const options = {
        notebook: document.querySelector('#product-options .option-card[data-value="notebook"]'),
        magazine: document.querySelector('#product-options .option-card[data-value="magazine"]'),
        travel: document.querySelector('#product-options .option-card[data-value="travel"]'),
        album: document.querySelector('#product-options .option-card[data-value="album"]')
    };

    if (options.notebook) options.notebook.dataset.price = prices.notebook;
    if (options.magazine) options.magazine.dataset.price = prices.magazine;
    if (options.travel) options.travel.dataset.price = prices.travel;
    if (options.album) options.album.dataset.price = prices.album;

    // Cover Material Addon Prices
    const covers = {
        softcover: document.querySelector('#cover-options .option-card[data-value="softcover"]'),
        hardcover: document.querySelector('#cover-options .option-card[data-value="hardcover"]'),
        leather: document.querySelector('#cover-options .option-card[data-value="leather"]')
    };

    if (covers.softcover) covers.softcover.dataset.addPrice = prices.softcover;
    if (covers.hardcover) covers.hardcover.dataset.addPrice = prices.hardcover;
    if (covers.leather) covers.leather.dataset.addPrice = prices.leather;

    // Paper type add-on pricing
    const papers = {
        ivory: document.querySelector('#config-paper option[value="ivory-120"]'),
        matte: document.querySelector('#config-paper option[value="matte-170"]'),
        lustre: document.querySelector('#config-paper option[value="lustre-200"]')
    };

    if (papers.ivory) papers.ivory.dataset.addPagePrice = prices.paperIvory;
    if (papers.matte) papers.matte.dataset.addPagePrice = prices.paperMatte;
    if (papers.lustre) papers.lustre.dataset.addPagePrice = prices.paperLustre;

    // Set calculator initial selection states
    const activeProductCard = document.querySelector('#product-options .option-card.selected');
    if (activeProductCard) {
        selectedProduct.name = activeProductCard.querySelector('span').innerText;
        selectedProduct.basePrice = parseFloat(activeProductCard.dataset.price);
        updateCoverOptionsVisibility(activeProductCard.dataset.value);
        updatePageLimitsAndBindings(activeProductCard.dataset.value);
    }

    const activeCoverCard = document.querySelector('#cover-options .option-card.selected');
    if (activeCoverCard) {
        selectedCover.name = activeCoverCard.querySelector('span').innerText;
        selectedCover.addonPrice = parseFloat(activeCoverCard.dataset.addPrice);
    }

    // Run first calculation
    calculatePrice();
}

// Fetch Showcase
async function fetchShowcase() {
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabaseClient
                .from('showcase')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) return data;
        } catch (err) {
            console.error("Failed to load showcase from Supabase:", err);
        }
    }

    const localShowcase = localStorage.getItem(STORAGE_KEYS.SHOWCASE);
    return localShowcase ? JSON.parse(localShowcase) : [];
}

function renderPortfolioShowcase(items) {
    const galleryContainer = document.getElementById('dynamic-gallery-container');
    const galleryGrid = document.getElementById('dynamic-gallery-grid');

    if (!galleryContainer || !galleryGrid) return;

    if (items.length === 0) {
        galleryContainer.style.display = 'none';
        return;
    }

    // Unhide showcase container
    galleryContainer.style.display = 'block';

    const categoryMap = {
        notebook: 'Customized Notebook',
        magazine: 'Photo Magazine',
        travel: 'Travel Magazine',
        album: 'Family Photo Album'
    };

    // Render cards
    galleryGrid.innerHTML = items.map(item => `
        <div class="dynamic-showcase-card">
            <div class="dynamic-showcase-img-wrapper">
                <img src="${item.imageUrl}" alt="${item.title}">
            </div>
            <div class="dynamic-showcase-details">
                <h4>${item.title}</h4>
                <p>${item.description || ''}</p>
                <div class="dynamic-showcase-category-tag">${categoryMap[item.category] || item.category}</div>
            </div>
        </div>
    `).join('');
}

// Save customer inquiries
async function saveInquiryToDatabase(inquiry) {
    if (isSupabaseConfigured) {
        try {
            const { error } = await supabaseClient
                .from('inquiries')
                .insert([inquiry]);
            if (!error) return;
            console.error("Supabase inquiries insert failed:", error);
        } catch (err) {
            console.error("Supabase inquiries save failed, saving to fallback:", err);
        }
    }

    const localInquiries = localStorage.getItem(STORAGE_KEYS.INQUIRIES) || "[]";
    const list = JSON.parse(localInquiries);
    list.unshift(inquiry);
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));
}
});
