// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between four screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=title|orders|assembly|serve (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.

import { BEST_KEY, INGREDIENTS } from './config.js';
import { createRandom } from './random.js';
import { createSound } from './audio.js';
import {
  EVENT_GAME_OVER,
  EVENT_ORDER_LOST,
  EVENT_PATTY_BURNT,
  EVENT_PATTY_READY,
  createWorld,
} from './world.js';
import { LAYOUT, createInput, inside } from './input.js';
import {
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  createRenderer,
} from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, world.findMatch());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let lastTickSecond = -1;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    lastTickSecond = -1;
    screen = SCREEN_PLAY;
    sound.unlock();
    announce('Playing. Take the tickets, grill the patties, serve before patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.coins > best) {
      best = world.state.coins;
      saveBest(best);
    }
    sound.stopSizzle();
    announce(`Shift over. You earned $${world.state.coins}. Best $${best}.`);
  }

  function handleEvents(events) {
    if (events & EVENT_PATTY_READY) sound.ready();
    if (events & EVENT_PATTY_BURNT) sound.burn();
    if (events & EVENT_ORDER_LOST) sound.error();
    if (events & EVENT_GAME_OVER) endGame();
  }

  function serveAt(x, y) {
    const served = world.serve(x, y);
    if (served) {
      sound.serve();
      sound.coin();
    } else if (world.state.plate.length > 0) {
      sound.error();
    }
  }

  function clickIngredient(id, x, y) {
    const added = world.addIngredient(id, x, y);
    if (!added) {
      sound.error();
      return;
    }
    if (id === 'patty') sound.grill();
    else sound.place();
  }

  function handleClick(point) {
    const { x, y } = point;
    sound.unlock();
    if (screen === SCREEN_TITLE) {
      if (inside(LAYOUT.startButton, x, y)) {
        sound.click();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_OVER) {
      if (inside(LAYOUT.againButton, x, y)) {
        sound.click();
        startGame();
      }
      return;
    }
    if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    // Playing.
    const bin = input.binAt(x, y);
    if (bin) {
      clickIngredient(bin, x, y);
      return;
    }
    const grill = input.grillAt(x, y);
    if (grill !== -1) {
      const result = world.takeFromGrill(grill, x, y);
      if (result === 'taken') sound.pick();
      else if (result === 'binned') sound.burn();
      else if (result === 'cooking') sound.click();
      return;
    }
    const plateIndex = input.plateItemAt(x, y, world.state.plate.length);
    if (plateIndex !== -1) {
      world.removeFromPlate(plateIndex);
      sound.click();
      return;
    }
    if (inside(LAYOUT.serve, x, y)) {
      serveAt(x, y);
      return;
    }
    if (inside(LAYOUT.trash, x, y)) {
      world.clearPlate();
      sound.click();
    }
  }

  function handleKeys() {
    for (const key of input.takeKeys()) {
      sound.unlock();
      if (key === 'm') {
        const muted = sound.toggleMute();
        announce(muted ? 'Muted.' : 'Sound on.');
        continue;
      }
      if (screen === SCREEN_TITLE && (key === 'enter' || key === ' ')) {
        startGame();
        continue;
      }
      if (screen === SCREEN_OVER && (key === 'r' || key === 'enter' || key === ' ')) {
        startGame();
        continue;
      }
      if (key === 'p' || key === 'escape') {
        if (screen === SCREEN_PLAY) {
          screen = SCREEN_PAUSED;
          announce('Paused.');
        } else if (screen === SCREEN_PAUSED) {
          screen = SCREEN_PLAY;
          announce('Playing.');
        }
        continue;
      }
      if (screen !== SCREEN_PLAY) continue;
      if (key === ' ') {
        serveAt(640, 430);
        continue;
      }
      const index = INGREDIENTS.findIndex((ing) => ing.key === key);
      if (index !== -1) clickIngredient(INGREDIENTS[index].id, 640, 700);
    }
  }

  function step() {
    if (screen === SCREEN_TITLE) return;
    const events = world.step(STEP);
    const second = Math.ceil(world.state.timeLeft);
    if (second <= 10 && second > 0 && second !== lastTickSecond) {
      lastTickSecond = second;
      sound.tick();
    }
    handleEvents(events);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    for (const point of input.takeClicks()) handleClick(point);
    handleKeys();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, world.findMatch());
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  // A handle for automated play-testing: the live world and screen.
  window.__game = {
    get state() {
      return world.state;
    },
    get screen() {
      return screen;
    },
  };

  announce('The Golden Skillet. Press Enter or click Start Shift to play.');
  requestAnimationFrame(frame);
}

window.addEventListener('error', (event) => {
  document.title = `ERR: ${event.message}`;
});

if (shot) runShot(shot);
else runGame();
