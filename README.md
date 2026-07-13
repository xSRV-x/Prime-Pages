# Prime Pages - Custom Book & Magazine Studio

An elegant, highly interactive dark-themed landing page and admin dashboard built for **Prime Pages**, a premium design studio based in Chattogram, Bangladesh. 

This repository houses the front-end interface, interactive configurator, secure administrator panel, and cloud server database integrations.

---

## 🌟 Key Features

### 1. Cinematic Landing Page (`index.html`)
* **Premium Aesthetics**: Curated gold-accented dark mode color palette (`#D4AF37`), styled fonts (Google Fonts `Playfair Display` & `Inter`), sleek glassmorphic container cards, and subtle hover animations.
* **Testimonials Slider**: Interactive slide panel showing user reviews and ratings with responsive navigation dots and a custom **12-second auto-slide interval**.
* **FAQ Accordion**: Interactive, collapsible panels for common customer questions (shipping times, resolution settings, etc.) with smooth height expansions and rotating indicator icons.
* **Responsive Layout**: Designed to display beautifully on narrow phone displays, tablets, and wide desktop screens.

### 2. Live Quote Configurator & Calculator
* **Product Formats**: Dynamically changes page limits, paper values, and binding options based on the chosen format:
  * **Notebook**: 20 to 300 pages (Default: 70). Bindings: *Normal Spiral* (+0 BDT), *Premium Spiral* (+80 BDT), *Perfect Glue* (+150 BDT).
  * **Photo & Travel Magazine**: 4 to 16 pages (Default: 10). Bindings: *Stapler* (+0 BDT), *Glue Binding* (+100 BDT). Default paper: *200 GSM Glossy Premium*.
  * **Family Photo Album**: 10 to 100 pages (Default: 20). Bindings: *Premium Lay-flat Board* (+400 BDT), *Spiral* (+0 BDT).
* **Base Pricing Calculations**:
  * **Notebook + Premium Softcover + Normal Spiral + 70 Pages** = **350 BDT** (Base price: 350 BDT).
  * **Photo/Travel Magazine + Premium Softcover/Hardcover + Stapler/Glue + 12 Pages** = **499 BDT** (Base price: 499 BDT).
  * **Photo Album + Premium Hardcover + Premium Lay-flat + 20 Pages** = **899 BDT** (Base price: 149 BDT + 350 Hardcover + 400 Lay-flat).
  * Page counts above the default thresholds charge only for extra pages. Sizing multiplier scales overall price.
* **Chattogram Delivery Options**: Location selector options with flat charges:
  * **Inside Chattogram**: +80 BDT (Flat fee added to total).
  * **Outside Chattogram**: +120 BDT (Flat fee added to total).
  * Right-aligned specs card formatting with no label wrapping.

### 3. Multi-File High-Res Upload
* **Multiple Files**: Customers can upload multiple original uncompressed photos, ZIP archives, or PDFs simultaneously.
* **No Compression**: Files upload directly to the cloud to ensure zero quality loss during delivery.
* **Upload Progress Indicator**: Submit button changes to `Uploading Files (1/3)...` in real-time, providing feedback during file uploads.

### 4. Secure Admin Panel (`admin.html`)
* **Access Control**: Passcode protection overlay screen (Default: `admin123`).
* **Pricing Dashboard**: Form inputs to dynamically adjust base rates and add-on costs, saving config variables globally.
* **Showcase Manager**: Drag-and-drop file uploader to publish new custom work images to the landing page showcase grid.
* **CRM Inquiries List & Order Statuses**:
  * View customer details, exact order specifications, and custom notes.
  * **Multiple Download Buttons**: Clickable download buttons (e.g. `File 1`, `File 2`) to grab the original uncompressed client assets.
  * **Dynamic Order Status**: CRM status selector dropdown (`New` in Gold, `Pending` in Orange, `In Production` in Blue, `Completed` in Green, `Cancelled` in Red) that updates the database instantly.
  * Responsive table layout with horizontal swipe scrolling on smaller screens.

### 5. Local Mock Mode (Offline Fallback)
* If Supabase credentials are not configured, the website automatically falls back to **Local Mock Mode**.
* Loads default local variables and stores customer inquiries and showcase photos in the browser's `localStorage`, allowing 100% offline functionality.

---

## 📂 Project Structure

```text
├── index.html          # Main customer landing page
├── style.css           # Global premium stylesheets & layouts
├── app.js              # Calculator logic, testimonials, FAQ, & client-side database submit
├── admin.html          # Secure administrative dashboard panel
├── admin.js            # Admin authentication, pricing, showcase editor, & inquiry CRM
├── SUPABASE_SETUP.md   # SQL queries & storage bucket instructions
└── README.md           # Documentation (This file)
```

---

## 🚀 Running Locally

1. Clone or download this project folder into your workspace directory.
2. Open terminal in the directory and serve using any local server (e.g., Live Server extension in VS Code or node serve):
   ```bash
   npx serve
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ⚡ Supabase Database Setup

To hook the project up to your live Supabase Cloud environment:
1. Open [admin.js](file:///C:/Users/Hotspot/.gemini/antigravity/scratch/prime-pages/admin.js) and [app.js](file:///C:/Users/Hotspot/.gemini/antigravity/scratch/prime-pages/app.js).
2. Insert your Supabase project keys at the top:
   ```javascript
   const SUPABASE_URL = "https://gkpaczynbbcxkknxftlh.supabase.co"; 
   const SUPABASE_ANON_KEY = "your-anon-key";
   ```
3. Open the **SQL Editor** in your Supabase Dashboard and execute the SQL script provided inside [SUPABASE_SETUP.md](file:///C:/Users/Hotspot/.gemini/antigravity/scratch/prime-pages/SUPABASE_SETUP.md). This creates the `prices`, `showcase`, and `inquiries` tables.
4. Go to **Storage** in the Supabase Dashboard, create a new public bucket named **`order-files`**, and apply the **INSERT** and **SELECT** policies for anonymous/public access.

---

## 🛠️ Developer Attribution
* **Handcrafted by**: `xSRV-x`
