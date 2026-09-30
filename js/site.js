/*
  SHARED SITE BEHAVIOR
  ====================
  I use a short transition for internal portfolio navigation while leaving external,
  email, new tab, and modified-click behavior unchanged. Reduced motion settings bypass
  the transition.
*/

(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      const sameSite = destination.protocol === current.protocol && destination.host === current.host;
      const isPortfolioPage = /(?:index|resume|snake|pong)\.html$/.test(destination.pathname);

      if (!sameSite || !isPortfolioPage) return;

      event.preventDefault();
      document.body.classList.add('page-exit');
      window.setTimeout(() => {
        window.location.href = destination.href;
      }, 180);
    });
  });
})();


/*
  MOBILE GAME CONTROL PROTECTION
  I suppress selection, context menus, and drag behavior only on movement controls so
  long presses in iOS Safari do not interrupt gameplay.
*/
(() => {
  const controls = document.querySelectorAll('.dpad-btn, [data-snake-dir], [data-pong-dir]');
  controls.forEach((control) => {
    control.addEventListener('selectstart', (event) => event.preventDefault());
    control.addEventListener('contextmenu', (event) => event.preventDefault());
    control.addEventListener('dragstart', (event) => event.preventDefault());
  });
})();
