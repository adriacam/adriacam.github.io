// script.js
(() => {
  const canvas = document.getElementById('gen-art');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const cellSize = 5;
  let gridWidth, gridHeight;
  let grid, ant, oldX, oldY, animId;

  // Resize canvas to match CSS size and recalc grid
  function resizeCanvas() {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gridWidth  = Math.floor(canvas.width  / cellSize);
    gridHeight = Math.floor(canvas.height / cellSize);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resizeCanvas();
    init();
    animate();
  });

  // Initialize grid & ant, clear canvas
  function init() {
    resizeCanvas();
    grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
    ant = {
      x: Math.floor(gridWidth  / 2),
      y: Math.floor(gridHeight / 2),
      dir: 0  // 0=up,1=right,2=down,3=left
    };
    oldX = ant.x;
    oldY = ant.y;
    ctx.fillStyle = '#1a1f26';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawAnt(oldX, oldY);
  }

  function drawCell(x, y) {
    ctx.fillStyle = grid[y][x] ? '#1a1f26' : '#8BC34A';
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  function drawAnt(x, y) {
    ctx.fillStyle = '#00edff';
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }

  // Perform one Langton’s Ant step
  function step() {
    // Erase old ant by redrawing its cell
    drawCell(oldX, oldY);

    // Toggle & turn on current cell
    const { x, y } = ant;
    const state = grid[y][x];
    ant.dir = state ? (ant.dir + 3) % 4 : (ant.dir + 1) % 4;
    grid[y][x] = !state;
    drawCell(x, y);

    // Move forward
    if (ant.dir === 0) ant.y--;
    else if (ant.dir === 1) ant.x++;
    else if (ant.dir === 2) ant.y++;
    else ant.x--;

    // Wrap edges
    if (ant.x < 0)             ant.x = gridWidth - 1;
    if (ant.x >= gridWidth)   ant.x = 0;
    if (ant.y < 0)             ant.y = gridHeight - 1;
    if (ant.y >= gridHeight)  ant.y = 0;

    // Draw ant at new pos
    drawAnt(ant.x, ant.y);
    oldX = ant.x;
    oldY = ant.y;
  }

  // Animation loop
  function animate() {
    step();
    animId = requestAnimationFrame(animate);
  }

  // Start simulation
  init();
  animate();

  // Click to reset & restart
  canvas.addEventListener('click', () => {
    cancelAnimationFrame(animId);
    init();
    animate();
  });
})();
