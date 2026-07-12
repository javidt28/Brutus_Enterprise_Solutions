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

let catalog = [];

const categoryLabels = {
    automotive: 'Automotive',
    'solar-hvac': 'Solar & HVAC',
    'ev-charging': 'EV Charging',
    'energy-storage': 'Energy Storage',
    appliances: 'Appliances',
    digital: 'Digital Technologies',
};

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

    catalogResults.innerHTML = results.map(part => `
        <article class="parts-card">
            <div class="parts-card-top">
                <span class="parts-category">${categoryLabels[part.category] || part.category}</span>
                <span class="parts-availability ${part.availability === 'In Stock' ? 'in-stock' : 'order'}">${part.availability}</span>
            </div>
            <h3 class="parts-card-title">${part.name}</h3>
            <p class="parts-card-number">Part # ${part.partNumber}</p>
            <p class="parts-card-manufacturer">${part.manufacturer}</p>
            <p class="parts-card-desc">${part.description}</p>
            <a href="index.html#contact" class="parts-card-link">Request Quote →</a>
        </article>
    `).join('');
}

function renderWebResults(results) {
    webCount.textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    webFallback.hidden = true;
    webResults.hidden = false;

    webResults.innerHTML = results.map(item => `
        <a class="parts-web-item" href="${item.url}" target="_blank" rel="noopener noreferrer">
            <h3>${item.title}</h3>
            <p>${item.snippet}</p>
            <span class="parts-web-url">${formatUrl(item.url)}</span>
        </a>
    `).join('');
}

function formatUrl(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}

function renderFallbackLinks(query) {
    const encoded = encodeURIComponent(query);
    const links = [
        { name: 'Google', url: `https://www.google.com/search?q=${encoded}+parts+buy` },
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
    const data = await response.json();
    return data.results || [];
}

function setLoading(isLoading) {
    const btnText = partsSearchBtn.querySelector('.btn-text');
    const btnLoader = partsSearchBtn.querySelector('.btn-loader');
    partsSearchBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline-flex' : 'none';
}

function showResults(catalogMatches, webMatches) {
    partsEmpty.hidden = true;

    const hasCatalog = catalogMatches.length > 0;
    const hasWeb = webMatches.length > 0;
    const showFallback = !webFallback.hidden;

    catalogResultsBlock.hidden = !hasCatalog;
    webResultsBlock.hidden = !hasWeb && !showFallback;

    if (!hasCatalog && !hasWeb && !showFallback) {
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

    const catalogMatches = searchCatalog(query, category);
    renderCatalogResults(catalogMatches);

    let webMatches = [];
    try {
        webMatches = await searchWeb(query, category);
        renderWebResults(webMatches);
    } catch {
        webResults.hidden = true;
        webFallback.hidden = false;
        webCount.textContent = 'External search';
        renderFallbackLinks(query);
    }

    showResults(catalogMatches, webMatches);
    setLoading(false);

    document.querySelector('.parts-results-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Pre-fill from URL query string
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

loadCatalog().then(initFromUrl);
partsSearchForm.addEventListener('submit', handleSearch);
