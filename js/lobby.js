/*
  INTERACTIVE LOBBY CONTROLLER
  ============================
  I handle keyboard and touch movement here, keep the character inside the room, check
  door collisions, and route to the matching page. The character is a regular HTML
  element, so each animation frame updates its CSS left and top positions.
*/

(() => {
  const stage = document.getElementById('lobbyStage');
  const player = document.getElementById('player');
  const toast = document.getElementById('interactionToast');
  const doors = [...document.querySelectorAll('.portal')];

  if (!stage || !player) return;

  // Tracks the four active movement directions.
  const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // I store position as percentages so the character scales with the stage.
  // On phones I start the character slightly left of center so the larger thumb controls have
  // clear space on the lower right side of the room.
  const phoneLayout = window.matchMedia('(max-width: 700px)');
  const position = { x: phoneLayout.matches ? 32 : 50, y: 78 };

  // Movement speed starts in pixels per second and converts to stage percentages each frame.
  const SPEED = 250;
  let lastTime = performance.now();
  let navigating = false;

  // Maps keyboard input to the four movement directions.
  const keyMap = {
    w: 'up',
    arrowup: 'up',
    s: 'down',
    arrowdown: 'down',
    a: 'left',
    arrowleft: 'left',
    d: 'right',
    arrowright: 'right',
  };

  function setKey(event, isDown) {
    const direction = keyMap[event.key.toLowerCase()];
    if (!direction) return;

    // Arrow keys move the character instead of scrolling the page.
    event.preventDefault();
    keys[direction] = isDown;
  }

  window.addEventListener('keydown', (event) => setKey(event, true), { passive: false });
  window.addEventListener('keyup', (event) => setKey(event, false), { passive: false });

  // Desktop clicks remain available as a secondary way to open a door.
  doors.forEach((door) => {
    door.addEventListener('click', () => enterDoor(door));
  });

  // Touch controls use the same held-direction state as the keyboard.
  document.querySelectorAll('.dpad-btn').forEach((button) => {
    const direction = button.dataset.key;

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

  function enterDoor(door) {
    if (navigating || !door) return;
    navigating = true;

    const destination = door.dataset.page;
    door.classList.add('is-near');
    document.body.classList.add('page-exit');
    toast.classList.add('show');
    toast.textContent = `Opening ${door.parentElement.querySelector('.portal-label')?.textContent || 'room'}…`;

    // Short delay leaves time for the door transition before navigation.
    window.setTimeout(() => {
      window.location.href = destination;
    }, 360);
  }

  function checkDoorCollision() {
    const stageRect = stage.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const playerCenterX = playerRect.left + playerRect.width / 2;
    const playerCenterY = playerRect.top + playerRect.height / 2;

    let closestDoor = null;

    doors.forEach((door) => {
      const rect = door.getBoundingClientRect();

      // The near zone only controls the visual door glow.
      const near =
        playerCenterX > rect.left - 32 &&
        playerCenterX < rect.right + 32 &&
        playerCenterY > rect.top - 20 &&
        playerCenterY < rect.bottom + 45;

      door.classList.toggle('is-near', near);
      if (near) closestDoor = door;

      // The collision trigger is tighter than the visual glow zone.
      const inside =
        playerCenterX > rect.left + 6 &&
        playerCenterX < rect.right - 6 &&
        playerCenterY > rect.top + 8 &&
        playerCenterY < rect.bottom + 18;

      if (inside) enterDoor(door);
    });

    if (!closestDoor) {
      toast.classList.remove('show');
    } else if (!navigating) {
      toast.textContent = 'Keep walking into the door';
      toast.classList.add('show');
    }

    // Reading the stage rect here keeps collision values current after resizing.
    void stageRect;
  }

  function update(timestamp) {
    const deltaSeconds = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    const stageRect = stage.getBoundingClientRect();
    const xPercentPerPixel = 100 / stageRect.width;
    const yPercentPerPixel = 100 / stageRect.height;

    let dx = 0;
    let dy = 0;

    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;

    const moving = dx !== 0 || dy !== 0;
    player.classList.toggle('walking', moving);

    // I keep the last horizontal direction so the character faces its movement direction.
    if (dx < 0) {
      player.classList.add('facing-left');
      player.classList.remove('facing-right');
    }
    if (dx > 0) {
      player.classList.add('facing-right');
      player.classList.remove('facing-left');
    }

    // Diagonal movement is normalized to match straight line speed.
    if (dx !== 0 && dy !== 0) {
      const diagonalScale = Math.SQRT1_2;
      dx *= diagonalScale;
      dy *= diagonalScale;
    }

    position.x += dx * SPEED * deltaSeconds * xPercentPerPixel;
    position.y += dy * SPEED * deltaSeconds * yPercentPerPixel;

    // Movement bounds keep the character inside the visible room.
    position.x = Math.max(3.5, Math.min(96.5, position.x));
    position.y = Math.max(19, Math.min(91, position.y));

    player.style.left = `${position.x}%`;
    player.style.top = `${position.y}%`;

    checkDoorCollision();
    requestAnimationFrame(update);
  }

  // Pointer interaction gives the stage focus for keyboard input.
  stage.addEventListener('pointerdown', () => stage.focus());

  requestAnimationFrame(update);
})();
