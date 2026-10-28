/**
 * ==============================================================================
 * SnakeGame - Modular Retro Arcade Mini Game
 * ==============================================================================
 */

export class SnakeGame {
  constructor(canvas, scoreEl, restartBtn) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scoreEl = scoreEl;
    this.restartBtn = restartBtn;

    this.grid = 16;
    this.count = 0;
    this.score = 0;
    this.isGameOver = false;
    this.rafId = null;

    this.snake = { x: 160, y: 128, dx: this.grid, dy: 0, cells: [], maxCells: 4 };
    this.apple = { x: 64, y: 64 };

    this.keyHandler = this.onKey.bind(this);
    this.init();
  }

  init() {
    this.reset();
    window.addEventListener('keydown', this.keyHandler);
    if (this.restartBtn) {
      this.restartBtn.onclick = () => this.reset();
    }
    this.loop();
  }

  reset() {
    this.snake.x = 160;
    this.snake.y = 128;
    this.snake.cells = [];
    this.snake.maxCells = 4;
    this.snake.dx = this.grid;
    this.snake.dy = 0;
    this.score = 0;
    if (this.scoreEl) this.scoreEl.textContent = '0';
    this.isGameOver = false;
    this.spawnApple();
  }

  spawnApple() {
    this.apple.x = Math.floor(Math.random() * (this.canvas.width / this.grid)) * this.grid;
    this.apple.y = Math.floor(Math.random() * (this.canvas.height / this.grid)) * this.grid;
  }

  onKey(e) {
    if (e.key === 'ArrowLeft' && this.snake.dx === 0) { this.snake.dx = -this.grid; this.snake.dy = 0; }
    else if (e.key === 'ArrowUp' && this.snake.dy === 0) { this.snake.dy = -this.grid; this.snake.dx = 0; }
    else if (e.key === 'ArrowRight' && this.snake.dx === 0) { this.snake.dx = this.grid; this.snake.dy = 0; }
    else if (e.key === 'ArrowDown' && this.snake.dy === 0) { this.snake.dy = this.grid; this.snake.dx = 0; }
  }

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());

    if (++this.count < 6 || this.isGameOver) return;
    this.count = 0;

    this.ctx.fillStyle = '#111318';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.snake.x += this.snake.dx;
    this.snake.y += this.snake.dy;

    // 穿墙
    if (this.snake.x < 0) this.snake.x = this.canvas.width - this.grid;
    else if (this.snake.x >= this.canvas.width) this.snake.x = 0;
    if (this.snake.y < 0) this.snake.y = this.canvas.height - this.grid;
    else if (this.snake.y >= this.canvas.height) this.snake.y = 0;

    this.snake.cells.unshift({ x: this.snake.x, y: this.snake.y });
    if (this.snake.cells.length > this.snake.maxCells) this.snake.cells.pop();

    // 苹果
    this.ctx.fillStyle = '#ff3838';
    this.ctx.fillRect(this.apple.x, this.apple.y, this.grid - 1, this.grid - 1);

    // 蛇身
    this.ctx.fillStyle = '#00ffcc';
    this.snake.cells.forEach((cell, idx) => {
      this.ctx.fillRect(cell.x, cell.y, this.grid - 1, this.grid - 1);

      if (cell.x === this.apple.x && cell.y === this.apple.y) {
        this.snake.maxCells++;
        this.score += 10;
        if (this.scoreEl) this.scoreEl.textContent = this.score;
        if (window.MCAudio) window.MCAudio.playOrb();
        this.spawnApple();
      }

      for (let i = idx + 1; i < this.snake.cells.length; i++) {
        if (cell.x === this.snake.cells[i].x && cell.y === this.snake.cells[i].y) {
          this.isGameOver = true;
          if (window.MCAudio) window.MCAudio.playHurt();
        }
      }
    });

    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.65)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('游戏结束！点击按钮重开', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.keyHandler);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
