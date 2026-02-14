// GK Websites - Modern JavaScript (2025/26 Best Practices)

/**
 * GK Websites Main JavaScript
 * Implements modern web interactions with performance and accessibility in mind
 */

(function() {
    'use strict';

    // ============================================
    // DOM CONTENT LOADED
    // ============================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initScrollEffects();
        initAnimations();
        initFormHandling();
        initLazyLoading();
    });

    // ============================================
    // NAVIGATION
    // ============================================
    
    function initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const navbar = document.querySelector('.navbar');
        
        // Mobile menu toggle with ARIA
        if (hamburger && navLinks) {
            hamburger.addEventListener('click', function() {
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', !isExpanded);
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isExpanded ? '' : 'hidden';
            });
            
            // Close menu when clicking a link
            navLinks.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function() {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                    hamburger.focus();
                }
            });
        }
        
        // Navbar scroll effect
        if (navbar) {
            let lastScrollY = window.scrollY;
            let ticking = false;
            
            function updateNavbar() {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                lastScrollY = currentScrollY;
                ticking = false;
            }
            
            window.addEventListener('scroll', function() {
                if (!ticking) {
                    requestAnimationFrame(updateNavbar);
                    ticking = true;
                }
            });
        }
    }

    // ============================================
    // SCROLL EFFECTS
    // ============================================
    
    function initScrollEffects() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update focus for accessibility
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    
    function initAnimations() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Add class to disable animations via CSS
            document.body.classList.add('reduce-motion');
            return;
        }
        
        // Intersection Observer for reveal animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            root: null
        };
        
        const revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Elements to animate
        const animateElements = document.querySelectorAll(
            '.feature-card, .service-card, .project-card, .value-card, ' +
            '.testimonial-card, .process-step, .faq-item, .stat-item'
        );
        
        animateElements.forEach(function(el, index) {
            el.classList.add('reveal');
            el.style.transitionDelay = (index % 4) * 0.1 + 's';
            revealObserver.observe(el);
        });
        
        // Stagger animation for grid items
        const grids = document.querySelectorAll('.features-grid, .values-grid, .services-grid');
        
        grids.forEach(function(grid) {
            const items = grid.children;
            Array.from(items).forEach(function(item, index) {
                item.style.transitionDelay = (index % 4) * 0.1 + 's';
            });
        });
    }

    // ============================================
    // FORM HANDLING
    // ============================================
    
    function initFormHandling() {
        const contactForm = document.getElementById('contactForm');
        
        if (contactForm) {
            // Real-time validation
            const inputs = contactForm.querySelectorAll('input, select, textarea');
            
            inputs.forEach(function(input) {
                // Remove error state on input
                input.addEventListener('input', function() {
                    this.classList.remove('form-error-message');
                    const errorEl = this.parentElement.querySelector('.form-error');
                    if (errorEl) {
                        errorEl.remove();
                    }
                });
                
                // Validate on blur
                input.addEventListener('blur', function() {
                    validateField(this);
                });
            });
            
            // Form submission
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validate all fields
                let isValid = true;
                const requiredFields = contactForm.querySelectorAll('[required]');
                
                requiredFields.forEach(function(field) {
                    if (!validateField(field)) {
                        isValid = false;
                    }
                });
                
                if (isValid) {
                    handleFormSubmission(contactForm);
                } else {
                    // Focus first invalid field
                    const firstInvalid = contactForm.querySelector('.form-error-message');
                    if (firstInvalid) {
                        firstInvalid.focus();
                    }
                }
            });
        }
        
        // Autocomplete attributes for better UX
        const nameInputs = document.querySelectorAll('input[name="name"], input[id="name"]');
        nameInputs.forEach(function(input) {
            input.setAttribute('autocomplete', 'name');
        });
        
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(function(input) {
            input.setAttribute('autocomplete', 'email');
        });
    }
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error
        field.classList.remove('form-error-message');
        const existingError = field.parentElement.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Check required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Check email format
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Show error if invalid
        if (!isValid) {
            field.classList.add('form-error-message');
            const errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.textContent = errorMessage;
            field.parentElement.appendChild(errorEl);
        }
        
        // Add aria-invalid attribute
        field.setAttribute('aria-invalid', !isValid);
        
        return isValid;
    }
    
    function handleFormSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
        
        // Simulate form submission (replace with actual API call)
        setTimeout(function() {
            // Show success message
            showNotification('Thank you for your message! We will get back to you within 24 hours.');
            
            // Reset form
            form.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            
            // Clear ARIA states
            form.querySelectorAll('[aria-invalid]').forEach(function(el) {
                el.removeAttribute('aria-invalid');
            });
        }, 1500);
    }

    // ============================================
    // LAZY LOADING
    // ============================================
    
    function initLazyLoading() {
        // Native lazy loading for images
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            images.forEach(function(img) {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback for older browsers
            const lazyImageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        lazyImageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(function(img) {
                lazyImageObserver.observe(img);
            });
        }
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    
    function showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification notification--success';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = '<span class="notification-icon">✓</span><span class="notification-message">' + message + '</span>';
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '16px 24px',
            background: '#10b981',
            color: '#ffffff',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
            zIndex: '9999',
            animation: 'slideIn 0.3s ease',
            fontSize: '14px',
            fontWeight: '500'
        });
        
        // Add animation keyframes if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // ============================================
    // ACCESSIBILITY UTILITIES
    // ============================================
    
    // Add keyboard navigation for cards with links
    document.querySelectorAll('.project-card, .feature-card, .service-card').forEach(function(card) {
        const link = card.querySelector('a');
        if (link) {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'group');
            
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
        }
    });

    // ============================================
    // PERFORMANCE MONITORING (Optional)
    // ============================================
    
    if (typeof window !== 'undefined' && window.PerformanceObserver) {
        // Log Core Web Vitals in development
        const observer = new PerformanceObserver(function(list) {
            const entries = list.getEntries();
            entries.forEach(function(entry) {
                if (entry.entryType === 'lcp') {
                    // console.log('LCP:', entry.startTime.toFixed(2) + 'ms');
                }
            });
        });
        
        try {
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            // Not supported in all browsers
        }
    }

})();
