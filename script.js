// Mobile menu
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const body = document.body;

function closeMobileMenu() {
    navMenu.classList.remove('active');
    body.style.overflow = '';
    const spans = mobileMenuToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
}

mobileMenuToggle.addEventListener('click', () => {
    const isActive = navMenu.classList.toggle('active');
    body.style.overflow = isActive ? 'hidden' : '';
    const spans = mobileMenuToggle.querySelectorAll('span');
    if (isActive) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
    } else {
        closeMobileMenu();
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();

        if (href === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });

            if (href === '#contact') {
                setTimeout(() => {
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus({ preventScroll: true });
                }, 700);
            }
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let scrollTicking = false;

window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            navbar.classList.toggle('scrolled', window.pageYOffset > 20);
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset + 120;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation, { passive: true });

// Reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Form validation & submission
const contactForm = document.getElementById('contactForm');
const messageTextarea = document.getElementById('message');
const charCount = document.querySelector('.char-count');
const formInputs = document.querySelectorAll('#contactForm input, #contactForm textarea, #contactForm select');

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

    field.classList.toggle('error', !isValid);
    field.classList.toggle('valid', isValid && field.value.trim());
    if (errorElement) errorElement.textContent = errorMessage;

    return isValid;
}

if (messageTextarea && charCount) {
    messageTextarea.addEventListener('input', () => {
        const count = messageTextarea.value.length;
        charCount.textContent = `${count} / 1000 characters`;
        charCount.style.color = count > 1000 ? '#dc2626' : '';
    });
}

formInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', function () {
        if (this.classList.contains('error')) validateField(this);
    });
});

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let isFormValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) isFormValid = false;
        });
        if (!isFormValid) return;

        const submitBtn = contactForm.querySelector('.btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        const formSuccess = document.getElementById('formSuccess');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        // Replace with your backend endpoint (Formspree, Resend, etc.)
        setTimeout(() => {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';

            if (formSuccess) {
                formSuccess.style.display = 'flex';
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            contactForm.reset();
            if (charCount) charCount.textContent = '0 / 1000 characters';
            formInputs.forEach(input => input.classList.remove('valid', 'error'));

            setTimeout(() => {
                if (formSuccess) formSuccess.style.display = 'none';
            }, 5000);
        }, 1200);
    });
}

// Scroll to top
const scrollToTopBtn = document.getElementById('scrollToTop');
let scrollTopTicking = false;

if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (!scrollTopTicking) {
            requestAnimationFrame(() => {
                scrollToTopBtn.classList.toggle('visible', window.pageYOffset > 400);
                scrollTopTicking = false;
            });
            scrollTopTicking = true;
        }
    }, { passive: true });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Copyright year
const copyrightYear = document.getElementById('copyrightYear');
if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    highlightNavigation();
    document.body.classList.add('loaded');
});
