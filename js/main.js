/* Красный конь — главная страница (общая часть — в common.js) */
(() => {
  const { $, $$, isNarrow, header } = window.KK;
  const root = document.documentElement;
  const body = document.body;

  /* ---------- 4. Первый экран ---------- */
  const hero = $('#hero');
  const playBtn = $('[data-hero-play]', hero);
  let step = 0;
  let stepLockedUntil = 0;
  const STEP_DURATION = 1000; // Smart animate в прототипе ≈ 1.02 с

  function textOut() { hero.classList.add('is-text-out'); }
  // «Студия дизайна» уезжает через 2 секунды (After delay 2s в прототипе)
  const textTimer = setTimeout(textOut, 2000);

  function setStep(n, { instant = false } = {}) {
    n = Math.max(0, Math.min(3, n));
    if (n === step) return;
    if (instant) {
      hero.classList.add('no-anim');
      $$('.hero-card, .hero__btn, .hero__intro, .hero__play', hero).forEach(el => (el.style.transition = 'none'));
    }
    step = n;
    hero.dataset.step = String(n);
    hero.classList.toggle('is-s1', n >= 1);
    hero.classList.toggle('is-s2', n >= 2);
    hero.classList.toggle('is-s3', n >= 3);
    if (n >= 1) {
      clearTimeout(textTimer);
      textOut();
      body.classList.remove('is-intro');
    }
    stepLockedUntil = performance.now() + STEP_DURATION;
    if (instant) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        $$('.hero-card, .hero__btn, .hero__intro, .hero__play', hero).forEach(el => (el.style.transition = ''));
        hero.classList.remove('no-anim');
      }));
    }
  }

  function advance() {
    if (performance.now() < stepLockedUntil) return;
    if (step >= 1 && step < 3) setStep(step + 1);
  }

  playBtn.addEventListener('click', () => setStep(isNarrow() ? 3 : 1));

  $$('[data-hero-next]', hero).forEach(btn => btn.addEventListener('click', () => {
    if (step < 3) setStep(step + 1);
    else $('.dark').scrollIntoView({ behavior: 'smooth' });
  }));

  function nudgePlay() {
    playBtn.classList.remove('is-nudge');
    void playBtn.offsetWidth;
    playBtn.classList.add('is-nudge');
  }

  // Подгоняем «Студия дизайна» под высоту экрана, чтобы подпись не наезжала на заголовок
  function fitIntro() {
    const rem = parseFloat(root.style.fontSize) || 10;
    const avail = hero.clientHeight - (7.4 + 7.3) * rem;
    const scale = Math.max(0.55, Math.min(1, avail / (55.5 * rem)));
    hero.style.setProperty('--intro-scale', scale.toFixed(3));
  }

  // Экран не листается, пока не нажмёшь «Play». Дальше — горизонтальная анимация по скроллу.
  const heroAtTop = () => window.scrollY <= 2;
  const gatesScroll = () => !isNarrow() && step < 3 && heroAtTop() && !body.classList.contains('is-locked');

  let lastWheelTs = 0;
  window.addEventListener('wheel', e => {
    const now = performance.now();
    const newGesture = now - lastWheelTs > 250; // отсекаем инерцию тачпада
    lastWheelTs = now;
    if (!gatesScroll() || e.deltaY <= 0) return;
    e.preventDefault();
    if (step === 0) { if (newGesture) nudgePlay(); return; }
    if (newGesture) advance();
  }, { passive: false });

  let touchStartY = null, touchUsed = false;
  window.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; touchUsed = false; }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (touchStartY === null || !gatesScroll()) return;
    const dy = touchStartY - e.touches[0].clientY;
    if (dy <= 0) return;
    e.preventDefault();
    if (dy > 30 && !touchUsed) {
      touchUsed = true;
      if (step === 0) nudgePlay(); else advance();
    }
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (!gatesScroll()) return;
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    if (!['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'].includes(e.key)) return;
    e.preventDefault();
    if (step === 0) nudgePlay(); else advance();
  });

  // Если страница открыта не с самого верха (перезагрузка, якорь) — показываем финальное состояние
  function syncHeroWithScroll() {
    if (window.scrollY > 40 && step < 3) setStep(3, { instant: window.scrollY > hero.offsetHeight });
  }

  /* ---------- 5. Куб «Наши проекты» ---------- */
  // Порядок = порядок граней при повороте: front → left → back → right.
  // Описания взяты со страниц кейсов в Figma; теги — по разделам кейса.
  const PROJECTS = [
    {
      title: 'Яблочный спас',
      desc: 'Бренд „Яблочный спас“ пришел к нам на этапе запуска – без фирменного стиля, стратегии и четкого ТЗ. Мы взяли на себя роль креаторов: полностью разработали визуальную концепцию, подобрали фирменные цвета и заложили фундамент бренда. На протяжении всего проекта мы работали в формате полного доверия: сами генерировали идеи и предлагали решения, которые вывели магазин на рынок',
      tags: 'Айдентика, наружная реклама, SMM',
      href: '#', // TODO: ссылка на страницу кейса
    },
    {
      title: 'Цель',
      desc: 'Клиент пришел к нам с запросом на полное обновление визуальной логики продукта. Мы взяли на себя роль проектировщиков пользовательского опыта: разработали чистый функциональный интерфейс, подобрали современную цветовую палитру и собрали гибкую дизайн-систему. Работали в формате полного доверия: сами генерировали продуктовые гипотезы и предлагали UX/UI решения, которые сделали планировщик максимально удобным и выделили его на рынке.',
      tags: 'UX/UI, веб-дизайн, 3D-персонаж',
      href: '#',
    },
    {
      title: 'Желен',
      desc: 'Мясоперерабатывающее предприятие «ЖеЛен» — семейная фабрика мясной гастрономии, основанная в 2003 году. Бренд позиционируется как продукт, сделанный с заботой о семье: он подчёркивает ценность домашнего уюта и вкусных традиций. Ассортимент включает более 170 наименований колбас, сосисок, ветчин и деликатесов.',
      tags: 'Айдентика, фирменный стиль, реклама',
      href: '#',
    },
    {
      title: 'Очень молочен',
      desc: 'Мы начали сотрудничество с компанией «Очень молочен» с разработки нового фирменного стиля и логотипа. Цель стояла не просто создать визуальную айдентику, а разработать современный и узнаваемый образ бренда, который выделит продукцию на полке, подчеркнёт её натуральность и качество, а также будет легко масштабироваться на различные носители.',
      tags: 'Логотип, фирменный стиль, упаковка',
      href: '#',
    },
  ];
  // Неразрывный пробел после коротких слов, чтобы предлоги не висели в конце строки (как в макетах кейсов)
  const typo = t => t.replace(/(^|[\s«„(])([а-яёА-ЯЁ]{1,2})\s+/g, '$1$2 ');

  (function initCube() {
    const section = $('#projects');
    const scene = $('[data-cube]', section);
    const cube = $('.cube', scene);
    const faces = ['front', 'left', 'back', 'right'].map(n => $('.cube__face--' + n, cube));
    const tTitle = $('[data-project-title]', section);
    const tDesc = $('[data-project-desc]', section);
    const tTags = $('[data-project-tags]', section);
    const tLink = $('[data-project-link]', section);
    const BASE = 21;              // исходный разворот куба, как в макете
    const DEG_PER_PX = 0.32;      // ~280px перетаскивания = одна грань

    let rot = 0;                  // поворот относительно исходного, градусы
    let shownIdx = 0, textTimer = null;
    let hovered = false, visible = false, autoTimer = null, idleUntil = 0;

    const indexFor = r => ((Math.round(r / 90) % 4) + 4) % 4;

    function render() {
      cube.style.setProperty('--ry', BASE + rot + 'deg');
      // тень на гранях по реальному углу: боковая темнее, фронтальная светлая
      faces.forEach((f, i) => {
        const a = (BASE + rot - 90 * i) * Math.PI / 180;
        f.style.setProperty('--shade', Math.min(.4, Math.max(0, .42 * (1 - Math.cos(a)))).toFixed(3));
      });
      const idx = indexFor(rot);
      if (idx !== shownIdx) showText(idx);
    }

    function showText(idx) {
      shownIdx = idx;
      clearTimeout(textTimer);
      section.classList.add('is-switching');
      textTimer = setTimeout(() => {
        const p = PROJECTS[idx];
        tTitle.textContent = p.title;
        tDesc.textContent = typo(p.desc);
        tTags.textContent = p.tags;
        tLink.href = p.href;
        section.classList.remove('is-switching');
      }, 300);
    }

    function goTo(r) { rot = r; render(); }
    function step(dir) { goTo(Math.round(rot / 90) * 90 + 90 * dir); }

    // Автоповорот: пауза при наведении и 10 с после ручного вращения
    function schedule() {
      clearInterval(autoTimer);
      if (!visible || hovered || document.hidden) return;
      autoTimer = setInterval(() => { if (performance.now() > idleUntil && !dragging) step(1); }, 4000);
    }
    const touchIdle = () => { idleUntil = performance.now() + 10000; };

    // Перетаскивание мышью и пальцем
    let dragging = false, moved = false, startX = 0, startRot = 0, lastX = 0, lastT = 0, velocity = 0, pointerId = null;
    scene.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; moved = false; pointerId = e.pointerId;
      startX = lastX = e.clientX; startRot = rot; lastT = performance.now(); velocity = 0;
      touchIdle();
    });
    scene.addEventListener('pointermove', e => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        scene.classList.add('is-dragging');
        scene.setPointerCapture(pointerId);
      }
      if (!moved) return;
      const now = performance.now();
      velocity = (e.clientX - lastX) / Math.max(1, now - lastT); // px/мс
      lastX = e.clientX; lastT = now;
      goTo(startRot + dx * DEG_PER_PX);
    });
    const endDrag = e => {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      dragging = false;
      scene.classList.remove('is-dragging');
      touchIdle();
      // простой клик — следующий проект; отменённый жест (например, вертикальный свайп страницы) — ничего
      if (!moved) { if (e && e.type === 'pointerup') step(1); return; }
      let target = Math.round(rot / 90) * 90;
      // быстрый рывок довершает поворот в сторону движения
      if (Math.abs(velocity) > .45 && Math.sign(velocity) * (target - rot) <= 0) target += 90 * Math.sign(velocity);
      goTo(target);
    };
    scene.addEventListener('pointerup', endDrag);
    scene.addEventListener('pointercancel', endDrag);
    // на тач-экранах касание сначала неявно захвачено гранью; её lostpointercapture всплывает — это не конец жеста
    scene.addEventListener('lostpointercapture', e => { if (e.target === scene) endDrag(e); });

    scene.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); touchIdle(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); touchIdle(); step(-1); }
    });
    scene.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    scene.addEventListener('mouseleave', () => { hovered = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; schedule(); }, { threshold: 0.3 }).observe(scene);

    tDesc.textContent = typo(PROJECTS[0].desc);
    render();
  })();

  /* ---------- 6. Горизонтальные ряды карточек: перетаскивание мышью ---------- */
  $$('[data-drag-scroll], .hero__cards').forEach(row => {
    let startX = 0, startLeft = 0, down = false, moved = false;
    row.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (row.scrollWidth <= row.clientWidth + 1) return; // ряд не прокручивается (например, карточки столбиком)
      down = true; moved = false; startX = e.clientX; startLeft = row.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; row.classList.add('is-dragging'); }
      if (moved) row.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      setTimeout(() => row.classList.remove('is-dragging'), 0);
    });
    row.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });

  // Индикатор прокрутки ленты карточек на планшете и телефоне
  (function initHeroScrollbar() {
    const row = $('.hero__cards', hero);
    const bar = $('.hero__scrollbar', hero);
    const update = () => {
      const max = row.scrollWidth - row.clientWidth;
      bar.style.setProperty('--p', max > 0 ? (row.scrollLeft / max).toFixed(3) : 0);
    };
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ---------- 7. «Результат» в карточках ---------- */
  $$('[data-result]').forEach(r => {
    const btn = $('.result__head', r);
    btn.addEventListener('click', () => {
      const open = r.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 8. Услуги — аккордеон (открыта одна) ---------- */
  const services = $$('[data-svc]');
  function setSvc(target, open) {
    services.forEach(s => {
      const on = s === target ? open : false;
      s.classList.toggle('is-open', on);
      $('.svc__toggle', s).setAttribute('aria-expanded', String(on));
    });
  }
  services.forEach(s => s.addEventListener('click', e => {
    if (e.target.closest('[data-open-popup]')) return;
    setSvc(s, !s.classList.contains('is-open'));
  }));

  /* ---------- 9. Бутылки ---------- */
  (function initShelf() {
    const shelf = $('[data-shelf]');
    if (!shelf) return;
    const ROWS = 3, COLS = 11, SHOT = [[1, 5]]; // в макете подбита 6-я бутылка во 2-м ряду
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'shelf__row';
      const line = document.createElement('div');
      line.className = 'shelf__bottles';
      for (let c = 0; c < COLS; c++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'bottle';
        b.setAttribute('aria-label', 'Бутылка');
        if (SHOT.some(([sr, sc]) => sr === r && sc === c)) b.classList.add('is-shot');
        b.innerHTML = '<img class="bottle__aim" src="assets/img/bottle-crosshair.svg" alt="">';
        b.addEventListener('click', () => {
          b.classList.toggle('is-shot');
          b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop');
        });
        line.appendChild(b);
      }
      const rule = document.createElement('div');
      rule.className = 'shelf__line';
      row.append(line, rule);
      shelf.appendChild(row);
    }
  })();

  /* ---------- 10. Процесс и сроки ---------- */
  // TODO: в макете заполнен только «Бриф — 1 день». Остальные сроки и описания — от заказчика.
  const LOREM = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.';
  const STAGES = [
    { name: 'Бриф', time: '1 день', desc: LOREM },
    { name: 'дизайн-спринт', time: '', desc: LOREM },
    { name: 'согласование', time: '', desc: LOREM },
    { name: 'подготовка макетов', time: '', desc: LOREM },
    { name: 'запуск', time: '', desc: LOREM },
    { name: 'сопровождение', time: '', desc: LOREM },
  ];
  (function initProcess() {
    const list = $('[data-process-list]');
    const nameEl = $('[data-process-name]');
    const timeEl = $('[data-process-time]');
    const descEl = $('[data-process-desc]');
    const bars = $$('[data-process-bar] i');
    const items = STAGES.map((s, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'process__item';
      b.setAttribute('role', 'tab');
      b.textContent = s.name;
      b.addEventListener('mouseenter', () => select(i));
      b.addEventListener('focus', () => select(i));
      b.addEventListener('click', () => select(i));
      li.appendChild(b);
      list.appendChild(li);
      return b;
    });
    function select(i) {
      const s = STAGES[i];
      items.forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', String(k === i)); });
      bars.forEach((bar, k) => bar.classList.toggle('is-on', k <= i));
      nameEl.textContent = s.name;
      timeEl.textContent = s.time || ' ';
      descEl.textContent = s.desc;
    }
    select(0);
  })();

  /* ---------- Общие обработчики ---------- */
  window.addEventListener('scroll', syncHeroWithScroll, { passive: true });
  window.addEventListener('resize', fitIntro);
  window.addEventListener('load', () => { fitIntro(); syncHeroWithScroll(); });
  fitIntro();
  syncHeroWithScroll();
})();
