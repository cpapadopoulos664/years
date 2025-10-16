(function () {
  const TOTAL = 25185;
  const PER_COLUMN = 1000;
  const GREEN = 3285;
  const BLUE = 14600;
  const RED = TOTAL - GREEN - BLUE;

  const grid = document.getElementById('grid');
  const filledCountEl = document.getElementById('filledCount');
  const totalCountEl = document.getElementById('totalCount');
  totalCountEl.textContent = String(TOTAL);

  // Pre-compute color by index (0-based)
  function colorForIndex(idx) {
    if (idx < GREEN) return 'green';
    if (idx < GREEN + BLUE) return 'blue';
    return 'red';
  }

  function renderGrid(filledCount) {
    // Calculate number of columns
    const columns = Math.ceil(TOTAL / PER_COLUMN);
    // Build columns with document fragments for performance
    grid.textContent = '';
    for (let c = 0; c < columns; c++) {
      const colEl = document.createElement('div');
      colEl.className = 'col';
      const start = c * PER_COLUMN;
      const end = Math.min(start + PER_COLUMN, TOTAL);
      const frag = document.createDocumentFragment();
      for (let i = start; i < end; i++) {
        const box = document.createElement('div');
        box.className = 'box';
        if (i < filledCount) {
          box.classList.add(colorForIndex(i));
        }
        frag.appendChild(box);
      }
      colEl.appendChild(frag);
      grid.appendChild(colEl);
    }
  }

  async function fetchProgress() {
    try {
      const res = await fetch('/api/progress');
      if (!res.ok) throw new Error('Failed to load progress');
      return await res.json();
    } catch (e) {
      console.error(e);
      return { filledCount: 0 };
    }
  }

  function updateStats(filled) {
    filledCountEl.textContent = String(filled);
  }

  // Initial load
  (async function init() {
    const { filledCount } = await fetchProgress();
    updateStats(filledCount);
    renderGrid(filledCount);
  })();
})();


