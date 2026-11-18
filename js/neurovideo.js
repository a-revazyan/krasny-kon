/* Нейровидео: слайдер / список / плеер (логика по референсу jasonbergh.com) */
(() => {
  const { $, $$, isNarrow, lockPage } = window.KK;
  const { base, categories, works } = window.NV;
  const html = document.documentElement;
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ORN = ['orn-flower-lined', 'orn-star', 'orn-flower-lined'];
  const videoUrl = f => base + 'video/' + f;
  const posterUrl = w => base + 'posters/' + w.poster;
  const pad = n => String(n).padStart(2, '0');
  const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${pad(s % 60)}`; };
  const clock = s => { s = Math.max(0, Math.floor(s || 0)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
  const timecode = s => { s = Math.max(0, s || 0); const f = Math.floor((s % 1) * 25); s = Math.floor(s); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f)}`; };
  const totalDur = w => w.parts.reduce((a, p) => a + p.duration, 0);
  const durLabel = w => {
    const eps = w.parts.filter(p => /^Серия/.test(p.label)).length;
    return eps ? `${eps} ${eps < 5 ? 'серии' : 'серий'} · ${mmss(totalDur(w))}` : mmss(totalDur(w));
  };
  const typo = t => t.replace(/(^|[\s«„(])([а-яёА-ЯЁ]{1,2})\s+/g, '$1$2 ');

  /* ---------- Разметка ---------- */
  const slider = $('[data-slider]');
  const list = $('[data-list]');
  works.forEach((w, i) => {
    const n = pad(i + 1);
    const cat = categories[w.cat];
    const orient = w.parts[0].orientation || w.orientation || 'h';
    const ar = { h: [16, 9], v: [9, 16], s: [4, 3] }[orient] || [16, 9]; // родные пропорции — для телефона

    const slide = document.createElement('article');
    slide.className = 'nv-slide';
    slide.dataset.index = i;
    slide.innerHTML = `
      <h2 class="nv-slide__title">${w.title}</h2>
      <div class="nv-slide__meta">
        <span class="nv-slide__cat">${cat}</span>
        <span class="nv-orn" aria-hidden="true">${ORN.map(o => `<img src="../assets/img/${o}.svg" alt="">`).join('')}</span>
        <span class="nv-slide__kind">${w.kind}</span>
      </div>
      <div class="nv-frame">
        <div class="nv-frame__box${orient === 'h' ? '' : ' is-fit'}" style="--ar:${ar[0]} / ${ar[1]};--arn:${(ar[0] / ar[1]).toFixed(4)}" role="button" tabindex="0" aria-label="Смотреть: ${w.title}">
          ${orient === 'h' ? '' : `<img class="nv-frame__blur" src="${posterUrl(w)}" alt="" loading="lazy">`}
          <img src="${posterUrl(w)}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}">
          <span class="nv-frame__corners" aria-hidden="true"></span>
          <span class="nv-play"><img src="../assets/img/play.svg" alt="">смотреть</span>
        </div>
      </div>
      <div class="nv-slide__foot"><span>${n}.</span><span>${durLabel(w)}</span></div>`;
    slider.appendChild(slide);

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'nv-row';
    row.dataset.index = i;
    row.innerHTML = `
      <span class="nv-row__num">${n}.</span>
      <span class="nv-row__main">
        <span class="nv-row__title"><img src="../assets/img/triangle-red.svg" alt="">${w.title}</span>
        <span class="nv-row__sub"><b>${cat}</b> · ${w.kind}</span>
      </span>
      <span class="nv-row__thumb"><img src="${posterUrl(w)}" alt="" loading="lazy"><span class="nv-row__dur">${durLabel(w)}</span></span>`;
    list.appendChild(row);
  });
  const slides = $$('.nv-slide', slider);
  const rows = $$('.nv-row', list);

  /* ---------- Заставка ---------- */
  (function intro() {
    const counter = $('[data-intro-count]');
    let seen = false;
    try { seen = sessionStorage.getItem('nv-intro') === '1'; sessionStorage.setItem('nv-intro', '1'); } catch (e) { /* приватный режим */ }
    if (reduced || seen) { body.classList.remove('is-loading'); return; }
    const t0 = performance.now(), D = 1300;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / D);
      counter.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(() => body.classList.remove('is-loading'), 150);
    })(t0);
  })();

  /* ---------- Линейки по краям: числа «кадров», едут со скроллом ---------- */
  const rulers = $$('[data-ruler]');
  rulers.forEach(r => { r.innerHTML = Array.from({ length: 60 }, (_, k) => `<span>${(k * 10 + 100) % 1000}</span>`).join(''); });
  function moveRulers() {
    const step = parseFloat(getComputedStyle(html).fontSize) * 8; // высота деления 8rem
    const off = -((window.scrollY * .35) % (step * 10));
    rulers.forEach((r, k) => { r.style.transform = `translateY(${k ? -off - step * 10 : off}px)`; });
  }

  /* ---------- Размытый фон ---------- */
  const bgA = $('[data-bg-a]'), bgB = $('[data-bg-b]');
  let bgFront = bgA, bgSrc = '';
  function setBg(w) {
    const src = posterUrl(w);
    if (src === bgSrc) return;
    bgSrc = src;
    const next = bgFront === bgA ? bgB : bgA;
    next.onload = () => { next.classList.add('is-on'); bgFront.classList.remove('is-on'); bgFront = next; };
    next.src = src;
  }

  /* ---------- Превью-видео (без звука) ---------- */
  function previewIn(box, w) {
    let v = $('video', box);
    if (!v) {
      v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.src = videoUrl(w.parts[0].video);
      v.addEventListener('playing', () => v.classList.add('is-ready'));
      box.insertBefore(v, $('.nv-frame__corners', box));
    }
    v.play().catch(() => {});
    return v;
  }
  const stopPreview = box => { const v = box && $('video', box); if (v) v.pause(); };

  /* ---------- Слайдер: активный слайд играет, остальные стоят ---------- */
  let activeSlide = null, activeVideo = null;
  function activate(slide) {
    if (activeSlide === slide) return;
    if (activeSlide) { activeSlide.classList.remove('is-active'); stopPreview($('.nv-frame__box', activeSlide)); }
    activeSlide = slide;
    if (!slide) { activeVideo = null; return; }
    slide.classList.add('is-active');
    const w = works[+slide.dataset.index];
    setBg(w);
    if (!player.classList.contains('is-open') && !html.classList.contains('is-list')) activeVideo = previewIn($('.nv-frame__box', slide), w);
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting && e.intersectionRatio >= .55) activate(e.target); });
  }, { threshold: [.55] });
  slides.forEach(s => io.observe(s));

  slides.forEach(s => {
    const box = $('.nv-frame__box', s);
    const open = () => openPlayer(+s.dataset.index);
    box.addEventListener('click', open);
    box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  /* ---------- Таймкод активного видео ---------- */
  const tcEl = $('[data-timecode]');
  requestAnimationFrame(function tc() { // первый кадр — уже после объявления плеера ниже
    const v = player.classList.contains('is-open') ? pVideo : activeVideo;
    tcEl.textContent = timecode(v ? v.currentTime : 0);
    requestAnimationFrame(tc);
  });

  /* ---------- Список ---------- */
  rows.forEach(r => {
    const w = works[+r.dataset.index];
    const thumb = $('.nv-row__thumb', r);
    r.addEventListener('mouseenter', () => { setBg(w); if (matchMedia('(hover: hover)').matches) activeVideo = previewIn(thumb, w); });
    r.addEventListener('mouseleave', () => stopPreview(thumb));
    r.addEventListener('focus', () => setBg(w));
    r.addEventListener('click', () => openPlayer(+r.dataset.index));
  });

  /* ---------- Вид: слайдер / список ---------- */
  function setView(view) {
    const isList = view === 'list';
    html.classList.toggle('is-list', isList);
    slider.hidden = isList;
    list.hidden = !isList;
    $$('[data-view]').forEach(b => b.classList.toggle('is-active', b.dataset.view === view));
    if (activeSlide) stopPreview($('.nv-frame__box', activeSlide));
    activeSlide = null;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!isList) requestAnimationFrame(() => activate(visibleSlides()[0] || null));
    try { localStorage.setItem('nv-view', view); } catch (e) { /* ignore */ }
  }
  $$('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

  /* ---------- Фильтр по категориям: выпадающий список вверх ---------- */
  const filter = $('[data-filter]');
  const fToggle = $('[data-filter-toggle]', filter);
  const fCats = $('[data-cats]', filter);
  const countOf = id => (id === 'all' ? works.length : works.filter(w => w.cat === id).length);
  const catName = id => (id === 'all' ? 'Все' : categories[id]);
  fCats.innerHTML = ['all', ...Object.keys(categories)]
    .map(id => `<button type="button" role="menuitemradio" data-cat="${id}"><i></i>${catName(id)} <em>(${countOf(id)})</em></button>`).join('');
  let currentCat = 'all';
  const visibleSlides = () => slides.filter(s => !s.hidden);
  const visibleIdx = () => works.map((w, i) => i).filter(i => currentCat === 'all' || works[i].cat === currentCat);
  const setOpen = on => { filter.classList.toggle('is-open', on); fToggle.setAttribute('aria-expanded', String(on)); };
  function setCat(cat) {
    currentCat = cat;
    $$('[data-cat]', fCats).forEach(b => { const on = b.dataset.cat === cat; b.classList.toggle('is-active', on); b.setAttribute('aria-checked', String(on)); });
    $('[data-filter-label]', filter).textContent = catName(cat);
    $('[data-count]', filter).textContent = `(${countOf(cat)})`;
    works.forEach((w, i) => { const show = cat === 'all' || w.cat === cat; slides[i].hidden = !show; rows[i].hidden = !show; });
    setOpen(false);
    if (activeSlide) stopPreview($('.nv-frame__box', activeSlide));
    activeSlide = null;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!html.classList.contains('is-list')) requestAnimationFrame(() => activate(visibleSlides()[0] || null));
  }
  fToggle.addEventListener('click', () => setOpen(!filter.classList.contains('is-open')));
  fCats.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) setCat(b.dataset.cat); });
  document.addEventListener('click', e => { if (!filter.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  setCat('all');
  html.classList.remove('nv-snap'); // setCat прокрутил наверх; привязка включится ниже

  /* ---------- Плеер ---------- */
  const player = $('#player');
  const pVideo = $('[data-player-video]', player);
  const pTitle = $('[data-player-title]', player);
  const pKind = $('[data-player-kind]', player);
  const pParts = $('[data-player-parts]', player);
  const pCounter = $('[data-player-counter]', player);
  const pFill = $('[data-player-fill]', player);
  const pBuf = $('[data-player-buffer]', player);
  const pTime = $('[data-player-time]', player);
  const pDur = $('[data-player-duration]', player);
  const pMute = $('[data-player-mute]', player);
  const pPlay = $('[data-player-play]', player);
  const pLoading = $('[data-player-loading]', player);
  const progress = $('[data-player-progress]', player);
  const info = $('[data-info]', player);
  const ctaBtn = $('[data-service-from-player]', player);
  let cur = 0, curPart = 0, lastFocus = null;

  function renderInfo(w) {
    const order = visibleIdx();
    const pos = order.indexOf(cur) + 1;
    $('[data-info-counter]', info).textContent = `${pos} / ${order.length}`;
    $('[data-info-cat]', info).textContent = `${categories[w.cat]} / ${w.kind}`;
    $('[data-info-title]', info).textContent = w.title;
    $('[data-info-about]', info).textContent = typo(w.about);
    const facts = [['Хронометраж', durLabel(w)], ['Формат', { h: 'горизонтальный 16:9', v: 'вертикальный 9:16', s: '4:3' }[w.orientation] || '16:9']];
    $('[data-info-facts]', info).innerHTML = facts.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('')
      + (w.spec ? '<li class="is-spec"><span>Концепт</span><span>spec-реклама</span></li>' : '');
    ctaBtn.dataset.service = `Нейровидео: похожее на «${w.title}»`;
  }

  function loadPart(k, autoplay = true) {
    const w = works[cur];
    curPart = Math.max(0, Math.min(w.parts.length - 1, k));
    $$('button', pParts).forEach((b, j) => b.classList.toggle('is-active', j === curPart));
    pLoading.classList.add('is-on');
    pVideo.src = videoUrl(w.parts[curPart].video);
    pVideo.poster = posterUrl(w);
    pFill.style.width = pBuf.style.width = '0';
    pTime.textContent = '00:00';
    pDur.textContent = clock(w.parts[curPart].duration);
    if (autoplay) play();
  }

  function play() {
    pVideo.play().catch(() => {
      // браузер не дал включить звук без жеста (например, при открытии по ссылке) — запускаем без звука
      pVideo.muted = true; syncMute();
      pVideo.play().catch(() => {});
    });
  }

  function show(i, part = 0) {
    const order = visibleIdx();
    if (!order.includes(i)) i = order[0];
    cur = i;
    const w = works[cur];
    pTitle.textContent = w.title;
    pKind.textContent = `${categories[w.cat]} / ${w.kind}`;
    pCounter.textContent = `${pad(order.indexOf(cur) + 1)} / ${pad(order.length)}`;
    pParts.innerHTML = w.parts.length > 1 ? w.parts.map((p, j) => `<button type="button" data-part="${j}">${p.label}</button>`).join('') : '';
    renderInfo(w);
    setBg(w);
    loadPart(part);
    history.replaceState(null, '', '#' + w.slug);
  }

  function openPlayer(i, { muted = false } = {}) {
    lastFocus = document.activeElement;
    if (activeVideo) activeVideo.pause();
    pVideo.muted = muted; syncMute();
    player.classList.add('is-open');
    player.setAttribute('aria-hidden', 'false');
    body.classList.add('is-player-open');
    lockPage(true);
    show(i);
    $('[data-player-close]', player).focus({ preventScroll: true });
  }

  function closePlayer() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    closeInfo();
    pVideo.pause();
    pVideo.removeAttribute('src'); pVideo.load();
    player.classList.remove('is-open');
    player.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-player-open');
    lockPage(false);
    history.replaceState(null, '', location.pathname + location.search);
    // вернуться к той же работе в слайдере/списке
    const target = html.classList.contains('is-list') ? rows[cur] : slides[cur];
    if (target && !target.hidden) target.scrollIntoView({ behavior: 'instant', block: html.classList.contains('is-list') ? 'center' : 'start' });
    if (!html.classList.contains('is-list')) { activeSlide = null; activate(slides[cur]); }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  function go(dir) {
    const order = visibleIdx();
    const k = (order.indexOf(cur) + dir + order.length) % order.length;
    show(order[k]);
  }

  const syncMute = () => { pMute.textContent = pVideo.muted ? 'звук: выкл' : 'звук: вкл'; };
  const syncPlay = () => { pPlay.textContent = pVideo.paused ? 'смотреть' : 'пауза'; };
  const togglePlay = () => { if (pVideo.paused) play(); else pVideo.pause(); };

  pVideo.addEventListener('click', togglePlay);
  pVideo.addEventListener('play', syncPlay);
  pVideo.addEventListener('pause', syncPlay);
  pVideo.addEventListener('playing', () => pLoading.classList.remove('is-on'));
  pVideo.addEventListener('waiting', () => pLoading.classList.add('is-on'));
  pVideo.addEventListener('loadedmetadata', () => { pDur.textContent = clock(pVideo.duration); });
  pVideo.addEventListener('timeupdate', () => {
    if (!scrubbing) pFill.style.width = (pVideo.currentTime / (pVideo.duration || 1)) * 100 + '%';
    pTime.textContent = clock(pVideo.currentTime);
  });
  pVideo.addEventListener('progress', () => {
    const b = pVideo.buffered;
    if (b.length) pBuf.style.width = (b.end(b.length - 1) / (pVideo.duration || 1)) * 100 + '%';
  });
  pVideo.addEventListener('ended', () => {
    const w = works[cur];
    if (curPart < w.parts.length - 1) loadPart(curPart + 1); else go(1); // следующая серия, затем следующая работа
  });

  // перемотка: клик и перетаскивание по шкале
  let scrubbing = false;
  const seekTo = x => {
    const r = progress.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (x - r.left) / r.width));
    pFill.style.width = p * 100 + '%';
    if (pVideo.duration) pVideo.currentTime = p * pVideo.duration;
  };
  progress.addEventListener('pointerdown', e => { scrubbing = true; progress.setPointerCapture(e.pointerId); seekTo(e.clientX); });
  progress.addEventListener('pointermove', e => { if (scrubbing) seekTo(e.clientX); });
  progress.addEventListener('pointerup', () => { scrubbing = false; });
  progress.addEventListener('pointercancel', () => { scrubbing = false; });

  pParts.addEventListener('click', e => { const b = e.target.closest('[data-part]'); if (b) loadPart(+b.dataset.part); });
  pMute.addEventListener('click', () => { pVideo.muted = !pVideo.muted; syncMute(); });
  pPlay.addEventListener('click', togglePlay);
  $$('[data-player-prev]', player).forEach(b => b.addEventListener('click', () => go(-1)));
  $$('[data-player-next]', player).forEach(b => b.addEventListener('click', () => go(1)));
  $('[data-player-close]', player).addEventListener('click', closePlayer);
  $('[data-player-fs]', player).addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (player.requestFullscreen) player.requestFullscreen().catch(() => {});
    else if (pVideo.webkitEnterFullscreen) pVideo.webkitEnterFullscreen(); // iPhone
  });

  function openInfo() { info.classList.add('is-open'); info.setAttribute('aria-hidden', 'false'); }
  function closeInfo() { info.classList.remove('is-open'); info.setAttribute('aria-hidden', 'true'); }
  $('[data-player-info]', player).addEventListener('click', () => (info.classList.contains('is-open') ? closeInfo() : openInfo()));
  $('[data-info-close]', info).addEventListener('click', closeInfo);
  // из плеера форма открывается поверх: ставим видео на паузу
  ctaBtn.addEventListener('click', () => pVideo.pause());

  document.addEventListener('keydown', e => {
    if (!player.classList.contains('is-open') || $('#popup').classList.contains('is-open')) return;
    if (e.key === 'Escape') { if (info.classList.contains('is-open')) closeInfo(); else closePlayer(); }
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); togglePlay(); }
    else if (e.key === 'm' || e.key === 'ь') { pVideo.muted = !pVideo.muted; syncMute(); }
  });

  /* ---------- Старт ---------- */
  let startView = 'slider';
  try { startView = localStorage.getItem('nv-view') || 'slider'; } catch (e) { /* ignore */ }
  if (startView === 'list') setView('list');
  window.addEventListener('scroll', moveRulers, { passive: true });
  window.addEventListener('resize', moveRulers);
  moveRulers();
  setBg(works[0]);
  window.scrollTo(0, 0);
  requestAnimationFrame(() => html.classList.add('nv-snap'));

  // ссылка вида /neurovideo/#son-raskolnikova открывает работу сразу (без звука — браузеры его блокируют без клика)
  const fromHash = works.findIndex(w => '#' + w.slug === location.hash);
  if (fromHash >= 0) openPlayer(fromHash, { muted: true });
})();
