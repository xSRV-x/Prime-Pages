/* ----------------------------------------------------
   PRIME PAGES ADMIN PANEL JS
   Handles Login, Tab switching, Pricing updates, Showcase uploads
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
    // 1. Password Protection & Session Persistence
    const loginWrapper = document.getElementById('login-wrapper');
    const loginForm = document.getElementById('login-form');
    const passcodeField = document.getElementById('passcode');
    
    const adminSidebar = document.getElementById('admin-sidebar');
    const adminMain = document.getElementById('admin-main');

    async function getAdminPasscode() {
        // Check local storage first
        let localPass = localStorage.getItem('prime_pages_admin_passcode');
        if (localPass) return localPass;

        // Check Supabase
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabaseClient
                    .from('prices')
                    .select('admin_passcode')
                    .single();
                if (data && data.admin_passcode) {
                    return data.admin_passcode;
                }
            } catch (err) {
                console.log("admin_passcode column not found in database, using default.");
            }
        }
        return 'admin123';
    }

    function checkAuth() {
        if (sessionStorage.getItem('admin_auth') === 'true') {
            loginWrapper.style.display = 'none';
            adminSidebar.style.display = 'flex';
            adminMain.style.display = 'block';
            initializeDashboard();
        } else {
            loginWrapper.style.display = 'flex';
            adminSidebar.style.display = 'none';
            adminMain.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const passcode = passcodeField.value.trim();
            
            const correctPasscode = await getAdminPasscode();
            if (passcode === correctPasscode) {
                sessionStorage.setItem('admin_auth', 'true');
                checkAuth();
            } else {
                alert('Invalid Passcode! Please try again.');
                passcodeField.value = '';
                passcodeField.focus();
            }
        });
    }

    window.getAdminPasscode = getAdminPasscode;

    window.logoutAdmin = () => {
        sessionStorage.removeItem('admin_auth');
        checkAuth();
    };

    // Run auth check on load
    checkAuth();
});

// ==========================================
// DASHBOARD INITIALIZATION
// ==========================================
function initializeDashboard() {
    setupTabSwitcher();
    setupImageUploader();
    checkSetupWarning();
    loadAllDashboardData();
    setupSecurityForm();
}

function checkSetupWarning() {
    const alertBox = document.getElementById('supabase-alert');
    const statusPill = document.getElementById('db-status');
    
    if (isSupabaseConfigured) {
        alertBox.style.display = 'none';
        statusPill.className = 'db-status-pill inquiry-status status-read';
        statusPill.innerHTML = '<i class="fa-solid fa-cloud"></i> Supabase Live';
    } else {
        alertBox.style.display = 'block';
        statusPill.className = 'db-status-pill inquiry-status status-unread';
        statusPill.innerHTML = '<i class="fa-solid fa-circle-dot"></i> Local Mock Mode';
    }
}

// 2. Tab Navigation Switcher
function setupTabSwitcher() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.dashboard-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(mi => mi.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            item.classList.add('active');
            const target = item.dataset.target;
            document.getElementById(target).classList.add('active');
        });
    });
}

// 3. Showcase Image Upload Dropzone details
let uploadedImageBase64 = "";

function setupImageUploader() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('showcase-image');
    const previewEl = document.getElementById('image-preview-element');
    const uploadIcon = dropZone.querySelector('i');
    const uploadTxt = dropZone.querySelector('p');

    // Handle drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--accent-gold)';
            dropZone.style.backgroundColor = 'rgba(212, 175, 55, 0.04)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--border-color)';
            dropZone.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImageBase64 = e.target.result;
            previewEl.src = uploadedImageBase64;
            previewEl.style.display = 'block';
            uploadIcon.style.display = 'none';
            uploadTxt.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    // Submit handler for showcase form
    const form = document.getElementById('showcase-upload-form');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('showcase-title').value;
            const category = document.getElementById('showcase-category').value;
            const desc = document.getElementById('showcase-desc').value;

            if (!uploadedImageBase64) {
                alert('Please upload an image first!');
                return;
            }

            const newShowcaseItem = {
                id: Date.now(),
                title,
                category,
                description: desc,
                imageUrl: uploadedImageBase64,
                created_at: new Date().toISOString()
            };

            await addShowcaseItem(newShowcaseItem);
            alert('Showcase item added successfully!');
            form.reset();
            previewEl.style.display = 'none';
            uploadIcon.style.display = 'block';
            uploadTxt.style.display = 'block';
            uploadedImageBase64 = "";

            loadAllDashboardData();
        };
    }
}

// ==========================================
// DATA ACCESS FUNCTIONS (SUPABASE + LOCALSTORAGE)
// ==========================================

async function loadAllDashboardData() {
    // A. Load Prices
    const prices = await getPrices();
    document.getElementById('price-notebook').value = prices.notebook;
    document.getElementById('price-magazine').value = prices.magazine;
    document.getElementById('price-travel').value = prices.travel;
    document.getElementById('price-album').value = prices.album;
    document.getElementById('price-cover-soft').value = prices.softcover;
    document.getElementById('price-cover-hard').value = prices.hardcover;
    document.getElementById('price-cover-leather').value = prices.leather;
    document.getElementById('price-paper-ivory').value = prices.paperIvory;
    document.getElementById('price-paper-matte').value = prices.paperMatte;
    document.getElementById('price-paper-lustre').value = prices.paperLustre;

    // B. Load Showcase
    const showcaseItems = await getShowcase();
    document.getElementById('stat-showcase-count').innerText = showcaseItems.length;
    renderShowcaseTable(showcaseItems);

    // C. Load Inquiries
    const inquiries = await getInquiries();
    document.getElementById('stat-inquiry-count').innerText = inquiries.length;
    renderInquiriesTable(inquiries);
}

// 1. Get prices
async function getPrices() {
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabaseClient
                .from('prices')
                .select('*')
                .single();
            if (data) return data;
        } catch (err) {
            console.error("Failed to load prices from Supabase, loading fallback:", err);
        }
    }
    
    // Fallback to local storage or defaults
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

// Save prices
async function savePrices() {
    const updatedPrices = {
        notebook: parseFloat(document.getElementById('price-notebook').value),
        magazine: parseFloat(document.getElementById('price-magazine').value),
        travel: parseFloat(document.getElementById('price-travel').value),
        album: parseFloat(document.getElementById('price-album').value),
        softcover: parseFloat(document.getElementById('price-cover-soft').value),
        hardcover: parseFloat(document.getElementById('price-cover-hard').value),
        leather: parseFloat(document.getElementById('price-cover-leather').value),
        paperIvory: parseFloat(document.getElementById('price-paper-ivory').value),
        paperMatte: parseFloat(document.getElementById('price-paper-matte').value),
        paperLustre: parseFloat(document.getElementById('price-paper-lustre').value)
    };

    if (isSupabaseConfigured) {
        try {
            const { error } = await supabaseClient
                .from('prices')
                .upsert([{ id: 1, ...updatedPrices }]);
            if (!error) {
                alert('Prices saved successfully to Supabase!');
                return;
            }
            console.error("Supabase write error:", error);
        } catch (err) {
            console.error("Supabase write failed, writing to fallback:", err);
        }
    }

    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(updatedPrices));
    alert('Prices saved successfully to Local Storage!');
}

// 2. Get showcase
async function getShowcase() {
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabaseClient
                .from('showcase')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) return data;
        } catch (err) {
            console.error("Supabase showcase fetch error:", err);
        }
    }

    const localShowcase = localStorage.getItem(STORAGE_KEYS.SHOWCASE);
    return localShowcase ? JSON.parse(localShowcase) : [];
}

// Add showcase item
async function addShowcaseItem(item) {
    if (isSupabaseConfigured) {
        try {
            // First, if using real Supabase storage, we would upload the image file to storage bucket.
            // For code simplicity, we will save the base64 URL directly in the text column or upload to storage.
            // Let's save the base64 URL directly in Postgres column. Postgres Text column supports up to 10MB, which is plenty for 2MB mock images.
            const { error } = await supabaseClient
                .from('showcase')
                .insert([item]);
            if (!error) return;
            console.error("Supabase showcase insert error:", error);
        } catch (err) {
            console.error("Supabase showcase write failed, writing to local fallback:", err);
        }
    }

    const list = await getShowcase();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.SHOWCASE, JSON.stringify(list));
}

// Delete showcase item
async function deleteShowcaseItem(id) {
    if (confirm('Are you sure you want to delete this showcase item?')) {
        if (isSupabaseConfigured) {
            try {
                const { error } = await supabaseClient
                    .from('showcase')
                    .delete()
                    .eq('id', id);
                if (!error) {
                    loadAllDashboardData();
                    return;
                }
            } catch (err) {
                console.error("Supabase delete failed:", err);
            }
        }

        const list = await getShowcase();
        const updatedList = list.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEYS.SHOWCASE, JSON.stringify(updatedList));
        loadAllDashboardData();
    }
}

// 3. Get Inquiries
async function getInquiries() {
    if (isSupabaseConfigured) {
        try {
            const { data, error } = await supabaseClient
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) return data;
        } catch (err) {
            console.error("Supabase inquiries fetch error:", err);
        }
    }

    const localInquiries = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
    return localInquiries ? JSON.parse(localInquiries) : [];
}

// Delete / Clear inquiries
function clearInquiriesHistory() {
    if (confirm('Are you sure you want to clear all inquiries history? This action is permanent.')) {
        if (isSupabaseConfigured) {
            try {
                supabaseClient.from('inquiries').delete().not('id', 'is', 'null').then(() => {
                    loadAllDashboardData();
                });
                return;
            } catch (err) {
                console.error(err);
            }
        }
        localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify([]));
        loadAllDashboardData();
    }
}

// ==========================================
// RENDER UI METHODS
// ==========================================

function renderShowcaseTable(items) {
    const tbody = document.getElementById('overview-showcase-tbody');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No uploads found. Upload photos in the Showcase panel.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const date = new Date(item.created_at).toLocaleDateString();
        const categoryMap = {
            notebook: 'Customized Notebook',
            magazine: 'Photo Magazine',
            travel: 'Travel Magazine',
            album: 'Family Photo Album'
        };

        return `
            <tr>
                <td><img src="${item.imageUrl}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color)"></td>
                <td><strong>${item.title}</strong></td>
                <td>${categoryMap[item.category] || item.category}</td>
                <td>${date}</td>
                <td><button onclick="deleteShowcaseItem(${item.id})" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; border-color: #ef4444; color: #ef4444;"><i class="fa-regular fa-trash-can"></i> Delete</button></td>
            </tr>
        `;
    }).join('');
}

function renderInquiriesTable(items) {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No inquiries found. When customers submit the form on the front page, orders will appear here.</td></tr>`;
        return;
    }

    tbody.innerHTML = items.map(item => {
        const date = new Date(item.created_at).toLocaleString();
        
        const fileCell = item.fileUrl ? 
            item.fileUrl.split(',').map((url, idx) => {
                const trimmedUrl = url.trim();
                if (trimmedUrl.startsWith('http')) {
                    return `<a href="${trimmedUrl}" target="_blank" class="btn btn-secondary" style="padding: 0.2rem 0.4rem; font-size: 0.72rem; border-color: var(--accent-gold); color: var(--accent-gold); display: inline-flex; align-items: center; gap: 0.25rem; margin-bottom: 0.25rem; margin-right: 0.25rem;"><i class="fa-solid fa-download"></i> File ${idx + 1}</a>`;
                } else {
                    return `<span style="color: var(--accent-gold); font-size: 0.75rem; display: block; margin-bottom: 0.25rem;">${trimmedUrl}</span>`;
                }
            }).join('') : 
            `<span style="color: var(--text-muted);">None</span>`;

        const statusVal = item.status || 'New';
        let statusClass = 'status-unread';
        if (statusVal === 'Completed') statusClass = 'status-read';
        else if (statusVal === 'Pending') statusClass = 'status-pending';
        else if (statusVal === 'In Production') statusClass = 'status-production';
        else if (statusVal === 'Cancelled') statusClass = 'status-cancelled';

        const statusOptions = ['New', 'Pending', 'In Production', 'Completed', 'Cancelled'];
        const inquiryKey = item.id ? item.id : `'${item.created_at}'`;

        const selectHtml = `
            <div style="display: flex; flex-direction: column; gap: 0.35rem; width: 110px;">
                <span class="inquiry-status ${statusClass}" style="text-align: center; display: block;">${statusVal}</span>
                <select onchange="updateInquiryStatus(${inquiryKey}, this.value)" style="background: rgba(0, 0, 0, 0.45); border: 1px solid var(--border-color); border-radius: 4px; color: #fff; padding: 0.2rem 0.4rem; font-size: 0.75rem; outline: none; cursor: pointer; width: 100%;">
                    ${statusOptions.map(opt => `<option value="${opt}" ${statusVal === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </div>
        `;

        return `
            <tr>
                <td>${selectHtml}</td>
                <td>
                    <strong>${item.name}</strong><br>
                    <small style="color: var(--text-secondary)">${item.email}</small><br>
                    <small style="color: var(--text-secondary)">${item.phone}</small><br>
                    <small style="color: var(--text-muted)">${item.address}</small>
                </td>
                <td><pre style="font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-secondary); white-space: pre-wrap; width: 220px;">${item.specifications}</pre></td>
                <td><p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 250px; word-break: break-word;">${item.message || '<em style="color:var(--text-muted)">No message</em>'}</p></td>
                <td>${fileCell}</td>
                <td><small style="color: var(--text-muted)">${date}</small></td>
            </tr>
        `;
    }).join('');
}

async function updateInquiryStatus(key, newStatus) {
    if (isSupabaseConfigured) {
        try {
            const query = supabaseClient.from('inquiries').update({ status: newStatus });
            if (typeof key === 'number') {
                query.eq('id', key);
            } else {
                query.eq('created_at', key);
            }
            const { error } = await query;
            if (!error) {
                loadAllDashboardData();
                return;
            }
            console.error("Supabase status update failed:", error);
        } catch (err) {
            console.error("Supabase status update error:", err);
        }
    }

    // Local Mock Mode fallback
    const localInquiries = localStorage.getItem(STORAGE_KEYS.INQUIRIES) || "[]";
    const list = JSON.parse(localInquiries);
    const updated = list.map(item => {
        if (item.id === key || item.created_at === key) {
            item.status = newStatus;
        }
        return item;
    });
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
    loadAllDashboardData();
}
window.updateInquiryStatus = updateInquiryStatus;

function setupSecurityForm() {
    const changePasscodeForm = document.getElementById('change-passcode-form');
    if (!changePasscodeForm) return;

    changePasscodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPass = document.getElementById('current-passcode').value.trim();
        const newPass = document.getElementById('new-passcode').value.trim();
        const confirmNewPass = document.getElementById('confirm-new-passcode').value.trim();

        if (typeof window.getAdminPasscode !== 'function') {
            alert("Security system initialization error.");
            return;
        }

        const correctPasscode = await window.getAdminPasscode();

        if (currentPass !== correctPasscode) {
            alert("Current passcode is incorrect!");
            return;
        }

        if (newPass !== confirmNewPass) {
            alert("New passcode and confirmation do not match!");
            return;
        }

        if (newPass.length < 4) {
            alert("New passcode must be at least 4 characters long.");
            return;
        }

        // Save new passcode locally
        localStorage.setItem('prime_pages_admin_passcode', newPass);

        if (isSupabaseConfigured) {
            try {
                // Update prices table with new passcode
                const { data: pricesList } = await supabaseClient.from('prices').select('id');
                const priceRecordId = (pricesList && pricesList.length > 0) ? pricesList[0].id : 1;

                const { error } = await supabaseClient
                    .from('prices')
                    .update({ admin_passcode: newPass })
                    .eq('id', priceRecordId);

                if (error) {
                    console.error("Supabase passcode save failed:", error.message);
                    alert("Passcode updated locally in this browser. To sync across all devices, run the SQL query to add the passcode column in your Supabase Dashboard.");
                } else {
                    alert("Passcode updated successfully and synced to Supabase Cloud!");
                }
            } catch (err) {
                console.error("Database save failed:", err);
                alert("Passcode updated locally. (Supabase sync failed: admin_passcode column might not exist yet).");
            }
        } else {
            alert("Passcode updated locally in Mock Mode!");
        }

        changePasscodeForm.reset();
    });
}
