/**
 * TEMUR ESTATE — app.js
 * Premium Real Estate JavaScript
 * Works purely with DOM — no data stored in JS
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════
     1. NAVBAR — scroll effect + mobile drawer
  ══════════════════════════════════════════════ */
  const Navbar = (() => {
    const navbar   = document.querySelector('.navbar');
    const toggle   = document.querySelector('.navbar__toggle');
    const drawer   = document.querySelector('.navbar__drawer');
    let   isOpen   = false;

    function onScroll() {
      if (!navbar) return;
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    function openMenu() {
      if (!drawer || !toggle) return;
      isOpen = !isOpen;
      toggle.classList.toggle('open', isOpen);
      drawer.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function closeMenu() {
      if (!drawer || !toggle) return;
      isOpen = false;
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }

    function init() {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      if (toggle) {
        toggle.addEventListener('click', openMenu);
      }

      // Close drawer when a link is clicked
      if (drawer) {
        drawer.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', closeMenu);
        });
      }

      // Close on backdrop click
      document.addEventListener('click', function (e) {
        if (
          isOpen &&
          navbar &&
          !navbar.contains(e.target) &&
          drawer &&
          !drawer.contains(e.target)
        ) {
          closeMenu();
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) closeMenu();
      });

      // Close on resize to desktop
      window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && isOpen) closeMenu();
      });
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     2. ACTIVE NAVBAR LINKS (scroll spy)
  ══════════════════════════════════════════════ */
  const ScrollSpy = (() => {
    const allLinks = document.querySelectorAll('.navbar__nav a, .navbar__drawer a');

    function update() {
      const scrollY = window.scrollY + 120;

      // Collect sections that have matching nav links
      allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (!target) return;

        const top    = target.offsetTop;
        const bottom = top + target.offsetHeight;

        if (scrollY >= top && scrollY < bottom) {
          allLinks.forEach(l => l.classList.remove('active'));
          // Activate all links pointing to the same anchor
          document.querySelectorAll(`a[href="${href}"]`).forEach(l => l.classList.add('active'));
        }
      });
    }

    function init() {
      if (allLinks.length === 0) return;
      window.addEventListener('scroll', update, { passive: true });
      update();
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     3. SMOOTH SCROLL for anchor links
  ══════════════════════════════════════════════ */
  const SmoothScroll = (() => {
    function init() {
      document.addEventListener('click', function (e) {
        const anchor = e.target.closest('a[href^="#"]');
        if (!anchor) return;

        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        const navH   = (document.querySelector('.navbar') || {}).offsetHeight || 72;
        const top    = target.getBoundingClientRect().top + window.scrollY - navH;

        window.scrollTo({ top, behavior: 'smooth' });
      });
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     4. REVEAL ANIMATIONS (Intersection Observer)
  ══════════════════════════════════════════════ */
  const Reveal = (() => {
    let observer;

    function init() {
      // Auto-tag elements for reveal if not already tagged
      const candidates = [
        '.card',
        '.section__header',
        '.footer__grid > *',
        '.hero__eyebrow',
        '.hero__title',
        '.hero__sub',
        '.hero__actions',
        '.section__search',
      ];

      candidates.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, i) => {
          if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
            // Stagger cards
            if (selector === '.card') {
              el.classList.add(`reveal--delay-${(i % 4) + 1}`);
            }
          }
        });
      });

      // Also respect existing .reveal elements in markup
      const allReveal = document.querySelectorAll('.reveal');
      if (!allReveal.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      allReveal.forEach(el => observer.observe(el));
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     5. SEARCH — filter .card elements
  ══════════════════════════════════════════════ */
  const Search = (() => {
    const searchInput = document.getElementById('search');

    function getCardText(card) {
      return card.textContent.toLowerCase();
    }

    function filterCards(query) {
      const cards      = document.querySelectorAll('.card');
      const container  = document.querySelector('.cards');
      const q          = query.trim().toLowerCase();

      let visibleCount = 0;

      cards.forEach(card => {
        const matches = !q || getCardText(card).includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      // Show/hide no-results message
      if (container) {
        let noResults = container.querySelector('.no-results');

        if (visibleCount === 0 && q) {
          if (!noResults) {
            noResults = document.createElement('div');
            noResults.className = 'no-results reveal revealed';
            noResults.textContent = 'No properties found for "' + query + '"';
            container.appendChild(noResults);
          } else {
            noResults.textContent = 'No properties found for "' + query + '"';
            noResults.style.display = '';
          }
        } else if (noResults) {
          noResults.style.display = 'none';
        }
      }
    }

    function init() {
      if (!searchInput) return;

      let debounceTimer;

      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          filterCards(this.value);
        }, 200);
      });

      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          this.value = '';
          filterCards('');
          this.blur();
        }
      });
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     6. HERO EFFECTS — parallax + floating particles
  ══════════════════════════════════════════════ */
  const Hero = (() => {
    const hero = document.querySelector('.hero');

    // Subtle parallax on hero bg
    function parallax() {
      if (!hero) return;
      const bg = hero.querySelector('.hero__bg');
      if (!bg) return;

      window.addEventListener('scroll', function () {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          bg.style.transform = `translateY(${y * 0.28}px)`;
        }
      }, { passive: true });
    }

    // Floating gold particles
    function createParticles() {
      if (!hero) return;

      const canvas = document.createElement('canvas');
      canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.45;
      `;
      hero.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let W, H, particles;

      function resize() {
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
      }

      function Particle() {
        this.reset();
      }

      Particle.prototype.reset = function () {
        this.x    = Math.random() * W;
        this.y    = Math.random() * H;
        this.r    = Math.random() * 1.5 + 0.3;
        this.vy   = -(Math.random() * 0.4 + 0.1);
        this.vx   = (Math.random() - 0.5) * 0.2;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 120;
        this.alpha = 0;
      };

      Particle.prototype.update = function () {
        this.x    += this.vx;
        this.y    += this.vy;
        this.life += 1;
        const t    = this.life / this.maxLife;
        this.alpha = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1;
        if (this.life >= this.maxLife || this.y < -10) this.reset();
      };

      Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,169,110,${this.alpha * 0.7})`;
        ctx.fill();
      };

      function initParticles() {
        particles = Array.from({ length: 55 }, () => new Particle());
      }

      function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
      }

      resize();
      initParticles();
      loop();

      window.addEventListener('resize', function () {
        resize();
        initParticles();
      });
    }

    // Mouse tilt on hero content
    function mouseTilt() {
      const content = document.querySelector('.hero__content');
      if (!content || !hero) return;

      hero.addEventListener('mousemove', function (e) {
        const rect = hero.getBoundingClientRect();
        const cx   = rect.width  / 2;
        const cy   = rect.height / 2;
        const dx   = (e.clientX - rect.left - cx) / cx;
        const dy   = (e.clientY - rect.top  - cy) / cy;

        content.style.transform = `perspective(1200px) rotateX(${-dy * 2.5}deg) rotateY(${dx * 2.5}deg)`;
      });

      hero.addEventListener('mouseleave', function () {
        content.style.transform = 'perspective(1200px) rotateX(0) rotateY(0)';
        content.style.transition = 'transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      });

      hero.addEventListener('mouseenter', function () {
        content.style.transition = 'transform 0.1s linear';
      });
    }

    function init() {
      parallax();
      createParticles();
      // Only tilt on non-touch devices
      if (!('ontouchstart' in window)) mouseTilt();
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     7. CARD HOVER INTERACTIONS
  ══════════════════════════════════════════════ */
  const CardInteractions = (() => {
    // 3D tilt on card hover
    function applyTilt(card) {
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x    = (e.clientX - rect.left) / rect.width  - 0.5;
        const y    = (e.clientY - rect.top)  / rect.height - 0.5;

        card.style.transform = `
          translateY(-8px)
          perspective(600px)
          rotateX(${-y * 6}deg)
          rotateY(${x * 6}deg)
        `;
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s ease, border-color 0.5s ease';
      });

      card.addEventListener('mouseenter', function () {
        card.style.transition = 'transform 0.1s linear, box-shadow 0.38s ease, border-color 0.38s ease';
      });
    }

    // Cursor spotlight on card
    function applySpotlight(card) {
      const spotlight = document.createElement('div');
      spotlight.style.cssText = `
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 0;
      `;
      card.style.position = card.style.position || 'relative';
      card.appendChild(spotlight);

      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;
        spotlight.style.background = `radial-gradient(260px circle at ${x}px ${y}px, rgba(200,169,110,0.08), transparent 70%)`;
        spotlight.style.opacity    = '1';
      });

      card.addEventListener('mouseleave', function () {
        spotlight.style.opacity = '0';
      });
    }

    function init() {
      document.querySelectorAll('.card').forEach(card => {
        // Skip touch devices for tilt
        if (!('ontouchstart' in window)) {
          applyTilt(card);
          applySpotlight(card);
        }
      });

      // Also watch for dynamically injected cards (if any via external scripts)
      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
          m.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList.contains('card')) {
              if (!('ontouchstart' in window)) {
                applyTilt(node);
                applySpotlight(node);
              }
            }
          });
        });
      });

      const cardsContainer = document.querySelector('.cards');
      if (cardsContainer) {
        observer.observe(cardsContainer, { childList: true });
      }
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     8. BUTTON RIPPLE EFFECT
  ══════════════════════════════════════════════ */
  const ButtonRipple = (() => {
    function createRipple(e) {
      const btn    = e.currentTarget;
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        width:  ${size}px;
        height: ${size}px;
        left:   ${x}px;
        top:    ${y}px;
        background: rgba(255,255,255,0.18);
        transform: scale(0);
        animation: rippleAnim 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
      `;

      // Inject keyframes once
      if (!document.getElementById('temur-ripple-style')) {
        const s = document.createElement('style');
        s.id = 'temur-ripple-style';
        s.textContent = `
          @keyframes rippleAnim {
            to { transform: scale(1); opacity: 0; }
          }
        `;
        document.head.appendChild(s);
      }

      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', () => ripple.remove());
    }

    function init() {
      document.querySelectorAll('.button').forEach(btn => {
        btn.addEventListener('click', createRipple);
      });
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     9. FORM INTERACTIONS
  ══════════════════════════════════════════════ */
  const FormEffects = (() => {
    function floatLabel(input) {
      const label = input.previousElementSibling;
      if (!label || label.tagName !== 'LABEL') return;

      function update() {
        if (input.value || document.activeElement === input) {
          label.style.color = 'var(--gold)';
        } else {
          label.style.color = '';
        }
      }

      input.addEventListener('focus',  update);
      input.addEventListener('blur',   update);
      input.addEventListener('input',  update);
    }

    function init() {
      document.querySelectorAll('.form input, .form textarea, .form select').forEach(el => {
        floatLabel(el);
      });
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     10. CURSOR GLOW (desktop only)
  ══════════════════════════════════════════════ */
  const CursorGlow = (() => {
    function init() {
      if ('ontouchstart' in window) return;

      const glow = document.createElement('div');
      glow.style.cssText = `
        position: fixed;
        width: 320px; height: 320px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        background: radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: opacity 0.4s ease;
        opacity: 0;
        will-change: transform;
      `;
      document.body.appendChild(glow);

      let mouseX = 0, mouseY = 0;
      let glowX  = 0, glowY  = 0;
      let raf;

      document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.style.opacity = '1';
      });

      document.addEventListener('mouseleave', function () {
        glow.style.opacity = '0';
      });

      function animate() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        glow.style.left = glowX + 'px';
        glow.style.top  = glowY + 'px';
        raf = requestAnimationFrame(animate);
      }

      animate();
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     11. PERFORMANCE: Lazy image loading polyfill
  ══════════════════════════════════════════════ */
  const LazyImages = (() => {
    function init() {
      const images = document.querySelectorAll('img[loading="lazy"], .card__image img');

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              io.unobserve(img);
            }
          });
        }, { rootMargin: '200px' });

        images.forEach(img => io.observe(img));
      }
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     12. STATS COUNTER ANIMATION
  ══════════════════════════════════════════════ */
  const CounterAnimation = (() => {
    function animateCounter(el) {
      const target   = parseFloat(el.textContent.replace(/[^\d.]/g, ''));
      const suffix   = el.textContent.replace(/[\d.]/g, '');
      const duration = 1800;
      const start    = performance.now();
      const isFloat  = el.textContent.includes('.');

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease     = 1 - Math.pow(1 - progress, 3);
        const current  = target * ease;

        el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;

        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
      }

      requestAnimationFrame(step);
    }

    function init() {
      const counters = document.querySelectorAll('[data-counter]');
      if (!counters.length) return;

      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(el => io.observe(el));
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     13. PAGE LOADER (fade-in on load)
  ══════════════════════════════════════════════ */
  const PageLoader = (() => {
    function init() {
      document.documentElement.style.opacity = '0';
      document.documentElement.style.transition = 'opacity 0.6s ease';

      window.addEventListener('load', function () {
        requestAnimationFrame(() => {
          document.documentElement.style.opacity = '1';
        });
      });

      // Fallback
      setTimeout(() => {
        document.documentElement.style.opacity = '1';
      }, 1500);
    }

    return { init };
  })();

  /* ══════════════════════════════════════════════
     14. CART — удаление items, очистка, счётчик
  ══════════════════════════════════════════════ */
  const Cart = (() => {
    // Обновить счётчик в navbar
    function updateCount() {
      const items      = document.querySelectorAll('.cart-item');
      const countEl    = document.querySelector('.cart-count');
      const count      = items.length;

      if (countEl) {
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'inline-flex' : 'none';
      }

      // Показать empty state если корзина пуста
      const listWrap = document.querySelector('.cart-list');
      if (!listWrap) return;

      let emptyEl = listWrap.querySelector('.cart-empty');

      if (count === 0) {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.className = 'cart-empty reveal revealed';
          emptyEl.innerHTML = `
            <div class="cart-empty__icon">🏠</div>
            <div class="cart-empty__title">Корзина пуста</div>
            <p class="cart-empty__sub">Добавьте объекты которые вас интересуют</p>
            <a href="/properties/" class="button">Смотреть объекты</a>
          `;
          listWrap.appendChild(emptyEl);
        } else {
          emptyEl.style.display = '';
        }

        // Скрыть кнопку очистки и итого
        const clearBtn  = document.querySelector('.cart-clear');
        const summaryEl = document.querySelector('.cart-summary');
        if (clearBtn)  clearBtn.style.display  = 'none';
        if (summaryEl) summaryEl.style.opacity  = '0.4';
        if (summaryEl) summaryEl.style.pointerEvents = 'none';

      } else {
        if (emptyEl) emptyEl.style.display = 'none';
      }
    }

    // Удалить один item с анимацией
    function removeItem(btn) {
      const item = btn.closest('.cart-item');
      if (!item) return;

      item.style.transition = 'all 0.38s cubic-bezier(0.16,1,0.3,1)';
      item.style.opacity    = '0';
      item.style.transform  = 'translateX(40px)';
      item.style.maxHeight  = item.offsetHeight + 'px';

      setTimeout(() => {
        item.style.maxHeight  = '0';
        item.style.marginBottom = '0';
        item.style.overflow   = 'hidden';
      }, 200);

      setTimeout(() => {
        item.remove();
        updateCount();
        recalcTotal();
      }, 420);
    }

    // Пересчитать итоговую сумму
    function recalcTotal() {
      const items   = document.querySelectorAll('.cart-item');
      const totalEl = document.querySelector('.cart-summary__total-price');
      if (!totalEl) return;

      let total = 0;
      let hasRent = false;

      items.forEach(item => {
        const priceEl = item.querySelector('.card__price');
        if (!priceEl) return;

        const raw = priceEl.textContent;

        // Аренда — не суммируем, просто отмечаем
        if (raw.includes('мес')) {
          hasRent = true;
          return;
        }

        // Извлечь число
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) total += num;
      });

      // Форматировать
      const formatted = total.toLocaleString('ru-RU');
      totalEl.textContent = total > 0 ? `$${formatted}` : '—';

      // Обновить кол-во объектов
      const countRow = document.querySelector('.cart-summary__count');
      if (countRow) countRow.textContent = items.length;

      // Уведомление об аренде
      const rentNote = document.querySelector('.cart-rent-note');
      if (hasRent && rentNote) rentNote.style.display = '';
      if (!hasRent && rentNote) rentNote.style.display = 'none';
    }

    // Очистить всю корзину
    function clearAll() {
      const items = document.querySelectorAll('.cart-item');

      items.forEach((item, i) => {
        setTimeout(() => {
          item.style.transition = 'all 0.3s ease';
          item.style.opacity    = '0';
          item.style.transform  = 'translateX(40px)';

          setTimeout(() => {
            item.remove();
            if (i === items.length - 1) {
              updateCount();
              recalcTotal();
            }
          }, 320);
        }, i * 60);
      });
    }

    function init() {
      // Делегирование — кнопки "Удалить"
      document.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.cart-item__remove');
        if (removeBtn) removeItem(removeBtn);

        const clearBtn = e.target.closest('.cart-clear');
        if (clearBtn) {
          e.preventDefault();
          clearAll();
        }
      });

      // Первичный подсчёт
      updateCount();
      recalcTotal();
    }

    return { init, updateCount, recalcTotal };
  })();

  /* ══════════════════════════════════════════════
     THEME TOGGLE — light / dark mode
  ══════════════════════════════════════════════ */
  const ThemeToggle = (() => {
    const STORAGE_KEY = 'temur-theme';
    const html        = document.documentElement;

    // Sun SVG (shown in dark mode → click to go light)
    const SUN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2"  x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22"  x2="6.34" y2="6.34"/>
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
      <line x1="2"  y1="12" x2="5"  y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="4.22"  y1="19.78" x2="6.34"  y2="17.66"/>
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"/>
    </svg>`;

    // Moon SVG (shown in light mode → click to go dark)
    const MOON_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;

    function createButton() {
      const btn = document.createElement('button');
      btn.className   = 'theme-toggle';
      btn.setAttribute('aria-label', 'Переключить тему');
      btn.setAttribute('title', 'Переключить тему');
      btn.innerHTML = `
        <span class="theme-toggle__icon theme-toggle__sun">${SUN_SVG}</span>
        <span class="theme-toggle__icon theme-toggle__moon">${MOON_SVG}</span>
      `;
      return btn;
    }

    function getPreferred() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function apply(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
      // Update all toggle buttons on the page
      document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.setAttribute('aria-label', theme === 'dark'
          ? 'Переключить на светлую тему'
          : 'Переключить на тёмную тему');
      });
    }

    function toggle() {
      const current = html.getAttribute('data-theme') || 'dark';
      apply(current === 'dark' ? 'light' : 'dark');
    }

    function init() {
      // Apply saved/preferred theme immediately (no flash)
      apply(getPreferred());

      // Insert button into navbar (before the hamburger toggle)
      const navbarToggle = document.querySelector('.navbar__toggle');
      const navbar       = document.querySelector('.navbar');

      if (navbar) {
        const btn = createButton();
        btn.addEventListener('click', toggle);

        if (navbarToggle) {
          // Wrap toggle + theme btn in a controls group
          const controls = document.createElement('div');
          controls.className = 'navbar__controls';
          navbarToggle.parentNode.insertBefore(controls, navbarToggle);
          controls.appendChild(btn.cloneNode(true));
          controls.appendChild(navbarToggle);
          controls.querySelector('.theme-toggle').addEventListener('click', toggle);
        } else {
          navbar.appendChild(btn);
        }
      }

      // Listen for OS theme changes (if user hasn't manually set a preference)
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          apply(e.matches ? 'light' : 'dark');
        }
      });
    }

    return { init, toggle, apply };
  })();

  /* ══════════════════════════════════════════════
     INIT — Run everything on DOMContentLoaded
  ══════════════════════════════════════════════ */
  function init() {
    ThemeToggle.init();
    PageLoader.init();
    Navbar.init();
    ScrollSpy.init();
    SmoothScroll.init();
    Reveal.init();
    Search.init();
    Hero.init();
    CardInteractions.init();
    ButtonRipple.init();
    FormEffects.init();
    CursorGlow.init();
    LazyImages.init();
    CounterAnimation.init();
    Cart.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ============================================================
   TEMUR ESTATE — app.js
   DOM-only. No data arrays, no fake DB, no HTML generation.
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. NAVBAR — scroll shadow + mobile burger ────────────── */
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.navbar__toggle');
  const drawer = document.querySelector('.navbar__drawer');

  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      drawer.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close on drawer link click
    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        drawer.classList.contains('open') &&
        !drawer.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeDrawer();
      }
    });

    function closeDrawer() {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  /* ── 2. SEARCH FILTER — filters .card elements ────────────── */
  const searchInput = document.getElementById('search');
  const cardsWrap   = document.querySelector('.cards');

  if (searchInput && cardsWrap) {
    let timer;

    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(filterCards, 180);
    });
    searchInput.addEventListener('search', filterCards);

    function filterCards() {
      const query = searchInput.value.trim().toLowerCase();
      const cards = cardsWrap.querySelectorAll('.card');
      let visible = 0;

      cards.forEach(card => {
        const match = !query || card.textContent.toLowerCase().includes(query);
        card.classList.toggle('hidden', !match);
        if (match) visible++;
      });

      // "No results" message
      let msg = cardsWrap.querySelector('.cards__empty');
      if (visible === 0 && query) {
        if (!msg) {
          msg = document.createElement('p');
          msg.className = 'cards__empty';
          Object.assign(msg.style, {
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--muted)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            fontWeight: '300',
            letterSpacing: '.02em',
          });
          msg.textContent = 'По вашему запросу ничего не найдено';
          cardsWrap.appendChild(msg);
        }
      } else {
        msg && msg.remove();
      }
    }
  }

  /* ── 3. SCROLL REVEAL ────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');

  if (revealEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ── 4. CARD tilt micro-interaction ─────────────────────── */
  document.querySelectorAll('.card:not(.card--cart)').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform =
        `translateY(-6px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg)`;
      card.style.transition = 'transform 80ms linear, box-shadow 350ms cubic-bezier(.4,0,.2,1)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });

  /* ── 5. SMOOTH ANCHOR SCROLL ─────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top +
                     window.scrollY -
                     (navbar ? navbar.offsetHeight : 0) - 16;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ── 6. ACTIVE NAV LINK ───────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__nav a[href^="#"]');

  if (sections.length && navLinks.length) {
    const markActive = () => {
      const y = window.scrollY + (navbar ? navbar.offsetHeight : 0) + 40;
      let current = '';
      sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
      });
    };
    window.addEventListener('scroll', markActive, { passive: true });
    markActive();
  }

})();