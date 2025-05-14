// script.js

// Simple debounce helper
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  // ——— Day / Night Theme Toggle ———
  const themeBtn = document.getElementById('theme-toggle');
  const rootEl   = document.documentElement;
  const saved    = localStorage.getItem('theme');
  if (saved === 'light') {
    rootEl.dataset.theme = 'light';
    themeBtn.textContent = '☀️';
  }
  themeBtn.addEventListener('click', () => {
    themeBtn.classList.add('rotate');
    setTimeout(() => themeBtn.classList.remove('rotate'), 400);
    const next = rootEl.dataset.theme === 'light' ? 'dark' : 'light';
    rootEl.dataset.theme = next;
    localStorage.setItem('theme', next);
    themeBtn.textContent = next === 'light' ? '☀️' : '🌙';
  });

  // ——— Shared Config & CSS Variables ———
  const CONFIG = {
    POP:       10,
    LIFESPAN:  200,
    MUTATION:  0.2,
    DT:        0.01,
    MAX_PTS:   400,
    K:         [0.0826, 0.1101, 1.0800, 0.2400]
  };
  const styles = getComputedStyle(rootEl);
  const COLORS = {
    moon:   styles.getPropertyValue('--text-secondary').trim(),
    rockets: [
      styles.getPropertyValue('--accent-primary').trim(),
      styles.getPropertyValue('--accent-secondary').trim(),
      styles.getPropertyValue('--text-main').trim(),
      styles.getPropertyValue('--text-secondary').trim(),
      styles.getPropertyValue('--highlight').trim()
    ]
  };

  // ——— Genetic Rocket-to-Moon Simulation ———
  (function setupRocket() {
    const canvas = document.getElementById('rocket-canvas');
    const ctx    = canvas.getContext('2d');
    let W, H, generation, rockets, frame, moon, hitRad;

    class Rocket {
      constructor(brain) {
        this.pos      = { x: W/2,    y: H - 20 };
        this.vel      = { x: 0,      y: 0   };
        this.brain    = brain || Array.from({ length: CONFIG.LIFESPAN }, randomAccel);
        this.trail    = [];
        this.reached  = false;
        this.fitness  = 0;
      }
      step(i) {
        if (this.reached) return;
        const a = this.brain[i];
        this.vel.x += a.x; this.vel.y += a.y;
        this.pos.x += this.vel.x; this.pos.y += this.vel.y;
        this.trail.push({ ...this.pos });
        if (Math.hypot(this.pos.x - moon.x, this.pos.y - moon.y) < hitRad) {
          this.reached = true;
        }
      }
      draw(col) {
        ctx.strokeStyle = col;
        ctx.beginPath();
        this.trail.forEach((p, i) =>
          i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)
        );
        ctx.stroke();
        ctx.fillStyle    = col;
        ctx.font         = '16px serif';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛸', this.pos.x, this.pos.y);
      }
      calcFitness() {
        const d = Math.hypot(this.pos.x - moon.x, this.pos.y - moon.y);
        this.fitness = this.reached 
          ? 1e6 / generation 
          : 1 / (d * d);
      }
      clone() { return new Rocket(this.brain.slice()); }
      mutate() {
        this.brain = this.brain.map(a =>
          Math.random() < CONFIG.MUTATION ? randomAccel() : a
        );
      }
    }

    function randomAccel() {
      return { 
        x: (Math.random() * 2 - 1) * 0.1,
        y: (Math.random() * 2 - 1) * 0.1
      };
    }

    function reset() {
      canvas.width  = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      W = canvas.width; H = canvas.height;
      ctx.font = '20px serif';
      const m = ctx.measureText('🌕');
      hitRad = m.actualBoundingBoxAscent || m.width / 2;
      generation = 0; frame = 0;
      rockets = Array.from({ length: CONFIG.POP }, () => new Rocket());
      placeMoon();
      document.getElementById('rocket-msg').textContent = '';
    }

    function placeMoon() {
      moon = {
        x: 20 + Math.random() * (W - 40),
        y: 20 + Math.random() * (H / 2)
      };
    }

    function nextGen() {
      rockets.forEach(r => r.calcFitness());
      rockets.sort((a, b) => b.fitness - a.fitness);
      const best = rockets[0];
      const msg  = document.getElementById('rocket-msg');
      if (best.reached) {
        msg.textContent = `Reached! Generation ${generation}`;
        generation = 1;
        placeMoon();
      } else {
        generation++;
        msg.textContent = '';
      }
      const newPop = [best.clone()];
      while (newPop.length < CONFIG.POP) {
        const parent = rockets[Math.floor(Math.random() * (CONFIG.POP / 2))].clone();
        parent.mutate();
        newPop.push(parent);
      }
      rockets = newPop; frame = 0;
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);

      // draw moon
      ctx.fillStyle    = COLORS.moon;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌕', moon.x, moon.y);

      // step each rocket at current frame, then advance frame by 1
      if (frame < CONFIG.LIFESPAN) {
        rockets.forEach(r => r.step(frame));
        frame++;
      } else {
        nextGen();
      }

      // draw all rockets
      const col = COLORS.rockets[generation % COLORS.rockets.length];
      rockets.forEach(r => r.draw(col));

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', debounce(reset, 100));
    reset();
    animate();
  })();

  // ——— Steady-State Ball-on-Beam Demo ———
  (function setupStateSpace() {
    const canvas = document.getElementById('ss-canvas');
    class Demo {
      constructor(dt, A, B, K) {
        this.dt      = dt;
        this.A       = A; this.B = B; this.K = K;
        this.maxPts  = CONFIG.MAX_PTS;
        this.history = [];
        this.r       = 0;
        this.dragging = false;
        this.ctx     = canvas.getContext('2d');
        this.handle = document.getElementById('ss-handle');

        window.addEventListener('resize', debounce(() => this._resize(), 100));
        this._resize();
        this._updateHandle();
        this._bindDrag();
      }

      _resize() {
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        this.halfH = canvas.height / 2;
      }

      _bindDrag() {
        this.handle.addEventListener('pointerdown', e => {
          this.dragging = true;
          this.handle.setPointerCapture(e.pointerId);
        });
        this.handle.addEventListener('pointermove', e => {
          if (!this.dragging) return;
          const y = e.clientY - canvas.getBoundingClientRect().top;
          let r = (this.halfH - y) / this.halfH;
          this.r = Math.max(-0.9, Math.min(0.9, r));
          this.start();
        });
        this.handle.addEventListener('pointerup', e => {
          this.dragging = false;
          this.handle.releasePointerCapture(e.pointerId);
        });
      }

      _updateHandle() {
        const top = this.halfH - this.r * this.halfH;
        this.handle.style.top = `${top}px`;
      }

      init() {
        this.history = [];
        this.x = [0.5, 0, 0.1, 0];
      }

      step() {
        if (this.history.length >= this.maxPts) this.init();
        const err = [this.x[0] - this.r, ...this.x.slice(1)];
        const u   = -this.K.reduce((s, ki, i) => s + ki * err[i], 0);
        const Ax  = this.A.map(row => row.reduce((s, v, i) => s + v * this.x[i], 0));
        const Bu  = this.B.flat().map(v => u * v);
        this.x    = this.x.map((v, i) => v + this.dt * (Ax[i] + Bu[i]));
        this.history.push(this.x[0]);
      }

      draw() {
        const ctx = this.ctx, W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        const yAxisX = 10;

        // y-axis & zero-line
        ctx.strokeStyle = styles.getPropertyValue('--text-secondary').trim();
        ctx.beginPath(); ctx.moveTo(yAxisX, 0);    ctx.lineTo(yAxisX, H);    ctx.stroke();
        ctx.beginPath(); ctx.moveTo(yAxisX, this.halfH); ctx.lineTo(W, this.halfH); ctx.stroke();

        // set-point line
        const spY = this.halfH - this.r * this.halfH;
        ctx.setLineDash([2,2]);
        ctx.beginPath(); ctx.moveTo(yAxisX, spY); ctx.lineTo(W, spY); ctx.stroke();
        ctx.setLineDash([]);

        // trace
        ctx.strokeStyle = styles.getPropertyValue('--text-main').trim();
        ctx.beginPath();
        this.history.forEach((val, i) => {
          const x  = yAxisX + (i / this.maxPts) * (W - yAxisX);
          const py = this.halfH - Math.max(-1, Math.min(1, val)) * this.halfH;
          i ? ctx.lineTo(x, py) : ctx.moveTo(x, py);
        });
        ctx.stroke();

        this._updateHandle();
      }

      animate() {
        this.step();
        this.draw();
        this.raf = requestAnimationFrame(() => this.animate());
      }

      start() {
        cancelAnimationFrame(this.raf);
        this.init();
        this.animate();
      }
    }

    // Example plant/controller matrices
    const L = 0.5, Jb = 0.02;
    const A = [
      [0, 1,    0,    0],
      [0, 0, 9.81/L,  0],
      [0, 0,    0,    1],
      [0, 0,    0,    0]
    ];
    const B = [[0],[0],[0],[1/Jb]];
    const K = CONFIG.K;

    new Demo(CONFIG.DT, A, B, K).start();
  })();
});
