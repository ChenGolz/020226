// Build: 2026-02-03-v22
// Shared layout injector (header + footer) for KBWG static pages
// Loads partials/header.html into #siteHeaderMount and partials/footer.html into #siteFooterMount
(function () {

const KBWG_LAYOUT_BUILD = '2026-02-03-v22';
const KBWG_HEADER_KEY = 'kbwg_header_' + KBWG_LAYOUT_BUILD;
const KBWG_FOOTER_KEY = 'kbwg_footer_' + KBWG_LAYOUT_BUILD;

  // Resolve correctly when Weglot serves pages under /en/... (or when hosted under a subpath)
  function siteBaseFromScript() {
    try {
      var src = '';
      try { src = (document.currentScript && document.currentScript.src) ? document.currentScript.src : ''; } catch (e) { src = ''; }
      if (!src) {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
          var ssrc = scripts[i] && scripts[i].src ? String(scripts[i].src) : '';
          if (ssrc.indexOf('layout-inject.js') !== -1) { src = ssrc; break; }
        }
      }
      if (!src) return '/';
      var u = new URL(src, location.href);
      var p = u.pathname || '/';
      var idx = p.indexOf('/assets/js/');
      var base = idx >= 0 ? p.slice(0, idx) : p.replace(/\/[^\/]+$/, '');
      base = base.replace(/\/+$/, '');
      var parts = base.split('/').filter(Boolean);
      var langs = { en: 1, he: 1, iw: 1, ar: 1, fr: 1, es: 1, de: 1, ru: 1 };
      if (parts.length && langs[parts[parts.length - 1]]) parts.pop();
      return '/' + parts.join('/');
    } catch (e) { return '/'; }
  }

  function resolveFromBase(rel) {
    try {
      if (!rel) return rel;
      var p = String(rel).replace(/^\.\//, '');
      if (/^https?:\/\//i.test(p)) return p;
      var base = siteBaseFromScript() || '/';
      if (base === '/') return '/' + p.replace(/^\//, '');
      return base + '/' + p.replace(/^\//, '');
    } catch (e) { return rel; }
  }


// Clear older cached versions so header updates immediately
try {
  ['KBWG_HEADER_KEY','KBWG_HEADER_KEY','kbwg_header_v3','KBWG_FOOTER_KEY','KBWG_FOOTER_KEY','kbwg_footer_v3'].forEach(k=>sessionStorage.removeItem(k));
} catch(e) {}

  const HEADER_URL = resolveFromBase('partials/header.html?v=' + KBWG_LAYOUT_BUILD);
  const FOOTER_URL = resolveFromBase('partials/footer.html?v=' + KBWG_LAYOUT_BUILD);

  function cacheKey(url){ return 'kbwg:partial:' + url; }

  async function inject(url, mountSelector) {
    const mount = document.querySelector(mountSelector);
    if (!mount) return false;

    // Try session cache first (fast navigation between pages)
    try {
      const cached = sessionStorage.getItem(cacheKey(url));
      if (cached) {
        mount.innerHTML = cached;
        return true;
      }
    } catch (e) {}

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      mount.innerHTML = html;
      try { sessionStorage.setItem(cacheKey(url), html); } catch (e) {}
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
