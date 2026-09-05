// Comet-style perspective, implemented locally without React or device sensors.
(() => {
  const surface = document.querySelector('[data-profile-tilt]');
  if (!surface) return;
  const host = surface.parentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let point = null;
  const enabled = () => fine.matches && !reduced.matches;
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    point = null;
    surface.classList.remove('is-tilting');
    for (const key of ['--tilt-x', '--tilt-y', '--glow-x', '--glow-y']) surface.style.removeProperty(key);
  }
  host.addEventListener('pointermove', event => {
    if (!enabled() || event.pointerType !== 'mouse') return;
    // Measure the stationary host, not the rotating surface: no edge feedback.
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    point = {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!enabled() || !point) return reset();
      surface.style.setProperty('--tilt-x', `${(0.5 - point.y) * 12}deg`);
      surface.style.setProperty('--tilt-y', `${(point.x - 0.5) * 12}deg`);
      surface.style.setProperty('--glow-x', `${point.x * 100}%`);
      surface.style.setProperty('--glow-y', `${point.y * 100}%`);
      surface.classList.add('is-tilting');
    });
  }, { passive: true });
  for (const event of ['pointerleave', 'pointercancel', 'focusin']) host.addEventListener(event, reset);
  for (const event of ['blur', 'resize', 'beforeprint']) window.addEventListener(event, reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  fine.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
})();
