const ITEMS_PER_LOAD = 10;
let allData = [];
let displayedCards = 0;


const $ = id => document.getElementById(id);
const modal = $("myModal");
const showModalBtn = $("showModalBtn");
const loadCardsBtn = $("loadCardsBtn");
const closeBtn = document.querySelector(".close");
const cardsContainer = $("cardsContainer");
const modalContent = $("modalContent");

showModalBtn.addEventListener('click', showModal);
loadCardsBtn.addEventListener('click', loadCards);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', e => e.target === modal && closeModal());

const mockData = [  ];

async function fetchData() {
    const tryFetch = async url => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${url}`);
        return await res.json();
    };

    try {
        const data = await tryFetch('https://microsoftedge.github.io/Demos/json-dummy-data/64KB.json');
        console.log('Data loaded from primary API');
        return data;
    } catch (err1) {
        console.warn('Primary API failed:', err1);
        try {
            const users = await tryFetch('https://jsonplaceholder.typicode.com/users');
            return users.map(user => ({
                name: user.name,
                language: user.address.city,
                id: user.id.toString(),
                bio: `${user.company.catchPhrase}. ${user.company.bs}`,
                version: parseFloat((Math.random() * 10).toFixed(2))
            }));
        } catch (err2) {
            console.warn('Fallback API failed:', err2);
            return mockData;
        }
    }
}

// Modalni ko‘rsatish
async function showModal() {
    modal.style.display = "block";
    modalContent.innerHTML = '<div class="loading">Loading...</div>';

    try {
        if (!allData.length) allData = await fetchData();
        displayedCards = ITEMS_PER_LOAD;
        renderModalCards(allData.slice(0, displayedCards));
    } catch {
        modalContent.innerHTML = '<div class="loading">Error loading data</div>';
    }
}

// Modalga kartalarni render qilish
function renderModalCards(items) {
    modalContent.innerHTML = `
        <div class="modal-cards">
            ${items.map(item => `
                <div class="modal-card">
                    <div class="modal-card-title">${item.name || 'No Name'}</div>
                    <div class="modal-card-bio">${(item.bio || 'No bio available').slice(0, 100)}...</div>
                    <div class="modal-card-info">
                        <span><strong>Language:</strong> ${item.language || 'N/A'}</span>
                        <span><strong>Version:</strong> ${item.version || 'N/A'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadCards() {
    toggleLoadButton(true);

    try {
        if (!allData.length) allData = await fetchData();

        const itemsToShow = allData.slice(displayedCards, displayedCards + ITEMS_PER_LOAD);
        if (itemsToShow.length) {
            appendCards(itemsToShow);
            displayedCards += itemsToShow.length;
        }

        if (displayedCards >= allData.length) {
            loadCardsBtn.textContent = 'All items loaded';
            loadCardsBtn.disabled = true;
        } else {
            toggleLoadButton(false);
        }
    } catch {
        loadCardsBtn.textContent = 'Error loading cards';
    }
}

function createCardElement(item) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-header">
            <div class="card-title">${item.name || 'No Name'}</div>
            <div class="card-id">ID: ${item.id || 'N/A'}</div>
        </div>
        <div class="card-body">
            <div class="card-bio">${item.bio || 'No bio available'}</div>
        </div>
        <div class="card-footer">
            <span class="card-language">${item.language || 'Unknown'}</span>
            <span class="card-version">v${item.version || '0.0'}</span>
        </div>
    `;
    return card;
}

function appendCards(items) {
    items.forEach(item => {
        cardsContainer.appendChild(createCardElement(item));
    });
}

function toggleLoadButton(loading) {
    loadCardsBtn.disabled = loading;
    loadCardsBtn.textContent = loading ? 'Loading...' : 'Load More Cards';
}

function closeModal() {
    modal.style.display = "none";
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Page ready');
});
