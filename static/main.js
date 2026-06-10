// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Counter animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
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

document.querySelectorAll('.counter').forEach(counter => counterObserver.observe(counter));

// Particle animation
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

createParticles();

// Property modal
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

// Close modal on outside click
document.getElementById('propertyModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('propertyModal')) {
        closeModal();
    }
});

// Contact form submission - NOW CONNECTS TO PYTHON BACKEND
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
    
    // Send to Python Flask backend
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        const toast = document.getElementById('toast');
        toast.textContent = data.message || 'Message sent successfully!';
        toast.classList.add('show');
        document.getElementById('contactForm').reset();
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    })
    .catch(error => {
        console.error('Error:', error);
        const toast = document.getElementById('toast');
        toast.textContent = 'Error sending message. Please try again.';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    });
}

// Property search functionality
function searchProperties(query) {
    fetch(`/api/search?q=${encodeURIComponent(query)}`  )
        .then(response => response.json())
        .then(properties => {
            updatePropertyGrid(properties);
        })
        .catch(error => console.error('Search error:', error));
}

function updatePropertyGrid(properties) {
    const grid = document.querySelector('.property-grid');
    if (!grid) return;
    
    grid.innerHTML = properties.map(p => `
        <div class="property-card fade-in visible" onclick="showPropertyDetails('${p.title}', '${p.price}', '${p.location}', '${p.description}')">
            <div class="property-image">
                <i class="fas ${p.icon}"></i>
                <span class="property-badge">${p.badge}</span>
                <span class="property-price">${p.price}</span>
            </div>
            <div class="property-info">
                <h3>${p.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${p.location}
                </div>
                <div class="property-features">
                    <div class="feature">
                        <i class="fas fa-bed"></i>
                        <span>${p.beds} Beds</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-bath"></i>
                        <span>${p.baths} Baths</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-ruler-combined"></i>
                        <span>${p.sqft} sqft</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

document.querySelectorAll('.property-video video').forEach(video => {
  
  // Play on hover
  video.addEventListener('mouseenter', () => {
    video.play().catch(e => console.log('Autoplay blocked'));
    video.setAttribute('playing', '');
  });
  
  // Pause and reset on mouse leave
  video.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
    video.removeAttribute('playing');
  });
  
  // Toggle play/pause on click
  video.addEventListener('click', () => {
    if (video.paused) {
      video.play();
      video.setAttribute('playing', '');
    } else {
      video.pause();
      video.removeAttribute('playing');
    }
  });
});

// Search input handler
const searchInput = document.getElementById('propertySearch');
if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchProperties(e.target.value);
        }, 300);
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    nav.style.position = 'absolute';
    nav.style.top = '100%';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.flexDirection = 'column';
    nav.style.background = 'rgba(5, 5, 5, 0.98)';
    nav.style.padding = '2rem';
    nav.style.gap = '1.5rem';
}

// Dynamic property loading from API
function loadAllProperties() {
    fetch('/api/properties')
        .then(response => response.json())
        .then(properties => {
            console.log('Loaded properties:', properties);
        })
        .catch(error => console.error('Error loading properties:', error));
}

// Load properties on page load
document.addEventListener('DOMContentLoaded', loadAllProperties);