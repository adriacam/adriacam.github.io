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

})();
