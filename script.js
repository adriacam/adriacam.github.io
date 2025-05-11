// script.js
(() => {
  /**
   * Langton’s Ant simulation with randomized start direction.
   */
  class LangtonsAnt {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {number} cellSize
     */
    constructor(canvas, cellSize = 5) {
      this.canvas = canvas;
      this.ctx    = canvas.getContext('2d');
      this.cellSize = cellSize;
      this.grid = [];
      this.ant = { x:0, y:0, dir:0 };
      this.old = { x:0, y:0 };
      this.colors = { bg:'', ant:'', trace:'' };

      // reset triggers
      canvas.addEventListener('click', ()=> this.reset());
      window.addEventListener('resize', ()=> this.reset());
    }

    /** Pull CSS vars (bg-alt + palette). */
    _updateColors() {
      const s = getComputedStyle(document.documentElement);
      const p = [
        s.getPropertyValue('--accent-primary').trim(),
        s.getPropertyValue('--accent-secondary').trim(),
        s.getPropertyValue('--highlight').trim(),
        s.getPropertyValue('--linkedin-btn').trim()
      ].filter(Boolean);
      this.colors.bg    = s.getPropertyValue('--bg-alt').trim();
      // pick head + trace
      this.colors.ant   = p[Math.floor(Math.random()*p.length)];
      this.colors.trace = p.filter(c=>c!==this.colors.ant)[
        Math.floor(Math.random()*(p.length-1))
      ];
    }

    /** Resize & compute grid. */
    _resize() {
      this.canvas.width  = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.cols = Math.floor(this.canvas.width  / this.cellSize);
      this.rows = Math.floor(this.canvas.height / this.cellSize);
    }

    /** Init grid, ant position & direction, clear. */
    init() {
      this._resize();
      this._updateColors();

      this.grid = Array.from({length:this.rows},
        ()=>Array(this.cols).fill(false)
      );

      // center + random dir (0=N,1=E,2=S,3=W)
      this.ant.x = Math.floor(this.cols/2);
      this.ant.y = Math.floor(this.rows/2);
      this.ant.dir = Math.floor(Math.random()*4);
      this.old = {...this.ant};

      // clear to bg
      this.ctx.fillStyle = this.colors.bg;
      this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      // draw initial head
      this._drawAnt(this.old.x,this.old.y);
    }

    _drawCell(x,y){
      this.ctx.fillStyle = this.grid[y][x]
        ? this.colors.trace
        : this.colors.bg;
      this.ctx.fillRect(
        x*this.cellSize,y*this.cellSize,
        this.cellSize,this.cellSize
      );
    }

    _drawAnt(x,y){
      this.ctx.fillStyle = this.colors.ant;
      this.ctx.fillRect(
        x*this.cellSize,y*this.cellSize,
        this.cellSize,this.cellSize
      );
    }

    /** One step of Langton’s Ant. */
    step(){
      this._drawCell(this.old.x,this.old.y);

      const {x,y,dir} = this.ant;
      const s = this.grid[y][x];
      this.ant.dir = s ? (dir+3)%4 : (dir+1)%4;
      this.grid[y][x] = !s;
      this._drawCell(x,y);

      if     (this.ant.dir===0) this.ant.y--;
      else if(this.ant.dir===1) this.ant.x++;
      else if(this.ant.dir===2) this.ant.y++;
      else                       this.ant.x--;

      // wrap
      if(this.ant.x<0)           this.ant.x=this.cols-1;
      if(this.ant.x>=this.cols)  this.ant.x=0;
      if(this.ant.y<0)           this.ant.y=this.rows-1;
      if(this.ant.y>=this.rows)  this.ant.y=0;

      this._drawAnt(this.ant.x,this.ant.y);
      this.old={...this.ant};
    }

    /** Animation loop. */
    animate(){
      this.raf = requestAnimationFrame(()=>{
        this.step(); this.animate();
      });
    }
    pause(){ cancelAnimationFrame(this.raf) }
    reset(){
      this.pause(); this.init(); this.animate();
    }
  }

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
    antSim.reset();
  });

  // Launch
  const antCanvas = document.getElementById('gen-art');
  const antSim = new LangtonsAnt(antCanvas,5);
  antSim.reset();
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
