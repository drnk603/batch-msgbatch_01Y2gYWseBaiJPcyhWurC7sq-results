(function() {
  'use strict';

  const CONFIG = {
    headerScrolledClass: 'is-scrolled',
    navOpenClass: 'is-open',
    noScrollClass: 'u-no-scroll',
    accordionOpenClass: 'is-open',
    visibleClass: 'is-visible',
    animatedClass: 'is-animated',
    errorClass: 'has-error',
    scrollThreshold: 50,
    animationDelay: 100,
    formSubmitDelay: 500
  };

  const REGEX = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+\-\d\s()]{10,20}$/,
    name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
    message: /^.{10,}$/
  };

  class App {
    constructor() {
      this.init();
    }

    init() {
      this.setupHeader();
      this.setupNavigation();
      this.setupScrollEffects();
      this.setupAccordions();
      this.setupForms();
      this.setupAnimations();
      this.setupButtons();
      this.setupScrollToTop();
      this.setupCounters();
      this.setupCards();
    }

    setupHeader() {
      const header = document.querySelector('.l-header');
      if (!header) return;

      const handleScroll = () => {
        if (window.scrollY > CONFIG.scrollThreshold) {
          header.classList.add(CONFIG.headerScrolledClass);
        } else {
          header.classList.remove(CONFIG.headerScrolledClass);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    setupNavigation() {
      const toggle = document.querySelector('[data-nav-toggle]');
      const nav = document.querySelector('.c-nav');
      const navLinks = document.querySelectorAll('.c-nav__link');

      if (!toggle || !nav) return;

      const closeNav = () => {
        nav.classList.remove(CONFIG.navOpenClass);
        toggle.classList.remove(CONFIG.navOpenClass);
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove(CONFIG.noScrollClass);
      };

      const openNav = () => {
        nav.classList.add(CONFIG.navOpenClass);
        toggle.classList.add(CONFIG.navOpenClass);
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add(CONFIG.noScrollClass);
      };

      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.contains(CONFIG.navOpenClass);
        isOpen ? closeNav() : openNav();
      });

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            e.preventDefault();
            closeNav();
            const target = document.querySelector(href);
            if (target) {
              const headerHeight = document.querySelector('.l-header')?.offsetHeight || 0;
              const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }
          } else {
            closeNav();
          }
        });
      });

      this.setupScrollSpy();
    }

    setupScrollSpy() {
      const sections = document.querySelectorAll('[id]');
      const navLinks = document.querySelectorAll('.c-nav__link');

      if (sections.length === 0 || navLinks.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(link => {
              link.removeAttribute('aria-current');
              if (link.getAttribute('href') === `#${entry.target.id}`) {
                link.setAttribute('aria-current', 'page');
              }
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px'
      });

      sections.forEach(section => observer.observe(section));
    }

    setupScrollEffects() {
      const elements = document.querySelectorAll('.c-card, .c-feature, .c-service-card, .c-team__card, .c-case-study, .c-event, .c-accordion__item, .c-timeline__item, .c-sustainability__card, .c-section-header, .c-hero__content');

      if (elements.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting && !entry.target.classList.contains(CONFIG.animatedClass)) {
            setTimeout(() => {
              entry.target.style.opacity = '0';
              entry.target.style.transform = 'translateY(30px)';
              entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

              requestAnimationFrame(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add(CONFIG.animatedClass);
              });
            }, index * 100);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      });

      elements.forEach(el => observer.observe(el));
    }

    setupAccordions() {
      const triggers = document.querySelectorAll('.c-accordion__trigger, .c-faq__question');

      triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const item = trigger.closest('.c-accordion__item, .c-faq__item');
          const content = item.querySelector('.c-accordion__content, .c-faq__answer');
          const isOpen = item.classList.contains(CONFIG.accordionOpenClass);

          if (isOpen) {
            item.classList.remove(CONFIG.accordionOpenClass);
            trigger.setAttribute('aria-expanded', 'false');
            content.setAttribute('aria-hidden', 'true');
            content.style.maxHeight = '0';
          } else {
            item.classList.add(CONFIG.accordionOpenClass);
            trigger.setAttribute('aria-expanded', 'true');
            content.setAttribute('aria-hidden', 'false');
            content.style.maxHeight = content.scrollHeight + 'px';
          }
        });
      });
    }

    setupForms() {
      const forms = document.querySelectorAll('[data-form-submit]');

      forms.forEach(form => {
        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';

        form.addEventListener('submit', (e) => {
          e.preventDefault();

          if (!this.validateForm(form)) {
            return;
          }

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Wird gesendet...';
          }

          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, CONFIG.formSubmitDelay);
        });

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('blur', () => {
            this.validateField(input);
          });

          input.addEventListener('input', () => {
            const errorMsg = input.parentElement.querySelector('.c-form__error');
            if (errorMsg) {
              errorMsg.remove();
              input.removeAttribute('aria-invalid');
              input.parentElement.classList.remove(CONFIG.errorClass);
            }
          });
        });
      });
    }

    validateForm(form) {
      let isValid = true;
      const fields = form.querySelectorAll('[required], [aria-required="true"]');

      fields.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      return isValid;
    }

    validateField(field) {
      const value = field.value.trim();
      const fieldType = field.type;
      const fieldId = field.id || field.name;
      let errorMessage = '';

      const existingError = field.parentElement.querySelector('.c-form__error');
      if (existingError) {
        existingError.remove();
      }

      field.removeAttribute('aria-invalid');
      field.parentElement.classList.remove(CONFIG.errorClass);

      if (field.hasAttribute('required') || field.getAttribute('aria-required') === 'true') {
        if (!value) {
          errorMessage = 'Dieses Feld ist erforderlich.';
        } else if (fieldType === 'email' || fieldId.includes('email')) {
          if (!REGEX.email.test(value)) {
            errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
          }
        } else if (fieldType === 'tel' || fieldId.includes('phone')) {
          if (!REGEX.phone.test(value)) {
            errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).';
          }
        } else if (fieldId.includes('name')) {
          if (!REGEX.name.test(value)) {
            errorMessage = 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben).';
          }
        } else if (field.tagName === 'TEXTAREA' || fieldId.includes('message')) {
          if (!REGEX.message.test(value)) {
            errorMessage = 'Bitte geben Sie mindestens 10 Zeichen ein.';
          }
        }

        if (fieldType === 'checkbox' && !field.checked) {
          errorMessage = 'Bitte akzeptieren Sie die Datenschutzerklärung.';
        }
      }

      if (errorMessage) {
        this.showError(field, errorMessage);
        return false;
      }

      return true;
    }

    showError(field, message) {
      field.setAttribute('aria-invalid', 'true');
      field.parentElement.classList.add(CONFIG.errorClass);

      const errorDiv = document.createElement('div');
      errorDiv.className = 'c-form__error';
      errorDiv.textContent = message;
      errorDiv.setAttribute('role', 'alert');

      field.parentElement.appendChild(errorDiv);

      errorDiv.style.opacity = '0';
      errorDiv.style.transform = 'translateY(-10px)';
      errorDiv.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

      requestAnimationFrame(() => {
        errorDiv.style.opacity = '1';
        errorDiv.style.transform = 'translateY(0)';
      });
    }

    setupAnimations() {
      const images = document.querySelectorAll('img:not(.c-logo__img)');

      images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      });

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains(CONFIG.animatedClass)) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
            entry.target.classList.add(CONFIG.animatedClass);
          }
        });
      }, {
        threshold: 0.1
      });

      images.forEach(img => imageObserver.observe(img));
    }

    setupButtons() {
      const buttons = document.querySelectorAll('.c-btn, .c-button, button, a[class*="btn"]');

      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function(e) {
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.position = 'absolute';
          ripple.style.borderRadius = '50%';
          ripple.style.background = 'rgba(255, 255, 255, 0.6)';
          ripple.style.width = '0';
          ripple.style.height = '0';
          ripple.style.pointerEvents = 'none';
          ripple.style.transform = 'translate(-50%, -50%)';
          ripple.style.transition = 'width 0.6s ease-out, height 0.6s ease-out, opacity 0.6s ease-out';
          ripple.style.opacity = '1';

          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';

          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);

          requestAnimationFrame(() => {
            ripple.style.width = size * 2 + 'px';
            ripple.style.height = size * 2 + 'px';
            ripple.style.opacity = '0';
          });

          setTimeout(() => ripple.remove(), 600);
        });
      });

      const links = document.querySelectorAll('a:not(.c-btn):not(.c-button)');
      links.forEach(link => {
        link.addEventListener('mouseenter', function() {
          this.style.transition = 'color 0.3s ease-out, transform 0.2s ease-out';
        });
      });
    }

    setupScrollToTop() {
      const scrollBtn = document.createElement('button');
      scrollBtn.className = 'c-scroll-top';
      scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.4s ease-out, visibility 0.4s ease-out, transform 0.3s ease-out;
        z-index: 1000;
        box-shadow: var(--shadow-lg);
      `;

      document.body.appendChild(scrollBtn);

      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
          scrollBtn.style.opacity = '1';
          scrollBtn.style.visibility = 'visible';
        } else {
          scrollBtn.style.opacity = '0';
          scrollBtn.style.visibility = 'hidden';
        }
      }, { passive: true });

      scrollBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      scrollBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
      });

      scrollBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
    }

    setupCounters() {
      const counters = document.querySelectorAll('.c-case-study__stat-value, .c-sustainability__card-title');

      counters.forEach(counter => {
        const text = counter.textContent;
        const match = text.match(/(\d+)/);

        if (match) {
          const target = parseInt(match[1]);
          counter.dataset.target = target;
          counter.textContent = text.replace(match[1], '0');

          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && !entry.target.classList.contains(CONFIG.animatedClass)) {
                this.animateCounter(entry.target, target, text);
                entry.target.classList.add(CONFIG.animatedClass);
              }
            });
          }, { threshold: 0.5 });

          observer.observe(counter);
        }
      });
    }

    animateCounter(element, target, originalText) {
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        current += increment;
        step++;

        if (step >= steps) {
          current = target;
          clearInterval(timer);
        }

        const newText = originalText.replace(/\d+/, Math.floor(current));
        element.textContent = newText;
      }, duration / steps);
    }

    setupCards() {
      const cards = document.querySelectorAll('.c-card, .c-service-card, .c-team__card, .c-feature');

      cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
  } else {
    new App();
  }
})();