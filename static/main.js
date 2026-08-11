// ========== NAVBAR ==========
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== FADE-IN ANIMATIONS ==========
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// ========== COUNTER ANIMATION ==========
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-target'));
            const step = target / 125;
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };
            updateCounter();
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

// ========== PARTICLES ==========
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 15 + 's';
        p.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(p);
    }
}
createParticles();

// ========== MODAL ==========
function showPropertyDetails(title, price, location, description = '') {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalLocation').innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + location;
    if (description) {
        document.getElementById('modalDescription').textContent = description;
    }
    document.getElementById('propertyModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

document.getElementById('propertyModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('propertyModal')) closeModal();
});

// ========== CONTACT FORM ==========
function handleSubmit(e) {
    e.preventDefault();
    const formData = {
        first_name: document.querySelector('input[placeholder="John"]').value,
        last_name: document.querySelector('input[placeholder="Doe"]').value,
        email: document.querySelector('input[type="email"]').value,
        phone: document.querySelector('input[type="tel"]').value,
        interest: document.querySelector('select').value,
        message: document.querySelector('textarea').value
    };

    fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(r => r.json())
    .then(data => {
        const toast = document.getElementById('toast');
        toast.textContent = data.message || 'Message sent successfully!';
        toast.classList.add('show');
        document.getElementById('contactForm').reset();
        setTimeout(() => toast.classList.remove('show'), 3000);
    })
    .catch(err => {
        console.error('Error:', err);
        const toast = document.getElementById('toast');
        toast.textContent = 'Error sending message. Please try again.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    });
}

// ========== TIKTOK EMBED HELPER ==========
function getTikTokEmbedUrl(tiktokUrl) {
    if (!tiktokUrl) return null;
    // If it's already just an ID (numbers only)
    if (/^\d+$/.test(tiktokUrl)) {
        return `https://www.tiktok.com/embed/${tiktokUrl}`;
    }
    // Extract ID from full URL like https://www.tiktok.com/@user/video/1234567890
    const match = tiktokUrl.match(/\/video\/(\d+)/);
    if (match) {
        return `https://www.tiktok.com/embed/${match[1]}`;
    }
    return null;
}

// ========== PROPERTY GRID (TIKTOK EMBED) ==========
function updatePropertyGrid(properties) {
    const grid = document.querySelector('.property-grid');
    if (!grid) return;

    grid.innerHTML = properties.map(p => {
        const tiktokUrl = getTikTokEmbedUrl(p.tiktok);
        const mediaHtml = tiktokUrl ? `
            <div class="property-tiktok">
                <iframe 
                    src="${tiktokUrl}" 
                    frameborder="0" 
                    scrolling="no" 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" 
                    allowfullscreen>
                </iframe>
            </div>
        ` : `
            <div class="property-tiktok property-tiktok-empty">
                <i class="fas fa-home"></i>
            </div>
        `;

        return `
        <div class="property-card fade-in visible" 
             onclick="showPropertyDetails('${p.title}', '${p.price}', '${p.location}', '${p.description || ''}')">
            <div class="property-media">
                ${mediaHtml}
                <span class="property-badge">${p.badge}</span>
                <span class="property-price">${p.price}</span>
            </div>
            <div class="property-info">
                <h3>${p.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i> ${p.location}
                </div>
                <div class="property-features">
                    <div class="feature"><i class="fas fa-bed"></i> <span>${p.beds} Beds</span></div>
                    <div class="feature"><i class="fas fa-bath"></i> <span>${p.baths} Baths</span></div>
                    <div class="feature"><i class="fas fa-ruler-combined"></i> <span>${p.sqft} sqft</span></div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// ========== SEARCH ==========
function searchProperties(query) {
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(properties => updatePropertyGrid(properties))
        .catch(error => console.error('Search error:', error));
}

const searchInput = document.getElementById('propertySearch');
if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchProperties(e.target.value), 300);
    });
}

// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.flexDirection = 'column';
        nav.style.background = 'rgba(5, 5, 5, 0.98)';
        nav.style.padding = '2rem';
        nav.style.gap = '1.5rem';
    }
}

// ========== LOAD PROPERTIES ON START ==========
function loadAllProperties() {
    fetch('/api/properties')
        .then(r => r.json())
        .then(properties => {
            console.log('Loaded properties:', properties);
            updatePropertyGrid(properties);
        })
        .catch(error => console.error('Error loading properties:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllProperties();
});