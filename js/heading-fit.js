/* Keep content headings on one line without overflowing their columns. */
(() => {
  const headings = [...document.querySelectorAll('main h2, main h3, main h4')];
  function fit(heading) {
    heading.style.removeProperty('font-size');
    if (window.matchMedia('(max-width: 680px)').matches) return;
    const available = heading.clientWidth;
    if (!available) return;
    const natural = heading.scrollWidth;
    if (natural > available) {
      const size = parseFloat(getComputedStyle(heading).fontSize);
      heading.style.fontSize = `${Math.floor(size * available / natural * 0.98 * 100) / 100}px`;
    }
  }
  const observer = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
  headings.forEach(heading => { observer.observe(heading); fit(heading); });
  window.addEventListener('resize', () => headings.forEach(fit));
  if (document.fonts) document.fonts.ready.then(() => headings.forEach(fit));
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const updateOffset = () => {
      const sticky = getComputedStyle(navbar).position === 'sticky';
      document.documentElement.style.setProperty('--filter-top',
        `${sticky ? Math.ceil(navbar.getBoundingClientRect().height) + 8 : 8}px`);
    };
    new ResizeObserver(updateOffset).observe(navbar);
    window.addEventListener('resize', updateOffset);
    updateOffset();
  }
})();
