// ===== SMOOTH SCROLL =====
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

// ===== NAVIGATION BACKGROUND ON SCROLL =====
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.style.background = 'rgba(10, 10, 21, 0.95)';
        nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.background = 'rgba(10, 10, 21, 0.8)';
        nav.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===== INTERSECTION OBSERVER FOR FADE IN ANIMATIONS =====
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

// Observe all cards and sections
document.querySelectorAll('.expertise-card, .project-card, .section-header').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ===== COUNTER ANIMATION FOR STATS =====
function animateCounter(element, target, duration = 2000) {
    let current = 0;
    const increment = target / (duration / 16);
    const isSuffix = target === 98; // For percentage

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = isSuffix ? target + '%' : Math.ceil(target);
            clearInterval(timer);
        } else {
            element.textContent = isSuffix ? Math.ceil(current) + '%' : Math.ceil(current);
        }
    }, 16);
}

// Trigger counter animation when stats are visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ===== CURSOR TRAIL EFFECT =====
const coords = { x: 0, y: 0 };
const circles = [];
const colors = [
    'rgba(99, 102, 241, 0.3)',
    'rgba(99, 102, 241, 0.25)',
    'rgba(99, 102, 241, 0.2)',
    'rgba(99, 102, 241, 0.15)',
    'rgba(99, 102, 241, 0.1)'
];

// Create cursor circles
for (let i = 0; i < 5; i++) {
    const circle = document.createElement('div');
    circle.style.position = 'fixed';
    circle.style.width = '20px';
    circle.style.height = '20px';
    circle.style.borderRadius = '50%';
    circle.style.background = colors[i];
    circle.style.pointerEvents = 'none';
    circle.style.zIndex = '9999';
    circle.style.transition = 'transform 0.1s ease-out';
    circle.style.transform = 'translate(-50%, -50%)';
    circle.style.opacity = '0';
    document.body.appendChild(circle);
    circles.push(circle);
}

let mouseIsMoving = false;
let timeout;

window.addEventListener('mousemove', (e) => {
    coords.x = e.clientX;
    coords.y = e.clientY;

    if (!mouseIsMoving) {
        mouseIsMoving = true;
        circles.forEach(circle => circle.style.opacity = '1');
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        mouseIsMoving = false;
        circles.forEach(circle => circle.style.opacity = '0');
    }, 100);
});

function animateCircles() {
    let x = coords.x;
    let y = coords.y;

    circles.forEach((circle, index) => {
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        circle.style.transform = `translate(-50%, -50%) scale(${(circles.length - index) / circles.length})`;

        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.offsetLeft - x) * 0.3;
        y += (nextCircle.offsetTop - y) * 0.3;
    });

    requestAnimationFrame(animateCircles);
}

animateCircles();

// ===== PARALLAX EFFECT FOR SECTIONS =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    const expertiseCards = document.querySelectorAll('.expertise-card');
    expertiseCards.forEach((card, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed / 100);
        card.style.transform = `translateY(${yPos}px)`;
    });
});

// ===== PROJECT CARD TILT EFFECT =====
document.querySelectorAll('.project-card').forEach(card => {
    card.style.transition = 'all 0.1s ease-out';

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        setTimeout(() => {
            card.style.transition = 'all 0.1s ease-out';
        }, 300);
    });
});

// ===== EXPERTISE CARD HOVER EFFECT =====
document.querySelectorAll('.expertise-card').forEach(card => {
    card.style.transition = 'all 0.1s ease-out';

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        setTimeout(() => {
            card.style.transition = 'all 0.1s ease-out';
        }, 300);
    });
});

// ===== FORM SUBMISSION =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const button = contactForm.querySelector('.btn-primary');
        const originalText = button.innerHTML;

        button.innerHTML = '<span>Sending...</span>';
        button.style.opacity = '0.7';
        button.disabled = true;

        // Simulate form submission
        setTimeout(() => {
            button.innerHTML = '<span>Message Sent!</span> <span class="btn-icon">✓</span>';
            button.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.opacity = '1';
                button.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-accent))';
                button.disabled = false;
                contactForm.reset();
            }, 2000);
        }, 1500);
    });
}

// ===== BUTTON HOVER EFFECTS =====
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== CUSTOM CURSOR FOR BUTTONS =====
document.querySelectorAll('button, a, .project-card, .expertise-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        circles.forEach((circle, index) => {
            circle.style.width = '30px';
            circle.style.height = '30px';
        });
    });

    el.addEventListener('mouseleave', () => {
        circles.forEach((circle, index) => {
            circle.style.width = '20px';
            circle.style.height = '20px';
        });
    });
});

// ===== SCROLL REVEAL ANIMATION =====
const scrollRevealOptions = {
    distance: '60px',
    duration: 1000,
    delay: 200,
    interval: 100
};

// Add stagger effect to cards
const cards = document.querySelectorAll('.expertise-card, .project-card');
cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 100}ms`;
});

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';

    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== GLITCH EFFECT ON LOGO =====
const logo = document.querySelector('.nav-logo');
if (logo) {
    logo.addEventListener('mouseenter', function() {
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = 'glitch 0.3s ease';
        }, 10);
    });
}

// Add glitch animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes glitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
    }

    .nav-link.active {
        color: var(--color-primary);
    }

    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// ===== PARTICLE EFFECT ON SCROLL =====
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.opacity = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create canvas for particles
const particleCanvas = document.createElement('canvas');
particleCanvas.style.position = 'fixed';
particleCanvas.style.top = '0';
particleCanvas.style.left = '0';
particleCanvas.style.width = '100%';
particleCanvas.style.height = '100%';
particleCanvas.style.pointerEvents = 'none';
particleCanvas.style.zIndex = '9998';
document.body.appendChild(particleCanvas);

const ctx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}

resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

let lastScrollY = window.pageYOffset;

window.addEventListener('scroll', () => {
    const currentScrollY = window.pageYOffset;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);

    if (scrollDelta > 5) {
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(
                Math.random() * window.innerWidth,
                currentScrollY + Math.random() * window.innerHeight
            ));
        }
    }

    lastScrollY = currentScrollY;
});

function animateParticles() {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    particles = particles.filter(particle => {
        particle.update();
        particle.draw(ctx);
        return particle.opacity > 0;
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

console.log('%c Beva Diamond Portfolio ', 'background: linear-gradient(135deg, #6366f1, #ec4899); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Crafted with precision and passion ', 'color: #6366f1; font-size: 14px;');
