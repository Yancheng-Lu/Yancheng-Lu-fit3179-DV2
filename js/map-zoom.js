/* Zoom the SVG viewport so map marks, labels and flows move together.
   Vega data and global filter signals remain independent of navigation. */
function initialiseMapZoom(target, svg) {
  const bounds = svg.viewBox.baseVal;
  const original = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  let zoom = 1, x = original.x, y = original.y, drag = null;
  const toolbar = document.createElement('div');
  toolbar.className = 'map-zoom-controls';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Map zoom controls');
  const label = document.createElement('span');
  label.className = 'map-zoom-level';
  label.setAttribute('aria-live', 'polite');
  function button(text, title, action) {
    const el = document.createElement('button');
    el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', title);
    el.title = title; el.addEventListener('click', action); toolbar.append(el); return el;
  }
  const out = button('−', 'Zoom out', () => changeZoom(zoom / 1.4));
  const inside = button('+', 'Zoom in', () => changeZoom(zoom * 1.4));
  button('Reset', 'Reset map view', () => { zoom = 1; x = original.x; y = original.y; render(); });
  toolbar.append(label);
  const hint = document.createElement('span');
  hint.className = 'map-zoom-hint'; hint.textContent = 'Zoom in, then drag to pan'; toolbar.append(hint);
  target.before(toolbar);
  function render() {
    const width = original.width / zoom, height = original.height / zoom;
    x = Math.max(original.x, Math.min(original.x + original.width - width, x));
    y = Math.max(original.y, Math.min(original.y + original.height - height, y));
    svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    // Keep the original display ratio while changing only the visible region.
    svg.style.aspectRatio = `${original.width} / ${original.height}`;
    svg.classList.toggle('map-zoomed', zoom > 1);
    label.textContent = `${zoom.toFixed(1)}×`;
    out.disabled = zoom <= 1; inside.disabled = zoom >= 6;
  }
  function changeZoom(value) {
    const next = Math.max(1, Math.min(6, value));
    x += original.width / zoom / 2 - original.width / next / 2;
    y += original.height / zoom / 2 - original.height / next / 2;
    zoom = next; render();
  }
  svg.addEventListener('pointerdown', event => {
    if (zoom <= 1 || !event.isPrimary || event.button !== 0) return;
    drag = { clientX: event.clientX, clientY: event.clientY, x, y,
      inverse: svg.getScreenCTM().inverse() };
    svg.setPointerCapture(event.pointerId);
    svg.classList.add('map-panning');
    event.preventDefault();
  });
  svg.addEventListener('pointermove', event => {
    if (!drag) return;
    const from = new DOMPoint(drag.clientX, drag.clientY).matrixTransform(drag.inverse);
    const to = new DOMPoint(event.clientX, event.clientY).matrixTransform(drag.inverse);
    x = drag.x + from.x - to.x; y = drag.y + from.y - to.y; render();
  });
  function stop() { drag = null; svg.classList.remove('map-panning'); }
  svg.addEventListener('pointerup', event => {
    stop(); if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  });
  svg.addEventListener('pointercancel', stop);
  svg.addEventListener('lostpointercapture', stop);
  render();
}

/* First map: zoom the geographic projection, not the SVG or the bars. */
function initialiseCountryBarZoom(target, svg, view) {
  let zoom = 1, panX = 0, panY = 0, country = '', pending = false;
  const toolbar = document.createElement('div');
  toolbar.className = 'map-zoom-controls';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Country focus controls');
  const status = document.createElement('span');
  status.setAttribute('aria-live', 'polite');
  function button(text, title, action) {
    const node = document.createElement('button');
    node.type = 'button'; node.textContent = text; node.setAttribute('aria-label', title);
    node.addEventListener('click', action); toolbar.append(node); return node;
  }
  function changeZoom(value) {
    const next = Math.max(1, Math.min(6, value));
    panX *= next / zoom; panY *= next / zoom; zoom = next;
    if (zoom === 1) { panX = 0; panY = 0; country = ''; }
    update();
  }
  const out = button('−', 'Zoom out', () => changeZoom(zoom / 1.4));
  const inside = button('+', 'Zoom in', () => changeZoom(zoom * 1.4));
  button('Reset', 'Reset map view', () => { zoom = 1; panX = 0; panY = 0; country = ''; update(); });
  toolbar.append(status);
  const hint = document.createElement('span');
  hint.className = 'map-zoom-hint'; hint.textContent = 'Click a bar to focus, or use + / −; drag to pan when zoomed';
  toolbar.append(hint); target.before(toolbar);
  async function update() {
    status.textContent = `${country ? country + ' · ' : ''}${zoom.toFixed(1)}×`;
    out.disabled = zoom <= 1;
    inside.disabled = zoom >= 6;
    svg.classList.toggle('map-zoomed', zoom > 1);
    if (pending) return;
    pending = true;
    try {
      let snapshot;
      do {
        snapshot = [zoom, panX, panY].join(',');
        await view.signal('mapZoom', zoom).signal('mapPanX', panX).signal('mapPanY', panY).runAsync();
      } while (snapshot !== [zoom, panX, panY].join(','));
    } catch (error) {
      console.error('Country zoom failed', error);
      status.textContent = 'Could not update map zoom. Try Reset.';
    } finally { pending = false; }
  }
  let drag = null, suppressClick = false;
  svg.addEventListener('pointerdown', event => {
    if (zoom <= 1 || !event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    drag = { clientX: event.clientX, clientY: event.clientY, panX, panY,
      inverse: svg.getScreenCTM().inverse() };
  });
  svg.addEventListener('pointermove', event => {
    if (!drag) return;
    if (!suppressClick && Math.hypot(event.clientX - drag.clientX, event.clientY - drag.clientY) < 5) return;
    suppressClick = true;
    if (!svg.hasPointerCapture(event.pointerId)) svg.setPointerCapture(event.pointerId);
    svg.classList.add('map-panning');
    const from = new DOMPoint(drag.clientX, drag.clientY).matrixTransform(drag.inverse);
    const to = new DOMPoint(event.clientX, event.clientY).matrixTransform(drag.inverse);
    panX = drag.panX + to.x - from.x;
    panY = drag.panY + to.y - from.y;
    country = ''; update();
  });
  function stopDrag() { drag = null; svg.classList.remove('map-panning'); }
  svg.addEventListener('pointerup', event => {
    stopDrag();
    if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  });
  svg.addEventListener('pointercancel', stopDrag);
  svg.addEventListener('lostpointercapture', stopDrag);
  view.addEventListener('click', (event, item) => {
    if (suppressClick) { suppressClick = false; return; }
    if (item?.mark?.name !== 'countryBars' || !item.datum?.centroid) return;
    const centerX = view.signal('width') / 2;
    const centerY = view.signal('height') / 2 + 15;
    const next = 4;
    panX = (centerX + panX - item.datum.centroid[0]) * next / zoom;
    panY = (centerY + panY - item.datum.centroid[1]) * next / zoom;
    zoom = next; country = item.datum.country; update();
  });
  update();
}
