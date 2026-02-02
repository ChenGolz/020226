// Build: 2026-02-02-v21
// Shared layout injector (header + footer) for KBWG static pages
// Loads partials/header.html into #siteHeaderMount and partials/footer.html into #siteFooterMount
(function () {

const KBWG_LAYOUT_BUILD = '2026-02-02-v21';
const KBWG_HEADER_KEY = 'kbwg_header_' + KBWG_LAYOUT_BUILD;
const KBWG_FOOTER_KEY = 'kbwg_footer_' + KBWG_LAYOUT_BUILD;

  const scriptEl = document.currentScript;
  const base = (scriptEl && scriptEl.dataset && scriptEl.dataset.base) ? scriptEl.dataset.base : '';
  const HEADER_URL = base + 'partials/header.html?v=' + KBWG_LAYOUT_BUILD;
  const FOOTER_URL = base + 'partials/footer.html?v=' + KBWG_LAYOUT_BUILD;
  async function inject(url, mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return false;

    try {
      // no-store so fixes/data deploy immediately and we don’t get stuck on a cached header/footer
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      mount.innerHTML = html;
      return true;
    } catch (e) {
      // Fail silently – page still works without injected layout
      return false;
    }
  }
    } catch (e) {}

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      mount.innerHTML = html;
      return true;
    } catch (e) {
      // Fail silently – page still works without injected layout
      return false;
    }
  }

  function fireReady() {
    try { window.dispatchEvent(new CustomEvent('kbwg:layout-ready')); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('kbwg:content-rendered')); } catch (e) {}
    try { if (window.Weglot && typeof Weglot.refresh === 'function') Weglot.refresh(); } catch (e) {}
  }

  Promise.all([
    inject(HEADER_URL, '#siteHeaderMount'),
    inject(FOOTER_URL, '#siteFooterMount')
  ]).then(fireReady);
})();