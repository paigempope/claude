/* Mitten theme: vanilla JS, no dependencies. */
(function () {
  'use strict';

  var MGS = window.MGS || {};
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Money ---------- */
  function formatMoney(cents) {
    var format = MGS.moneyFormat || '${{amount}}';
    var value = (cents / 100);
    var withDelims = function (n, dec, thou, decSep) {
      var parts = n.toFixed(dec).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thou);
      return parts.join(decSep);
    };
    return format.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
      switch (key) {
        case 'amount_no_decimals': return withDelims(value, 0, ',', '.');
        case 'amount_with_comma_separator': return withDelims(value, 2, '.', ',');
        case 'amount_no_decimals_with_comma_separator': return withDelims(value, 0, '.', ',');
        default: return withDelims(value, 2, ',', '.');
      }
    });
  }

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- Drawers ---------- */
  var overlay = $('[data-overlay]');
  var lastFocus = null;

  function openDrawer(id) {
    var d = document.getElementById(id);
    if (!d) return;
    lastFocus = document.activeElement;
    d.classList.add('is-open');
    overlay && (overlay.hidden = false);
    document.body.style.overflow = 'hidden';
    setTimeout(function () { d.focus(); }, 50);
  }
  function closeDrawers() {
    $$('.drawer.is-open').forEach(function (d) { d.classList.remove('is-open'); });
    overlay && (overlay.hidden = true);
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-drawer-open]');
    if (opener) {
      // Cart icon still works as a link without JS; with JS it opens the drawer
      // (except on the cart page itself).
      if (opener.dataset.drawerOpen === 'CartDrawer' && document.body.classList.contains('template-cart')) return;
      e.preventDefault();
      openDrawer(opener.dataset.drawerOpen);
      return;
    }
    if (e.target.closest('[data-drawer-close]') || e.target === overlay) closeDrawers();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });

  /* ---------- Cart ---------- */
  function sectionsUrl() { return window.location.pathname; }

  function renderCartSections(sections) {
    if (!sections || !sections['cart-drawer']) return;
    var wrap = document.getElementById('shopify-section-cart-drawer');
    if (!wrap) return;
    var wasOpen = !!$('#CartDrawer.is-open');
    var doc = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html');
    var fresh = doc.getElementById('shopify-section-cart-drawer');
    wrap.innerHTML = fresh ? fresh.innerHTML : sections['cart-drawer'];
    if (wasOpen) $('#CartDrawer').classList.add('is-open');
    initDateMins(wrap);
  }

  function updateCount() {
    return fetch(MGS.routes.root + 'cart.js', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        $$('[data-cart-count]').forEach(function (el) {
          el.dataset.count = cart.item_count;
          el.textContent = cart.item_count > 0 ? cart.item_count : '';
        });
        return cart;
      });
  }

  function addToCart(items) {
    return fetch(MGS.routes.cartAdd + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items, sections: 'cart-drawer', sections_url: sectionsUrl() })
    })
      .then(function (r) { return r.json().then(function (data) { if (!r.ok) throw data; return data; }); })
      .then(function (data) {
        renderCartSections(data.sections);
        updateCount();
        if (document.body.classList.contains('template-cart')) { window.location.reload(); return data; }
        openDrawer('CartDrawer');
        toast(MGS.strings.added);
        return data;
      })
      .catch(function (err) {
        toast((err && (err.description || err.message)) || MGS.strings.unavailable);
        throw err;
      });
  }

  function changeLine(line, quantity) {
    return fetch(MGS.routes.cartChange + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity, sections: 'cart-drawer', sections_url: sectionsUrl() })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (document.body.classList.contains('template-cart')) { window.location.reload(); return; }
        renderCartSections(data.sections);
        updateCount();
      });
  }

  document.addEventListener('click', function (e) {
    var quick = e.target.closest('[data-quick-add]');
    if (quick) {
      e.preventDefault();
      quick.classList.add('is-loading');
      addToCart([{ id: Number(quick.dataset.quickAdd), quantity: 1 }])
        .finally(function () { quick.classList.remove('is-loading'); });
      return;
    }
    var change = e.target.closest('[data-qty-change]');
    if (change) {
      var row = change.closest('[data-line]');
      if (!row) return;
      change.disabled = true;
      changeLine(Number(row.dataset.line), Number(change.dataset.qtyChange));
    }
  });

  // Cart attributes (gift message, gift receipt, ship date): saved on change.
  var attrTimer;
  document.addEventListener('input', function (e) {
    var el = e.target.closest('[data-cart-attribute]');
    if (!el) return;
    clearTimeout(attrTimer);
    attrTimer = setTimeout(function () {
      var attributes = {};
      attributes[el.dataset.cartAttribute] = el.type === 'checkbox' ? (el.checked ? el.value : '') : el.value;
      fetch(MGS.routes.cartUpdate + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ attributes: attributes })
      });
    }, 400);
  });

  function initDateMins(ctx) {
    var today = new Date();
    var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $$('[data-min-today]', ctx).forEach(function (el) { el.min = iso; });
  }
  initDateMins(document);

  /* ---------- Header ---------- */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Announcement rotation + deadline countdown ---------- */
  var slides = $$('[data-announcement-slide]');
  if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var si = 0;
    setInterval(function () {
      slides[si].hidden = true;
      si = (si + 1) % slides.length;
      slides[si].hidden = false;
    }, 4500);
  }

  $$('[data-deadline]').forEach(function (wrap) {
    var target = new Date(wrap.dataset.deadline).getTime();
    var out = $('[data-countdown]', wrap);
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) { wrap.hidden = true; return; }
      var d = Math.floor(diff / 864e5);
      var h = Math.floor((diff % 864e5) / 36e5);
      out.textContent = d > 0 ? d + 'd ' + h + 'h left' : h + 'h ' + Math.floor((diff % 36e5) / 6e4) + 'm left';
    }
    tick();
    setInterval(tick, 60000);
  });

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Region map ---------- */
  $$('[data-region-map]').forEach(function (map) {
    function select(id) {
      $$('[data-region-tab]', map).forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.regionTab === id)); });
      $$('[data-region-panel]', map).forEach(function (p) { p.hidden = p.dataset.regionPanel !== id; });
      $$('[data-region-pin]', map).forEach(function (p) { p.classList.toggle('is-active', p.dataset.regionPin === id); });
    }
    map.addEventListener('click', function (e) {
      var t = e.target.closest('[data-region-tab], [data-region-pin]');
      if (t) select(t.dataset.regionTab || t.dataset.regionPin);
    });
    map.addEventListener('keydown', function (e) {
      var pin = e.target.closest('[data-region-pin]');
      if (pin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(pin.dataset.regionPin); }
    });
  });

  /* ---------- Gift finder quiz ---------- */
  $$('[data-quiz]').forEach(function (quiz) {
    var go = $('[data-quiz-go]', quiz);
    var picks = [];
    function refresh() {
      go.setAttribute('aria-disabled', String(picks.length === 0));
      go.href = picks.length === 1 ? picks[0].dataset.url : picks.length > 1 ? go.dataset.boxUrl : '#';
    }
    quiz.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-quiz-option]');
      if (!opt) return;
      var on = opt.getAttribute('aria-pressed') === 'true';
      if (!on && picks.length >= 3) { toast('Pick up to three'); return; }
      opt.setAttribute('aria-pressed', String(!on));
      picks = $$('[data-quiz-option][aria-pressed="true"]', quiz);
      refresh();
    });
    refresh();
  });

  /* ---------- Product page ---------- */
  $$('[data-product-section]').forEach(function (section) {
    var form = $('[data-product-form]', section);
    var json = $('[data-product-json]', section);
    var variants = json ? JSON.parse(json.textContent) : [];
    var idInput = $('[data-variant-id]', section);
    var addBtn = $('[data-add-button]', section);
    var priceEl = $('[data-product-price]', section);
    var mainImg = $('[data-gallery-main]', section);

    function currentOptions() {
      return $$('fieldset.option-group', section).map(function (fs) {
        var c = $('input:checked', fs);
        return c ? c.value : null;
      });
    }
    function onVariantChange() {
      var opts = currentOptions();
      var v = variants.find(function (vv) { return vv.options.every(function (o, i) { return o === opts[i]; }); });
      if (!v) { addBtn.disabled = true; addBtn.textContent = MGS.strings.unavailable; return; }
      idInput.value = v.id;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? MGS.strings.addToCart : MGS.strings.soldOut;
      if (priceEl) {
        priceEl.innerHTML = '<span class="price' + (v.compare_at_price > v.price ? ' price--sale' : '') + '">' + formatMoney(v.price) +
          (v.compare_at_price > v.price ? '<s>' + formatMoney(v.compare_at_price) + '</s>' : '') + '</span>';
      }
      if (v.featured_media && mainImg) {
        var thumb = $('[data-media-id="' + v.featured_media.id + '"]', section);
        if (thumb) thumb.click();
      }
      var url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url.toString());
    }
    section.addEventListener('change', function (e) { if (e.target.matches('[data-option-index]')) onVariantChange(); });

    section.addEventListener('click', function (e) {
      var step = e.target.closest('[data-qty-step]');
      if (step) {
        var input = step.parentElement.querySelector('input');
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + Number(step.dataset.qtyStep));
      }
      var thumb = e.target.closest('[data-gallery-thumb]');
      if (thumb && mainImg) {
        mainImg.removeAttribute('srcset');
        mainImg.src = thumb.dataset.src;
        $$('[data-gallery-thumb]', section).forEach(function (t) { t.removeAttribute('aria-current'); });
        thumb.setAttribute('aria-current', 'true');
      }
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        addBtn.disabled = true;
        var qty = parseInt((form.querySelector('[name="quantity"]') || {}).value, 10) || 1;
        addToCart([{ id: Number(idInput.value), quantity: qty }]).finally(function () { addBtn.disabled = false; });
      });
    }

    // Sticky add-to-cart appears once the main button scrolls away.
    var sticky = $('[data-sticky-atc]');
    if (sticky && addBtn && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var show = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', show);
        sticky.setAttribute('aria-hidden', String(!show));
        $('[data-sticky-add]', sticky).tabIndex = show ? 0 : -1;
      }).observe(addBtn);
      $('[data-sticky-add]', sticky).addEventListener('click', function () { form.requestSubmit ? form.requestSubmit() : addBtn.click(); });
    }

    // Honest ship-by countdown: same-day cutoff in Eastern Time, Mon–Fri.
    var eta = $('[data-ship-eta]', section);
    if (eta) {
      var cutoff = Number(eta.dataset.cutoffHour || 13);
      var renderEta = function () {
        var nowET = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' }));
        var day = nowET.getDay();
        var mins = cutoff * 60 - (nowET.getHours() * 60 + nowET.getMinutes());
        if (day >= 1 && day <= 5 && mins > 0) {
          eta.textContent = 'Order in the next ' + Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm and it ships today from Michigan';
        } else {
          var next = (day >= 1 && day <= 4) ? 'tomorrow' : 'Monday';
          eta.textContent = 'Order now and it ships ' + next + ' from Michigan';
        }
      };
      renderEta();
      setInterval(renderEta, 60000);
    }
  });

  /* ---------- Recommendations (lazy) ---------- */
  $$('[data-recommendations], [data-complementary]').forEach(function (el) {
    if (!el.dataset.url) return;
    fetch(el.dataset.url)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var sel = el.hasAttribute('data-complementary') ? '[data-complementary]' : '[data-recommendations]';
        var fresh = doc.querySelector(sel);
        if (fresh && fresh.innerHTML.trim()) {
          el.innerHTML = fresh.innerHTML;
          $$('.reveal', el).forEach(function (r) { r.classList.add('is-in'); });
        }
      })
      .catch(function () {});
  });

  /* ---------- Collection sort + filters ---------- */
  var sort = $('[data-sort]');
  if (sort) sort.addEventListener('change', function () {
    var url = new URL(window.location.href);
    url.searchParams.set('sort_by', sort.value);
    window.location = url.toString();
  });
  var facets = $('[data-facets]');
  if (facets) {
    var ft;
    facets.addEventListener('change', function () {
      clearTimeout(ft);
      ft = setTimeout(function () {
        var params = new URLSearchParams(new FormData(facets));
        Array.from(params.keys()).forEach(function (k) { if (!params.get(k)) params.delete(k); });
        window.location.search = params.toString();
      }, 500);
    });
  }

  /* ---------- Build a box ---------- */
  $$('[data-bab]').forEach(function (bab) {
    var items = $$('[data-bab-item]', bab);
    var sizes = $$('[data-bab-size]', bab);
    var slotsEl = $('[data-bab-slots]', bab);
    var progress = $('[data-bab-progress]', bab);
    var status = $('[data-bab-status]', bab);
    var totalEl = $('[data-bab-total]', bab);
    var submit = $('[data-bab-submit]', bab);
    var note = $('[data-bab-note]', bab);
    var qty = {};
    var size = sizes.find(function (s) { return s.getAttribute('aria-pressed') === 'true'; }) || sizes[0];

    function count() { return Object.keys(qty).reduce(function (a, k) { return a + qty[k]; }, 0); }
    function capacity() { return size ? Number(size.dataset.count) : 6; }

    function render() {
      var cap = capacity();
      var n = count();
      slotsEl.style.setProperty('--slots', Math.min(cap, 10));
      var filled = [];
      items.forEach(function (it) { for (var i = 0; i < (qty[it.dataset.variant] || 0); i++) filled.push(it); });
      slotsEl.innerHTML = '';
      for (var i = 0; i < cap; i++) {
        var s = document.createElement('div');
        s.className = 'bab__slot' + (filled[i] ? ' is-filled' : '');
        if (filled[i] && filled[i].dataset.img) {
          var img = document.createElement('img');
          img.src = filled[i].dataset.img; img.alt = filled[i].dataset.title;
          s.appendChild(img);
        } else {
          s.textContent = filled[i] ? '✓' : i + 1;
        }
        slotsEl.appendChild(s);
      }
      progress.style.width = Math.min(100, (n / cap) * 100) + '%';
      var total = (size ? Number(size.dataset.price) : 0);
      items.forEach(function (it) { total += (qty[it.dataset.variant] || 0) * Number(it.dataset.price); });
      totalEl.textContent = formatMoney(total);
      var left = cap - n;
      status.textContent = left > 0 ? left + ' more to fill your box' : 'Box full. Ready to ship!';
      submit.setAttribute('aria-disabled', String(left !== 0));
      items.forEach(function (it) {
        var q = qty[it.dataset.variant] || 0;
        var out = $('[data-bab-qty]', it);
        if (out) out.textContent = q;
        it.classList.toggle('is-selected', q > 0);
      });
    }

    bab.addEventListener('click', function (e) {
      var sz = e.target.closest('[data-bab-size]');
      if (sz) {
        sizes.forEach(function (s) { s.setAttribute('aria-pressed', String(s === sz)); });
        size = sz;
        // Trim selections that no longer fit.
        while (count() > capacity()) {
          var keys = Object.keys(qty).filter(function (k) { return qty[k] > 0; });
          var last = keys[keys.length - 1];
          qty[last]--;
        }
        render();
        return;
      }
      var item = e.target.closest('[data-bab-item]');
      if (!item) return;
      var id = item.dataset.variant;
      if (e.target.closest('[data-bab-plus]')) {
        if (count() >= capacity()) { toast('Your box is full. Pick a bigger size?'); return; }
        qty[id] = (qty[id] || 0) + 1;
      } else if (e.target.closest('[data-bab-minus]')) {
        qty[id] = Math.max(0, (qty[id] || 0) - 1);
      }
      render();
    });

    submit.addEventListener('click', function () {
      if (submit.getAttribute('aria-disabled') === 'true') {
        toast('Fill every slot first: ' + (capacity() - count()) + ' to go');
        return;
      }
      var boxId = 'BOX-' + Date.now().toString(36).toUpperCase();
      var label = boxId.slice(-5);
      var props = { Box: label, _box_id: boxId };
      var lines = [];
      if (size) {
        var boxProps = { Box: label, _box_id: boxId };
        if (note && note.value.trim()) boxProps['Gift note'] = note.value.trim();
        lines.push({ id: Number(size.dataset.variant), quantity: 1, properties: boxProps });
      }
      Object.keys(qty).forEach(function (k) {
        if (qty[k] > 0) lines.push({ id: Number(k), quantity: qty[k], properties: props });
      });
      submit.disabled = true;
      addToCart(lines).then(function () { qty = {}; if (note) note.value = ''; render(); })
        .finally(function () { submit.disabled = false; });
    });

    render();
  });
})();
