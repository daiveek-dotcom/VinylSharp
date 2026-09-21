/* Vinyl Sharp — light interactions. No dependencies. */
(function () {
  'use strict';

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var body = document.body;
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Sticky header shadow on scroll */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Keep the mobile nav panel anchored exactly below the header, even while
     the announcement bar above it is still in normal flow (pre-scroll). */
  if (header) {
    var setHeaderOffset = function () {
      document.documentElement.style.setProperty('--header-offset', header.getBoundingClientRect().bottom + 'px');
    };
    setHeaderOffset();
    window.addEventListener('resize', setHeaderOffset);
    window.addEventListener('scroll', setHeaderOffset, { passive: true });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Single-open FAQ (native <details>) */
  var faqItems = document.querySelectorAll('.faq details, details.faq-item');
  faqItems.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        faqItems.forEach(function (other) { if (other !== d) other.open = false; });
      }
    });
  });

  /* Contact form — graceful client-side handling + honest success state.
     Wire action/endpoint in contact.html; this only manages UX + validation. */
  var form = document.querySelector('form[data-contact]');
  if (form) {
    var status = form.querySelector('.form-status');
    var setStatus = function (type, msg) {
      if (!status) return;
      status.className = 'form-status ' + type;
      status.textContent = msg;
    };
    form.addEventListener('submit', function (e) {
      var endpoint = form.getAttribute('action');
      // If no real endpoint is configured, prevent silent failure and tell the user.
      if (!endpoint || endpoint === '#') {
        e.preventDefault();
        setStatus('err', 'Form endpoint not connected yet. Please email support@vinylsharp.com or message us on WhatsApp.');
        return;
      }
      var consent = form.querySelector('#consent');
      if (consent && !consent.checked) {
        e.preventDefault();
        setStatus('err', 'Please tick the consent box so we can reply to you.');
        return;
      }
      // Real endpoint present: allow native submit; show pending state.
      setStatus('ok', 'Sending…');
    });
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero parallax — background photo drifts slower than the page scrolls.
     Purely decorative; the image is pre-scaled in CSS so drift never shows
     an edge. Respects reduced-motion. */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduceMotion) {
    var heroTicking = false;
    var parallaxHero = function () {
      var shift = Math.min(window.scrollY * 0.25, 90);
      heroBg.style.transform = 'scale(1.12) translateY(' + shift + 'px)';
      heroTicking = false;
    };
    var onParallaxScroll = function () {
      if (!heroTicking) {
        window.requestAnimationFrame(parallaxHero);
        heroTicking = true;
      }
    };
    parallaxHero();
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
  }

  /* Hero vinyl = "next section" button. Each click glides to the next section
     below the current viewport top; from the last section it returns to top. */
  var nextBtn = document.querySelector('[data-scroll-next]');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      nextBtn.classList.remove('is-clicked');
      void nextBtn.offsetWidth;
      nextBtn.classList.add('is-clicked');
      var headerH = header ? header.getBoundingClientRect().height : 0;
      var blocks = Array.prototype.slice.call(document.querySelectorAll('main > section'));
      var target = null;
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].getBoundingClientRect().top > headerH + 24) { target = blocks[i]; break; }
      }
      var behavior = reduceMotion ? 'auto' : 'smooth';
      if (target) {
        var top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: behavior });
      } else {
        window.scrollTo({ top: 0, behavior: behavior });
      }
    });
  }

  /* "Browse the crates" tiles — every 2 days each tile swaps to a fresh set of
     4 real covers from its pool (assets/js/crates-data.js, built from
     shop.vinylsharp.com by tools/refresh-crates.py). Deterministic by date, so
     every visitor sees the same set; no server needed. */
  var pools = window.VS_CRATES;
  if (pools) {
    var TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    var period = Math.floor(Date.now() / TWO_DAYS);
    document.querySelectorAll('[data-crate]').forEach(function (tile) {
      var pool = pools[tile.getAttribute('data-crate')];
      if (!pool || !pool.length) return;
      tile.querySelectorAll('.tile-collage img').forEach(function (img, i) {
        img.src = pool[(period * 4 + i) % pool.length];
      });
    });
  }

  /* "Record of the week" — a small rotating showcase in the hero, linking
     straight to a real product page on shop.vinylsharp.com. This is a
     client-side rotation over a short curated list of real, verified
     products (deterministic by ISO week number, so every visitor sees the
     same pick and it changes on its own about once a week) — not a live
     feed. HANDOFF: swap this list for an actual "best sellers" API/feed
     from the shop once one exists. */
  var potw = document.querySelector('[data-potw]');
  if (potw) {
    var featuredRecords = [
      { id: '228231', title: 'The Dark Side of the Moon', artist: 'Pink Floyd', img: 'assets/img/albums/dark-side-of-the-moon.jpg' },
      { id: '295005', title: 'Thriller', artist: 'Michael Jackson', img: 'assets/img/albums/thriller.jpg' },
      { id: '290424', title: 'Abbey Road', artist: 'The Beatles', img: 'assets/img/albums/abbey-road.jpg' },
      { id: '230319', title: 'Rumours', artist: 'Fleetwood Mac', img: 'assets/img/albums/rumours.jpg' },
      { id: '269333', title: 'AM', artist: 'Arctic Monkeys', img: 'assets/img/albums/am.jpg' },
      { id: '265033', title: 'Nevermind', artist: 'Nirvana', img: 'assets/img/albums/nevermind.jpg' }
    ];
    var now = new Date();
    var startOfYear = new Date(now.getFullYear(), 0, 1);
    var weekNumber = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    var pick = featuredRecords[weekNumber % featuredRecords.length];
    potw.href = 'https://shop.vinylsharp.com/records/' + pick.id;
    var potwImg = potw.querySelector('img');
    if (potwImg) { potwImg.src = pick.img; potwImg.alt = pick.title + ' — ' + pick.artist + ' vinyl record'; }
    var potwTitle = potw.querySelector('.potw-title');
    if (potwTitle) potwTitle.textContent = pick.title;
    var potwArtist = potw.querySelector('.potw-artist');
    if (potwArtist) potwArtist.textContent = pick.artist;
  }

  /* Footer year */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
