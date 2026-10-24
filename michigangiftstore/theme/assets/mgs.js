/* Michigan Gift Store: interactive boxes, gift steps, shelf builder, gift finder and hometown map.
   Reads #MgsData (snippets/mgs-data.liquid). Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var el = document.getElementById('MgsData');
  if (!el) return;
  var RAW = JSON.parse(el.textContent);
  var S = RAW.static, ITEMS = S.items, SHELVES = S.shelves, PLACES = S.places, CARDS = S.cards, FINDER = S.finder;
  var SET = RAW.settings || {}, LIVE = RAW.live || {};
  var BOXES = {}, SIZES = {};
  Object.keys(RAW.boxDefs).forEach(function (k) {
    var d = RAW.boxDefs[k], l = LIVE[k];
    BOXES[k] = Object.assign({}, d, l ? { p: l.price, variant: l.variant, url: l.url, available: l.available } : {});
  });
  Object.keys(RAW.sizeDefs).forEach(function (k) {
    var d = RAW.sizeDefs[k], l = LIVE['size_' + k];
    SIZES[k] = Object.assign({}, d, l ? { p: l.price, variant: l.variant } : {});
  });
  var PHOTO = LIVE.photo, UPG = LIVE.upgrades || {};
  var photoPrice = PHOTO ? PHOTO.price : 1000;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (c) {
    var f = SET.money || '${{amount}}', v = (c / 100);
    var s = (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return f.replace(/\{\{\s*\w+\s*\}\}/, s);
  };
  var ROT = [-5, 4, -2, 6, -4, 3, -6, 5, -3];
  var toast = function (m) { var t = $('[data-toast]'); if (!t) return; t.textContent = m; t.classList.add('is-visible'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('is-visible'); }, 2600); };
  var usOnly = function (keys) { return keys.some(function (k) { return ITEMS[k] && ITEMS[k].usOnly; }); };
  var worth = function (key) { return BOXES[key].items.reduce(function (a, k) { return a + (ITEMS[k] ? ITEMS[k].v : 0); }, 0) + 600; };

  /* ---------- Package art (drawn, no photos needed) ---------- */
  var INK = '#1F2D5C';
  function label(it) { return esc((it.m || '').replace(/\s*\(.*\)/, '').replace(/ Potato Chip Co\.| Roasting Co\.| Home Bakery| Milling/, '')).slice(0, 16); }
  function fit(x, y, size, fill, w, txt) {
    var tl = txt.length * size * 0.56 > w ? ' textLength="' + w + '" lengthAdjust="spacingAndGlyphs"' : '';
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="' + size + '" fill="' + fill + '"' + tl + '>' + txt + '</text>';
  }
  function art(k) {
    var it = ITEMS[k]; if (!it) return '';
    var c = it.c, L = label(it), b;
    switch (it.s) {
      case 'can': b = '<ellipse cx="60" cy="22" rx="30" ry="7" fill="#DDE5EC" stroke="' + INK + '" stroke-width="3"/><path d="M30 22v92c0 5 13 9 30 9s30-4 30-9V22" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><rect x="34" y="52" width="52" height="34" rx="4" fill="#fff" opacity=".92"/>' + fit(60, 73, 11, INK, 46, L) ; break;
      case 'jar': b = '<rect x="32" y="16" width="56" height="18" rx="4" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><rect x="26" y="32" width="68" height="94" rx="14" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="32" y="60" width="56" height="36" rx="4" fill="' + c + '"/>' + fit(60, 82, 10, '#fff', 50, L) ; break;
      case 'bottle': b = '<rect x="50" y="10" width="20" height="20" rx="3" fill="' + INK + '"/><path d="M48 30h24l12 20v66a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V50z" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><rect x="40" y="66" width="40" height="34" rx="3" fill="#fff"/>' + fit(60, 87, 8, INK, 36, L) ; break;
      case 'box': b = '<rect x="24" y="22" width="72" height="104" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="24" y="22" width="72" height="30" fill="' + c + '"/><rect x="24" y="104" width="72" height="22" fill="' + c + '" opacity=".25"/>' + fit(60, 80, 11, INK, 64, L) ; break;
      case 'slab': b = '<g transform="rotate(-6 60 75)"><rect x="18" y="44" width="84" height="56" rx="6" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><path d="M18 62h84M18 80h84M46 44v56M74 44v56" stroke="#3B2216" stroke-width="2"/><rect x="26" y="102" width="68" height="18" rx="3" fill="#fff" stroke="' + INK + '" stroke-width="2"/><text x="60" y="115" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="9" fill="' + INK + '">FUDGE</text></g>'; break;
      case 'bar': b = '<g transform="rotate(8 60 75)"><rect x="34" y="16" width="52" height="108" rx="5" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M38 36c10-6 18 6 26 0s14-10 18-4v30c-12 4-16 14-28 10S40 78 38 70z" fill="' + c + '"/><text x="60" y="104" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="10" fill="' + INK + '">YOOPER</text></g>'; break;
      case 'toast': b = '<path d="M26 26h68l-4 98H30z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><g fill="' + c + '" stroke="#7A4A16" stroke-width="2"><rect x="38" y="40" width="44" height="14" rx="5"/><rect x="38" y="58" width="44" height="14" rx="5"/><rect x="38" y="76" width="44" height="14" rx="5"/></g><text x="60" y="110" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="10" fill="' + INK + '">TRENARY</text>'; break;
      case 'stone': b = '<ellipse cx="60" cy="72" rx="44" ry="34" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><g fill="none" stroke="#5E574B" stroke-width="1.6">' + [[40, 62], [56, 56], [72, 62], [48, 76], [64, 74], [80, 78], [56, 90], [40, 86]].map(function (p) { return '<path d="M' + (p[0] - 6) + ' ' + p[1] + 'l3-5h6l3 5-3 5h-6z"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.2" fill="#5E574B"/>'; }).join('') + '</g>'; break;
      case 'ornament': b = '<circle cx="60" cy="74" r="42" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="54" y="22" width="12" height="12" rx="2" fill="#E9C450" stroke="' + INK + '" stroke-width="2"/><path d="M24 86h72M38 86V56M82 86V56M38 58c8 14 14 22 22 26M82 58c-8 14-14 22-22 26" stroke="' + c + '" stroke-width="3" fill="none"/><path d="M22 96c8 0 8-4 16-4s8 4 16 4 8-4 16-4 8 4 16 4 8-4 16-4" stroke="#1F6FA3" stroke-width="2" fill="none"/>'; break;
      case 'magnet': b = '<path d="M46 124h34v-14c8-7 14-17 14-29V60a9 9 0 0 0-18 0v12V44a11 11 0 0 0-22 0v28l-6-7a9 9 0 0 0-14 11l12 18z" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/><circle cx="66" cy="94" r="4" fill="#B8352B"/>'; break;
      case 'mug': b = '<path d="M22 40h64v56a22 22 0 0 1-22 22H44a22 22 0 0 1-22-22z" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M86 52h8a14 14 0 0 1 0 28h-8" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M34 62c6-6 10 2 16-2s6 8 12 6 10-6 14 0c-2 10-10 14-18 12s-14 4-20-2-6-8-4-14z" fill="' + c + '"/>'; break;
      case 'card': b = '<rect x="14" y="36" width="92" height="66" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="3"/><rect x="80" y="42" width="20" height="24" fill="#B8352B"/><path d="M22 76h44M22 86h36M22 66h50" stroke="' + INK + '" stroke-width="2"/>'; break;
      default: b = '<path d="M28 14h64l-5 10 5 10v80l-5 10 5 10H28l5-10-5-10V34l5-10z" fill="' + c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><rect x="34" y="56" width="52" height="40" rx="6" fill="#fff"/>' + fit(60, 80, 10, INK, 46, L) ;
    }
    return '<svg class="pkg" viewBox="0 0 120 140" role="img" aria-label="' + esc(it.n) + '">' + b + '</svg>';
  }
  var tray = function (keys) {
    return keys.filter(function (k) { return k !== 'card'; }).slice(0, 5).map(function (k, i) {
      return '<span class="ti" style="--r:' + ROT[i] + 'deg;--y:' + (i % 2 ? -8 : 0) + 'px">' + art(k) + '</span>';
    }).join('');
  };
  window.MGSArt = { art: art, tray: tray };

  /* ---------- Cart ---------- */
  function refreshCart() {
    return fetch((window.MGS && MGS.routes.root || '/') + '?sections=cart-drawer').then(function (r) { return r.json(); }).then(function (s) {
      var wrap = document.getElementById('shopify-section-cart-drawer');
      if (wrap && s['cart-drawer']) {
        var d = new DOMParser().parseFromString(s['cart-drawer'], 'text/html');
        var fresh = d.getElementById('shopify-section-cart-drawer');
        wrap.innerHTML = fresh ? fresh.innerHTML : s['cart-drawer'];
      }
      return fetch('/cart.js').then(function (r) { return r.json(); });
    }).then(function (cart) {
      $$('[data-cart-count]').forEach(function (c) { c.dataset.count = cart.item_count; c.textContent = cart.item_count || ''; });
      var dr = document.getElementById('CartDrawer');
      if (dr) { dr.classList.add('is-open'); var o = $('[data-overlay]'); if (o) o.hidden = false; }
    }).catch(function () {});
  }
  function addItems(items) {
    return fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: items }) })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw new Error(d.description || d.message || "Couldn't add that to the cart."); return d; }); });
  }
  function addPhoto(file, gid, box) {
    if (!PHOTO || !file) return Promise.resolve();
    var fd = new FormData();
    fd.append('id', PHOTO.variant); fd.append('quantity', 1);
    fd.append('properties[Card photo]', file); fd.append('properties[_for]', box); fd.append('properties[_gid]', gid);
    return fetch('/cart/add.js', { method: 'POST', body: fd }).then(function (r) { if (!r.ok) throw new Error("The box is in your cart, but the photo didn't upload. Try a smaller image."); });
  }

  /* ---------- Shared gift steps (card, recipient, timing) ---------- */
  var RECIP = [
    ['them', 'Ship it to them', 'Their address goes in at checkout. Sending to more than one person? The cart asks for each address.'],
    ['link', 'Text or email them', "No address? We text or email them within 1 business day to ask where to ship. No price, no receipt. If they don't answer in 5 days, we email you."],
    ['me', 'Ship it to me', 'It comes to your address.']
  ];
  function cardFace(id) {
    switch (id) {
      case 'bridge': return '<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#BFE0F3"/><rect y="34" width="80" height="16" fill="#1F6FA3"/><path d="M0 34h80M18 34V12M62 34V12M18 14c10 14 16 18 22 20M62 14c-10 14-16 18-22 20" stroke="#1F2D5C" stroke-width="2.5" fill="none"/></svg>';
      case 'pines': return '<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#DCEFFA"/><circle cx="60" cy="14" r="7" fill="#FFE7A3"/><rect y="38" width="80" height="12" fill="#1F6FA3"/><path d="M6 38l8-18 8 18zM18 38l9-24 9 24zM34 38l7-15 7 15zM52 38l8-20 8 20zM64 38l7-14 7 14z" fill="#1E5B3F"/></svg>';
      case 'photo': return '<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#E3ECF7"/><path d="M8 42l18-20 12 12 10-8 24 16z" fill="#9CC5E0"/><circle cx="58" cy="14" r="6" fill="#FFF4CF"/><text x="40" y="12" text-anchor="middle" font-family="Georgia,serif" font-size="7" fill="#1F2D5C">your photo here</text></svg>';
      default: return '<svg viewBox="0 0 80 50"><rect width="80" height="50" fill="#F7C873"/><rect y="30" width="80" height="20" fill="#1F6FA3"/><text x="40" y="15" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="8" fill="#1F2D5C">Greetings from</text><text x="40" y="34" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="15" fill="#E9C450" stroke="#B8352B" stroke-width=".8">MICHIGAN</text></svg>';
    }
  }
  var opt = function (attr, v, t, s, on) { return '<button type="button" class="opt" role="radio" data-' + attr + '="' + v + '" aria-checked="' + on + '"><span class="dot" aria-hidden="true"></span><span><b>' + t + '</b><small>' + s + '</small></span></button>'; };
  function giftHTML(id, usOnlyBox) {
    var cards = CARDS.filter(function (c) { return c.id !== 'photo' || PHOTO; });
    var timings = [['asap', 'Next business day', 'Arrives in 1 to 6 business days, depending on distance.']];
    if (SET.holdOpen) timings.push(['hold', 'Hold for the holidays', 'Ships ' + esc(SET.holdWindow || 'the week before Christmas') + " so it lands before Christmas, with a Don't Open Till Christmas sticker. US addresses only."]);
    return '<div class="gstep"><div class="gstep__h"><span class="n">1.</span><h4>Pick the postcard</h4></div>' +
      '<div class="cardopts" role="group" aria-label="Postcard design">' + cards.map(function (c, i) { return '<button type="button" class="cardopt" data-card="' + c.id + '" aria-pressed="' + (i === 0) + '"><span class="face">' + cardFace(c.id) + '</span>' + esc(c.n) + '</button>'; }).join('') + '</div>' +
      '<div class="photo-up" data-photo hidden><label class="form-note">Upload a photo. We print it on the front of the postcard.<input type="file" accept="image/*" data-file></label></div>' +
      '<label class="visually-hidden" for="msg-' + id + '">Your message</label><textarea class="input" id="msg-' + id + '" data-msg maxlength="300" placeholder="Happy birthday from home. Save me some Rock & Rye."></textarea><p class="form-note">We write it by hand. Up to 300 characters.</p></div>' +
      '<div class="gstep"><div class="gstep__h"><span class="n">2.</span><h4>Who\'s it going to?</h4></div><div class="opts" role="radiogroup" aria-label="Recipient">' + RECIP.map(function (r, i) { return opt('to', r[0], r[1], r[2], i === 0); }).join('') + '</div>' +
      '<div class="gfields" data-gfields><div class="two"><div><label class="label" for="nm-' + id + '">Their name</label><input class="input" id="nm-' + id + '" data-name placeholder="Like Aunt Carol" autocomplete="off"></div><div><label class="label" for="fr-' + id + '">From</label><input class="input" id="fr-' + id + '" data-from placeholder="Love, Linda" autocomplete="off"></div></div>' +
      '<div data-contact-wrap hidden><label class="label" for="ct-' + id + '">Their phone or email</label><input class="input" id="ct-' + id + '" data-contact inputmode="email" placeholder="616-555-0123 or name@email.com"></div></div></div>' +
      '<div class="gstep"><div class="gstep__h"><span class="n">3.</span><h4>When should it ship?</h4></div><div class="opts" role="radiogroup" aria-label="Ship timing">' + timings.map(function (t, i) { return opt('when', t[0], t[1], t[2], i === 0); }).join('') + '</div>' +
      (usOnlyBox ? '<p class="form-note">This box ships to US addresses only.</p>' : '') + '</div>';
  }
  function bindGift(root, G, onChange) {
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-card]');
      if (c) { G.card = c.dataset.card; $$('[data-card]', root).forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); $('[data-photo]', root).hidden = G.card !== 'photo'; onChange && onChange(); }
      var t = e.target.closest('[data-to]');
      if (t) { G.to = t.dataset.to; $$('[data-to]', root).forEach(function (x) { x.setAttribute('aria-checked', String(x === t)); }); $('[data-gfields]', root).hidden = G.to === 'me'; $('[data-contact-wrap]', root).hidden = G.to !== 'link'; if (G.to === 'link') $('[data-contact]', root).focus(); }
      var w = e.target.closest('[data-when]');
      if (w) { G.when = w.dataset.when; $$('[data-when]', root).forEach(function (x) { x.setAttribute('aria-checked', String(x === w)); }); }
    });
    root.addEventListener('input', function (e) {
      if (e.target.matches('[data-msg]')) G.msg = e.target.value;
      if (e.target.matches('[data-name]')) G.name = e.target.value;
      if (e.target.matches('[data-from]')) G.from = e.target.value;
      if (e.target.matches('[data-contact]')) G.contact = e.target.value;
    });
    root.addEventListener('change', function (e) { if (e.target.matches('[data-file]')) G.file = e.target.files[0] || null; });
  }
  var newGift = function () { return { card: CARDS[0].id, msg: '', to: 'them', when: 'asap', name: '', from: '', contact: '', file: null }; };
  function giftError(G, root) {
    var focus = function (s) { var i = $(s, root); if (i) i.focus(); };
    if (G.to !== 'me' && !G.name.trim()) { focus('[data-name]'); return 'Add their name so we can address the postcard.'; }
    if (G.to === 'link' && !/@|\d{7,}/.test(G.contact.replace(/\D(?=\d)/g, ''))) { focus('[data-contact]'); return 'Add a phone number with area code, or an email, so we can reach them.'; }
    if (G.card === 'photo' && !G.file) return 'Choose a photo for the postcard, or pick another design.';
    return '';
  }
  function giftProps(G, gid, us) {
    var p = {};
    if (G.to !== 'me') { p.Recipient = G.name.trim(); if (G.from.trim()) p.From = G.from.trim(); }
    p['Send to'] = G.to === 'them' ? 'Ship to them' : G.to === 'me' ? 'Ship to me' : 'We text or email them for their address';
    if (G.to === 'link') p['Recipient contact'] = G.contact.trim();
    p.Ship = G.when === 'hold' ? 'Hold: ships ' + (SET.holdWindow || 'before Christmas') : 'Next business day';
    var card = CARDS.find(function (c) { return c.id === G.card; });
    p.Postcard = card ? card.n.replace(/, \+\$10$/, '') : G.card;
    if (G.msg.trim()) p.Message = G.msg.trim();
    if (us) p['Ships to'] = 'US addresses only';
    p._gid = gid;
    return p;
  }
  var gidOf = function () { return 'G' + Date.now().toString(36).toUpperCase(); };

  /* ---------- Polaroids ---------- */
  function polaroid(k, i) {
    var it = ITEMS[k];
    return '<button type="button" class="pola" style="--r:' + (ROT[i % ROT.length] / 3) + 'deg" aria-expanded="false" data-pola="' + k + '">' +
      '<span class="pola__art">' + art(k) + '</span><span class="pola__n">' + esc(it.n) + '</span><span class="pola__sz">' + esc(it.sz) + '</span>' +
      '<span class="pola__from">' + esc(it.from) + '</span><span class="pola__why">' + esc(it.why) + '</span></button>';
  }
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-pola]');
    if (!p) return;
    var open = p.getAttribute('aria-expanded') === 'true';
    $$('[data-pola]', p.parentNode).forEach(function (x) { x.setAttribute('aria-expanded', 'false'); });
    p.setAttribute('aria-expanded', String(!open));
  });

  /* ---------- Box panel (modal or inline on the product page) ---------- */
  function panel(key, inline) {
    var b = BOXES[key], us = usOnly(b.items), val = worth(key);
    var root = document.createElement('div');
    root.className = 'bxp' + (inline ? ' bxp--inline' : '');
    root.style.setProperty('--blob', b.blob);
    var id = key + (inline ? 'i' : 'm');
    root.innerHTML =
      '<div class="bxp__left">' +
        (inline ? '' : '<span class="kicker">' + esc(b.who) + '</span><h2 class="bxp__title" id="bxp-title-' + id + '">' + esc(b.n) + '</h2>') +
        '<p class="bxp__pitch">' + esc(b.pitch) + ' Tap any item to see why it made the box.</p>' +
        '<div class="bxp__grid">' + b.items.map(polaroid).join('') + '</div>' +
        '<p class="bxp__meta"><span>' + b.items.length + ' things inside, packed by hand in Michigan' + (us ? ' · ships to US addresses only' : '') + '</span>' + (val > b.p ? '<span>Worth <b>' + money(val) + '</b> on its own</span>' : '') + '</p>' +
      '</div>' +
      '<div class="bxp__right">' + giftHTML(id, us) +
        '<div class="bxp__buy"><span class="bxp__price" data-price>' + money(b.p) + '</span><button type="button" class="btn" data-add ' + (b.available === false ? 'disabled' : '') + '>' + (b.available === false ? 'Sold out' : 'Add to cart') + '</button></div>' +
      '</div>';
    var G = newGift();
    var reprice = function () { $('[data-price]', root).textContent = money(b.p + (G.card === 'photo' ? photoPrice : 0)); };
    bindGift(root, G, reprice);
    $('[data-add]', root).addEventListener('click', function () {
      var err = giftError(G, root);
      if (err) { toast(err); return; }
      if (!b.variant) { toast('This box is not set up in Shopify yet.'); return; }
      var btn = this, gid = gidOf();
      btn.disabled = true;
      addItems([{ id: b.variant, quantity: 1, properties: giftProps(G, gid, us) }])
        .then(function () { return G.card === 'photo' ? addPhoto(G.file, gid, b.n) : null; })
        .then(function () { closeModal(); refreshCart(); toast(b.n + ' is in your cart.'); })
        .catch(function (e) { toast(e.message); })
        .then(function () { btn.disabled = false; });
    });
    return root;
  }

  var modal;
  function openModal(key) {
    if (!BOXES[key]) return;
    if (!modal) {
      modal = document.createElement('dialog');
      modal.className = 'bxm';
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
      document.body.appendChild(modal);
    }
    modal.innerHTML = '<button type="button" class="btn btn--secondary btn--sm bxm__close" data-close>Close</button>';
    var p = panel(key, false);
    modal.appendChild(p);
    modal.setAttribute('aria-labelledby', $('.bxp__title', p).id);
    if (modal.showModal) modal.showModal(); else modal.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() { if (modal && modal.open) { modal.close(); document.body.style.overflow = ''; } }

  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-open-box]');
    if (o && BOXES[o.dataset.openBox]) { e.preventDefault(); openModal(o.dataset.openBox); }
  });

  /* ---------- Box cards ---------- */
  $$('[data-box-card]').forEach(function (card) {
    var b = BOXES[card.dataset.boxCard]; if (!b) return;
    var art_ = $('[data-tray]', card); if (art_) art_.innerHTML = tray(b.items);
    card.style.setProperty('--blob', b.blob);
    var who = $('[data-who]', card); if (who) who.textContent = b.who;
    var cnt = $('[data-count]', card); if (cnt) cnt.textContent = b.items.length + ' things';
    var val = worth(card.dataset.boxCard), w = $('[data-worth]', card);
    if (w && val > b.p) w.innerHTML = '<b>' + money(val) + '</b> of Michigan for ' + money(b.p);
    var makers = $('[data-makers]', card);
    if (makers) {
      var seen = []; b.items.forEach(function (k) { var m = ITEMS[k].m; if (m !== 'Us' && seen.indexOf(m) < 0 && !/TBD/.test(m)) seen.push(m); });
      makers.innerHTML = seen.slice(0, 4).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
    }
  });

  /* ---------- Inline panel on box product pages ---------- */
  $$('[data-box-panel]').forEach(function (host) {
    var key = host.dataset.boxPanel; if (!BOXES[key]) return;
    host.innerHTML = ''; host.appendChild(panel(key, true));
  });

  /* ---------- Gift finder ---------- */
  $$('[data-finder]').forEach(function (root) {
    var chips = $('[data-finder-chips]', root), out = $('[data-finder-result]', root);
    chips.innerHTML = FINDER.map(function (f, i) { return '<button type="button" class="chip" data-f="' + f.id + '" aria-pressed="' + (i === 0) + '">' + esc(f.l) + '</button>'; }).join('');
    function show(id) {
      var f = FINDER.find(function (x) { return x.id === id; });
      $$('[data-f]', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.f === id)); });
      if (f.box && BOXES[f.box]) {
        var b = BOXES[f.box];
        out.innerHTML = '<div class="fres__art" style="background:' + b.blob + '"><div class="tray">' + tray(b.items) + '</div></div><div class="fres__body"><span class="kicker">send them</span><div class="fres__top"><h3>' + esc(b.n) + '</h3><span class="price">' + money(b.p) + '</span></div><p>' + esc(f.why) + '</p><div class="fres__ctas"><button type="button" class="btn" data-open-box="' + f.box + '">See what\'s inside</button>' + (b.url ? '<a class="link-arrow" href="' + b.url + '">Box details</a>' : '') + '</div></div>';
      } else {
        out.innerHTML = '<div class="fres__art" style="background:var(--water)"><div class="tray">' + tray(['rockrye', 'bbq', 'mfudge', 'drycherry', 'stone']) + '</div></div><div class="fres__body"><span class="kicker">build them</span><div class="fres__top"><h3>A box you pack yourself</h3><span class="price">from ' + money(SIZES.half ? SIZES.half.p : 4900) + '</span></div><p>' + esc(f.why) + '</p><div class="fres__ctas"><a class="btn" href="' + (root.dataset.buildUrl || '#build') + '">Build a box</a></div></div>';
      }
      out.classList.remove('is-swap'); void out.offsetWidth; out.classList.add('is-swap');
    }
    chips.addEventListener('click', function (e) { var c = e.target.closest('[data-f]'); if (c) show(c.dataset.f); });
    show(FINDER[0].id);
  });

  /* ---------- Hometown map: every item has a Michigan address ---------- */
  $$('[data-mimap]').forEach(function (root) {
    var svg = $('[data-mimap-pins]', root), out = $('[data-mimap-panel]', root), tabs = $('[data-mimap-tabs]', root);
    var byPlace = {};
    Object.keys(ITEMS).forEach(function (k) { var it = ITEMS[k]; if (k === 'card' || !PLACES[it.place]) return; (byPlace[it.place] = byPlace[it.place] || []).push(k); });
    var placeKeys = Object.keys(byPlace);
    var regions = []; placeKeys.forEach(function (p) { var r = PLACES[p].region; if (regions.indexOf(r) < 0) regions.push(r); });
    var order = ['Metro Detroit', 'West Michigan', 'Up North', 'The U.P.', 'The Thumb'];
    regions.sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    tabs.innerHTML = ['All'].concat(regions).map(function (r, i) { return '<button type="button" class="region-tab" data-region="' + r + '" aria-pressed="' + (i === 0) + '">' + esc(r) + '</button>'; }).join('');
    svg.innerHTML = placeKeys.map(function (p) {
      var P = PLACES[p], n = byPlace[p].length, r = 9 + Math.min(n, 12) * 0.9;
      var left = P.x > 440;
      return '<g class="mpin" data-place="' + p + '" data-region="' + P.region + '" transform="translate(' + P.x + ' ' + P.y + ')" tabindex="0" role="button" aria-label="' + esc(P.n) + ': ' + n + ' item' + (n > 1 ? 's' : '') + '">' +
        '<circle class="mpin__pulse" r="' + r + '"/><circle class="mpin__dot" r="' + r + '"/><text class="mpin__n" y="4" text-anchor="middle">' + n + '</text>' +
        '<text class="mpin__label" x="' + (left ? -(r + 6) : r + 6) + '" y="5" text-anchor="' + (left ? 'end' : 'start') + '">' + esc(P.n) + '</text></g>';
    }).join('');
    function boxesWith(k) { return Object.keys(BOXES).filter(function (b) { return BOXES[b].items.indexOf(k) > -1; }); }
    function show(p) {
      $$('.mpin', svg).forEach(function (g) { g.classList.toggle('is-active', g.dataset.place === p); });
      var P = PLACES[p], ks = byPlace[p];
      out.innerHTML = '<span class="kicker">' + esc(P.region) + '</span><h3>' + esc(P.n) + '</h3><p class="mimap__count">' + ks.length + ' thing' + (ks.length > 1 ? 's' : '') + ' in our boxes come from here.</p>' +
        '<div class="mimap__items">' + ks.map(function (k, i) {
          var bx = boxesWith(k);
          return '<div class="mimap__item">' + polaroid(k, i) + (bx.length ? '<p class="mimap__in">In ' + bx.map(function (b) { return '<button type="button" class="link-arrow" data-open-box="' + b + '">' + esc(BOXES[b].n) + '</button>'; }).join(', ') + '</p>' : (ITEMS[k].shelf ? '<p class="mimap__in">Pick it in the box builder</p>' : '')) + '</div>';
        }).join('') + '</div>';
      out.classList.remove('is-swap'); void out.offsetWidth; out.classList.add('is-swap');
    }
    svg.addEventListener('click', function (e) { var g = e.target.closest('.mpin'); if (g) show(g.dataset.place); });
    svg.addEventListener('keydown', function (e) { var g = e.target.closest('.mpin'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(g.dataset.place); } });
    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('[data-region]'); if (!t) return;
      var r = t.dataset.region;
      $$('[data-region]', tabs).forEach(function (x) { x.setAttribute('aria-pressed', String(x === t)); });
      $$('.mpin', svg).forEach(function (g) { g.classList.toggle('is-dim', r !== 'All' && g.dataset.region !== r); });
      if (r !== 'All') { var first = placeKeys.filter(function (p) { return PLACES[p].region === r; })[0]; if (first) show(first); }
    });
    show(root.dataset.start && byPlace[root.dataset.start] ? root.dataset.start : 'mackinac');
  });

  /* ---------- Shelf builder ---------- */
  $$('[data-builder]').forEach(function (root) {
    var STEPS = ['Size', 'Fill it', 'Postcard + send', 'Review'];
    var BB = { step: 0, size: SIZES.full ? 'full' : 'half', shelf: SHELVES[0].id, picked: [], G: newGift() };
    var bar = $('[data-bb-steps]', root), main = $('[data-bb-main]', root), side = $('[data-bb-side]', root);
    var size = function () { return SIZES[BB.size]; };
    var upPrice = function (k) { var it = ITEMS[k]; if (!it.up) return 0; return UPG[it.upv] ? UPG[it.upv].price : it.up * 100; };
    var total = function () { return size().p + BB.picked.reduce(function (a, k) { return a + upPrice(k); }, 0) + (BB.G.card === 'photo' ? photoPrice : 0); };
    var shelfOf = function (k) { return ITEMS[k].shelf; };
    var covered = function () { var s = {}; BB.picked.forEach(function (k) { s[shelfOf(k)] = 1; }); return Object.keys(s).length; };
    function need() {
      var s = size(), n = BB.picked.length;
      if (BB.size === 'full') {
        var c = covered();
        if (c < SHELVES.length) return 'Pick something from every shelf (' + (SHELVES.length - c) + ' to go).';
      }
      return n < s.cap ? (s.cap - n) + ' more pick' + (s.cap - n > 1 ? 's' : '') + ' to fill the box.' : '';
    }
    function normalize() {
      var s = size(), cnt = {};
      BB.picked = BB.picked.filter(function (k) { var sh = shelfOf(k); cnt[sh] = (cnt[sh] || 0) + 1; return cnt[sh] <= s.per; }).slice(0, s.cap);
    }
    function canPick(k) {
      var s = size(), sh = shelfOf(k);
      if (BB.picked.length >= s.cap) return 'Your box is full. Remove something first.';
      var onShelf = BB.picked.filter(function (x) { return shelfOf(x) === sh; }).length;
      if (onShelf >= s.per) return s.per === 1 ? 'Half boxes take one pick per shelf.' : 'Two picks max from each shelf.';
      if (BB.size === 'full') {
        var missing = SHELVES.length - covered(), left = s.cap - BB.picked.length;
        if (onShelf > 0 && left <= missing) return 'Save room: you still need something from every shelf.';
      }
      return '';
    }
    function renderBar() {
      bar.innerHTML = STEPS.map(function (s, i) { return '<button type="button" role="tab" class="bb-step" data-go="' + i + '" aria-selected="' + (i === BB.step) + '"' + (i > BB.step + 1 || (i >= 2 && need()) ? ' disabled' : '') + '><span>' + (i + 1) + '.</span> ' + s + '</button>'; }).join('');
    }
    function renderSide() {
      var s = size();
      var slots = ''; for (var i = 0; i < s.cap; i++) { var k = BB.picked[i]; slots += '<span class="slot' + (k ? ' is-filled' : '') + '">' + (k ? art(k) : '') + '</span>'; }
      var lines = '<div class="bb-line"><span>' + esc(s.n) + '</span><span>' + money(s.p) + '</span></div>' +
        BB.picked.filter(function (k) { return upPrice(k); }).map(function (k) { return '<div class="bb-line"><span>' + esc(ITEMS[k].n) + '</span><span>+' + money(upPrice(k)) + '</span></div>'; }).join('') +
        (BB.G.card === 'photo' ? '<div class="bb-line"><span>Photo postcard</span><span>+' + money(photoPrice) + '</span></div>' : '<div class="bb-line"><span>Handwritten postcard</span><span>free</span></div>');
      side.innerHTML = '<h3>Your ' + esc(s.n.toLowerCase()) + '</h3><div class="slots" style="--cols:' + (s.cap > 4 ? 4 : s.cap) + '">' + slots + '</div><p class="bb-meter">' + (need() || 'Box full. Ready to send.') + '</p>' + lines + '<div class="bb-total"><span>Total</span><span>' + money(total()) + '</span></div>';
    }
    function sizeView() {
      return '<div class="bb-sizes">' + Object.keys(SIZES).map(function (k) { var s = SIZES[k]; return '<button type="button" class="bb-size" data-size="' + k + '" aria-pressed="' + (BB.size === k) + '"><b>' + esc(s.n) + '</b><span class="bb-size__p">' + money(s.p) + '</span><small>' + esc(s.d) + '</small></button>'; }).join('') + '</div>' +
        '<p class="form-note">Every pick is a Michigan original. Thimbleberry jam adds a little; the tile tells you how much.</p><div class="bb-nav"><span></span><button type="button" class="btn" data-go="1">Next: fill it</button></div>';
    }
    function fillView() {
      var sh = SHELVES.find(function (x) { return x.id === BB.shelf; });
      var keys = Object.keys(ITEMS).filter(function (k) { return ITEMS[k].shelf === BB.shelf; });
      return '<div class="bb-shelves" role="tablist">' + SHELVES.map(function (x) { var n = BB.picked.filter(function (k) { return shelfOf(k) === x.id; }).length; return '<button type="button" role="tab" class="bb-shelf" data-shelf="' + x.id + '" aria-selected="' + (x.id === BB.shelf) + '">' + esc(x.n) + (n ? ' <span class="bb-shelf__n">' + n + '</span>' : '') + '</button>'; }).join('') + '</div>' +
        '<p class="bb-note">' + esc(sh.note) + '</p><div class="bb-items">' + keys.map(function (k) {
          var it = ITEMS[k], on = BB.picked.indexOf(k) > -1, up = upPrice(k);
          return '<button type="button" class="bb-item' + (on ? ' is-on' : '') + '" data-pick="' + k + '" aria-pressed="' + on + '"><span class="bb-item__art">' + art(k) + '</span><b>' + esc(it.n) + '</b><small>' + esc(it.sz) + ' · ' + esc(it.from) + '</small><span class="bb-item__why">' + esc(it.why) + '</span>' + (up ? '<span class="bb-item__up">+' + money(up) + '</span>' : '') + '<span class="bb-item__check" aria-hidden="true"></span></button>';
        }).join('') + '</div><div class="bb-nav"><button type="button" class="btn btn--secondary" data-go="0">Back</button><button type="button" class="btn" data-go="2"' + (need() ? ' aria-disabled="true"' : '') + '>Next: postcard</button></div>';
    }
    function sendView() { return '<div class="bb-gift" data-bb-gift>' + giftHTML('bb', usOnly(BB.picked)) + '</div><div class="bb-nav"><button type="button" class="btn btn--secondary" data-go="1">Back</button><button type="button" class="btn" data-go="3">Review</button></div>'; }
    function reviewView() {
      var p = giftProps(BB.G, '', usOnly(BB.picked));
      return '<div class="bb-review"><div class="bxp__grid">' + BB.picked.concat(['card']).map(polaroid).join('') + '</div><dl class="bb-dl">' +
        Object.keys(p).filter(function (k) { return k[0] !== '_'; }).map(function (k) { return '<dt>' + esc(k) + '</dt><dd>' + esc(p[k]) + '</dd>'; }).join('') + '</dl></div>' +
        '<div class="bb-nav"><button type="button" class="btn btn--secondary" data-go="2">Back</button><button type="button" class="btn" data-bb-add>Add box to cart · ' + money(total()) + '</button></div>';
    }
    function render() {
      renderBar();
      main.innerHTML = [sizeView, fillView, sendView, reviewView][BB.step]();
      if (BB.step === 2) {
        var g = $('[data-bb-gift]', main), G = BB.G;
        bindGift(g, G, renderSide);
        // restore state
        $$('[data-card]', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.card === G.card)); });
        $('[data-photo]', g).hidden = G.card !== 'photo';
        $$('[data-to]', g).forEach(function (x) { x.setAttribute('aria-checked', String(x.dataset.to === G.to)); });
        $$('[data-when]', g).forEach(function (x) { x.setAttribute('aria-checked', String(x.dataset.when === G.when)); });
        $('[data-gfields]', g).hidden = G.to === 'me'; $('[data-contact-wrap]', g).hidden = G.to !== 'link';
        $('[data-msg]', g).value = G.msg; $('[data-name]', g).value = G.name; $('[data-from]', g).value = G.from; $('[data-contact]', g).value = G.contact;
      }
      renderSide();
    }
    root.addEventListener('click', function (e) {
      var go = e.target.closest('[data-go]');
      if (go && !go.disabled) {
        var to = Number(go.dataset.go);
        if (to >= 2 && need()) { toast(need()); return; }
        if (to === 3) { var err = giftError(BB.G, root); if (err) { toast(err); return; } }
        BB.step = to; render(); root.scrollIntoView({ block: 'start', behavior: 'smooth' }); return;
      }
      var sz = e.target.closest('[data-size]');
      if (sz) { BB.size = sz.dataset.size; normalize(); render(); return; }
      var sh = e.target.closest('[data-shelf]');
      if (sh) { BB.shelf = sh.dataset.shelf; render(); return; }
      var pk = e.target.closest('[data-pick]');
      if (pk) {
        var k = pk.dataset.pick, i = BB.picked.indexOf(k);
        if (i > -1) BB.picked.splice(i, 1);
        else { var why = canPick(k); if (why) { toast(why); return; } BB.picked.push(k); }
        render(); return;
      }
      if (e.target.closest('[data-bb-add]')) {
        var s = size();
        if (!s.variant) { toast('The builder boxes are not set up in Shopify yet.'); return; }
        var gid = gidOf(), us = usOnly(BB.picked), btn = e.target.closest('[data-bb-add]');
        var props = Object.assign({ Picks: BB.picked.map(function (k) { return ITEMS[k].n; }).join(', ') }, giftProps(BB.G, gid, us));
        var lines = [{ id: s.variant, quantity: 1, properties: props }];
        BB.picked.forEach(function (k) {
          var v = ITEMS[k].up && UPG[ITEMS[k].upv];
          if (v) lines.push({ id: v.variant, quantity: 1, properties: { Upgrade: ITEMS[k].n, _gid: gid } });
        });
        btn.disabled = true;
        addItems(lines).then(function () { return BB.G.card === 'photo' ? addPhoto(BB.G.file, gid, s.n) : null; })
          .then(function () { refreshCart(); toast('Your box is in the cart.'); BB.picked = []; BB.G = newGift(); BB.step = 0; render(); })
          .catch(function (er) { toast(er.message); btn.disabled = false; });
      }
    });
    render();
  });
})();
