const partsSearchForm = document.getElementById('partsSearchForm');
const partsQuery = document.getElementById('partsQuery');
const partsCategory = document.getElementById('partsCategory');
const partsSearchBtn = document.getElementById('partsSearchBtn');
const partsEmpty = document.getElementById('partsEmpty');
const partsResults = document.getElementById('partsResults');
const partsNoResults = document.getElementById('partsNoResults');
const catalogResults = document.getElementById('catalogResults');
const catalogCount = document.getElementById('catalogCount');
const webResults = document.getElementById('webResults');
const webCount = document.getElementById('webCount');
const webFallback = document.getElementById('webFallback');
const fallbackLinks = document.getElementById('fallbackLinks');
const catalogResultsBlock = document.getElementById('catalogResultsBlock');
const webResultsBlock = document.getElementById('webResultsBlock');
const webImagesBlock = document.getElementById('webImagesBlock');
const webImages = document.getElementById('webImages');
const webImagesCount = document.getElementById('webImagesCount');
const suggestionChips = document.getElementById('suggestionChips');

let catalog = [];

const categoryLabels = {
    automotive: 'Automotive',
    'solar-hvac': 'Solar & HVAC',
    'ev-charging': 'EV Charging',
    'energy-storage': 'Energy Storage',
    appliances: 'Appliances',
    digital: 'Digital Technologies',
};

const popularSearches = [
    { label: 'Brake Pads', query: 'brake pads', category: 'automotive' },
    { label: 'Solar Inverter', query: 'solar inverter', category: 'solar-hvac' },
    { label: 'EV Charger', query: 'EV charger', category: 'ev-charging' },
    { label: 'Battery Storage', query: 'energy storage', category: 'energy-storage' },
    { label: 'D1212', query: 'D1212', category: 'automotive' },
    { label: 'HVAC System', query: 'HVAC', category: 'solar-hvac' },
];

const categoryIcons = {
    automotive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-5H5v5z"/><path d="M5 12V7l7-4 7 4v5"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',
    'solar-hvac': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>',
    'ev-charging': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    'energy-storage': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="18" height="12" rx="2"/><path d="M23 13v-2"/></svg>',
    appliances: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    digital: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFavicon(url) {
    try {
        const hostname = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
        return '';
    }
}

function formatUrl(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

function buildCatalogRow(part) {
    const availabilityClass = part.availability === 'In Stock' ? 'in-stock' : 'order';
    const icon = categoryIcons[part.category] || categoryIcons.automotive;

    return `
        <article class="parts-row">
            <div class="parts-row-icon">${icon}</div>
            <div class="parts-row-main">
                <div class="parts-row-top">
                    <span class="parts-row-category">${escapeHtml(categoryLabels[part.category] || part.category)}</span>
                    <span class="parts-availability ${availabilityClass}">${escapeHtml(part.availability)}</span>
                </div>
                <h3 class="parts-row-title">${escapeHtml(part.name)}</h3>
                <p class="parts-row-meta">
                    <span class="parts-row-number">Part # ${escapeHtml(part.partNumber)}</span>
                    <span class="parts-row-divider">·</span>
                    <span>${escapeHtml(part.manufacturer)}</span>
                </p>
                <p class="parts-row-desc">${escapeHtml(part.description)}</p>
            </div>
            <div class="parts-row-action">
                <a href="index.html#contact" class="btn btn-secondary">Request Quote</a>
            </div>
        </article>
    `;
}

function renderSuggestions() {
    if (!suggestionChips) return;

    suggestionChips.innerHTML = popularSearches.map(item => `
        <button type="button" class="parts-chip" data-query="${escapeHtml(item.query)}" data-category="${escapeHtml(item.category)}">
            ${escapeHtml(item.label)}
        </button>
    `).join('');

    suggestionChips.querySelectorAll('.parts-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            partsQuery.value = chip.dataset.query;
            if (chip.dataset.category) {
                partsCategory.value = chip.dataset.category;
            }
            partsSearchForm.requestSubmit();
        });
    });
}

async function loadCatalog() {
    try {
        const response = await fetch('parts-catalog.json');
        catalog = await response.json();
    } catch {
        catalog = [];
    }
}

function searchCatalog(query, category) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    return catalog.filter(part => {
        if (category !== 'all' && part.category !== category) return false;

        const haystack = [
            part.partNumber,
            part.name,
            part.manufacturer,
            part.description,
            categoryLabels[part.category] || part.category,
        ].join(' ').toLowerCase();

        return terms.every(term => haystack.includes(term));
    });
}

function renderCatalogResults(results) {
    catalogCount.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;

    if (results.length === 0) {
        catalogResults.innerHTML = '<p class="parts-inline-empty">No matching parts in our catalog.</p>';
        return;
    }

    catalogResults.innerHTML = results.map(part => buildCatalogRow(part)).join('');
}

function renderWebImages(images) {
    if (!images || images.length === 0) {
        webImagesBlock.hidden = true;
        return;
    }

    webImagesBlock.hidden = false;
    webImagesCount.textContent = `${images.length} image${images.length === 1 ? '' : 's'}`;

    webImages.innerHTML = images.map(item => `
        <a class="parts-image-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
            <div class="parts-image-wrap">
                <img src="${escapeHtml(item.thumbnail || item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
            </div>
            <div class="parts-image-info">
                <h3>${escapeHtml(item.title)}</h3>
                <span>${escapeHtml(item.source || formatUrl(item.url))}</span>
            </div>
        </a>
    `).join('');
}

function renderWebResults(results) {
    webCount.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    webFallback.hidden = true;
    webResults.hidden = false;

    webResults.innerHTML = results.map(item => {
        const favicon = getFavicon(item.url);
        return `
            <a class="parts-web-item" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
                <div class="parts-web-thumb">
                    ${favicon ? `<img src="${favicon}" alt="" loading="lazy">` : '<span class="parts-web-thumb-fallback">↗</span>'}
                </div>
                <div class="parts-web-content">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.snippet)}</p>
                    <span class="parts-web-url">${escapeHtml(formatUrl(item.url))}</span>
                </div>
            </a>
        `;
    }).join('');
}

function renderFallbackLinks(query) {
    const encoded = encodeURIComponent(query);
    const links = [
        { name: 'Google', url: `https://www.google.com/search?q=${encoded}+parts+buy&tbm=shop` },
        { name: 'eBay', url: `https://www.ebay.com/sch/i.html?_nkw=${encoded}` },
        { name: 'Amazon', url: `https://www.amazon.com/s?k=${encoded}` },
        { name: 'Alibaba', url: `https://www.alibaba.com/trade/search?SearchText=${encoded}` },
    ];

    fallbackLinks.innerHTML = links.map(link =>
        `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${link.name}</a>`
    ).join('');
}

async function searchWeb(query, category) {
    const params = new URLSearchParams({ q: query, max: '8' });
    if (category !== 'all') params.set('category', category);

    const response = await fetch(`/api/search?${params}`);
    if (!response.ok) throw new Error('Search API unavailable');
    return response.json();
}

function setLoading(isLoading) {
    const btnText = partsSearchBtn.querySelector('.btn-text');
    const btnLoader = partsSearchBtn.querySelector('.btn-loader');
    partsSearchBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline-flex' : 'none';
}

function showResults(catalogMatches, webData) {
    const webMatches = webData?.results || [];
    const webImageMatches = webData?.images || [];
    const showFallback = !webFallback.hidden;

    const hasCatalog = catalogMatches.length > 0;
    const hasWeb = webMatches.length > 0;
    const hasImages = webImageMatches.length > 0;

    partsEmpty.hidden = true;
    catalogResultsBlock.hidden = !hasCatalog;
    webResultsBlock.hidden = !hasWeb && !showFallback;
    webImagesBlock.hidden = !hasImages;

    if (!hasCatalog && !hasWeb && !hasImages && !showFallback) {
        partsResults.hidden = true;
        partsNoResults.hidden = false;
        return;
    }

    partsResults.hidden = false;
    partsNoResults.hidden = true;
}

async function handleSearch(event) {
    event.preventDefault();

    const query = partsQuery.value.trim();
    const category = partsCategory.value;
    if (!query) return;

    setLoading(true);
    partsNoResults.hidden = true;
    webFallback.hidden = true;
    webImagesBlock.hidden = true;

    const catalogMatches = searchCatalog(query, category);
    renderCatalogResults(catalogMatches);

    let webData = { results: [], images: [] };
    try {
        webData = await searchWeb(query, category);
        renderWebResults(webData.results || []);
        renderWebImages(webData.images || []);
    } catch {
        webResults.hidden = true;
        webFallback.hidden = false;
        webCount.textContent = 'External search';
        renderFallbackLinks(query);
    }

    showResults(catalogMatches, webData);
    setLoading(false);

    document.querySelector('.parts-results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const category = params.get('category');

    if (category && partsCategory.querySelector(`option[value="${category}"]`)) {
        partsCategory.value = category;
    }

    if (q) {
        partsQuery.value = q;
        handleSearch(new Event('submit'));
    }
}

renderSuggestions();
loadCatalog().then(initFromUrl);
partsSearchForm.addEventListener('submit', handleSearch);
