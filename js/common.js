/* Красный конь — общее для всех страниц: масштаб, шум, шапка, меню, поп-ап */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  // Раскладки как в Figma: Desktop 1280 (от 1024px), Tablet 768 (600–1023px), mobile 412 (до 599px)
  const BP_DESKTOP = 1024, BP_TABLET = 600;
  const isNarrow = () => root.clientWidth < BP_DESKTOP;

  /* ---------- 1. Масштаб: 1rem = 10px макета текущей раскладки ---------- */
  function setScale() {
    const w = root.clientWidth;
    let fs;
    if (w >= BP_DESKTOP) fs = Math.min(w / 128, 15);
    else if (w >= BP_TABLET) fs = w / 76.8;
    else fs = w / 41.2;
    root.style.fontSize = fs + 'px';
  }
  setScale();

  /* ---------- 2. Noise overlay (в Figma — эффект Noise: #96A576 / 43%) ---------- */
  (function makeNoise() {
    const el = $('.noise');
    if (!el) return;
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(size, size);
    // Figma рисует шум субпиксельно, поэтому на экране он даёт мягкое зерно:
    // в среднем ~10% зелёного с небольшим разбросом (подобрано по пикселям макета)
    for (let i = 0; i < size * size; i++) {
      img.data[i * 4] = 150;
      img.data[i * 4 + 1] = 165;
      img.data[i * 4 + 2] = 118;
      img.data[i * 4 + 3] = Math.round(255 * (0.1 + (Math.random() - 0.5) * 0.16));
    }
    ctx.putImageData(img, 0, 0);
    el.style.backgroundImage = `url(${c.toDataURL('image/png')})`;
    // одна «песчинка» = один физический пиксель, как мелкое зерно Noise в Figma
    const tile = size / Math.min(window.devicePixelRatio || 1, 2);
    el.style.backgroundSize = tile + 'px ' + tile + 'px';
  })();

  /* ---------- 3. Header: прячется при скролле вниз, показывается при скролле вверх ---------- */
  const header = $('#header');
  let lastY = window.scrollY;
  function onScrollHeader() {
    const y = window.scrollY;
    if (body.classList.contains('is-locked') || header.hasAttribute('data-static')) return;
    if (y > lastY + 4 && y > header.offsetHeight) header.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 0) header.classList.remove('is-hidden');
    lastY = y;
  }

  /* ---------- 11. Меню ---------- */
  const menu = $('#menu');
  function lockPage(on) {
    body.classList.toggle('is-locked', on);
    if (on) header.classList.remove('is-hidden');
  }
  function openMenu() { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); lockPage(true); }
  function closeMenu() { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); if (!popup.classList.contains('is-open')) lockPage(false); }
  $$('[data-open-menu]').forEach(b => b.addEventListener('click', openMenu));
  $$('[data-close-menu]').forEach(b => b.addEventListener('click', closeMenu));

  /* ---------- 12. Поп-ап «Познакомимся?» ---------- */
  const popup = $('#popup');
  const form = $('#lead-form');
  const submitBtn = $('.popup__submit', form);
  const titleEl = $('[data-popup-title]', popup);
  const subEl = $('[data-popup-sub]', popup);
  const DEFAULT_TITLE = titleEl.innerHTML;
  const DEFAULT_SUB = subEl.innerHTML;
  let lastFocus = null, doneTimer = null;

  // Из карточки услуги или пакета форма открывается в варианте «Услуга: …» (компонент «popup услуг» в Figma)
  function serviceFor(btn) {
    if (btn.dataset.service) return btn.dataset.service;
    const svc = btn.closest('.svc');
    if (svc) return $('.svc__name', svc).textContent.trim();
    const offer = btn.closest('.offer');
    if (offer) {
      const title = $('.offer__title', offer).textContent.trim();
      return offer.closest('.packages') ? `Пакет «${title}»` : title;
    }
    return '';
  }

  function openPopup(service = '') {
    lastFocus = document.activeElement;
    clearTimeout(doneTimer);
    popup.classList.remove('is-done');
    if (menu.classList.contains('is-open')) { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); }
    if (service) { titleEl.textContent = 'Услуга'; subEl.textContent = service; }
    else { titleEl.innerHTML = DEFAULT_TITLE; subEl.innerHTML = DEFAULT_SUB; }
    form.elements.service.value = service;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    lockPage(true);
    setTimeout(() => $('.field input', form).focus({ preventScroll: true }), 350);
  }
  function closePopup() {
    clearTimeout(doneTimer);
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
    lockPage(false);
    if (popup.classList.contains('is-done')) {
      setTimeout(() => { popup.classList.remove('is-done'); form.reset(); submitBtn.disabled = false; }, 400);
    }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $$('[data-open-popup]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openPopup(serviceFor(b)); }));
  $$('[data-close-popup]').forEach(b => b.addEventListener('click', closePopup));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (popup.classList.contains('is-open')) closePopup();
    else if (menu.classList.contains('is-open')) closeMenu();
  });

  const phoneInput = form.elements.phone;
  phoneInput.addEventListener('input', () => { phoneInput.value = phoneInput.value.replace(/[^\d+()\-\s]/g, ''); });
  $$('input', form).forEach(i => i.addEventListener('input', () => i.classList.remove('is-invalid')));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name;
    const okName = name.value.trim().length > 1;
    const okPhone = phoneInput.value.replace(/\D/g, '').length >= 10;
    name.classList.toggle('is-invalid', !okName);
    phoneInput.classList.toggle('is-invalid', !okPhone);
    if (!okName || !okPhone) { (okName ? phoneInput : name).focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    // TODO: подключить отправку заявки (CRM / почта / Telegram-бот). Сейчас данные только передаются в событие.
    document.dispatchEvent(new CustomEvent('lead:submit', { detail: data }));

    submitBtn.disabled = true;
    popup.classList.add('is-done'); // «Спасибо за письмо!»
    doneTimer = setTimeout(closePopup, 3500);
  });

  window.addEventListener('scroll', onScrollHeader, { passive: true });
  window.addEventListener('resize', setScale);

  // Общий доступ для скриптов конкретных страниц
  window.KK = { $, $$, isNarrow, lockPage, header, openPopup, BP_DESKTOP, BP_TABLET };
})();
