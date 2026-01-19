// Mobile Menu Toggle with enhanced animations
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;

mobileMenuToggle.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (isActive) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = '';
    }
    
    // Animate hamburger icon with smooth transitions
    const spans = mobileMenuToggle.querySelectorAll('span');
    if (isActive) {
        spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -7px)';
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        body.style.overflow = '';
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Smooth scrolling for navigation links with performance optimization
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href === '#' || href === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 100;
            window.scrollTo({
                top: Math.max(0, offsetTop),
                behavior: 'smooth'
            });
            
            // If clicking Contact button, focus on the contact form after scroll
            if (this.classList.contains('btn-primary') && target.id === 'contact') {
                setTimeout(() => {
                    const nameInput = document.getElementById('name');
                    if (nameInput) {
                        nameInput.focus({ preventScroll: true });
                    }
                }, 800);
            }
        }
    });
}, { passive: false });

// Navbar scroll effect with modern enhancements
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

// Optimized scroll handler with throttling
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Enhanced Intersection Observer with staggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(card);
});

// Observe sustainability points
document.querySelectorAll('.sustainability-point').forEach((point, index) => {
    point.style.opacity = '0';
    point.style.transform = 'translateX(-30px)';
    point.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    observer.observe(point);
});

// Form submission handler
const contactForm = document.getElementById('contactForm');

// Character counter for textarea
const messageTextarea = document.getElementById('message');
const charCount = document.querySelector('.char-count');

if (messageTextarea && charCount) {
    messageTextarea.addEventListener('input', () => {
        const count = messageTextarea.value.length;
        charCount.textContent = `${count} / 1000 characters`;
        
        if (count > 1000) {
            charCount.style.color = '#ef4444';
            messageTextarea.setAttribute('maxlength', '1000');
        } else {
            charCount.style.color = 'var(--text-light)';
        }
    });
}

// Enhanced form validation
function validateField(field) {
    const errorElement = field.parentElement.querySelector('.error-message');
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    } else if (field.id === 'subject' && field.hasAttribute('required') && !field.value) {
        isValid = false;
        errorMessage = 'Please select a subject';
    }

    if (isValid) {
        field.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    } else {
        field.classList.add('error');
        if (errorElement) errorElement.textContent = errorMessage;
    }

    return isValid;
}

// Add real-time validation
const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select');
formInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', function() {
        if (this.classList.contains('error')) {
            validateField(this);
        }
    });
});

// Form submission
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        let isFormValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            return;
        }

        // Get form values
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Show loading state
        const submitBtn = contactForm.querySelector('.btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const formSuccess = document.getElementById('formSuccess');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            console.log('Form submitted:', formData);
            
            // Hide loading state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';

            // Show success message
            if (formSuccess) {
                formSuccess.style.display = 'flex';
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Reset form
            contactForm.reset();
            if (charCount) charCount.textContent = '0 / 1000 characters';

            // Hide success message after 5 seconds
            setTimeout(() => {
                if (formSuccess) formSuccess.style.display = 'none';
            }, 5000);
        }, 1500);
    });
}

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Number counter animation (kept for any remaining numeric stats)
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    if (!target || isNaN(target)) return;
    
    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;

    const updateCounter = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(startValue + (target - startValue) * easeOutQuart);
        
        if (target >= 100) {
            element.textContent = current + '%';
        } else {
            element.textContent = current + '+';
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (target >= 100 ? '%' : '+');
        }
    };

    updateCounter();
}

// Observe stat cards for animation (icon fade-in instead of counter)
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Animate icon if present
            const statIcon = entry.target.querySelector('.stat-icon');
            if (statIcon) {
                statIcon.style.animation = 'pulse 1s ease-in-out';
            }
            
            statObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    statObserver.observe(card);
});

// Enhanced form validation
const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.validity.valid) {
            this.classList.add('valid');
            this.classList.remove('invalid');
        } else {
            this.classList.add('invalid');
            this.classList.remove('valid');
        }
    });

    input.addEventListener('input', function() {
        if (this.validity.valid) {
            this.classList.remove('invalid');
        }
    });
});

// Parallax effect for hero section (disabled to prevent trusted provider section from moving)
// let hero = document.querySelector('.hero');
// if (hero) {
//     window.addEventListener('scroll', () => {
//         const scrolled = window.pageYOffset;
//         const heroContent = document.querySelector('.hero-content');
//         if (heroContent && scrolled < hero.offsetHeight) {
//             heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
//             heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight) * 0.5;
//         }
//     });
// }

// Smooth reveal animations for sections
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    sectionObserver.observe(section);
});

// Add revealed class styles via JavaScript
const style = document.createElement('style');
style.textContent = `
    section.revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .form-group input.valid {
        border-color: var(--primary-color) !important;
    }
    .form-group input.invalid {
        border-color: #ef4444 !important;
    }
`;
document.head.appendChild(style);

// Scroll to top button with performance optimization
const scrollToTopBtn = document.getElementById('scrollToTop');
let scrollToTopTicking = false;

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (!scrollToTopTicking) {
            window.requestAnimationFrame(() => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
                scrollToTopTicking = false;
            });
            scrollToTopTicking = true;
        }
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Loading animation for page
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Update copyright year dynamically
const copyrightYear = document.getElementById('copyrightYear');
if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    highlightNavigation();
    
    // Update copyright year
    const copyrightYearEl = document.getElementById('copyrightYear');
    if (copyrightYearEl) {
        copyrightYearEl.textContent = new Date().getFullYear();
    }
    
    // Add stagger delay to feature cards
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Add stagger delay to testimonial cards
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
    });
    
    // Add loading class for fade-in effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});
