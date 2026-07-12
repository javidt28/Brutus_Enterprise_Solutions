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
const browseGrid = document.getElementById('browseGrid');

let catalog = [];

const categoryLabels = {
    automotive: 'Automotive',
    'solar-hvac': 'Solar & HVAC',
    'ev-charging': 'EV Charging',
    'energy-storage': 'Energy Storage',
    appliances: 'Appliances',
    digital: 'Digital Technologies',
};

const categoryFallbackImages = {
    automotive: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop',
    'solar-hvac': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
    'ev-charging': 'https://images.unsplash.com/photo-1593941707882-a5bba14938b7?w=600&h=400&fit=crop',
    'energy-storage': 'https://images.unsplash.com/photo-1611288588376-f28077be0ebf?w=600&h=400&fit=crop',
    appliances: 'https://images.unsplash.com/photo-1571175443880-49d1ba25898a?w=600&h=400&fit=crop',
    digital: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPartImage(part) {
    return part.image || categoryFallbackImages[part.category] || categoryFallbackImages.automotive;
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

function buildCatalogCard(part, options = {}) {
    const { clickable = false, compact = false } = options;
    const image = getPartImage(part);
    const availabilityClass = part.availability === 'In Stock' ? 'in-stock' : 'order';

    const cardInner = `
        <div class="parts-card-media">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(part.name)}" loading="lazy" onerror="this.src='${categoryFallbackImages[part.category] || categoryFallbackImages.automotive}'">
            <span class="parts-category">${escapeHtml(categoryLabels[part.category] || part.category)}</span>
        </div>
        <div class="parts-card-body">
            <div class="parts-card-top">
                <p class="parts-card-number">Part # ${escapeHtml(part.partNumber)}</p>
                <span class="parts-availability ${availabilityClass}">${escapeHtml(part.availability)}</span>
            </div>
            <h3 class="parts-card-title">${escapeHtml(part.name)}</h3>
            <p class="parts-card-manufacturer">${escapeHtml(part.manufacturer)}</p>
            ${compact ? '<span class="parts-card-hint">Click to search →</span>' : `<p class="parts-card-desc">${escapeHtml(part.description)}</p><a href="index.html#contact" class="parts-card-link">Request Quote →</a>`}
        </div>
    `;

    if (clickable) {
        return `<button type="button" class="parts-card parts-card-clickable" data-query="${escapeHtml(part.partNumber)}">${cardInner}</button>`;
    }

    return `<article class="parts-card">${cardInner}</article>`;
}

async function loadCatalog() {
    try {
        const response = await fetch('parts-catalog.json');
        catalog = await response.json();
    } catch {
        catalog = [];
    }
}

function renderBrowseGrid() {
    if (!browseGrid || catalog.length === 0) return;

    const featured = catalog.slice(0, 8);
    browseGrid.innerHTML = featured.map(part => buildCatalogCard(part, { clickable: true, compact: true })).join('');

    browseGrid.querySelectorAll('.parts-card-clickable').forEach(btn => {
        btn.addEventListener('click', () => {
            partsQuery.value = btn.dataset.query;
            partsSearchForm.requestSubmit();
        });
    });
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

    catalogResults.innerHTML = results.map(part => buildCatalogCard(part)).join('');
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
                    ${favicon ? `<img src="${favicon}" alt="" loading="lazy">` : '<span class="parts-web-thumb-fallback">🌐</span>'}
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

loadCatalog().then(() => {
    renderBrowseGrid();
    initFromUrl();
});
partsSearchForm.addEventListener('submit', handleSearch);
