// ===================================================================
// AVTO BOZOR UZ - INTERACTIVE CLIENT APPLICATION LOGIC
// ===================================================================

const STORAGE_CARS_KEY = 'AVTO_BOZOR_CARS_DATA_DESKTOP_V3';
const STORAGE_FAVS_KEY = 'AVTO_BOZOR_FAVORITES_DESKTOP_V3';
const STORAGE_COMPARE_KEY = 'AVTO_BOZOR_COMPARE_DESKTOP_V3';
const STORAGE_THEME_KEY = 'AVTO_BOZOR_THEME_PREF';

const USD_TO_UZS_RATE = 12800; // 1 USD = 12,800 UZS

class AvtoBozorPortal {
    constructor() {
        this.currency = 'USD'; // 'USD' or 'UZS'
        this.selectedBrand = 'all';
        this.onlyFavorites = false;
        this.compareList = [];
        this.favorites = [];
        this.cars = [];
        this.activeModalCar = null;

        this.init();
    }

    init() {
        this.loadState();
        this.initTheme();
        this.cacheDOM();
        this.bindEvents();
        this.initCalculator();
        this.renderCatalog();
        this.updateHeaderBadges();
    }

    loadState() {
        // Load Cars
        const savedCars = localStorage.getItem(STORAGE_CARS_KEY);
        if (savedCars) {
            try {
                this.cars = JSON.parse(savedCars);
            } catch (e) {
                this.cars = [...INITIAL_CARS_DATA];
            }
        } else {
            this.cars = [...INITIAL_CARS_DATA];
            this.saveCars();
        }

        // Load Favorites
        const savedFavs = localStorage.getItem(STORAGE_FAVS_KEY);
        this.favorites = savedFavs ? JSON.parse(savedFavs) : [];

        // Load Compare
        const savedCompare = localStorage.getItem(STORAGE_COMPARE_KEY);
        this.compareList = savedCompare ? JSON.parse(savedCompare) : [];
    }

    saveCars() {
        localStorage.setItem(STORAGE_CARS_KEY, JSON.stringify(this.cars));
    }

    saveFavorites() {
        localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(this.favorites));
        this.updateHeaderBadges();
    }

    saveCompare() {
        localStorage.setItem(STORAGE_COMPARE_KEY, JSON.stringify(this.compareList));
        this.updateHeaderBadges();
    }

    initTheme() {
        const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
        }
    }

    toggleTheme() {
        const isLight = document.body.classList.contains('light-theme');
        if (isLight) {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            localStorage.setItem(STORAGE_THEME_KEY, 'dark');
            this.dom.themeIcon.textContent = '🌙';
            this.showToast('Tungi rejim faollashtirildi');
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem(STORAGE_THEME_KEY, 'light');
            this.dom.themeIcon.textContent = '☀️';
            this.showToast('Kunduzgi yorug\' rejim faollashtirildi');
        }
    }

    cacheDOM() {
        this.dom = {
            // Header
            btnLogo: document.getElementById('btnLogo'),
            currUSD: document.getElementById('currUSD'),
            currUZS: document.getElementById('currUZS'),
            btnThemeToggle: document.getElementById('btnThemeToggle'),
            themeIcon: document.getElementById('themeIcon'),
            btnOpenCompare: document.getElementById('btnOpenCompare'),
            compareCountBadge: document.getElementById('compareCountBadge'),
            btnFilterFavs: document.getElementById('btnFilterFavs'),
            favCountBadge: document.getElementById('favCountBadge'),
            btnOpenAddModal: document.getElementById('btnOpenAddModal'),

            // Hero
            heroSearchInput: document.getElementById('heroSearchInput'),
            btnHeroSearch: document.getElementById('btnHeroSearch'),
            brandPills: document.getElementById('brandPills'),

            // Filters
            searchInput: document.getElementById('searchInput'),
            makeFilter: document.getElementById('makeFilter'),
            bodyFilter: document.getElementById('bodyFilter'),
            fuelFilter: document.getElementById('fuelFilter'),
            transFilter: document.getElementById('transFilter'),
            priceRange: document.getElementById('priceRange'),
            maxPriceLabel: document.getElementById('maxPriceLabel'),
            sortFilter: document.getElementById('sortFilter'),
            btnResetFilters: document.getElementById('btnResetFilters'),
            resultsCount: document.getElementById('resultsCount'),
            activeFilterBadge: document.getElementById('activeFilterBadge'),

            // Catalog
            carsContainer: document.getElementById('carsContainer'),
            emptyState: document.getElementById('emptyState'),
            btnResetFiltersEmpty: document.getElementById('btnResetFiltersEmpty'),
            btnToggleOnlyFavs: document.getElementById('btnToggleOnlyFavs'),
            favsCountNum: document.getElementById('favsCountNum'),

            // Loan Calculator
            calcPriceInput: document.getElementById('calcPriceInput'),
            calcPriceDisplay: document.getElementById('calcPriceDisplay'),
            calcDownInput: document.getElementById('calcDownInput'),
            calcDownPercentDisplay: document.getElementById('calcDownPercentDisplay'),
            calcTermInput: document.getElementById('calcTermInput'),
            calcTermDisplay: document.getElementById('calcTermDisplay'),
            calcRateInput: document.getElementById('calcRateInput'),
            calcRateDisplay: document.getElementById('calcRateDisplay'),
            calcMonthlyVal: document.getElementById('calcMonthlyVal'),
            calcMonthlySubVal: document.getElementById('calcMonthlySubVal'),
            calcDownSumVal: document.getElementById('calcDownSumVal'),
            calcPrincipalVal: document.getElementById('calcPrincipalVal'),
            calcInterestVal: document.getElementById('calcInterestVal'),
            calcTotalPaymentVal: document.getElementById('calcTotalPaymentVal'),
            btnOpenLoanApplyModal: document.getElementById('btnOpenLoanApplyModal'),

            // Trade In & Footer links
            btnTradeInModal: document.getElementById('btnTradeInModal'),
            footerAddCarLink: document.getElementById('footerAddCarLink'),
            footerCompareLink: document.getElementById('footerCompareLink'),

            // Modals
            modalCarDetails: document.getElementById('modalCarDetails'),
            btnCloseDetails: document.getElementById('btnCloseDetails'),
            modalDetailsContent: document.getElementById('modalDetailsContent'),

            modalAddCar: document.getElementById('modalAddCar'),
            btnCloseAddCar: document.getElementById('btnCloseAddCar'),
            btnCancelAdd: document.getElementById('btnCancelAdd'),
            addCarForm: document.getElementById('addCarForm'),

            // Photo tabs
            tabPhotoUrl: document.getElementById('tabPhotoUrl'),
            tabPhotoPreset: document.getElementById('tabPhotoPreset'),
            tabPhotoUpload: document.getElementById('tabPhotoUpload'),
            photoUrlContainer: document.getElementById('photoUrlContainer'),
            photoPresetContainer: document.getElementById('photoPresetContainer'),
            photoUploadContainer: document.getElementById('photoUploadContainer'),
            newImageUrl: document.getElementById('newImageUrl'),
            presetPhotoSelect: document.getElementById('presetPhotoSelect'),
            newImageFile: document.getElementById('newImageFile'),

            // Compare Modal
            modalCompare: document.getElementById('modalCompare'),
            btnCloseCompare: document.getElementById('btnCloseCompare'),
            modalCompareContent: document.getElementById('modalCompareContent'),

            // Test Drive Modal
            modalTestDrive: document.getElementById('modalTestDrive'),
            btnCloseTestDrive: document.getElementById('btnCloseTestDrive'),
            testDriveForm: document.getElementById('testDriveForm'),
            testDriveCarName: document.getElementById('testDriveCarName'),

            // Loan Apply Modal
            modalLoanApply: document.getElementById('modalLoanApply'),
            btnCloseLoanApply: document.getElementById('btnCloseLoanApply'),
            loanApplyForm: document.getElementById('loanApplyForm'),
            loanPillSummary: document.getElementById('loanPillSummary'),

            // Trade-In Modal
            modalTradeIn: document.getElementById('modalTradeIn'),
            btnCloseTradeIn: document.getElementById('btnCloseTradeIn'),
            tradeInForm: document.getElementById('tradeInForm'),

            toastContainer: document.getElementById('toastContainer')
        };
    }

    bindEvents() {
        // Logo click resets filters and scrolls top
        this.dom.btnLogo.addEventListener('click', () => {
            this.resetFilters();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Currency Toggle
        this.dom.currUSD.addEventListener('click', () => this.setCurrency('USD'));
        this.dom.currUZS.addEventListener('click', () => this.setCurrency('UZS'));

        // Theme Toggle
        this.dom.btnThemeToggle.addEventListener('click', () => this.toggleTheme());

        // Compare Button in header
        this.dom.btnOpenCompare.addEventListener('click', () => this.openCompareModal());
        if (this.dom.footerCompareLink) {
            this.dom.footerCompareLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCompareModal();
            });
        }

        // Favorites Button in header
        this.dom.btnFilterFavs.addEventListener('click', () => {
            this.toggleOnlyFavorites();
        });
        this.dom.btnToggleOnlyFavs.addEventListener('click', () => {
            this.toggleOnlyFavorites();
        });

        // Add Car Modal
        this.dom.btnOpenAddModal.addEventListener('click', () => this.openAddCarModal());
        if (this.dom.footerAddCarLink) {
            this.dom.footerAddCarLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAddCarModal();
            });
        }
        this.dom.btnCloseAddCar.addEventListener('click', () => this.closeAddCarModal());
        this.dom.btnCancelAdd.addEventListener('click', () => this.closeAddCarModal());
        this.dom.addCarForm.addEventListener('submit', (e) => this.handleAddNewCar(e));

        // Photo Tabs in Add Car Modal
        this.dom.tabPhotoUrl.addEventListener('click', () => this.switchPhotoTab('url'));
        this.dom.tabPhotoPreset.addEventListener('click', () => this.switchPhotoTab('preset'));
        this.dom.tabPhotoUpload.addEventListener('click', () => this.switchPhotoTab('upload'));

        // Details Modal Close
        this.dom.btnCloseDetails.addEventListener('click', () => this.closeDetailsModal());
        this.dom.btnCloseCompare.addEventListener('click', () => this.closeCompareModal());
        this.dom.btnCloseTestDrive.addEventListener('click', () => this.closeTestDriveModal());
        this.dom.btnCloseLoanApply.addEventListener('click', () => this.closeLoanApplyModal());
        this.dom.btnCloseTradeIn.addEventListener('click', () => this.closeTradeInModal());

        // Modal Backdrop clicks to close
        [this.dom.modalCarDetails, this.dom.modalAddCar, this.dom.modalCompare, this.dom.modalTestDrive, this.dom.modalLoanApply, this.dom.modalTradeIn].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Hero Search
        this.dom.btnHeroSearch.addEventListener('click', () => {
            const query = this.dom.heroSearchInput.value.trim();
            this.dom.searchInput.value = query;
            this.renderCatalog();
            this.dom.carsContainer.scrollIntoView({ behavior: 'smooth' });
        });
        this.dom.heroSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.dom.btnHeroSearch.click();
            }
        });

        // Quick Brand Pills
        this.dom.brandPills.addEventListener('click', (e) => {
            const pill = e.target.closest('.brand-pill');
            if (!pill) return;
            const brand = pill.dataset.brand;
            this.setBrandPill(brand);
        });

        // Filter Controls Change
        [
            this.dom.searchInput,
            this.dom.makeFilter,
            this.dom.bodyFilter,
            this.dom.fuelFilter,
            this.dom.transFilter,
            this.dom.sortFilter
        ].forEach(input => {
            input.addEventListener('input', () => this.renderCatalog());
            input.addEventListener('change', () => this.renderCatalog());
        });

        // Price Range Slider
        this.dom.priceRange.addEventListener('input', () => {
            const val = Number(this.dom.priceRange.value);
            this.dom.maxPriceLabel.textContent = `$${val.toLocaleString()}`;
            this.renderCatalog();
        });

        // Reset Filter Buttons
        this.dom.btnResetFilters.addEventListener('click', () => this.resetFilters());
        this.dom.btnResetFiltersEmpty.addEventListener('click', () => this.resetFilters());

        // Loan Apply Button
        this.dom.btnOpenLoanApplyModal.addEventListener('click', () => this.openLoanApplyModal());
        this.dom.loanApplyForm.addEventListener('submit', (e) => this.handleLoanApply(e));

        // Trade In Modal & Form
        this.dom.btnTradeInModal.addEventListener('click', () => this.openTradeInModal());
        this.dom.tradeInForm.addEventListener('submit', (e) => this.handleTradeIn(e));

        // Test Drive Form
        this.dom.testDriveForm.addEventListener('submit', (e) => this.handleTestDriveSubmit(e));
    }

    setCurrency(curr) {
        this.currency = curr;
        if (curr === 'USD') {
            this.dom.currUSD.classList.add('active');
            this.dom.currUZS.classList.remove('active');
        } else {
            this.dom.currUZS.classList.add('active');
            this.dom.currUSD.classList.remove('active');
        }
        this.renderCatalog();
        this.updateLoanDisplay();
    }

    formatPrice(priceUSD) {
        if (this.currency === 'UZS') {
            const uzs = Math.round(priceUSD * USD_TO_UZS_RATE);
            return `${uzs.toLocaleString()} so'm`;
        }
        return `$${Number(priceUSD).toLocaleString()}`;
    }

    formatSubPrice(priceUSD) {
        if (this.currency === 'USD') {
            const uzs = Math.round(priceUSD * USD_TO_UZS_RATE);
            return `~ ${uzs.toLocaleString()} so'm`;
        }
        return `~ $${Number(priceUSD).toLocaleString()}`;
    }

    setBrandPill(brand) {
        this.selectedBrand = brand;
        document.querySelectorAll('.brand-pill').forEach(p => {
            p.classList.toggle('active', p.dataset.brand === brand);
        });
        if (brand === 'all') {
            this.dom.makeFilter.value = 'all';
        } else {
            this.dom.makeFilter.value = brand;
        }
        this.renderCatalog();
    }

    toggleOnlyFavorites() {
        this.onlyFavorites = !this.onlyFavorites;
        this.dom.btnToggleOnlyFavs.classList.toggle('active', this.onlyFavorites);
        this.dom.btnFilterFavs.classList.toggle('active', this.onlyFavorites);
        this.renderCatalog();
        if (this.onlyFavorites) {
            this.showToast(`Faqat sevimlilar (${this.favorites.length}) ko'rsatilmoqda`);
        }
    }

    resetFilters() {
        this.dom.searchInput.value = '';
        this.dom.heroSearchInput.value = '';
        this.dom.makeFilter.value = 'all';
        this.dom.bodyFilter.value = 'all';
        this.dom.fuelFilter.value = 'all';
        this.dom.transFilter.value = 'all';
        this.dom.sortFilter.value = 'newest';
        this.dom.priceRange.value = 100000;
        this.dom.maxPriceLabel.textContent = '$100,000';
        this.selectedBrand = 'all';
        this.onlyFavorites = false;
        this.dom.btnToggleOnlyFavs.classList.remove('active');
        this.dom.btnFilterFavs.classList.remove('active');

        document.querySelectorAll('.brand-pill').forEach(p => {
            p.classList.toggle('active', p.dataset.brand === 'all');
        });

        this.renderCatalog();
        this.showToast('Barcha filtrlar tozalandi');
    }

    updateHeaderBadges() {
        this.dom.favCountBadge.textContent = this.favorites.length;
        this.dom.favsCountNum.textContent = this.favorites.length;
        this.dom.compareCountBadge.textContent = this.compareList.length;
    }

    // ===================================================================
    // CATALOG FILTERING & RENDERING
    // ===================================================================
    renderCatalog() {
        const query = (this.dom.searchInput.value || '').toLowerCase().trim();
        const makeVal = this.dom.makeFilter.value;
        const bodyVal = this.dom.bodyFilter.value;
        const fuelVal = this.dom.fuelFilter.value;
        const transVal = this.dom.transFilter.value;
        const maxPrice = Number(this.dom.priceRange.value);
        const sortVal = this.dom.sortFilter.value;

        let filtered = this.cars.filter(car => {
            // Only favorites filter
            if (this.onlyFavorites && !this.favorites.includes(car.id)) {
                return false;
            }

            // Search query match
            if (query) {
                const combined = `${car.make} ${car.model} ${car.location} ${car.description || ''}`.toLowerCase();
                if (!combined.includes(query)) return false;
            }

            // Make filter
            if (makeVal !== 'all' && car.make !== makeVal) {
                return false;
            }

            // Body filter
            if (bodyVal !== 'all' && !car.bodyType.toLowerCase().includes(bodyVal.toLowerCase())) {
                return false;
            }

            // Fuel filter
            if (fuelVal !== 'all' && !car.fuel.toLowerCase().includes(fuelVal.toLowerCase())) {
                return false;
            }

            // Transmission filter
            if (transVal !== 'all' && !car.transmission.toLowerCase().includes(transVal.toLowerCase())) {
                return false;
            }

            // Price filter
            if (car.priceUSD > maxPrice) {
                return false;
            }

            return true;
        });

        // Sorting
        filtered.sort((a, b) => {
            switch (sortVal) {
                case 'price_asc':
                    return a.priceUSD - b.priceUSD;
                case 'price_desc':
                    return b.priceUSD - a.priceUSD;
                case 'mileage_asc':
                    return a.mileage - b.mileage;
                case 'year_desc':
                    return b.year - a.year;
                case 'views_desc':
                    return (b.views || 0) - (a.views || 0);
                case 'newest':
                default:
                    return 0; // Natural array order
            }
        });

        // Update Results Count
        this.dom.resultsCount.textContent = filtered.length;

        // Render Cards
        this.dom.carsContainer.innerHTML = '';
        if (filtered.length === 0) {
            this.dom.emptyState.style.display = 'block';
        } else {
            this.dom.emptyState.style.display = 'none';
            filtered.forEach(car => {
                this.dom.carsContainer.appendChild(this.createCarCard(car));
            });
        }
    }

    createCarCard(car) {
        const isFav = this.favorites.includes(car.id);
        const isCompared = this.compareList.includes(car.id);

        const card = document.createElement('div');
        card.className = 'car-card';
        card.id = `car_card_${car.id}`;

        const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450' fill='%23111827'><rect width='800' height='450'/><text x='50%25' y='45%25' font-family='sans-serif' font-size='48' font-weight='bold' fill='%23F59E0B' text-anchor='middle'>${encodeURIComponent(car.make)}</text><text x='50%25' y='60%25' font-family='sans-serif' font-size='26' fill='%2394A3B8' text-anchor='middle'>${encodeURIComponent(car.model)}</text></svg>`;

        card.innerHTML = `
            <div class="car-card-img-wrap">
                <img class="car-card-img" src="${car.image || fallbackSvg}" alt="${car.make} ${car.model}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackSvg}';">
                
                <div class="card-badges-row">
                    ${car.featured ? '<span class="badge-featured">🔥 TOP TAKLIF</span>' : ''}
                    <span class="badge-credit">Kredit 18.5%</span>
                </div>

                <div class="card-actions-float">
                    <button class="btn-fav-card ${isFav ? 'active' : ''}" title="Sevimlilarga qo'shish" onclick="window.app.toggleFavorite('${car.id}'); event.stopPropagation();">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                    <button class="btn-compare-card ${isCompared ? 'active' : ''}" title="Taqqoslashga qo'shish" onclick="window.app.toggleCompare('${car.id}'); event.stopPropagation();">
                        ⚖️
                    </button>
                </div>
            </div>

            <div class="car-card-body">
                <div class="car-meta-top">
                    <span class="car-brand-tag">${car.make}</span>
                    <span class="car-year-badge">${car.year}-yil</span>
                </div>

                <h3 class="car-card-title">${car.model}</h3>

                <div class="car-card-price-box">
                    <div class="price-main">${this.formatPrice(car.priceUSD)}</div>
                    <div class="price-sub">${this.formatSubPrice(car.priceUSD)}</div>
                </div>

                <div class="car-specs-grid">
                    <div class="spec-item">
                        <span class="spec-icon">🛣️</span>
                        <span>${Number(car.mileage).toLocaleString()} km</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">⛽</span>
                        <span>${car.fuel}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">🕹️</span>
                        <span>${car.transmission}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-icon">📍</span>
                        <span>${car.location}</span>
                    </div>
                </div>

                <div class="car-location-seller">
                    <span>👤 ${car.seller}</span>
                    <span>👁️ ${car.views || 120} ko'rildi</span>
                </div>

                <div class="car-card-actions">
                    <button class="btn-card-details" onclick="window.app.openDetailsModal('${car.id}')">
                        Batafsil ma'lumot
                    </button>
                    <a class="btn-card-call" href="tel:${car.phone.replace(/\s+/g, '')}" title="Qo'ng'iroq qilish">
                        📞
                    </a>
                </div>
            </div>
        `;

        return card;
    }

    // ===================================================================
    // FAVORITES & COMPARE
    // ===================================================================
    toggleFavorite(carId) {
        const index = this.favorites.indexOf(carId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Mashina sevimlilardan olib tashlandi');
        } else {
            this.favorites.push(carId);
            this.showToast('Mashina sevimlilarga qo\'shildi! ❤️');
        }
        this.saveFavorites();
        this.renderCatalog();
    }

    toggleCompare(carId) {
        const index = this.compareList.indexOf(carId);
        if (index > -1) {
            this.compareList.splice(index, 1);
            this.showToast('Taqqoslashdan olib tashlandi');
        } else {
            if (this.compareList.length >= 4) {
                this.showToast('Maksimal 4 tagacha mashinani taqqoslash mumkin!', 'error');
                return;
            }
            this.compareList.push(carId);
            this.showToast('Mashina taqqoslash ro\'yxatiga qo\'shildi! ⚖️');
        }
        this.saveCompare();
        this.renderCatalog();
    }

    openCompareModal() {
        if (this.compareList.length === 0) {
            this.showToast('Taqqoslash uchun kamida bitta mashinani tanlang (kartochkadagi ⚖️ belgisini bosing)!');
            return;
        }

        const comparedCars = this.cars.filter(c => this.compareList.includes(c.id));
        let html = `
            <table class="compare-matrix-table">
                <thead>
                    <tr>
                        <th style="width: 180px;">Xususiyatlar</th>
                        ${comparedCars.map(c => `
                            <th>
                                <img src="${c.image}" class="compare-img-thumb" onerror="this.style.display='none'">
                                <div><strong>${c.make}</strong></div>
                                <div>${c.model}</div>
                                <button onclick="window.app.toggleCompare('${c.id}'); window.app.openCompareModal();" style="margin-top:6px; font-size:0.75rem; cursor:pointer;">❌ O'chirish</button>
                            </th>
                        `).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Narxi ($ USD)</strong></td>
                        ${comparedCars.map(c => `<td><strong style="color:var(--accent-primary); font-size:1.1rem;">$${Number(c.priceUSD).toLocaleString()}</strong></td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Narxi (So'm UZS)</strong></td>
                        ${comparedCars.map(c => `<td>${(c.priceUSD * USD_TO_UZS_RATE).toLocaleString()} so'm</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Ishlab chiqarilgan yili</strong></td>
                        ${comparedCars.map(c => `<td>${c.year}-yil</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Bosib o'tgan masofasi</strong></td>
                        ${comparedCars.map(c => `<td>${Number(c.mileage).toLocaleString()} km</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Yoqilg'i turi</strong></td>
                        ${comparedCars.map(c => `<td>${c.fuel}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Uzatma qutisi</strong></td>
                        ${comparedCars.map(c => `<td>${c.transmission}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Dvigatel</strong></td>
                        ${comparedCars.map(c => `<td>${c.engine || '-'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Ot kuchi</strong></td>
                        ${comparedCars.map(c => `<td>${c.power ? c.power + ' HP' : '-'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Kraska holati</strong></td>
                        ${comparedCars.map(c => `<td>${c.paintStatus || 'Toza'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td><strong>Hudud</strong></td>
                        ${comparedCars.map(c => `<td>${c.location}</td>`).join('')}
                    </tr>
                </tbody>
            </table>
        `;

        this.dom.modalCompareContent.innerHTML = html;
        this.dom.modalCompare.style.display = 'flex';
    }

    closeCompareModal() {
        this.dom.modalCompare.style.display = 'none';
    }

    // ===================================================================
    // DETAILS MODAL
    // ===================================================================
    openDetailsModal(carId) {
        const car = this.cars.find(c => c.id === carId);
        if (!car) return;
        this.activeModalCar = car;

        // Increase views count
        car.views = (car.views || 0) + 1;
        this.saveCars();

        const tgLink = car.telegram ? `https://t.me/${car.telegram.replace('@', '')}` : '#';

        this.dom.modalDetailsContent.innerHTML = `
            <div class="detail-view-grid">
                <div class="detail-img-box">
                    <img src="${car.image}" alt="${car.make} ${car.model}" onerror="this.src='https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800';">
                </div>

                <div class="detail-info-col">
                    <div>
                        <span class="car-brand-tag">${car.make} &bull; ${car.year}-yil</span>
                        <h2 class="detail-title">${car.model}</h2>
                    </div>

                    <div class="detail-price-row">
                        <div class="detail-price-main">${this.formatPrice(car.priceUSD)}</div>
                        <div class="detail-price-sub">${this.formatSubPrice(car.priceUSD)}</div>
                    </div>

                    <div class="detail-specs-table">
                        <div class="spec-row"><span>🛣️ Probeg:</span><strong>${Number(car.mileage).toLocaleString()} km</strong></div>
                        <div class="spec-row"><span>⛽ Yoqilg'i:</span><strong>${car.fuel}</strong></div>
                        <div class="spec-row"><span>🕹️ Uzatma qutisi:</span><strong>${car.transmission}</strong></div>
                        <div class="spec-row"><span>🚗 Kuzov:</span><strong>${car.bodyType}</strong></div>
                        <div class="spec-row"><span>⚙️ Dvigatel:</span><strong>${car.engine || '1.5L'}</strong></div>
                        <div class="spec-row"><span>🐎 Ot kuchi:</span><strong>${car.power ? car.power + ' HP' : '110 HP'}</strong></div>
                        <div class="spec-row"><span>🎨 Rang / Kraska:</span><strong>${car.color || 'Oq'} (${car.paintStatus || 'Toza'})</strong></div>
                        <div class="spec-row"><span>📍 Manzil:</span><strong>${car.location}</strong></div>
                    </div>

                    <div class="detail-desc-box">
                        <strong>Tavsif:</strong><br>
                        ${car.description || 'Holati a\'lo darajada, hech qanday xarajat talab qilmaydi. Real xaridorga joyida savdolashiladi.'}
                    </div>

                    <div class="detail-contact-actions">
                        <a class="btn-contact-call" href="tel:${car.phone.replace(/\s+/g, '')}">
                            📞 Qo'ng'iroq: ${car.phone}
                        </a>
                        ${car.telegram ? `
                            <a class="btn-contact-tg" href="${tgLink}" target="_blank">
                                💬 Telegram orqali yozish
                            </a>
                        ` : ''}
                    </div>

                    <div style="display:flex; gap:10px; margin-top:8px;">
                        <button class="btn-test-drive-open" onclick="window.app.openTestDriveModal('${car.model}')">
                            🏁 Test-Drayvga Yozilish
                        </button>
                        <button class="btn-test-drive-open" style="background:var(--accent-gradient); color:#000; border:none;" onclick="window.app.jumpToCalculatorWithPrice(${car.priceUSD})">
                            🏦 Kreditini hisoblash
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.dom.modalCarDetails.style.display = 'flex';
    }

    closeDetailsModal() {
        this.dom.modalCarDetails.style.display = 'none';
        this.activeModalCar = null;
    }

    jumpToCalculatorWithPrice(price) {
        this.closeDetailsModal();
        this.dom.calcPriceInput.value = price;
        this.updateLoanDisplay();
        document.getElementById('kredit-bolimi').scrollIntoView({ behavior: 'smooth' });
    }

    // ===================================================================
    // ADD CAR (MASHINA SOTISH)
    // ===================================================================
    openAddCarModal() {
        this.dom.modalAddCar.style.display = 'flex';
    }

    closeAddCarModal() {
        this.dom.modalAddCar.style.display = 'none';
        this.dom.addCarForm.reset();
    }

    switchPhotoTab(tab) {
        this.dom.tabPhotoUrl.classList.toggle('active', tab === 'url');
        this.dom.tabPhotoPreset.classList.toggle('active', tab === 'preset');
        this.dom.tabPhotoUpload.classList.toggle('active', tab === 'upload');

        this.dom.photoUrlContainer.style.display = tab === 'url' ? 'block' : 'none';
        this.dom.photoPresetContainer.style.display = tab === 'preset' ? 'block' : 'none';
        this.dom.photoUploadContainer.style.display = tab === 'upload' ? 'block' : 'none';
    }

    async handleAddNewCar(e) {
        e.preventDefault();

        const make = document.getElementById('newMake').value;
        const model = document.getElementById('newModel').value.trim();
        const year = parseInt(document.getElementById('newYear').value);
        const priceUSD = parseFloat(document.getElementById('newPrice').value);
        const mileage = parseInt(document.getElementById('newMileage').value);
        const fuel = document.getElementById('newFuel').value;
        const transmission = document.getElementById('newTransmission').value;
        const bodyType = document.getElementById('newBodyType').value;
        const engine = document.getElementById('newEngine').value.trim();
        const power = parseInt(document.getElementById('newPower').value) || null;
        const color = document.getElementById('newColor').value.trim();
        const paintStatus = document.getElementById('newPaint').value;
        const location = document.getElementById('newLocation').value;
        const seller = document.getElementById('newSeller').value.trim();
        const phone = document.getElementById('newPhone').value.trim();
        const telegram = document.getElementById('newTelegram').value.trim();
        const description = document.getElementById('newDescription').value.trim();

        // Determine image
        let imageUrl = '';
        if (this.dom.tabPhotoUpload.classList.contains('active') && this.dom.newImageFile.files[0]) {
            imageUrl = await this.readFileAsDataURL(this.dom.newImageFile.files[0]);
        } else if (this.dom.tabPhotoPreset.classList.contains('active')) {
            const presetKey = this.dom.presetPhotoSelect.value;
            imageUrl = CAR_PRESET_IMAGES[presetKey] || CAR_PRESET_IMAGES['Default'];
        } else {
            imageUrl = this.dom.newImageUrl.value.trim() || CAR_PRESET_IMAGES[make] || CAR_PRESET_IMAGES['Default'];
        }

        const newCar = {
            id: 'car_' + Date.now(),
            make,
            model,
            year,
            priceUSD,
            mileage,
            fuel,
            transmission,
            bodyType,
            engine: engine || '1.5L',
            power: power || 120,
            color: color || 'Oq',
            paintStatus,
            location,
            seller,
            phone,
            telegram,
            views: 1,
            featured: false,
            image: imageUrl,
            description
        };

        this.cars.unshift(newCar);
        this.saveCars();
        this.renderCatalog();
        this.closeAddCarModal();

        this.showToast('Tabriklaymiz! Sizning e\'loningiz muvaffaqiyatli joylashtirildi! 🎉', 'success');
        this.dom.carsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    readFileAsDataURL(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }

    // ===================================================================
    // LOAN CALCULATOR
    // ===================================================================
    initCalculator() {
        [
            this.dom.calcPriceInput,
            this.dom.calcDownInput,
            this.dom.calcTermInput,
            this.dom.calcRateInput
        ].forEach(slider => {
            slider.addEventListener('input', () => this.updateLoanDisplay());
        });

        this.updateLoanDisplay();
    }

    updateLoanDisplay() {
        const price = Number(this.dom.calcPriceInput.value);
        const downPercent = Number(this.dom.calcDownInput.value);
        const termMonths = Number(this.dom.calcTermInput.value);
        const rateYearly = Number(this.dom.calcRateInput.value);

        // Update Slider Labels
        this.dom.calcPriceDisplay.textContent = `$${price.toLocaleString()}`;
        const downSum = Math.round((price * downPercent) / 100);
        this.dom.calcDownPercentDisplay.textContent = `${downPercent}% ($${downSum.toLocaleString()})`;
        this.dom.calcTermDisplay.textContent = `${termMonths} oy (${termMonths / 12} yil)`;
        this.dom.calcRateDisplay.textContent = `${rateYearly}%`;

        // Financial Calculation (Monthly payment formula: Annuity)
        const principal = price - downSum;
        const monthlyRate = (rateYearly / 100) / 12;

        let monthlyPayment = 0;
        if (monthlyRate === 0) {
            monthlyPayment = principal / termMonths;
        } else {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
        }

        const totalPayment = (monthlyPayment * termMonths) + downSum;
        const totalInterest = (monthlyPayment * termMonths) - principal;

        // Render Values
        const monthlyUSD = Math.round(monthlyPayment);
        const monthlyUZS = Math.round(monthlyUSD * USD_TO_UZS_RATE);

        this.dom.calcMonthlyVal.textContent = `$${monthlyUSD.toLocaleString()} / oy`;
        this.dom.calcMonthlySubVal.textContent = `~ ${monthlyUZS.toLocaleString()} so'm / oy`;

        this.dom.calcDownSumVal.textContent = `$${downSum.toLocaleString()} (~ ${(downSum * USD_TO_UZS_RATE).toLocaleString()} so'm)`;
        this.dom.calcPrincipalVal.textContent = `$${principal.toLocaleString()}`;
        this.dom.calcInterestVal.textContent = `$${Math.round(totalInterest).toLocaleString()}`;
        this.dom.calcTotalPaymentVal.textContent = `$${Math.round(totalPayment).toLocaleString()}`;

        if (this.dom.loanPillSummary) {
            this.dom.loanPillSummary.innerHTML = `Hisoblangan oylik to'lov: <strong>$${monthlyUSD} / oy</strong> (${monthlyUZS.toLocaleString()} so'm)`;
        }
    }

    openLoanApplyModal() {
        this.dom.modalLoanApply.style.display = 'flex';
    }

    closeLoanApplyModal() {
        this.dom.modalLoanApply.style.display = 'none';
        this.dom.loanApplyForm.reset();
    }

    handleLoanApply(e) {
        e.preventDefault();
        const name = document.getElementById('loanName').value;
        this.closeLoanApplyModal();
        this.showToast(`Rahmat, ${name}! Sizning avtokredit arizangiz qabul qilindi. 15 daqiqada mutaxassisimiz aloqaga chiqadi!`, 'success');
    }

    // ===================================================================
    // TEST DRIVE MODAL
    // ===================================================================
    openTestDriveModal(carName) {
        this.dom.testDriveCarName.textContent = `Avtomobil: ${carName}`;
        this.dom.modalTestDrive.style.display = 'flex';
    }

    closeTestDriveModal() {
        this.dom.modalTestDrive.style.display = 'none';
        this.dom.testDriveForm.reset();
    }

    handleTestDriveSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('tdName').value;
        this.closeTestDriveModal();
        this.showToast(`Hurmatli ${name}, Test-drayv arizangiz tasdiqlandi! Menejer sizga qo'ng'iroq qiladi.`, 'success');
    }

    // ===================================================================
    // TRADE IN
    // ===================================================================
    openTradeInModal() {
        this.dom.modalTradeIn.style.display = 'flex';
    }

    closeTradeInModal() {
        this.dom.modalTradeIn.style.display = 'none';
        this.dom.tradeInForm.reset();
    }

    handleTradeIn(e) {
        e.preventDefault();
        const model = document.getElementById('tiModel').value;
        const year = Number(document.getElementById('tiYear').value);
        this.closeTradeInModal();
        this.showToast(`Sizning ${year}-yilgi ${model} mashinangiz dastlabki baholandi! To'liq ma'lumot SMS orqali yuborildi.`, 'success');
    }

    // ===================================================================
    // TOAST SYSTEM
    // ===================================================================
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : '🔔'}</span> <span>${message}</span>`;
        this.dom.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

// Global helper for filter links in footer
window.filterByMake = function(make) {
    if (window.app) {
        window.app.setBrandPill(make);
        document.getElementById('filtersCard').scrollIntoView({ behavior: 'smooth' });
    }
};

// Initialize App when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AvtoBozorPortal();
});
