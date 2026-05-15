// ── Filter pills (benchmark env grid) ─────────────────────────────────────
document.querySelectorAll('.filter-bar[data-target]').forEach(bar => {
  const target = document.getElementById(bar.dataset.target);
  if (!target) return;
  const cards = target.querySelectorAll('[data-cat]');
  bar.querySelectorAll('.filter-pill[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const show = (f === 'all') || (c.dataset.cat === f);
        c.classList.toggle('hidden', !show);
      });
    });
  });
});

// ── Mode toggle (InD↔OoD compare grid) ────────────────────────────────────
document.querySelectorAll('.filter-bar.mode-bar').forEach(bar => {
  const grid = document.getElementById('compare-grid');
  if (!grid) return;
  bar.querySelectorAll('.filter-pill[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const m = btn.dataset.mode;
      grid.classList.remove('mode-ind', 'mode-ood');
      if (m === 'ind') grid.classList.add('mode-ind');
      else if (m === 'ood') grid.classList.add('mode-ood');
    });
  });
});

// ── Result-row video carousels ────────────────────────────────────────────
document.querySelectorAll('.result-carousel').forEach((root) => {
  const slides = (root.dataset.slides || '').split(',').map(s => s.trim()).filter(Boolean);
  if (slides.length === 0) return;

  const video    = root.querySelector('video');
  const dotsBox  = root.querySelector('.carousel-dots');
  const counter  = root.querySelector('.counter-now');
  const totalEl  = root.querySelector('.counter-total');
  const prevBtn  = root.querySelector('.carousel-arrow.prev');
  const nextBtn  = root.querySelector('.carousel-arrow.next');
  const stage    = root.querySelector('.carousel-stage');

  let idx = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.dataset.idx = i;
    dot.setAttribute('aria-label', `Clip ${i + 1}`);
    dot.addEventListener('click', (e) => { e.stopPropagation(); goTo(i); });
    dotsBox.appendChild(dot);
  });
  if (totalEl) totalEl.textContent = slides.length;

  function goTo(i, autoplayHint = true) {
    idx = ((i % slides.length) + slides.length) % slides.length;
    // Update src and let the new clip start
    video.src = slides[idx];
    // Some browsers need an explicit play() after src changes
    if (autoplayHint) {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }
    // Sync UI
    dotsBox.querySelectorAll('.dot').forEach((d, j) => d.classList.toggle('active', j === idx));
    if (counter) counter.textContent = idx + 1;
  }

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(idx - 1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(idx + 1); });
  // Click the video (or stage) to advance
  if (stage) stage.addEventListener('click', () => goTo(idx + 1));

  // initial load (no need to play() since the <video> has autoplay attribute)
  video.src = slides[0];
});

// ── Lazy-pause offscreen videos to keep things smooth ─────────────────────
const allVideos = document.querySelectorAll('video');
if ('IntersectionObserver' in window) {
  const vidObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        if (v.paused) v.play().catch(() => {});
      } else {
        if (!v.paused) v.pause();
      }
    });
  }, { threshold: 0.05 });
  allVideos.forEach(v => vidObserver.observe(v));
}
