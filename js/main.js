/* Krasny Kon — Homepage script (Iteration 1: P0-V)
   No hero scroll-jacking, no 3D cube, no production AI widget.
   Includes: deliverables accordion, interactive bottles shelf, read-only AI context helper,
   and preview-only (?ai-preview=1) layout slot toggle for verifying both grid states.
*/
(() => {
  const { $, $$ } = window.KK;
  const body = document.body;

  /* ---------- 1. Expandable «Результат» inside Express & Package cards ---------- */
  $$('[data-result]').forEach(container => {
    const btn = $('.result__head', container);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = container.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- 2. Interactive Bottles Shelf («Для кого работаем — Пищевая промышленность») ---------- */
  (function initShelf() {
    const shelf = $('[data-shelf]');
    if (!shelf) return;
    const ROWS = 3;
    const COLS = 11;
    const SHOT = [[1, 5]]; // 6th bottle in 2nd row highlighted initially as in Figma
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'shelf__row';
      const line = document.createElement('div');
      line.className = 'shelf__bottles';
      for (let c = 0; c < COLS; c++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'bottle';
        b.setAttribute('aria-label', `Бутылка ${r * COLS + c + 1}`);
        if (SHOT.some(([sr, sc]) => sr === r && sc === c)) b.classList.add('is-shot');
        b.innerHTML = '<img class="bottle__aim" src="assets/img/bottle-crosshair.svg" alt="" width="18" height="18">';
        b.addEventListener('click', () => {
          b.classList.toggle('is-shot');
          b.classList.remove('is-pop');
          void b.offsetWidth;
          b.classList.add('is-pop');
        });
        line.appendChild(b);
      }
      const rule = document.createElement('div');
      rule.className = 'shelf__line';
      row.append(line, rule);
      shelf.appendChild(row);
    }
  })();

  /* ---------- 2b. Interactive Process & Timeline (hover/click/focus + animated progress bar) ---------- */
  (function initProcess() {
    const root = $('[data-process]');
    if (!root) return;
    const tabs = $$('[data-process-tab]', root);
    const panels = $$('[data-process-panel]', root);
    const fill = $('[data-process-fill]', root);
    const view = $('.process-stage__view', root);
    if (!tabs.length || !panels.length || !fill || !view) return;

    // Render active description cleanly right below the animated progress bar while keeping all text in semantic panels
    const descBox = document.createElement('p');
    descBox.className = 'process-stage__active-desc';
    descBox.setAttribute('aria-live', 'polite');
    view.appendChild(descBox);

    let current = 0;
    function select(index) {
      current = Math.max(0, Math.min(tabs.length - 1, index));
      tabs.forEach((tab, idx) => {
        const active = idx === current;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      panels.forEach((panel, idx) => {
        const active = idx === current;
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
      fill.style.setProperty('--step', String(current + 1));
      const activeDesc = $('.process-stage__desc', panels[current]);
      if (activeDesc) descBox.textContent = activeDesc.textContent.trim();
    }

    tabs.forEach((tab, idx) => {
      tab.addEventListener('mouseenter', () => select(idx));
      tab.addEventListener('focus', () => select(idx));
      tab.addEventListener('click', () => select(idx));
      tab.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const next = (idx + 1) % tabs.length;
          select(next);
          tabs[next].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = (idx - 1 + tabs.length) % tabs.length;
          select(prev);
          tabs[prev].focus();
        }
      });
    });

    select(0);
  })();

  /* ---------- 3. Read-only AI Context Contract Helper (no LLM/API/observers active in P0-V) ---------- */
  function collectPublicContext() {
    const pageId = body.dataset.pageId || 'home';
    const baseUrl = window.location.origin + window.location.pathname;
    return $$('[data-section-id]').map(section => {
      const sectionId = section.dataset.sectionId;
      const heading = $('h1, h2, h3', section);
      const title = section.dataset.sectionTitle || (heading ? heading.textContent.trim() : sectionId);
      const anchor = section.id ? `#${section.id}` : '';
      const projects = $$('[data-project-id]', section).map(card => ({
        pageId,
        sectionId,
        projectId: card.dataset.projectId,
        serviceId: null,
        title: ($('h3, h4', card)?.textContent || '').trim(),
        publicText: card.textContent.replace(/\s+/g, ' ').trim(),
        url: baseUrl + anchor,
      }));
      const services = $$('[data-service-id]', section).map(card => ({
        pageId,
        sectionId,
        projectId: null,
        serviceId: card.dataset.serviceId,
        title: ($('h2, h3, h4', card)?.textContent || '').trim(),
        publicText: card.textContent.replace(/\s+/g, ' ').trim(),
        url: baseUrl + anchor,
      }));
      return {
        pageId,
        sectionId,
        projectId: null,
        serviceId: null,
        title,
        publicText: section.textContent.replace(/\s+/g, ' ').trim().slice(0, 500),
        url: baseUrl + anchor,
        projects,
        services,
      };
    });
  }

  window.KK_CONTEXT = {
    version: '1.0',
    getPageId: () => body.dataset.pageId || 'home',
    isAiEnabled: () => body.dataset.aiEnabled === 'true',
    getSlot: () => $('[data-ai-slot]'),
    getSnapshot: collectPublicContext,
  };

  /* ---------- 4. Preview-Only AI Slot Verification (?ai-preview=1 on local hosts ONLY) ---------- */
  (function initAiPreviewMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ai-preview') !== '1') return;

    const host = window.location.hostname;
    const isLocalHost =
      window.location.protocol === 'file:' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]' ||
      host === '::1';
    if (!isLocalHost) return;

    const slot = $('[data-ai-slot]');
    if (!slot) return;

    function renderPlaceholder() {
      const sections = collectPublicContext().filter(s => s.sectionId !== 'header' && s.sectionId !== 'footer');
      slot.innerHTML = `
        <div class="ai-slot-mock">
          <div class="ai-slot-mock__head">
            <span class="ai-slot-mock__title">Слот ИИ-ассистента</span>
            <span class="ai-slot-mock__badge">Preview</span>
          </div>
          <div class="ai-slot-mock__body">
            <div class="ai-slot-mock__card">
              <strong>Тестовая проверка сетки</strong>
              Этот блок виден только по параметру <code>?ai-preview=1</code>. На публичном сайте слот скрыт и занимает 0&nbsp;px.
            </div>
            <div class="ai-slot-mock__card">
              <strong>Обнаруженный контекст (${sections.length} секций)</strong>
              <div class="ai-slot-mock__chips">
                ${sections.slice(0, 6).map(s => `<span class="ai-slot-mock__chip">${s.sectionId}</span>`).join('')}
              </div>
            </div>
            <div class="ai-slot-mock__card">
              <strong>Пропорции сетки</strong>
              Desktop &ge;1360px: 9 + 3 колонки.<br>
              Desktop 1024–1359px: 8 + 4 колонки.<br>
              &lt;1024px: 1 колонка + отдельная панель.
            </div>
          </div>
          <div class="ai-slot-mock__foot">
            <span class="ai-slot-mock__input">Поле вопроса (AI-2)</span>
            <button class="ai-slot-mock__close" type="button" data-ai-preview-close>Скрыть</button>
          </div>
        </div>
      `;
      const closeBtn = $('[data-ai-preview-close]', slot);
      if (closeBtn) closeBtn.addEventListener('click', () => setPreviewOpen(false));
    }

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'ai-preview-toggle';
    body.appendChild(toggleBtn);

    function setPreviewOpen(open) {
      body.dataset.aiEnabled = open ? 'true' : 'false';
      slot.hidden = !open;
      if (open && !slot.children.length) renderPlaceholder();
      toggleBtn.textContent = open ? 'AI Preview: ВКЛ (скрыть)' : 'AI Preview: ВЫКЛ (показать слот)';
      toggleBtn.setAttribute('aria-pressed', String(open));
    }

    toggleBtn.addEventListener('click', () => {
      setPreviewOpen(body.dataset.aiEnabled !== 'true');
    });

    setPreviewOpen(true);
  })();
})();
