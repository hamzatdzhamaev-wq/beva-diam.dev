/**
 * Beva Diamond Portfolio - Main Script
 * Optimized for High Performance (60fps+)
 */

// ===== UTILS =====
const lerp = (start, end, factor) => start + (end - start) * factor;
const easeOutExpo = (x) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);

// ===== PWA FUNCTIONALITY =====
// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);

                // Check for updates every hour
                setInterval(() => {
                    registration.update();
                }, 3600000);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const closeInstall = document.getElementById('closeInstall');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install prompt after 3 seconds
    setTimeout(() => {
        if (installPrompt && !localStorage.getItem('pwa-dismissed')) {
            installPrompt.classList.add('visible');
        }
    }, 3000);
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // Clear the deferredPrompt
        deferredPrompt = null;

        // Hide the install prompt
        if (installPrompt) {
            installPrompt.classList.remove('visible');
        }
    });
}

if (closeInstall) {
    closeInstall.addEventListener('click', () => {
        if (installPrompt) {
            installPrompt.classList.remove('visible');
            localStorage.setItem('pwa-dismissed', 'true');
        }
    });
}

// Track app installation
window.addEventListener('appinstalled', (evt) => {
    console.log('✅ App was installed');
    if (installPrompt) {
        installPrompt.classList.remove('visible');
    }
});

// Online/Offline Detection
const offlineIndicator = document.getElementById('offlineIndicator');

window.addEventListener('online', () => {
    if (offlineIndicator) {
        offlineIndicator.classList.remove('visible');
    }
    console.log('✅ Back online');
});

window.addEventListener('offline', () => {
    if (offlineIndicator) {
        offlineIndicator.classList.add('visible');
    }
    console.log('⚠️ You are offline');
});

// Check initial online status
if (!navigator.onLine && offlineIndicator) {
    offlineIndicator.classList.add('visible');
}

// Touch device detection and optimizations
const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
};

// Disable cursor trail on touch devices for performance
if (isTouchDevice()) {
    document.body.classList.add('touch-device');
    console.log('📱 Touch device detected - optimizations applied');
}

// ===== DOM ELEMENTS =====
const dom = {
    nav: document.querySelector('.nav'),
    sections: document.querySelectorAll('section[id]'),
    navLinks: document.querySelectorAll('.nav-link'),
    expertiseCards: document.querySelectorAll('.expertise-card'),
    projectCards: document.querySelectorAll('.project-card'),
    serviceCards: document.querySelectorAll('.service-card'),
    expertiseSection: document.getElementById('expertise'),
    backToTop: document.querySelector('.back-to-top'),
    hamburger: document.querySelector('.hamburger'),
    mobileMenu: document.querySelector('.mobile-menu'),
    cursorCircles: [],
    logo: document.querySelector('.nav-logo')
};

// ===== STATE MANAGEMENT =====
const state = {
    scrollY: window.scrollY,
    lastScrollY: window.scrollY,
    mouse: { x: 0, y: 0 },
    isScrolling: false,
    ticking: false,
    cursorHovered: false
};

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== CENTRALIZED SCROLL LOOP (PERFORMANCE CORE) =====
const updateScrollAnimations = () => {
    const { scrollY, lastScrollY } = state;
    
    // 1. Navigation Background
    if (scrollY > 50) {
        dom.nav.classList.add('scrolled');
        dom.nav.style.background = 'rgba(10, 10, 21, 0.95)';
        dom.nav.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
        dom.nav.classList.remove('scrolled');
        dom.nav.style.background = 'rgba(10, 10, 21, 0.8)';
        dom.nav.style.boxShadow = 'none';
    }

    // 2. Parallax Effect (Hardware Accelerated)
    const sectionTop = dom.expertiseSection ? dom.expertiseSection.offsetTop : 0;

    dom.expertiseCards.forEach((card, index) => {
        if (window.innerWidth > 768) { // Only on desktop
            const speed = 0.05 + (index * 0.02); // Adjusted speed for relative calculation
            const yPos = (scrollY - sectionTop) * speed;
            // Use translate3d for GPU acceleration
            card.style.transform = `translate3d(0, ${yPos}px, 0)`;
        } else {
            card.style.transform = 'none';
        }
    });

    // 3. Active Nav Link
    let currentSection = '';
    dom.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    dom.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });

    // 4. Particle Generation on Fast Scroll
    const scrollDelta = Math.abs(scrollY - lastScrollY);
    if (scrollDelta > 10) {
        spawnParticles(2, scrollY);
    }

    // 5. Back to Top Visibility
    if (dom.backToTop) {
        if (scrollY > 500) {
            dom.backToTop.classList.add('visible');
        } else {
            dom.backToTop.classList.remove('visible');
        }
    }

    state.lastScrollY = scrollY;
    state.ticking = false;
};

window.addEventListener('scroll', () => {
    state.scrollY = window.scrollY;
    if (!state.ticking) {
        window.requestAnimationFrame(updateScrollAnimations);
        state.ticking = true;
    }
}, { passive: true });

// ===== INTERSECTION OBSERVER =====
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.expertise-card, .project-card, .service-card, .section-header, .hero-content').forEach((el, index) => {
    el.classList.add('fade-in');
    // Stagger delay via CSS variable or inline style
    el.style.transitionDelay = `${index * 50}ms`; 
    fadeObserver.observe(el);
});

// ===== PREMIUM COUNTER ANIMATION =====
const animateCounter = (element, target) => {
    const duration = 1800; // Made it faster
    const start = performance.now();
    const isPercentage = target === 98; // Specific case logic

    const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = easeOutExpo(progress); // Premium feel easing
        
        const current = Math.floor(eased * target);
        element.textContent = isPercentage ? current + '%' : current;

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            element.textContent = isPercentage ? target + '%' : target;
        }
    };
    requestAnimationFrame(frame);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.stat-number').forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ===== CURSOR TRAIL SYSTEM (Desktop Only) =====
const initCursor = () => {
    if (isTouchDevice()) return; // Skip on mobile

    const colors = [
        'rgba(99, 102, 241, 0.4)',
        'rgba(99, 102, 241, 0.3)',
        'rgba(99, 102, 241, 0.2)',
        'rgba(99, 102, 241, 0.1)',
        'rgba(99, 102, 241, 0.05)'
    ];

    colors.forEach((color, i) => {
        const circle = document.createElement('div');
        Object.assign(circle.style, {
            position: 'fixed',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: color,
            pointerEvents: 'none',
            zIndex: '9999',
            transition: 'transform 0.1s ease-out, opacity 0.3s ease',
            transform: 'translate(-50%, -50%)',
            opacity: '0',
            left: '0',
            top: '0'
        });
        document.body.appendChild(circle);
        dom.cursorCircles.push({ el: circle, x: 0, y: 0, lag: (i + 1) * 0.15 });
    });
};

if (!isTouchDevice()) {
    initCursor();
}

let cursorTimeout;
window.addEventListener('mousemove', (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;

    dom.cursorCircles.forEach(c => c.el.style.opacity = '1');
    
    clearTimeout(cursorTimeout);
    cursorTimeout = setTimeout(() => {
        dom.cursorCircles.forEach(c => c.el.style.opacity = '0');
    }, 500);
}, { passive: true });

// Restore Cursor Interactions (Hover Effect)
document.querySelectorAll('a, button, .project-card, .expertise-card, .service-card, .nav-logo, .back-to-top').forEach(el => {
    el.addEventListener('mouseenter', () => state.cursorHovered = true);
    el.addEventListener('mouseleave', () => state.cursorHovered = false);
});

const animateCursor = () => {
    if (isTouchDevice() || dom.cursorCircles.length === 0) return;

    // The first circle (leader) follows the mouse directly
    const leader = dom.cursorCircles[0];
    leader.x = lerp(leader.x, state.mouse.x, 0.5); // Faster lerp for responsiveness
    leader.y = lerp(leader.y, state.mouse.y, 0.5);

    let scale = state.cursorHovered ? 1.5 : 1;
    leader.el.style.transform = `translate(${leader.x}px, ${leader.y}px) translate(-50%, -50%) scale(${scale})`;

    // Subsequent circles follow the one in front of them, creating the trail
    for (let i = 1; i < dom.cursorCircles.length; i++) {
        const currentCircle = dom.cursorCircles[i];
        const previousCircle = dom.cursorCircles[i - 1];

        currentCircle.x = lerp(currentCircle.x, previousCircle.x, 0.5);
        currentCircle.y = lerp(currentCircle.y, previousCircle.y, 0.5);

        let scale = 1 - (i * 0.15);
        if (state.cursorHovered) scale *= 1.5;
        currentCircle.el.style.transform = `translate(${currentCircle.x}px, ${currentCircle.y}px) translate(-50%, -50%) scale(${scale})`;
    }

    requestAnimationFrame(animateCursor);
};

if (!isTouchDevice()) {
    animateCursor();
}

// ===== 3D TILT EFFECT (OPTIMIZED) =====
const handleTilt = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Increased rotation intensity back to original feel
    const rotateX = ((y - centerY) / centerY) * 15; 
    const rotateY = ((centerX - x) / centerX) * 15;

    // FIX: Transition ausschalten für direkte 1:1 Bewegung (kein Lag)
    card.style.transition = 'transform 0s, box-shadow 0.3s ease, border-color 0.3s ease';
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
};

const resetTilt = (card) => {
    // FIX: Transition wieder einschalten für sanftes Zurücksetzen
    card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease';
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
};

[...dom.projectCards, ...dom.expertiseCards, ...dom.serviceCards].forEach(card => {
    card.addEventListener('mousemove', (e) => requestAnimationFrame(() => handleTilt(e, card)));
    card.addEventListener('mouseleave', () => resetTilt(card));
});

// ===== PARTICLE SYSTEM (CANVAS) =====
const particleCanvas = document.createElement('canvas');
Object.assign(particleCanvas.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9998'
});
document.body.appendChild(particleCanvas);
const ctx = particleCanvas.getContext('2d');

let particles = [];
const resizeCanvas = () => {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
};
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(y) {
        this.x = Math.random() * window.innerWidth;
        this.y = y || Math.random() * window.innerHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.life = 1.0;
    }
    update() {
        this.y -= this.speedY + 0.5; // Float upwards slightly
        this.life -= 0.01;
        this.opacity = this.life * 0.5;
    }
    draw() {
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function spawnParticles(count, scrollY) {
    for(let i=0; i<count; i++) {
        // Spawn near bottom or based on scroll direction could be added
        particles.push(new Particle(window.innerHeight + Math.random() * 100));
    }
}

const animateParticles = () => {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    // Filter in place to avoid garbage collection spikes
    let i = particles.length;
    while (i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
    requestAnimationFrame(animateParticles);
};
animateParticles();

// ===== FORM SUBMISSION =====
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;

        btn.innerHTML = '<span>Sending...</span>';
        btn.style.opacity = '0.8';
        btn.disabled = true;

        // Daten sammeln
        const projects = [];
        contactForm.querySelectorAll('input[name="project"]:checked').forEach(cb => {
            const label = cb.parentElement.querySelector('span[data-i18n]');
            projects.push(label ? label.textContent : cb.value);
        });

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            projectType: projects.join(', '),
            budget: 'N/A', // Budget field can be added if needed
            startDate: new Date().toISOString().split('T')[0],
            description: document.getElementById('message').value
        };

        // Send to Vercel Serverless API
        try {
            const response = await fetch('/api/submit-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                btn.innerHTML = '<span>Message Sent!</span> <span class="btn-icon">✓</span>';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                    btn.disabled = false;
                    contactForm.reset();
                }, 3000);
            } else {
                throw new Error(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending form:', error);
            btn.innerHTML = '<span>Error! Try Again</span>';
            btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.background = '';
                btn.style.opacity = '1';
                btn.disabled = false;
            }, 3000);
        }
    });
}

// ===== BUTTON HOVER EFFECTS (RESTORED) =====
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});

// ===== MOBILE MENU TOGGLE =====
if (dom.hamburger && dom.mobileMenu) {
    dom.hamburger.addEventListener('click', () => {
        dom.hamburger.classList.toggle('active');
        dom.mobileMenu.classList.toggle('active');
        document.body.style.overflow = dom.mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    dom.mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            dom.hamburger.classList.remove('active');
            dom.mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== GLITCH EFFECT INJECTION =====
if (dom.logo) {
    dom.logo.addEventListener('mouseenter', () => {
        dom.logo.classList.remove('glitch-anim');
        void dom.logo.offsetWidth; // Trigger reflow
        dom.logo.classList.add('glitch-anim');
    });
}

// Add glitch animation to CSS dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }
    .glitch-anim { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both; }
`;
document.head.appendChild(styleSheet);

// ===== INIT =====
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
    console.log('%c Beva Diamond ', 'background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px;', 'System initialized.');
});
