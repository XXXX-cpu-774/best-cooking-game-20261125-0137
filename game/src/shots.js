// The screenshot scenes behind ?shot=title|orders|assembly|serve. Each one
// builds its frame from the real world — real orders, a real grill, a real
// plate — and the renderer paints it, so a screenshot is what a short game
// really looks like, and the same seed always gives the same frame.

import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function setClock(world, elapsed) {
  world.state.elapsed = elapsed;
  world.state.timeLeft = 150 - elapsed;
}

function order(world, recipeId, patienceShare) {
  const created = world.spawnOrder(recipeId);
  created.patience = created.maxPatience * patienceShare;
  return created;
}

export function stageShot(name, world) {
  world.reset();
  const state = world.state;

  if (name === 'orders') {
    setClock(world, 54);
    state.coins = 23;
    state.score = 245;
    order(world, 'burger', 0.72);
    order(world, 'pasta', 0.55);
    order(world, 'salad', 0.85);
    state.grill[0] = { ing: 'patty', t: 3.2 };
    return { screen: SCREEN_PLAY, best: 0 };
  }

  if (name === 'assembly') {
    setClock(world, 78);
    state.coins = 41;
    state.score = 430;
    state.combo = 2;
    state.bestCombo = 2;
    state.served = 4;
    order(world, 'burger', 0.6);
    order(world, 'taco', 0.4);
    state.plate = ['bun', 'lettuce'];
    state.grill[0] = { ing: 'patty', t: 7.4 };
    state.grill[1] = { ing: 'patty', t: 1.1 };
    return { screen: SCREEN_PLAY, best: 41 };
  }

  if (name === 'serve') {
    setClock(world, 96);
    state.coins = 58;
    state.score = 610;
    state.combo = 3;
    state.bestCombo = 3;
    state.served = 6;
    order(world, 'burger', 0.5);
    order(world, 'pasta', 0.78);
    order(world, 'taco', 0.33);
    state.plate = ['bun', 'patty', 'lettuce'];
    state.grill[0] = { ing: 'patty', t: 4.6 };
    state.serveFlash = 0.5;
    state.floaters.push({ text: '+$12  Classic Burger!', x: 640, y: 206, color: '#1f7a44', life: 1.4 });
    world.burst(640, 300, '#f6c445', 18);
    return { screen: SCREEN_PLAY, best: 58 };
  }

  // Default: the title screen over a kitchen already mid-shift.
  setClock(world, 30);
  order(world, 'burger', 0.8);
  order(world, 'salad', 0.65);
  state.grill[0] = { ing: 'patty', t: 5.1 };
  return { screen: SCREEN_TITLE, best: 86 };
}
