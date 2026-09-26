/* =============================================================
   Site JS — shared behaviors
   - Autoplay-in-view for gallery videos
   - Lightbox overlay for gallery images and videos
   ============================================================= */

(function () {
  // --- Autoplay-in-view for gallery videos ---
  const lazyVideos = document.querySelectorAll('video[data-lazy-video]');
  if ('IntersectionObserver' in window && lazyVideos.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    lazyVideos.forEach((v) => io.observe(v));
  }

  // --- Lightbox for gallery items + case-study evidence figures ---
  const items = document.querySelectorAll(
    '.gallery-item, .cs-evidence, .breakdown-step, .cs-refresh-proof'
  );
  if (items.length === 0) return;

  // Collect media descriptors in DOM order
  const media = Array.from(items).map((item) => {
    const img = item.querySelector('img');
    if (img) return { type: 'img', src: img.currentSrc || img.src, alt: img.alt || '' };
    const video = item.querySelector('video');
    if (video) {
      const source = video.querySelector('source');
      return {
        type: 'video',
        src: source ? source.src : video.src,
        poster: video.getAttribute('poster') || '',
      };
    }
    return null;
  });

  // Build lightbox DOM once
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = [
    '<button class="lightbox-close" aria-label="Close (Esc)">&times;</button>',
    '<button class="lightbox-nav lightbox-prev" aria-label="Previous (\u2190)">&lsaquo;</button>',
    '<div class="lightbox-stage"></div>',
    '<button class="lightbox-nav lightbox-next" aria-label="Next (\u2192)">&rsaquo;</button>',
    '<div class="lightbox-counter" aria-live="polite"></div>',
  ].join('');
  document.body.appendChild(lb);

  const stage    = lb.querySelector('.lightbox-stage');
  const btnClose = lb.querySelector('.lightbox-close');
  const btnPrev  = lb.querySelector('.lightbox-prev');
  const btnNext  = lb.querySelector('.lightbox-next');
  const counter  = lb.querySelector('.lightbox-counter');

  let currentIndex = -1;

  function render(idx) {
    const m = media[idx];
    if (!m) return;
    currentIndex = idx;
    counter.textContent = (idx + 1) + ' / ' + media.length;

    if (m.type === 'img') {
      stage.innerHTML = '';
      const el = document.createElement('img');
      el.src = m.src;
      el.alt = m.alt;
      stage.appendChild(el);
    } else {
      stage.innerHTML = '';
      const el = document.createElement('video');
      el.src = m.src;
      el.autoplay = true;
      el.loop = true;
      el.muted = true;
      el.playsInline = true;
      if (m.poster) el.poster = m.poster;
      stage.appendChild(el);
      el.play().catch(() => {});
    }
  }

  function open(idx) {
    render(idx);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Pause any playing gallery videos so we're not decoding 2 streams at once
    document.querySelectorAll('.gallery-item video').forEach((v) => v.pause());
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '';
    document.body.style.overflow = '';
    currentIndex = -1;
    // Resume the gallery videos that are currently in view
    document.querySelectorAll('.gallery-item video').forEach((v) => {
      const r = v.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.65 && r.bottom > window.innerHeight * 0.35;
      if (inView) v.play().catch(() => {});
    });
  }

  function next() { if (currentIndex >= 0) render((currentIndex + 1) % media.length); }
  function prev() { if (currentIndex >= 0) render((currentIndex - 1 + media.length) % media.length); }

  items.forEach((item, idx) => {
    if (!media[idx]) return;
    item.classList.add('is-lightbox-target');
    item.addEventListener('click', (e) => {
      // Ignore clicks on links inside a figure (e.g. captions with anchors)
      if (e.target.closest('a')) return;
      e.preventDefault();
      open(idx);
    });
  });

  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });

  // Click backdrop to close (but not clicks on the media itself)
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target === stage) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });
})();
