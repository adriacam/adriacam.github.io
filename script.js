// script.js
(() => {
  const canvas = document.getElementById('gen-art');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Simulation parameters
  const cellSize = 5;
  let gridWidth, gridHeight, grid, ant, oldX, oldY, animId;

  // Colors pulled from CSS
  let bgAlt;
  let paletteCols = [];
  let antColor, traceColor;

  // Read CSS variables into JS
  function updateColorsFromCSS() {
    const styles = getComputedStyle(document.documentElement);
    bgAlt = styles.getPropertyValue('--bg-alt').trim() || '#005f73';
    paletteCols = [
      styles.getPropertyValue('--accent-primary').trim(),
      styles.getPropertyValue('--accent-secondary').trim(),
      styles.getPropertyValue('--highlight').trim(),
      styles.getPropertyValue('--linkedin-btn').trim()
    ].filter(c => c);
  }

  // Pick two distinct random colors for this run
  function pickColors() {
    antColor   = paletteCols[Math.floor(Math.random() * paletteCols.length)];
    const others = paletteCols.filter(c => c !== antColor);
    traceColor = others[Math.floor(Math.random() * others.length)];
  }

  // Resize canvas & recalc grid size
  function resizeCanvas() {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gridWidth  = Math.floor(canvas.width  / cellSize);
    gridHeight = Math.floor(canvas.height / cellSize);
  }

  // Initialize/reset simulation
  function init() {
    resizeCanvas();
    updateColorsFromCSS();
    pickColors();
    grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
    ant = { x: Math.floor(gridWidth/2), y: Math.floor(gridHeight/2), dir: 0 };
    oldX = ant.x; oldY = ant.y;

    // fill background to match your card bg
    ctx.fillStyle = bgAlt;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw initial ant head
    drawAnt(oldX, oldY);
  }

  // Draw helpers
  function drawCell(x,y) {
    ctx.fillStyle = grid[y][x] ? traceColor : bgAlt;
    ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
  }

  function drawAnt(x,y) {
    ctx.fillStyle = antColor;
    ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
  }

  // One Langton’s Ant step
  function step() {
    drawCell(oldX, oldY);

    const { x, y } = ant;
    const state = grid[y][x];
    ant.dir = state ? (ant.dir + 3) % 4 : (ant.dir + 1) % 4;
    grid[y][x] = !state;
    drawCell(x, y);

    if (ant.dir === 0) ant.y--;
    else if (ant.dir === 1) ant.x++;
    else if (ant.dir === 2) ant.y++;
    else ant.x--;

    // wrap edges
    if (ant.x < 0)          ant.x = gridWidth - 1;
    if (ant.x >= gridWidth) ant.x = 0;
    if (ant.y < 0)          ant.y = gridHeight - 1;
    if (ant.y >= gridHeight)ant.y = 0;

    drawAnt(ant.x, ant.y);
    oldX = ant.x; oldY = ant.y;
  }

  // Animation loop
  function animate() {
    step();
    animId = requestAnimationFrame(animate);
  }

  // Full reset (stop → init → animate)
  function reset() {
    cancelAnimationFrame(animId);
    init();
    animate();
  }

  // Event bindings
  window.addEventListener('resize', reset);
  canvas.addEventListener('click', reset);

  // Day/Night toggle resets the ant too
  const toggleBtn = document.getElementById('theme-toggle');
  const rootEl    = document.documentElement;

  // Restore saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    rootEl.setAttribute('data-theme','light');
    toggleBtn.textContent = '☀️';
  }

  toggleBtn.addEventListener('click', () => {
    const next = rootEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    rootEl.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggleBtn.textContent = next === 'light' ? '☀️' : '🌙';

    reset();
  });

  // Kick things off
  init();
  animate();
})();
