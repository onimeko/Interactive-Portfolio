/*
  PONG GAME
  =========
  I use requestAnimationFrame with delta time for movement, paddle and ball collision checks,
  a speed limited browser opponent, and separate waiting, playing, and match end states.
*/

(() => {
  const canvas = document.getElementById('pongCanvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const playerScoreEl = document.getElementById('playerScore');
  const aiScoreEl = document.getElementById('aiScore');
  const serveButton = document.getElementById('pongServe');
  const restartButton = document.getElementById('pongRestart');

  const WIN_SCORE = 7;
  const keys = { up: false, down: false };

  const player = { x: 42, y: 240, w: 16, h: 120, speed: 470, score: 0 };
  const ai = { x: canvas.width - 58, y: 240, w: 16, h: 120, speed: 365, score: 0 };
  const ball = { x: canvas.width / 2, y: canvas.height / 2, r: 11, vx: 0, vy: 0, speed: 420 };

  let waitingForServe = true;
  let matchOver = false;
  let lastTime = performance.now();

  function centerBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    waitingForServe = true;
  }

  function restartMatch() {
    player.score = 0;
    ai.score = 0;
    player.y = canvas.height / 2 - player.h / 2;
    ai.y = canvas.height / 2 - ai.h / 2;
    playerScoreEl.textContent = '0';
    aiScoreEl.textContent = '0';
    matchOver = false;
    centerBall();
  }

  function serve() {
    if (matchOver || !waitingForServe) return;

    // Serve direction and vertical angle are randomized within a controlled range.
    const horizontal = Math.random() > 0.5 ? 1 : -1;
    const vertical = (Math.random() * 0.9 - 0.45);
    ball.vx = horizontal * ball.speed;
    ball.vy = ball.speed * vertical;
    waitingForServe = false;
  }

  function paddleHit(paddle) {
    return (
      ball.x + ball.r > paddle.x &&
      ball.x - ball.r < paddle.x + paddle.w &&
      ball.y + ball.r > paddle.y &&
      ball.y - ball.r < paddle.y + paddle.h
    );
  }

  function resolvePaddleHit(paddle, direction) {
    // Paddle hit position controls the outgoing vertical angle.
    const paddleCenter = paddle.y + paddle.h / 2;
    const offset = (ball.y - paddleCenter) / (paddle.h / 2);
    const speedBoost = 1.035;

    ball.speed = Math.min(ball.speed * speedBoost, 740);
    ball.vx = direction * ball.speed;
    ball.vy = offset * ball.speed * 0.8;

    // Move the ball outside the paddle after impact to prevent repeated collision.
    ball.x = direction > 0 ? paddle.x + paddle.w + ball.r : paddle.x - ball.r;
  }

  function awardPoint(winner) {
    winner.score += 1;
    playerScoreEl.textContent = player.score;
    aiScoreEl.textContent = ai.score;

    if (winner.score >= WIN_SCORE) {
      matchOver = true;
      waitingForServe = true;
      ball.vx = 0;
      ball.vy = 0;
    } else {
      ball.speed = 420;
      centerBall();
    }
  }

  function update(dt) {
    // Player paddle movement.
    if (keys.up) player.y -= player.speed * dt;
    if (keys.down) player.y += player.speed * dt;
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));

    // The browser paddle follows the ball with a capped movement speed.
    const aiCenter = ai.y + ai.h / 2;
    const difference = ball.y - aiCenter;
    if (Math.abs(difference) > 14) {
      ai.y += Math.sign(difference) * ai.speed * dt;
    }
    ai.y = Math.max(0, Math.min(canvas.height - ai.h, ai.y));

    if (waitingForServe || matchOver) return;

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Top and bottom wall collision.
    if (ball.y - ball.r <= 0 && ball.vy < 0) {
      ball.y = ball.r;
      ball.vy *= -1;
    }
    if (ball.y + ball.r >= canvas.height && ball.vy > 0) {
      ball.y = canvas.height - ball.r;
      ball.vy *= -1;
    }

    // Paddle collision checks.
    if (ball.vx < 0 && paddleHit(player)) resolvePaddleHit(player, 1);
    if (ball.vx > 0 && paddleHit(ai)) resolvePaddleHit(ai, -1);

    // A point is awarded after the ball leaves the playfield.
    if (ball.x + ball.r < 0) awardPoint(ai);
    if (ball.x - ball.r > canvas.width) awardPoint(player);
  }

  function drawRoundedRect(x, y, w, h, radius, fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
  }

  function draw() {
    ctx.fillStyle = '#081322';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line.
    ctx.setLineDash([12, 18]);
    ctx.strokeStyle = 'rgba(185, 231, 255, 0.22)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Subtle border detail matches the rest of the portfolio styling.
    ctx.strokeStyle = 'rgba(120, 200, 255, 0.10)';
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    // Draw paddles.
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#78c8ff';
    drawRoundedRect(player.x, player.y, player.w, player.h, 8, '#78c8ff');
    ctx.shadowColor = '#ffc85c';
    drawRoundedRect(ai.x, ai.y, ai.w, ai.h, 8, '#ffc85c');
    ctx.restore();

    // Draw ball.
    ctx.save();
    ctx.fillStyle = '#f7fbff';
    ctx.shadowBlur = 24;
    ctx.shadowColor = '#f7fbff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw in-canvas scores.
    ctx.textAlign = 'center';
    ctx.font = '800 70px system-ui';
    ctx.fillStyle = 'rgba(185, 231, 255, 0.16)';
    ctx.fillText(player.score, canvas.width * .38, 90);
    ctx.fillStyle = 'rgba(255, 200, 92, 0.16)';
    ctx.fillText(ai.score, canvas.width * .62, 90);

    if (waitingForServe || matchOver) {
      ctx.fillStyle = 'rgba(7, 17, 31, 0.52)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f7fbff';
      ctx.font = '800 46px system-ui';
      const title = matchOver ? (player.score > ai.score ? 'YOU WIN' : 'BROWSER WINS') : 'READY?';
      ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 14);

      ctx.fillStyle = '#b9c8d8';
      ctx.font = '700 20px system-ui';
      ctx.fillText(matchOver ? `Final score ${player.score}   ·   ${ai.score}` : 'First to 7', canvas.width / 2, canvas.height / 2 + 28);

      ctx.fillStyle = '#8fa6ba';
      ctx.font = '500 18px system-ui';
      ctx.fillText(matchOver ? 'Press R to play again' : 'Press Space or Serve', canvas.width / 2, canvas.height / 2 + 64);
    }
  }

  function loop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.035);
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function setMove(key, value) {
    if (key === 'w' || key === 'arrowup') keys.up = value;
    if (key === 's' || key === 'arrowdown') keys.down = value;
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['w', 's', 'arrowup', 'arrowdown', ' '].includes(key)) event.preventDefault();

    setMove(key, true);
    if (key === ' ') serve();
    if (key === 'r') restartMatch();
  }, { passive: false });

  window.addEventListener('keyup', (event) => setMove(event.key.toLowerCase(), false));

  serveButton.addEventListener('click', serve);
  restartButton.addEventListener('click', restartMatch);

  // Pointer events keep paddle movement active while a touch control is held.
  document.querySelectorAll('[data-pong-dir]').forEach((button) => {
    const direction = button.dataset.pongDir;
    const start = (event) => {
      event.preventDefault();
      keys[direction] = true;
    };
    const stop = (event) => {
      event.preventDefault();
      keys[direction] = false;
    };

    button.addEventListener('pointerdown', start);
    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('pointerleave', stop);
  });

  restartMatch();
  requestAnimationFrame(loop);
})();
