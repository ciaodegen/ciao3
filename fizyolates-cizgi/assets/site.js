(function () {
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
  var hdr = document.getElementById('hdr');
  var bar = document.getElementById('progress');

  // ---- Kelime kelime dolan metin ----
  var fills = $$('[data-fill]');
  fills.forEach(function (el) {
    var words = [];
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = part;
            words.push(s); frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    el._w = words;
    if (rm) words.forEach(function (w) { w.classList.add('lit'); });
  });

  // ---- Kaydırmaya bağlı çizim, yatay kaydırma, paralaks ----
  var draws = $$('[data-draw]');
  draws.forEach(function (p) { p.style.strokeDasharray = '1'; p.style.strokeDashoffset = rm ? '0' : '1'; });
  var par = $$('[data-parallax]');
  var hs = $$('[data-hscroll]');
  function setupH() {
    hs.forEach(function (sec) {
      var track = sec.querySelector('.hs-track');
      var on = !rm && window.innerWidth >= 900;
      sec.classList.toggle('pinned', on);
      if (on) {
        sec._dist = Math.max(0, track.scrollWidth - window.innerWidth);
        sec.style.height = (sec._dist + window.innerHeight) + 'px';
      } else {
        sec.style.height = '';
        track.style.transform = '';
      }
    });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (hdr) hdr.classList.toggle('scrolled', y > 30);
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (rm) return;
    draws.forEach(function (p) {
      var host = p.closest('[data-draw-host]') || p.ownerSVGElement;
      var r = host.getBoundingClientRect();
      var k = clamp((vh * 0.75 - r.top) / Math.max(1, r.height * 0.95));
      p.style.strokeDashoffset = (1 - k).toFixed(4);
    });
    par.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (-c * parseFloat(el.dataset.parallax)).toFixed(1) + 'px,0)';
    });
    hs.forEach(function (sec) {
      if (!sec.classList.contains('pinned')) return;
      var r = sec.getBoundingClientRect();
      var k = clamp(-r.top / Math.max(1, sec.offsetHeight - vh));
      sec.querySelector('.hs-track').style.transform = 'translate3d(' + (-k * sec._dist).toFixed(1) + 'px,0,0)';
      sec.style.setProperty('--hp', k.toFixed(3));
    });
    fills.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var k = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
      var n = Math.round(k * el._w.length);
      el._w.forEach(function (w, i) { w.classList.toggle('lit', i < n); });
    });
  }
  function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
  setupH();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { setupH(); onScroll(); });
  update();

  // ---- Kaydırınca belirme: yalnızca ekran altındakiler gizlenir ----
  if (!rm && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('in'); return; }
      el.classList.add('pre'); io.observe(el);
    });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }

  // ---- Sahne: ekrandaki öğeye göre değişen yapışkan alan ----
  $$('[data-stage]').forEach(function (stage) {
    var items = $$('[data-stage-item]', stage);
    if (!('IntersectionObserver' in window)) return;
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        stage.setAttribute('data-active', e.target.getAttribute('data-stage-item'));
        items.forEach(function (i) { i.classList.toggle('active', i === e.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    items.forEach(function (i) { so.observe(i); });
  });

  // ---- Fare ile derinlik ----
  var depth = $$('[data-depth]');
  if (!rm && fine && depth.length) {
    window.addEventListener('pointermove', function (e) {
      var mx = e.clientX / window.innerWidth - 0.5, my = e.clientY / window.innerHeight - 0.5;
      depth.forEach(function (el) {
        var d = parseFloat(el.dataset.depth);
        el.style.transform = 'translate3d(' + (mx * d).toFixed(1) + 'px,' + (my * d).toFixed(1) + 'px,0)';
      });
    });
  }

  // ---- Özel imleç ----
  var cur = document.querySelector('.cursor');
  if (cur && !rm && fine) {
    var tx = -100, ty = -100, cx = -100, cy = -100;
    var label = cur.querySelector('span');
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); });
    document.addEventListener('pointerleave', function () { cur.classList.remove('on'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('a,button,label,[data-cursor]');
      cur.classList.toggle('hover', !!t);
      var txt = t && t.getAttribute('data-cursor');
      cur.classList.toggle('has-label', !!txt);
      if (label) label.textContent = txt || '';
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      window.requestAnimationFrame(loop);
    })();
  } else if (cur) {
    cur.remove();
  }

  // ---- Satır üzerinde imleci izleyen görsel ----
  $$('[data-follow]').forEach(function (list) {
    var f = list.querySelector('.follower');
    if (!f || rm || !fine) return;
    var fl = f.querySelector('.follower-label');
    list.addEventListener('pointermove', function (e) {
      var row = e.target.closest('[data-label]');
      f.classList.toggle('on', !!row);
      if (row) {
        if (fl) fl.textContent = row.getAttribute('data-label');
        f.setAttribute('data-shape', row.getAttribute('data-shape') || '');
      }
      var r = list.getBoundingClientRect();
      f.style.transform = 'translate3d(' + (e.clientX - r.left).toFixed(0) + 'px,' + (e.clientY - r.top).toFixed(0) + 'px,0)';
    });
    list.addEventListener('pointerleave', function () { f.classList.remove('on'); });
  });

  // ---- Mıknatıs butonlar ve tıklama dalgası ----
  if (!rm && fine) {
    $$('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
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

  // ---- Kart içi ışık (imleç konumu) ----
  $$('[data-glow]').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  });

  // ---- Mobil menü ----
  var mb = document.querySelector('.menu-btn');
  if (mb && hdr) {
    mb.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('nav a', hdr).forEach(function (a) {
      a.addEventListener('click', function () { hdr.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); });
    });
  }

  // ---- Rezervasyon çipleri → WhatsApp mesajı ----
  $$('form[data-book]').forEach(function (f) {
    var out = f.querySelector('[data-book-link]');
    var sum = f.querySelector('[data-book-summary]');
    function sync() {
      var get = function (n) { var i = f.querySelector('input[name="' + n + '"]:checked'); return i ? i.value : ''; };
      var msg = 'Merhaba, ' + get('ders') + ' için ' + get('gun') + ' ' + get('saat') + ' ön görüşme ayarlamak istiyorum.';
      if (sum) sum.textContent = '“' + msg + '”';
      if (out) out.href = 'https://wa.me/90XXXXXXXXXX?text=' + encodeURIComponent(msg);
    }
    f.addEventListener('change', sync);
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    sync();
  });

  // ---- Nefes küresi ----
  var orb = document.getElementById('orb');
  if (orb && orb.getContext) {
    var ctx = orb.getContext('2d');
    var cue = document.getElementById('breath-cue');
    var pauseBtn = document.getElementById('breath-pause');
    var paused = rm, t0 = performance.now(), held = 0, lastCue = '';
    function size() {
      var r = orb.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      orb.width = r.width * dpr; orb.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size(); window.addEventListener('resize', size);
    function draw(now) {
      var w = orb.clientWidth, h = orb.clientHeight;
      var t = paused ? held : (now - t0) / 1000;
      var cyc = t % 8, inh = cyc < 4;
      var k = inh ? cyc / 4 : 1 - (cyc - 4) / 4;
      var e = 0.5 - Math.cos(k * Math.PI) / 2;
      var S = Math.min(w, h), R = S * (0.25 + 0.09 * e);
      ctx.clearRect(0, 0, w, h);
      // ışıklı halka: merkez koyu kalır, yazı okunur
      var g = ctx.createRadialGradient(w / 2, h / 2, R * 0.55, w / 2, h / 2, Math.min(R * 1.45, S * 0.49));
      g.addColorStop(0, 'rgba(217,195,165,0)');
      g.addColorStop(0.42, 'rgba(217,195,165,' + (0.16 + 0.14 * e).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(217,195,165,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w / 2, h / 2, S * 0.49, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(240,226,204,' + (0.35 + 0.3 * e).toFixed(3) + ')';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, R * 0.82, 0, Math.PI * 2); ctx.stroke();
      for (var i = 1; i <= 3; i++) {
        ctx.strokeStyle = 'rgba(237,233,225,' + (0.14 - i * 0.035).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(R * (0.82 + i * 0.16 + e * 0.05 * i), S * 0.49), 0, Math.PI * 2); ctx.stroke();
      }
      var c = inh ? 'Nefes al' : 'Nefes ver';
      if (cue && c !== lastCue && !paused) { cue.textContent = c; lastCue = c; }
      if (!rm) window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
    if (pauseBtn) {
      if (rm) { pauseBtn.hidden = true; if (cue) cue.textContent = 'Nefes al · Nefes ver'; }
      pauseBtn.addEventListener('click', function () {
        if (paused) { t0 = performance.now() - held * 1000; paused = false; pauseBtn.textContent = 'Durdur'; pauseBtn.setAttribute('aria-pressed', 'false'); }
        else { held = (performance.now() - t0) / 1000; paused = true; pauseBtn.textContent = 'Devam et'; pauseBtn.setAttribute('aria-pressed', 'true'); }
      });
    }
  }

  // ---- Akordeon ----
  $$('.acc-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.parentElement.classList.toggle('open', open);
    });
  });

  // ---- Kopyala ----
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy'), o = b.textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () {
        b.textContent = 'Kopyalandı'; setTimeout(function () { b.textContent = o; }, 1600);
      }, function () {});
    });
  });

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
