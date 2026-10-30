(function () {
  'use strict';

  /* ---------- Editable configuration ----------
     Leave a value empty ('') and it is hidden on the page. */
  var CONFIG = {
    // RSVP: set a WhatsApp number (country code, digits only, e.g. '919XXXXXXXXX') and/or an email.
    // With neither set, the RSVP section stays hidden.
    rsvp: { sheet: '', whatsapp: '', email: '' }, // sheet = Google Apps Script web app URL (see google-apps-script/Code.gs),
    ceremonyStart: '12:10', // 24h, Asia/Kolkata (IST, UTC+05:30) on 20 Dec 2026
    music: 'assets/audio/wedding-song.mp3' // Empty = no music, button hidden.
  };

  var NAMES = document.body.getAttribute('data-names') || 'Amrutha & Rohan';
  var SIDE = document.body.getAttribute('data-side') || 'bride';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Opening video ----------
     Plays once (no loop). The intro is only removed when the video ends, errors,
     is skipped, autoplay is rejected, or playback never starts / stays stalled. */
  var intro = $('#intro'), video = $('#introVideo'), heroImg = $('#heroImg');
  var finished = false, startTimer, stallTimer;
  var START_TIMEOUT = 10000, STALL_TIMEOUT = 6000;

  function endIntro() {
    if (finished) return;
    finished = true;
    clearTimeout(startTimer); clearTimeout(stallTimer);
    // Make sure the hero is decoded so the cross-fade never shows an empty frame.
    var ready = heroImg && heroImg.decode ? heroImg.decode().catch(function () {}) : Promise.resolve();
    var cap = new Promise(function (r) { setTimeout(r, 1200); });
    Promise.race([ready, cap]).then(function () {
      document.body.classList.remove('intro-active');
      window.scrollTo(0, 0);
      intro.classList.add('out');
      setTimeout(function () { intro.hidden = true; try { video.pause(); } catch (e) {} }, 800);
    });
  }
  function armStall() { clearTimeout(stallTimer); stallTimer = setTimeout(endIntro, STALL_TIMEOUT); }
  function live() { intro.classList.add('live'); }
  function playing() { clearTimeout(startTimer); clearTimeout(stallTimer); live(); }

  if (reduce || !video) {
    endIntro();
  } else {
    video.loop = false;
    $('#skipIntro').addEventListener('click', endIntro);
    video.addEventListener('ended', endIntro);
    video.addEventListener('error', endIntro);
    var opened = false;
    video.addEventListener('loadeddata', function () { if (opened) { clearTimeout(startTimer); startTimer = setTimeout(endIntro, START_TIMEOUT); } });
    video.addEventListener('canplay', function () { if (opened && video.paused && !finished) { var q = video.play(); if (q && q.catch) q.catch(endIntro); } });
    video.addEventListener('playing', playing);
    video.addEventListener('waiting', armStall);
    video.addEventListener('stalled', armStall);
    // The tap on "Open Invitation" is the user gesture that lets music and video start.
    $('#openBtn').addEventListener('click', function () {
      if (opened) return;
      opened = true;
      intro.classList.add('playing');
      startMusic();
      startTimer = setTimeout(endIntro, START_TIMEOUT);
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(live);
      var p = video.play();
      if (p && p.catch) p.catch(endIntro);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-reveal],.reveal-img,.stagger').forEach(function (el) {
    if (io) io.observe(el); else el.classList.add('in');
  });

  /* ---------- Countdown (activates only when CONFIG.ceremonyStart is set) ---------- */
  var cdEl = $('#countdown');
  if (cdEl && /^\d{1,2}:\d{2}$/.test(CONFIG.ceremonyStart)) {
    var t = CONFIG.ceremonyStart.split(':');
    var target = new Date('2026-12-20T' + (t[0].length < 2 ? '0' : '') + t[0] + ':' + t[1] + ':00+05:30').getTime();
    var u = {}; $$('[data-u]', cdEl).forEach(function (n) { u[n.getAttribute('data-u')] = n; });
    var tick = function () {
      var d = Math.max(0, target - Date.now()), x = Math.floor(d / 1000);
      u.d.textContent = Math.floor(x / 86400); u.h.textContent = Math.floor(x % 86400 / 3600);
      u.m.textContent = Math.floor(x % 3600 / 60); u.s.textContent = x % 60;
      if (d === 0) clearInterval(iv);
    };
    var iv = setInterval(tick, 1000); tick(); cdEl.hidden = false;
  }


  /* ---------- Gallery + lightbox ---------- */
  var photos = [
    { k: 'collage2', w: 2061, h: 2576, alt: 'Four-panel film strip of the couple running through a sunlit garden', c: 'full' },
    { k: 'g3192', w: 2061, h: 2576, alt: 'Rohan seated on a bench and Amrutha glancing back, with a coastal view behind them', c: '' },
    { k: 'g3160', w: 2061, h: 2576, alt: 'Amrutha and Rohan sitting together on a stone balustrade among autumn trees', c: '' },
    { k: 'g3197', w: 2576, h: 1450, alt: 'The couple seated on a sunlit lawn in front of a stone manor house', c: 'full' },
    { k: 'g3251', w: 2061, h: 2576, alt: 'Amrutha and Rohan leaning together beneath a large old tree in golden light', c: '' },
    { k: 'moment1', w: 2061, h: 2576, alt: 'Rohan gently touching Amrutha\u2019s hair beside a flower-covered stone wall', c: '' },
    { k: 'g3183', w: 2297, h: 1838, alt: 'Close-up portrait of Amrutha in warm sunlight', c: 'full' },
    { k: 'g3218', w: 1450, h: 2576, alt: 'The couple embracing at the foot of a great tree', c: '' },
    { k: 'g3215', w: 1450, h: 2576, alt: 'The couple beneath a vast tree canopy lit by the sun', c: '' },
    { k: 'moment2', w: 2061, h: 2576, alt: 'Amrutha and Rohan walking hand in hand along a cobbled lane', c: '' },
    { k: 'story', w: 2060, h: 2576, alt: 'Amrutha and Rohan embracing in warm golden light', c: '' },
    { k: 'together', w: 2061, h: 2576, alt: 'Amrutha and Rohan resting their foreheads together beside a rose-covered doorway', c: 'solo' }
  ];
  var grid = $('#masonry');
  photos.forEach(function (ph, i) {
    var b = document.createElement('button');
    b.type = 'button'; if (ph.c) b.className = ph.c;
    b.setAttribute('aria-label', 'Open photo ' + (i + 1));
    b.innerHTML = '<img src="assets/img/' + ph.k + '-800.webp" srcset="assets/img/' + ph.k + '-800.webp 800w, assets/img/' + ph.k + '-1600.webp 1600w" sizes="(min-width:900px) ' + (ph.c === 'full' ? '1000px' : '480px') + ', 48vw" width="' + ph.w + '" height="' + ph.h +
      '" loading="lazy" decoding="async" alt="' + ph.alt + '">';
    b.addEventListener('click', function () { open(i); });
    grid.appendChild(b);
  });

  var lb = $('#lightbox'), lbImg = $('#lbImg'), idx = 0, lastFocus = null;
  function show(i) {
    idx = (i + photos.length) % photos.length;
    lbImg.src = 'assets/img/' + photos[idx].k + '-1600.webp';
    lbImg.alt = photos[idx].alt;
  }
  function open(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close').focus(); }
  function close() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $('.lb-close').addEventListener('click', close);
  $('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  $('.lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- RSVP (opens WhatsApp / email with a ready-made message) ---------- */
  var rsvpSec = $('#rsvp'), R = CONFIG.rsvp || {};
  R.sheet = document.body.getAttribute('data-sheet') || R.sheet; // each page can post to its own sheet
  if (rsvpSec && (R.sheet || R.whatsapp || R.email)) {
    rsvpSec.hidden = false;
    var form = $('#rsvpForm'), err = $('#rsvpErr'), mail = $('#rsvpMail');
    function text() {
      var f = form.elements, yes = f.attend.value === 'yes', n = f.name.value.trim();
      var t = 'RSVP \u2013 ' + NAMES + '\u2019s Wedding (20 December 2026)\nName: ' + n + '\n' +
        (yes ? 'Attending: Yes, joyfully accept\nGuests: ' + f.guests.value : 'Attending: Regretfully unable to attend');
      if (f.msg.value.trim()) t += '\nMessage: ' + f.msg.value.trim();
      return t;
    }
    $$('input[name=attend]', form).forEach(function (r) {
      r.addEventListener('change', function () { form.toggleAttribute('data-no', form.elements.attend.value === 'no'); });
    });
    if (R.email) {
      mail.hidden = false;
      mail.addEventListener('click', function (e) {
        e.preventDefault();
        if (!form.elements.name.value.trim()) { err.hidden = false; return; }
        location.href = 'mailto:' + R.email + '?subject=' + encodeURIComponent('RSVP \u2013 ' + NAMES) + '&body=' + encodeURIComponent(text());
      });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      if (!f.name.value.trim()) { err.hidden = false; f.name.focus(); return; }
      err.hidden = true;
      if (f.website && f.website.value) return; // spam trap
      var yes = f.attend.value === 'yes';
      if (R.sheet) {
        var btn = $('#rsvpSend'), fail = $('#rsvpFail');
        btn.disabled = true; btn.textContent = 'Sending\u2026'; fail.hidden = true;
        var done = function () { form.classList.add('sent'); $('#rsvpThanks').hidden = false; };
        var failed = function () { fail.hidden = false; btn.disabled = false; btn.textContent = 'Send RSVP'; };
        fetch(R.sheet, {
          method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name: f.name.value.trim(), attending: yes ? 'Yes' : 'No', guests: yes ? f.guests.value : 0, message: f.msg.value.trim(), side: SIDE })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.ok === false) failed(); else done();
        }).catch(function () {
          // No readable reply (browser CORS quirk): the request was still sent, so only fail when offline.
          if (navigator.onLine === false) failed(); else done();
        });
        return;
      }
      if (R.whatsapp) window.open('https://wa.me/' + R.whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(text()), '_blank', 'noopener');
      else if (R.email) mail.click();
    });
  }

  /* ---------- Music (starts from the beginning when the invitation is opened) ---------- */
  var mb = $('#musicBtn'), audio = null;
  function setOn(on) { mb.classList.toggle('on', on); mb.setAttribute('aria-label', on ? 'Pause background music' : 'Play background music'); }
  function startMusic() {
    if (!audio) return;
    audio.currentTime = 0;
    var p = audio.play();
    if (p && p.then) p.then(function () { setOn(true); }).catch(function () { setOn(false); });
  }
  if (CONFIG.music && mb) {
    audio = new Audio(CONFIG.music);
    audio.loop = true; audio.preload = 'auto';
    mb.hidden = false;
    mb.addEventListener('click', function () {
      if (audio.paused) { audio.play().then(function () { setOn(true); }).catch(function () {}); }
      else { audio.pause(); setOn(false); }
    });
  }
})();
