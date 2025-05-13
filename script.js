// script.js
(() => {
   // Day/Night toggle
  const btn = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if(saved==='light'){
    root.dataset.theme='light';
    btn.textContent='☀️';
  }
  btn.addEventListener('click',()=>{
    btn.classList.add('rotate');
    setTimeout(()=>btn.classList.remove('rotate'),400);
    const next = root.dataset.theme==='light'?'dark':'light';
    root.dataset.theme = next;
    localStorage.setItem('theme',next);
    btn.textContent = next==='light'?'☀️':'🌙';
  });
// Genetic Rocket-to-Moon Simulation
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('rocket-canvas');
  const ctx    = canvas.getContext('2d');
  const POP       = 10;
  const LIFESPAN  = 200;
  const MUTATION  = 0.2;

  // CSS-variable colors
  const root       = getComputedStyle(document.documentElement);
  const COLOR_MOON = root.getPropertyValue('--text-secondary').trim();
  const COLOR_MSG  = root.getPropertyValue('--highlight').trim();
  const ROCKET_COLORS = [
    root.getPropertyValue('--accent-primary').trim(),
    root.getPropertyValue('--accent-secondary').trim(),
    root.getPropertyValue('--text-main').trim(),
    root.getPropertyValue('--text-secondary').trim(),
    root.getPropertyValue('--highlight').trim()
  ];

  let W, H, generation, rockets, frame, moon, moonHitRad;

  class Rocket {
    constructor(brain) {
      this.pos = { x: W/2, y: H - 20 };
      this.vel = { x: 0,   y: 0   };
      this.brain    = brain ? brain.slice() : Array.from({length:LIFESPAN}, randomAccel);
      this.reached  = false;
      this.trail    = [];
      this.fitness  = 0;
    }
    step(stepIndex) {
      if (this.reached) return;
      const a = this.brain[stepIndex];
      this.vel.x += a.x;
      this.vel.y += a.y;
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.trail.push({ x: this.pos.x, y: this.pos.y });

      // precise hit-check against emoji radius
      const dx = this.pos.x - moon.x;
      const dy = this.pos.y - moon.y;
      if (Math.hypot(dx, dy) < moonHitRad) {
        this.reached = true;
      }
    }
    draw(color) {
      // draw trail
      ctx.strokeStyle = color;
      ctx.beginPath();
      this.trail.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();

      // draw rocket emoji
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.fillText('🚀', this.pos.x, this.pos.y);
    }
    calcFitness() {
      const d = Math.hypot(this.pos.x - moon.x, this.pos.y - moon.y);
      this.fitness = this.reached ? 1e6 / generation : 1 / (d * d);
    }
    clone() {
      return new Rocket(this.brain);
    }
    mutate() {
      this.brain = this.brain.map(a =>
        Math.random() < MUTATION ? randomAccel() : a
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
    // resize & update W,H
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    W = canvas.width;
    H = canvas.height;

    // measure moon emoji radius
    ctx.font = '20px serif';
    const m = ctx.measureText('🌕');
    // use actual bounding ascent if available, else half width
    moonHitRad = m.actualBoundingBoxAscent || (m.width / 2);

    // init sim state
    generation = 0;
    frame      = 0;
    rockets    = Array.from({length:POP}, () => new Rocket());
    newMoon();

    // clear message
    document.getElementById('rocket-msg').textContent = '';
  }

  function newMoon() {
    moon = {
      x: 20 + Math.random() * (W - 40),
      y: 20 + Math.random() * (H/2)
    };
  }

  function nextGen() {
  rockets.forEach(r => r.calcFitness());
  rockets.sort((a, b) => b.fitness - a.fitness);
  const best = rockets[0];

  const msgEl = document.getElementById('rocket-msg');
  if (best.reached) {
    // show the message at the current generation
    msgEl.textContent = `Reached! Generation ${generation}`;
    // reset the generation counter
    generation = 1;
    // move the moon to a new random spot
    newMoon();
  } else {
    // only increment if they haven't reached yet
    generation++;
    // clear any old message
    msgEl.textContent = '';
  }

  // build the next population as before
  const newPop = [ best.clone() ];
  while (newPop.length < POP) {
    const parent = rockets[Math.floor(Math.random() * (POP/2))].clone();
    parent.mutate();
    newPop.push(parent);
  }
  rockets = newPop;
  frame   = 0;
}

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // draw moon emoji
    ctx.font = '20px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOR_MOON;
    ctx.fillText('🌕', moon.x, moon.y);

    // step & draw rockets
    if (frame < LIFESPAN) {
      rockets.forEach(r => r.step(frame));
      frame++;
    } else {
      nextGen();
    }

    const color = ROCKET_COLORS[generation % ROCKET_COLORS.length];
    rockets.forEach(r => r.draw(color));

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', reset);
  reset();
  animate();
});
    /**
     * Steady-State Ball-on-Beam Demo
     * Implements ẋ = A x + B u, u = –K x; plots ball pos & beam angle.
     */
    // Steady-State Ball-on-Beam Demo
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('ss-canvas');
  
  class StateSpaceDemo {
    constructor(canvas, dt, A, B, K) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.dt     = dt;
      [this.A, this.B, this.K] = [A, B, K];
      this.r       = 0;
      this.maxPts  = 400;
      this.dragging = false;

      window.addEventListener('resize', () => this._resize());
      this._resize();

      // pointer events to drag the set-point marker
      canvas.addEventListener('pointerdown', this._onDown.bind(this));
      window.addEventListener('pointermove', this._onMove.bind(this));
      window.addEventListener('pointerup',   this._onUp.bind(this));
    }

    _resize() {
      this.canvas.width  = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this._halfH = this.canvas.height / 2;
    }

    _onDown(e) {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const markerX = 10, markerY = this._halfH - this.r * this._halfH;
      const dx = x - markerX, dy = y - markerY;
      if (dx*dx + dy*dy < 8*8) { // 8px radius hit
        this.dragging = true;
        this.start();
      }
    }

    _onMove(e) {
      if (!this.dragging) return;
      const rect = this.canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      // compute r from y: y = halfH - r*halfH  ⇒  r = (halfH - y)/halfH
      let r = (this._halfH - y) / this._halfH;
      r = Math.max(-0.9, Math.min(0.9, r));
      this.r = r;
      this.start();
    }

    _onUp() {
      this.dragging = false;
    }

    _mv(mat, vec) { return mat.map(r => r.reduce((s,v,i)=>s+v*vec[i],0)); }
    _add(a,b)     { return a.map((v,i)=>v+b[i]); }
    _sv(s,v)      { return v.map(x=>s*x); }

    init() {
      this.history = [];
      this.x = [0.2, 0, 0.1, 0];
    }

    step() {
      if (this.history.length >= this.maxPts) this.init();
      const err = [this.x[0] - this.r, ...this.x.slice(1)];
      const u   = -this.K.reduce((s,ki,i)=>s+ki*err[i],0);
      const Ax = this._mv(this.A, this.x);
      const Bu = this._sv(u, this.B.flat());
      this.x = this._add(this.x, this._sv(this.dt, this._add(Ax,Bu)));
      this.history.push(this.x[0]);
    }

    draw() {
      const ctx = this.ctx, W = this.canvas.width, H = this.canvas.height;
      ctx.clearRect(0,0,W,H);

      const yAxisX = 10, halfH = this._halfH;

      // y-axis
      ctx.strokeStyle = getComputedStyle(document.documentElement)
                         .getPropertyValue('--text-secondary').trim();
      ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(yAxisX,0); ctx.lineTo(yAxisX,H); ctx.stroke();

      // zero-line
      ctx.beginPath(); ctx.moveTo(yAxisX,halfH); ctx.lineTo(W,halfH); ctx.stroke();

      // set-point line
      const spY = halfH - this.r*halfH;
      const spC = getComputedStyle(document.documentElement)
                         .getPropertyValue('--text-main').trim();
      ctx.strokeStyle = spC;
      ctx.setLineDash([2,2]);
      ctx.beginPath(); ctx.moveTo(yAxisX,spY); ctx.lineTo(W,spY); ctx.stroke();

      // draggable marker dot
      ctx.setLineDash([]);
      ctx.fillStyle = spC;
      ctx.beginPath(); ctx.arc(yAxisX, spY, 6, 0,2*Math.PI); ctx.fill();

      // ball trace
      const ballC = getComputedStyle(document.documentElement)
                         .getPropertyValue('--accent-primary').trim();
      ctx.strokeStyle = ballC;
      ctx.setLineDash([]);
      ctx.beginPath();
      this.history.forEach((y,i)=>{
        const x = yAxisX + (i/this.maxPts)*(W-yAxisX);
        const v = Math.max(-1,Math.min(1,y));
        const py = halfH - v*halfH;
        i===0 ? ctx.moveTo(x,py) : ctx.lineTo(x,py);
      });
      ctx.stroke();
    }

    animate() {
      this.step();
      this.draw();
      this.raf = requestAnimationFrame(()=>this.animate());
    }

    start() {
      cancelAnimationFrame(this.raf);
      this.init();
      this.animate();
    }
  }

  const L = 0.5, Jb = 0.02;
  const A = [
    [0, 1,      0,  0],
    [0, 0, 9.81/L,  0],
    [0, 0,  0,      1],
    [0, 0,  0,      0]
  ];
  const B = [ [0],
              [0],
              [0],
              [1/Jb]];
  const K = [0.0826, 0.1101, 1.0800, 0.2400];

  new StateSpaceDemo(canvas, 0.01, A, B, K).start();
});
})();
