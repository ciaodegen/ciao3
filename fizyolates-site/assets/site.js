(function () {
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.getElementById('hdr');
  var bar = document.getElementById('progress');
  var toTop = document.querySelector('.to-top');
  var par = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var grows = [].slice.call(document.querySelectorAll('[data-grow]'));
  var fills = [].slice.call(document.querySelectorAll('[data-fill]'));

  // Kelime kelime dolan metin: kelimeleri span'e böl
  fills.forEach(function (el) {
    var words = [];
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            words.push(s);
            frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n);
        }
      });
    })(el);
    el._w = words;
    if (rm) words.forEach(function (w) { w.classList.add('lit'); });
  });

  var ticking = false;
  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (hdr) hdr.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (toTop) toTop.classList.toggle('show', y > vh * 0.8);
    if (!rm) {
      par.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        var c = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-c * parseFloat(el.dataset.parallax)).toFixed(1) + 'px,0)';
      });
      fills.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
        var n = Math.round(p * el._w.length);
        el._w.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
      });
    }
    grows.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var p = rm ? 1 : clamp((vh * 0.6 - r.top) / r.height);
      el.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Kaydırınca belirme: yalnızca ekranın altında kalan öğeler gizlenip sonra açılır
  if (!rm && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    [].slice.call(document.querySelectorAll('[data-reveal]')).forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('pre');
      io.observe(el);
    });
  }

  // Mıknatıs etkili butonlar (yalnızca fareyle)
  if (!rm && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    [].slice.call(document.querySelectorAll('[data-magnetic]')).forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  // Tıklama dalgası
  if (!rm) {
    document.addEventListener('pointerdown', function (e) {
      var b = e.target.closest && e.target.closest('.btn');
      if (!b) return;
      var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
      var d = document.createElement('span');
      d.className = 'ripple';
      d.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
      b.appendChild(d);
      setTimeout(function () { d.remove(); }, 750);
    });
  }

  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: rm ? 'auto' : 'smooth' }); });

  // Mobil menü
  var mb = document.querySelector('.menu-btn');
  if (mb && hdr) {
    mb.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    [].slice.call(hdr.querySelectorAll('nav a')).forEach(function (a) {
      a.addEventListener('click', function () { hdr.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); });
    });
  }

  // Sekmeler
  [].slice.call(document.querySelectorAll('[data-tabs]')).forEach(function (box) {
    var tabs = [].slice.call(box.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (o) {
          var on = o === t;
          o.setAttribute('aria-selected', on ? 'true' : 'false');
          document.getElementById(o.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });
  });

  // Akordeon
  [].slice.call(document.querySelectorAll('.acc-btn')).forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.parentElement.classList.toggle('open', open);
    });
  });

  // Yatay kaydırıcı okları
  [].slice.call(document.querySelectorAll('[data-scroll-by]')).forEach(function (b) {
    b.addEventListener('click', function () {
      var el = document.getElementById(b.getAttribute('aria-controls'));
      var card = el.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 20 : 320;
      el.scrollBy({ left: step * parseFloat(b.dataset.scrollBy), behavior: rm ? 'auto' : 'smooth' });
    });
  });

  // Taslak form
  [].slice.call(document.querySelectorAll('form[data-demo]')).forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"]');
      var note = f.querySelector('.form-note');
      btn.classList.add('loading');
      btn.disabled = true;
      setTimeout(function () {
        btn.classList.remove('loading');
        btn.disabled = false;
        if (note) note.hidden = false;
      }, 1200);
    });
  });
  // Hizmetler alt menüsü: ekrandaki bölümü vurgula
  var chips = [].slice.call(document.querySelectorAll('.subnav a'));
  if (chips.length && 'IntersectionObserver' in window) {
    var byId = {};
    chips.forEach(function (c) { byId[c.getAttribute('href').slice(1)] = c; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        chips.forEach(function (c) { c.removeAttribute('aria-current'); });
        var c = byId[e.target.id];
        if (c) {
          c.setAttribute('aria-current', 'true');
          var bar = c.parentElement;
          bar.scrollTo({ left: c.offsetLeft - 20, behavior: rm ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  // Kopyala butonları
  [].slice.call(document.querySelectorAll('[data-copy]')).forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function () { var o = b.textContent; b.textContent = 'Kopyalandı'; setTimeout(function () { b.textContent = o; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
