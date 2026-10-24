/* One HTML controller updates the signals in three independent Vega views. */
function initialiseWorldFilters(views) {
  const status = document.getElementById('world-filter-status');
  if (views.size !== 3) {
    status.textContent = 'Filters are unavailable because one or more maps could not load. Reload the page to retry.';
    return;
  }
  const genre = document.getElementById('world-genre');
  const timeline = document.getElementById('world-timeline');
  // Validate the map/filter contract before enabling any controls.
  for (const [id, view] of views) {
    for (const signal of ['selectedGenre', 'yearStart', 'yearEnd']) {
      try { view.signal(signal); }
      catch (error) { throw new Error(`${id} is missing the ${signal} filter signal.`, { cause: error }); }
    }
  }
  const rows = views.get('vis8').data('movies');
  if (!Array.isArray(rows)) throw new Error('The film data for map filters is unavailable.');
  const genresOf = row => String(row.genre || '').split('|').map(s => s.trim()).filter(Boolean);
  const genres = [...new Set(rows.flatMap(genresOf))].sort();
  genres.forEach(value => genre.add(new Option(value, value)));
  const state = { genre: 'All genres', start: 1980, end: 2025 };
  const ns = 'http://www.w3.org/2000/svg';
  function element(tag, attrs, text) {
    const node = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    timeline.append(node);
    return node;
  }
  let selection, dragging = null, pending = false;
  const step = 880 / 46;
  function drawTimeline() {
    timeline.replaceChildren();
    const counts = Array(46).fill(0);
    rows.forEach(row => {
      const year = Number(row.year);
      if (Number.isInteger(year) && year >= 1980 && year <= 2025 &&
          (state.genre === 'All genres' || genresOf(row).includes(state.genre))) counts[year - 1980]++;
    });
    const max = Math.max(1, ...counts);
    counts.forEach((count, i) => element('rect', {
      x: 20 + i * step + 1, y: 35 - 27 * count / max,
      width: step - 2, height: 27 * count / max, fill: '#6387a0'
    }));
    selection = element('rect', {y: 5, height: 32, fill: '#bd684e', 'fill-opacity': 0.2, stroke: '#bd684e', 'pointer-events': 'none'});
    for (const year of [1980, 1990, 2000, 2010, 2020, 2025]) {
      element('text', {x: 20 + (year - 1980 + 0.5) * step, y: 53, 'text-anchor': 'middle', fill: '#162633', 'font-size': 12}, year);
    }
    updateSelection();
  }
  function updateSelection() {
    selection.setAttribute('x', 20 + (state.start - 1980) * step);
    selection.setAttribute('width', (state.end - state.start + 1) * step);
  }
  // Serialize updates so rapid pointer movement cannot leave a map on an old range.
  async function updateViews() {
    if (pending) return;
    pending = true;
    try {
      let snapshot;
      do {
        snapshot = JSON.stringify(state);
        await Promise.all([...views.values()].map(view => view
          .signal('selectedGenre', state.genre)
          .signal('yearStart', state.start)
          .signal('yearEnd', state.end).runAsync()));
      } while (snapshot !== JSON.stringify(state));
      const count = rows.filter(row => Number(row.year) >= state.start && Number(row.year) <= state.end &&
        (state.genre === 'All genres' || genresOf(row).includes(state.genre))).length;
      status.textContent = `${state.genre} · ${state.start}–${state.end} · ${count.toLocaleString()} film records. ` +
        (count ? 'All three maps share the same valid-score film records and filters; links show Australian co-productions.' : 'No films match this selection. Try another genre or a wider time range.');
    } catch (error) {
      console.error(error);
      status.textContent = 'The maps could not update. Reload the page to retry.';
    } finally { pending = false; }
  }
  function apply() { updateSelection(); updateViews(); }
  genre.addEventListener('change', () => { state.genre = genre.value; drawTimeline(); updateViews(); });
  function pointerYear(event) {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(timeline.getScreenCTM().inverse());
    return Math.max(1980, Math.min(2025, 1980 + Math.floor((point.x - 20) / step)));
  }
  function brush(event) {
    const year = pointerYear(event);
    state.start = Math.min(dragging, year);
    state.end = Math.max(dragging, year);
    apply();
  }
  timeline.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    dragging = pointerYear(event);
    timeline.setPointerCapture(event.pointerId);
    brush(event);
  });
  timeline.addEventListener('pointermove', event => { if (dragging !== null) brush(event); });
  timeline.addEventListener('pointerup', event => {
    if (dragging !== null) brush(event);
    dragging = null;
    if (timeline.hasPointerCapture(event.pointerId)) timeline.releasePointerCapture(event.pointerId);
  });
  timeline.addEventListener('pointercancel', () => { dragging = null; });
  timeline.addEventListener('lostpointercapture', () => { dragging = null; });
  timeline.addEventListener('dblclick', () => { state.start = 1980; state.end = 2025; apply(); });
  document.getElementById('world-filter-reset').addEventListener('click', () => {
    state.genre = 'All genres'; state.start = 1980; state.end = 2025;
    genre.value = state.genre; drawTimeline(); updateViews();
  });
  document.getElementById('world-filter-controls').disabled = false;
  drawTimeline();
  updateViews();
}
