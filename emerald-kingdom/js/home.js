/* =========================================
   🏠 HOME PAGE LOGIC (ULTIMATE V3.0)
   Features: Multi-Grid Rendering, Smart Filtering, & Live Narrator
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
});

function initHomePage() {
    // 1. Tampilkan Loading State di semua grid
    const grids = ['liveGrid', 'recommendationGrid', 'rareGrid', 'catWatchGrid', 'catCarGrid'];
    grids.forEach(id => showLoading(id));

    // 2. Jalankan Logika (Delay simulasi network)
    setTimeout(() => {
        const items = KingdomDB.getItems();
        
        // Update Statistik Header
        updateServerStats(items);

        // Distigusi Barang ke Grid masing-masing
        renderLiveSection(items);
        renderRecommendations(items);
        renderRareItems(items);
        renderCategorySection(items, 'Arloji', 'catWatchGrid');
        renderCategorySection(items, 'Kendaraan', 'catCarGrid');

    }, 800);
}

/* --- 1. RENDER SECTION KHUSUS: LIVE EVENT (Dengan Narator) --- */
function renderLiveSection(allItems) {
    const container = document.getElementById('liveGrid');
    
    // Filter: Barang VVIP atau VIP dianggap sebagai "Main Event"
    // Sort: Harga tertinggi dulu
    const liveItems = allItems
        .filter(i => i.status === 'active' && (i.access === 'vvip' || i.access === 'vip'))
        .sort((a, b) => b.currentBid - a.currentBid)
        .slice(0, 3); // Ambil Top 3

    container.innerHTML = '';

    if (liveItems.length === 0) {
        container.innerHTML = `<p style="color:#666; grid-column:1/-1;">Sedang tidak ada Live Event VVIP.</p>`;
        return;
    }

    liveItems.forEach(item => {
        // Fitur Narator: Teks acak seolah-olah juru lelang bicara
        const narratorTexts = [
            `🎙️ "Penawaran ${KingdomDB.formatRupiah(item.currentBid)} masuk!"`,
            `🎙️ "Ada yang berani lebih tinggi?"`,
            `🎙️ "Posisi tertinggi dipegang ${item.highestBidder}!"`,
            `🎙️ "Barang panas! Jangan sampai lolos!"`
        ];
        const randomText = narratorTexts[Math.floor(Math.random() * narratorTexts.length)];

        const cardHTML = `
            <div class="auction-card glass-panel fade-in" style="border-color: #ff4444;">
                <div class="card-image-box">
                    <div class="live-tag-wrapper">
                        <span class="live-dot-anim"></span> 
                        <span style="color:white; font-weight:bold; font-size:0.75rem;">LIVE STAGE</span>
                    </div>
                    <img src="${item.image}" alt="${item.name}">
                    
                    <div class="narrator-badge">
                        ${randomText}
                    </div>
                </div>
                
                <div class="card-info">
                    <div class="card-cat" style="color:#ff4444;">🔥 SEDANG DIPEREBUTKAN</div>
                    <h3 class="card-title">${item.name}</h3>
                    
                    <div class="card-footer">
                        <span class="card-price-label">Posisi Sekarang</span>
                        <div class="card-price" style="color:#ff4444;">${KingdomDB.formatRupiah(item.currentBid)}</div>
                        <a href="auction-live.html?id=${item.id}">
                            <button class="btn-card-action" style="background:#a00; color:white;">GABUNG LIVE</button>
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

/* --- 2. RENDER REKOMENDASI & RARE --- */
function renderRecommendations(allItems) {
    // Ambil acak 4 barang yang Active
    const shuffled = allItems.filter(i => i.status === 'active').sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    
    renderGenericGrid(selected, 'recommendationGrid');
}

function renderRareItems(allItems) {
    // Filter: Harga di atas 10 Miliar
    const rareItems = allItems
        .filter(i => i.status === 'active' && i.price >= 10000000000)
        .slice(0, 4);

    renderGenericGrid(rareItems, 'rareGrid');
}

/* --- 3. RENDER KATEGORI SPESIFIK --- */
function renderCategorySection(allItems, category, gridId) {
    const items = allItems
        .filter(i => i.status === 'active' && i.category === category)
        .slice(0, 4);
    
    renderGenericGrid(items, gridId);
}

/* --- HELPER: RENDER KARTU STANDAR --- */
function renderGenericGrid(items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<p style="color:#666;">Stok kosong.</p>`;
        return;
    }

    items.forEach(item => {
        // Badge Logic
        let badgeHTML = '';
        if (item.access === 'vvip') badgeHTML = `<div class="card-badge badge-vvip">👑 VVIP</div>`;
        else if (item.access === 'vip') badgeHTML = `<div class="card-badge badge-vip">⚜️ VIP</div>`;

        const cardHTML = `
            <div class="auction-card glass-panel fade-in">
                <div class="card-image-box">
                    ${badgeHTML}
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/items/placeholder.png'">
                </div>
                
                <div class="card-info">
                    <div class="card-cat">${item.category}</div>
                    <h3 class="card-title">${item.name}</h3>
                    
                    <div class="card-footer">
                        <span class="card-price-label">Tertinggi</span>
                        <div class="card-price">${KingdomDB.formatRupiah(item.currentBid)}</div>
                        <a href="auction-live.html?id=${item.id}">
                            <button class="btn-card-action">LIHAT</button>
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

/* --- STATISTIK & UTILS --- */
function updateServerStats(items) {
    const activeCount = items.filter(i => i.status === 'active').length;
    const users = KingdomDB.getUsers();
    const totalValuation = items.reduce((sum, i) => sum + i.price, 0) + users.reduce((sum, u) => sum + u.saldo, 0);

    animateCounter('statLive', activeCount);
    document.getElementById('statUsers').innerText = users.length - 1; // Exclude admin
    document.getElementById('statValuation').innerText = formatCompactNumber(totalValuation);
}

function showLoading(id) {
    const el = document.getElementById(id);
    if(el) el.innerHTML = `<div class="loading-text"><div class="loader-diamond" style="width:20px; height:20px; margin:0 auto 10px;"></div>Memuat...</div>`;
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    if(!el) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 20));
    const timer = setInterval(() => {
        current += step;
        if(current >= target) { current = target; clearInterval(timer); }
        el.innerText = current;
    }, 50);
}

function formatCompactNumber(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + 'T';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'M';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'jt';
    return num.toLocaleString();
}