/* Krasny Kon — Projects Catalog & Case Pages Script (P1-C)
   Handles category filtering, read-only AI context contract (including case sections for future narrator),
   and preview-only (?ai-preview=1) AI slot verification.
*/
(() => {
  const { $, $$ } = window.KK;
  const body = document.body;

  /* ---------- 1. Catalog Category Filter ---------- */
  (function initCatalogFilter() {
    const filterRoot = $('[data-proj-filter]');
    if (!filterRoot) return;
    const buttons = $$('[data-filter-cat]', filterRoot);
    const cards = $$('[data-project-card]');
    const shownEl = $('[data-shown-count]');

    function applyFilter(cat) {
      let visible = 0;
      cards.forEach(card => {
        const cats = (card.dataset.cats || '').split(/\s+/).filter(Boolean);
        const match = cat === 'all' || cats.includes(cat);
        card.hidden = !match;
        if (match) visible++;
      });
      buttons.forEach(btn => {
        const active = btn.dataset.filterCat === cat;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      if (shownEl) shownEl.textContent = String(visible);
    }

    buttons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filterCat));
    });

    const urlCat = new URLSearchParams(window.location.search).get('cat');
    if (urlCat && buttons.some(b => b.dataset.filterCat === urlCat)) {
      applyFilter(urlCat);
    } else {
      applyFilter('all');
    }
  })();

  /* ---------- 2. Read-Only AI Context Contract (Catalog & Case Narrator Ready) ---------- */
  function collectPublicContext() {
    const pageId = body.dataset.pageId || 'projects';
    const pageProjectId = body.dataset.projectId || null;
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
        title: ($('h2, h3, h4', card)?.textContent || '').trim(),
        publicText: card.textContent.replace(/\s+/g, ' ').trim().slice(0, 400),
        url: ($('a[href]', card)?.href) || (baseUrl + anchor),
      }));

      return {
        pageId,
        sectionId,
        projectId: section.dataset.projectId || pageProjectId,
        serviceId: section.dataset.serviceId || null,
        title,
        publicText: section.textContent.replace(/\s+/g, ' ').trim().slice(0, 600),
        url: baseUrl + anchor,
        projects,
      };
    });
  }

  window.KK_CONTEXT = {
    version: '1.1',
    getPageId: () => body.dataset.pageId || 'projects',
    getProjectId: () => body.dataset.projectId || null,
    isAiEnabled: () => body.dataset.aiEnabled === 'true',
    getSlot: () => $('[data-ai-slot]'),
    getSnapshot: collectPublicContext,
  };

  /* ---------- 3. Preview-Only AI Slot Verification (?ai-preview=1, blocked on prod) ---------- */
  (function initAiPreviewMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ai-preview') !== '1') return;

    const host = window.location.hostname;
    if (host === 'redkon.ru' || host === 'www.redkon.ru') return;

    const slot = $('[data-ai-slot]');
    if (!slot) return;

    function renderPlaceholder() {
      const sections = collectPublicContext().filter(s => s.sectionId !== 'header' && s.sectionId !== 'footer');
      const projectId = body.dataset.projectId;
      slot.innerHTML = `
        <div class="ai-slot-mock">
          <div class="ai-slot-mock__head">
            <span class="ai-slot-mock__title">${projectId ? 'Рассказчик кейса' : 'Слот ИИ-ассистента'}</span>
            <span class="ai-slot-mock__badge">Preview</span>
          </div>
          <div class="ai-slot-mock__body">
            <div class="ai-slot-mock__card">
              <strong>Контекст страницы</strong>
              <code>pageId</code>: ${body.dataset.pageId || 'projects'}<br>
              ${projectId ? `<code>projectId</code>: ${projectId}<br>` : ''}
              На публичном сайте слот скрыт и занимает 0&nbsp;px.
            </div>
            <div class="ai-slot-mock__card">
              <strong>Секции для сопровождения (${sections.length})</strong>
              <div class="ai-slot-mock__chips">
                ${sections.map(s => `<span class="ai-slot-mock__chip">${s.sectionId}</span>`).join('')}
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
