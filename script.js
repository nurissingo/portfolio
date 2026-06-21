/**
 * Portfolio Landing Page — JavaScript
 * Навигация, скролл анимациялары, форма валидациясы
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initContactForm();
  initSmoothActiveLinks();
  initHeaderScroll();
  initPromoBanner(); // УАҚЫТША — initPromoBanner() жолын өшіріңіз
});

/* ===== Мобильді мәзір ===== */
function initNavigation() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const navLinks = links.querySelectorAll('.nav__link');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===== Header скролл кезінде күшейту ===== */
function initHeaderScroll() {
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ===== Бөлімдерге скролл кезінде reveal анимациясы ===== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    '.section__header, .about__text, .tech-stack, .project-card, .service-card, .contact__form, .contact__info'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => observer.observe(el));
}

/* ===== Белсенді навигация сілтемесі ===== */
function initSmoothActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ===== Байланыс формасы — WhatsApp арқылы жіберу ===== */
const WHATSAPP_NUMBER = '77074312016';

function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  const validators = {
    name: (value) => {
      if (!value.trim()) return 'Атыңызды енгізіңіз';
      if (value.trim().length < 2) return 'Аты кемінде 2 әріп болуы керек';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Email мекенжайын енгізіңіз';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Дұрыс email енгізіңіз';
      return '';
    },
    message: (value) => {
      if (!value.trim()) return 'Хабарламаны жазыңыз';
      if (value.trim().length < 10) return 'Хабарлама кемінде 10 әріп болуы керек';
      return '';
    }
  };

  function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}Error`);
    const input = document.getElementById(fieldId);
    errorEl.textContent = message;
    input.style.borderColor = message ? '#f87171' : '';
  }

  function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    const error = validators[fieldId](input.value);
    showError(fieldId, error);
    return !error;
  }

  function buildWhatsAppMessage(name, email, message) {
    return [
      'Сәлем! NURIS.dev портфолио сайтынан хабарлама:',
      '',
      `👤 Аты: ${name.trim()}`,
      `📧 Email: ${email.trim()}`,
      '',
      '💬 Хабарлама:',
      message.trim()
    ].join('\n');
  }

  function openWhatsApp(name, email, message) {
    const text = encodeURIComponent(buildWhatsAppMessage(name, email, message));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  ['name', 'email', 'message'].forEach(fieldId => {
    const input = document.getElementById(fieldId);
    input.addEventListener('blur', () => validateField(fieldId));
    input.addEventListener('input', () => {
      if (document.getElementById(`${fieldId}Error`).textContent) {
        validateField(fieldId);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    const isNameValid = validateField('name');
    const isEmailValid = validateField('email');
    const isMessageValid = validateField('message');

    if (isNameValid && isEmailValid && isMessageValid) {
      openWhatsApp(name, email, message);

      successMsg.hidden = false;
      form.reset();

      setTimeout(() => {
        successMsg.hidden = true;
      }, 6000);
    }
  });
}

/* ===== УАҚЫТША ЖЕҢІЛДІК БАННЕРІ — алу үшін осы функцияны өшіріңіз ===== */
function initPromoBanner() {
  const banner = document.getElementById('promoBanner');
  const closeBtn = document.getElementById('promoClose');

  if (!banner || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    banner.remove();
    document.body.classList.remove('has-promo-banner');
  });
}
