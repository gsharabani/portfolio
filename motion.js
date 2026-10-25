(function () {
  window.__motion = true;
  var root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { root.classList.add('reveal-all'); return; }

  var SEL = '.hero .intro, .project, .initiatives, .cv-intro, .cv-row, .block, .full, .row, .closing, .pager, footer';

  /* headline words rise out of a mask */
  function splitWords(h) {
    var label = h.textContent.replace(/\s+/g, ' ').trim();
    var frag = document.createDocumentFragment();
    var n = 0;
    Array.prototype.slice.call(h.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var wm = document.createElement('span'); wm.className = 'wm'; wm.setAttribute('aria-hidden', 'true');
          var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', n++); w.textContent = part;
          wm.appendChild(w); frag.appendChild(wm);
        });
      } else { frag.appendChild(node.cloneNode(true)); }
    });
    h.setAttribute('aria-label', label);
    h.textContent = '';
    h.appendChild(frag);
  }
  document.querySelectorAll('h1').forEach(splitWords);

  /* reveal on scroll, staggered when several enter together */
  var io = new IntersectionObserver(function (entries) {
    var vis = entries.filter(function (e) { return e.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
    vis.forEach(function (e, i) {
      e.target.style.setProperty('--d', Math.min(i, 4) * 90 + 'ms');
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll(SEL).forEach(function (el) { io.observe(el); });

  /* tabbed home page: replay the entrance when a tab opens */
  ['view-work', 'view-cv'].forEach(function (id) {
    var view = document.getElementById(id);
    if (!view) return;
    new MutationObserver(function () {
      if (view.hidden) return;
      view.querySelectorAll(SEL).forEach(function (el) { el.classList.remove('in'); io.observe(el); });
    }).observe(view, { attributes: true, attributeFilter: ['hidden'] });
  });

  /* reading progress on case pages */
  if (document.querySelector('.crumbs')) {
    var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--p', h > 0 ? Math.min(1, scrollY / h) : 0);
      ticking = false;
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* count-up for headline stats, e.g. "40% of ..." */
  document.querySelectorAll('#im + .body strong').forEach(function (el) {
    var m = el.textContent.match(/^(\d+)%(.*)$/);
    if (!m) return;
    var target = +m[1], rest = m[2];
    el.textContent = '0%' + rest;
    new IntersectionObserver(function (es, obs) {
      if (!es[0].isIntersecting) return;
      obs.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + '%' + rest;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.6 }).observe(el);
  });
})();
