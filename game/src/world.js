// The kitchen itself: orders, the grill, the plate, coins and the shift clock.
// No drawing here, only rules, so the same world can be played, staged for a
// screenshot, or stepped by an autopilot.

import {
  GRILL_BURNT,
  GRILL_READY,
  INGREDIENT_BY_ID,
  MAX_HEARTS,
  MAX_ORDERS,
  PLATE_MAX,
  RECIPES,
  RECIPE_BY_ID,
  SHIFT_SECONDS,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_ORDER_LOST = 2;
export const EVENT_GAME_OVER = 4;
export const EVENT_PATTY_READY = 8;
export const EVENT_PATTY_BURNT = 16;

let orderId = 0;

function sameIngredients(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      elapsed: 0,
      timeLeft: SHIFT_SECONDS,
      coins: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      served: 0,
      missed: 0,
      hearts: MAX_HEARTS,
      orders: [],
      plate: [],
      grill: [null, null],
      nextOrderIn: 2.5,
      floaters: [],
      particles: [],
      over: false,
      overReason: '',
      shake: 0,
      serveFlash: 0,
      lastTickSecond: -1,
    };
  }

  function addFloater(text, x, y, color) {
    state.floaters.push({ text, x, y, color: color ?? '#3a2c1c', life: 1.4 });
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = random.next() * Math.PI * 2;
      const speed = 60 + random.next() * 140;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.7 + random.next() * 0.4,
        color,
        size: 3 + random.next() * 4,
      });
    }
  }

  // Orders arrive faster and grow less patient as the shift wears on.
  function orderInterval() {
    return Math.max(7, 14 - state.elapsed / 25);
  }

  function patienceFor() {
    return Math.max(30, 46 - state.elapsed / 12);
  }

  function spawnOrder(recipeId) {
    const recipe = recipeId ? RECIPE_BY_ID[recipeId] : random.pick(RECIPES);
    const patience = patienceFor();
    const order = {
      id: (orderId += 1),
      recipe,
      patience,
      maxPatience: patience,
      born: state.elapsed,
    };
    state.orders.push(order);
    return order;
  }

  function grillStage(slot) {
    if (!slot) return 'empty';
    if (slot.t >= GRILL_BURNT) return 'burnt';
    if (slot.t >= GRILL_READY) return 'ready';
    return 'cooking';
  }

  const world = {
    state,

    reset() {
      Object.assign(state, freshState());
      state.nextOrderIn = 2.5;
    },

    // One fixed step of the shift: clock, orders, grill, particles, floaters.
    step(dt) {
      if (state.over) return EVENT_NONE;
      let events = EVENT_NONE;
      state.elapsed += dt;
      state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);
      const second = Math.ceil(state.timeLeft);
      if (second <= 10 && second !== state.lastTickSecond && second > 0) {
        state.lastTickSecond = second;
        events |= 0; // the main loop plays the tick sound from timeLeft
      }

      state.nextOrderIn -= dt;
      if (state.nextOrderIn <= 0 && state.orders.length < MAX_ORDERS) {
        spawnOrder();
        state.nextOrderIn = orderInterval() * (0.85 + random.next() * 0.3);
      }

      for (const slot of state.grill) {
        if (!slot) continue;
        const before = grillStage(slot);
        slot.t += dt;
        const after = grillStage(slot);
        if (before === 'cooking' && after === 'ready') events |= EVENT_PATTY_READY;
        if (before === 'ready' && after === 'burnt') events |= EVENT_PATTY_BURNT;
      }

      for (let i = state.orders.length - 1; i >= 0; i -= 1) {
        const order = state.orders[i];
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders.splice(i, 1);
          state.missed += 1;
          state.hearts -= 1;
          state.combo = 0;
          state.shake = 0.35;
          addFloater('Order lost!', 640, 210, '#b0492f');
          events |= EVENT_ORDER_LOST;
          if (state.hearts <= 0) {
            state.over = true;
            state.overReason = 'The lunch crowd walked out.';
            events |= EVENT_GAME_OVER;
          }
        }
      }

      for (let i = state.floaters.length - 1; i >= 0; i -= 1) {
        const floater = state.floaters[i];
        floater.life -= dt;
        floater.y -= 34 * dt;
        if (floater.life <= 0) state.floaters.splice(i, 1);
      }
      for (let i = state.particles.length - 1; i >= 0; i -= 1) {
        const particle = state.particles[i];
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 260 * dt;
        if (particle.life <= 0) state.particles.splice(i, 1);
      }
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
      if (state.serveFlash > 0) state.serveFlash = Math.max(0, state.serveFlash - dt);

      if (state.timeLeft <= 0 && !state.over) {
        state.over = true;
        state.overReason = 'Shift complete!';
        events |= EVENT_GAME_OVER;
      }
      return events;
    },

    // A bin click: a patty goes to the grill, everything else onto the plate.
    addIngredient(id, x, y) {
      if (state.over) return false;
      const ing = INGREDIENT_BY_ID[id];
      if (!ing) return false;
      if (id === 'patty') {
        const free = state.grill.findIndex((slot) => slot === null);
        if (free === -1) {
          addFloater('Grill is full!', x, y, '#b0492f');
          return false;
        }
        state.grill[free] = { ing: 'patty', t: 0 };
        return true;
      }
      if (state.plate.length >= PLATE_MAX) {
        addFloater('Plate is full!', x, y, '#b0492f');
        return false;
      }
      state.plate.push(id);
      return true;
    },

    // A grill click: take a golden patty onto the plate, or bin a burnt one.
    takeFromGrill(index, x, y) {
      const slot = state.grill[index];
      if (!slot) return 'empty';
      const stage = grillStage(slot);
      if (stage === 'ready') {
        if (state.plate.length >= PLATE_MAX) {
          addFloater('Plate is full!', x, y, '#b0492f');
          return 'full';
        }
        state.plate.push('patty');
        state.grill[index] = null;
        burst(x, y, '#f6c445', 10);
        return 'taken';
      }
      if (stage === 'burnt') {
        state.grill[index] = null;
        addFloater('Burnt patty binned', x, y, '#b0492f');
        return 'binned';
      }
      addFloater('Still cooking…', x, y, '#7a6a52');
      return 'cooking';
    },

    removeFromPlate(index) {
      if (index < 0 || index >= state.plate.length) return false;
      state.plate.splice(index, 1);
      return true;
    },

    clearPlate() {
      state.plate = [];
    },

    // The serve button: the plate must match one open ticket exactly.
    serve(x, y) {
      if (state.over || state.plate.length === 0) return null;
      const match = state.orders.find((order) => sameIngredients(state.plate, order.recipe.needs));
      if (!match) {
        state.combo = 0;
        state.shake = 0.3;
        addFloater('No ticket matches this plate!', x, y, '#b0492f');
        return null;
      }
      const patienceShare = Math.max(0, match.patience / match.maxPatience);
      const tip = Math.round(match.recipe.tip * patienceShare);
      const earned = match.recipe.price + tip;
      state.coins += earned;
      state.score += earned * 10 + state.combo * 5;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.served += 1;
      state.serveFlash = 0.5;
      state.orders = state.orders.filter((order) => order !== match);
      state.plate = [];
      burst(x, y, '#f6c445', 22);
      addFloater(`+$${earned}  ${match.recipe.name}!`, x, y - 10, '#1f7a44');
      if (state.combo >= 3) addFloater(`Combo x${state.combo}!`, x, y - 44, '#c98a2e');
      return { order: match, earned, tip };
    },

    grillStage,
    spawnOrder,
    addFloater,
    burst,

    // The open ticket (if any) whose dish the plate matches exactly.
    findMatch() {
      if (state.plate.length === 0) return null;
      return state.orders.find((order) => sameIngredients(state.plate, order.recipe.needs)) ?? null;
    },
  };

  return world;
}
