/* Krasny Kon — shared script for all pages: scale (legacy pages), noise, header, menu, lead popup */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Breakpoints aligned with Figma layouts: Desktop >= 1024, Tablet 600..1023, Mobile <= 599
  const BP_DESKTOP = 1024;
  const BP_TABLET = 600;
  const isNarrow = () => root.clientWidth < BP_DESKTOP;

  /* ---------- 1. Fluid root scale (kept for legacy /neurovideo/ page; homepage uses CSS Container Queries) ---------- */
  const usesLegacyFluidScale = !root.classList.contains('home-page');
  function setScale() {
    if (!usesLegacyFluidScale) return;
    const w = root.clientWidth;
    let fs;
    if (w >= BP_DESKTOP) fs = Math.min(w / 128, 15);
    else if (w >= BP_TABLET) fs = w / 76.8;
    else fs = w / 41.2;
    root.style.fontSize = fs + 'px';
  }
  setScale();

  /* ---------- 2. Noise overlay (Figma Noise effect: #96A576 / 43%) ---------- */
  (function makeNoise() {
    const el = $('.noise');
    if (!el) return;
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      img.data[i * 4] = 150;
      img.data[i * 4 + 1] = 165;
      img.data[i * 4 + 2] = 118;
      img.data[i * 4 + 3] = Math.round(255 * (0.1 + (Math.random() - 0.5) * 0.16));
    }
    ctx.putImageData(img, 0, 0);
    el.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
    const tile = size / Math.min(window.devicePixelRatio || 1, 2);
    el.style.backgroundSize = tile + 'px ' + tile + 'px';
  })();

  /* ---------- 3. Header: hide on scroll down unless [data-static] ---------- */
  const header = $('#header');
  let lastY = window.scrollY;
  function onScrollHeader() {
    if (!header) return;
    const y = window.scrollY;
    if (body.classList.contains('is-locked') || header.hasAttribute('data-static')) return;
    if (y > lastY + 4 && y > header.offsetHeight) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 0) header.classList.remove('is-hidden');
    lastY = y;
  }

  /* ---------- 4. Menu overlay ---------- */
  const menu = $('#menu');
  const popup = $('#popup');

  function lockPage(on) {
    body.classList.toggle('is-locked', on);
    if (on && header) header.classList.remove('is-hidden');
  }

  let lastMenuFocus = null;
  function openMenu() {
    if (!menu) return;
    lastMenuFocus = document.activeElement;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    $$('[data-open-menu]').forEach(b => b.setAttribute('aria-expanded', 'true'));
    lockPage(true);
    const closeBtn = $('[data-close-menu]', menu);
    if (closeBtn) setTimeout(() => closeBtn.focus({ preventScroll: true }), 120);
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    $$('[data-open-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (!popup || !popup.classList.contains('is-open')) lockPage(false);
    if (lastMenuFocus && document.contains(lastMenuFocus)) {
      lastMenuFocus.focus({ preventScroll: true });
    }
  }

  $$('[data-open-menu]').forEach(b => b.addEventListener('click', openMenu));
  $$('[data-close-menu]').forEach(b => b.addEventListener('click', closeMenu));

  /* ---------- 5. Lead Popup ---------- */
  const form = $('#lead-form');
  const submitBtn = form ? $('.popup__submit', form) : null;
  const titleEl = popup ? $('[data-popup-title]', popup) : null;
  const subEl = popup ? $('[data-popup-sub]', popup) : null;
  const thanksTitleEl = popup ? $('[data-popup-thanks-title]', popup) : null;
  const thanksTextEl = popup ? $('[data-popup-thanks-text]', popup) : null;
  const DEFAULT_TITLE = titleEl ? titleEl.innerHTML : '';
  const DEFAULT_SUB = subEl ? subEl.innerHTML : '';
  let lastFocus = null;
  let doneTimer = null;

  function serviceFor(btn) {
    if (btn.dataset.service) return btn.dataset.service;
    const svc = btn.closest('.svc, [data-service-card]');
    if (svc) {
      const name = $('.svc__name, [data-service-title]', svc);
      if (name) return name.textContent.trim();
    }
    const offer = btn.closest('.offer, [data-offer-card]');
    if (offer) {
      const title = $('.offer__title, [data-offer-title]', offer);
      if (title) {
        const text = title.textContent.trim();
        return offer.closest('.packages, #packages') ? `Пакет «${text}»` : text;
      }
    }
    return '';
  }

  function openPopup(service = '') {
    if (!popup || !form) return;
    lastFocus = document.activeElement;
    clearTimeout(doneTimer);
    popup.classList.remove('is-done');
    if (submitBtn) submitBtn.disabled = false;
    if (menu && menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      $$('[data-open-menu]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
    if (titleEl && subEl) {
      if (service) {
        titleEl.textContent = 'Услуга';
        subEl.textContent = service;
      } else {
        titleEl.innerHTML = DEFAULT_TITLE;
        subEl.innerHTML = DEFAULT_SUB;
      }
    }
    if (form.elements.service) form.elements.service.value = service;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    lockPage(true);
    const firstInput = $('.field input', form);
    if (firstInput) setTimeout(() => firstInput.focus({ preventScroll: true }), 260);
  }

  function closePopup() {
    if (!popup) return;
    clearTimeout(doneTimer);
    const wasDone = popup.classList.contains('is-done');
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    lockPage(false);
    if (wasDone && form) {
      setTimeout(() => {
        popup.classList.remove('is-done');
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
      }, 350);
    }
    if (lastFocus && document.contains(lastFocus)) {
      lastFocus.focus({ preventScroll: true });
    }
  }

  document.addEventListener('click', e => {
    const openBtn = e.target.closest('[data-open-popup]');
    if (openBtn) {
      e.stopPropagation();
      openPopup(serviceFor(openBtn));
      return;
    }
    if (e.target.closest('[data-close-popup]')) {
      closePopup();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (popup && popup.classList.contains('is-open')) closePopup();
    else if (menu && menu.classList.contains('is-open')) closeMenu();
  });

  if (form) {
    const phoneInput = form.elements.phone;
    if (phoneInput) {
      phoneInput.addEventListener('input', () => {
        phoneInput.value = phoneInput.value.replace(/[^\d+()\-\s]/g, '');
      });
    }
    $$('input', form).forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.elements.name;
      const okName = name ? name.value.trim().length > 1 : true;
      const okPhone = phoneInput ? phoneInput.value.replace(/\D/g, '').length >= 10 : true;
      if (name) name.classList.toggle('is-invalid', !okName);
      if (phoneInput) phoneInput.classList.toggle('is-invalid', !okPhone);
      if (!okName || !okPhone) {
        (okName ? phoneInput : name)?.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      const isPreview = form.dataset.formMode === 'preview';

      // TODO (P0-F): connect backend endpoint / CRM delivery with anti-spam and 152-FZ consent.
      document.dispatchEvent(new CustomEvent('lead:submit', { detail: { ...data, preview: isPreview } }));

      if (isPreview && thanksTitleEl && thanksTextEl) {
        thanksTitleEl.textContent = 'Тестовый режим (preview)';
        thanksTextEl.textContent = 'Заявка не отправлена на сервер — подключение CRM запланировано на следующий этап. Для связи: +7 (3537) 42-00-20.';
      }

      if (submitBtn) submitBtn.disabled = true;
      popup.classList.add('is-done');
      doneTimer = setTimeout(closePopup, isPreview ? 5000 : 3500);
    });
  }

  window.addEventListener('scroll', onScrollHeader, { passive: true });
  window.addEventListener('resize', setScale);

  // Shared API for page scripts (/ and /neurovideo/)
  window.KK = { $, $$, isNarrow, lockPage, header, openPopup, closePopup, BP_DESKTOP, BP_TABLET };
})();
