// Everything the player sees: the tiled kitchen wall, the order board, the
// grill, the plate, the ingredient bins and the title, pause and game-over
// screens. All art is drawn with canvas shapes; there are no image files.

import {
  INGREDIENT_BY_ID,
  PALETTE,
  RECIPES,
  VIEW_H,
  VIEW_W,
} from './config.js';
import { LAYOUT, binRect, plateItemRect, ticketRect } from './input.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function text(ctx, value, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight ?? 700} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

// One ingredient, drawn as vector art, centred at (x, y) with radius r.
export function drawIngredient(ctx, id, x, y, r) {
  const ing = INGREDIENT_BY_ID[id];
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = ing.color;
    roundRect(ctx, -r, -r * 0.25, r * 2, r * 0.7, r * 0.3);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -r * 0.2, r * 0.95, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d0';
    circle(ctx, -r * 0.4, -r * 0.55, r * 0.1);
    ctx.fill();
    circle(ctx, r * 0.35, -r * 0.7, r * 0.1);
    ctx.fill();
    circle(ctx, r * 0.05, -r * 0.4, r * 0.09);
    ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = ing.color;
    roundRect(ctx, -r, -r * 0.55, r * 2, r * 1.1, r * 0.45);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.12;
    for (const offset of [-0.45, 0, 0.45]) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, offset * r);
      ctx.lineTo(r * 0.8, offset * r);
      ctx.stroke();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.color;
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      circle(ctx, Math.cos(angle) * r * 0.45, Math.sin(angle) * r * 0.45, r * 0.55);
      ctx.fill();
    }
    ctx.fillStyle = '#a8dba8';
    circle(ctx, 0, 0, r * 0.5);
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.4);
    ctx.lineTo(0, r * 0.4);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    circle(ctx, 0, 0, r * 0.9);
    ctx.fill();
    ctx.fillStyle = '#ff8a6b';
    circle(ctx, -r * 0.3, -r * 0.3, r * 0.3);
    ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(-r * 0.25, -r * 0.55);
    ctx.lineTo(0, -r * 0.65);
    ctx.lineTo(r * 0.25, -r * 0.55);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.6);
    ctx.lineTo(r * 0.9, r * 0.6);
    ctx.lineTo(0, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ing.dark;
    circle(ctx, -r * 0.25, r * 0.25, r * 0.14);
    ctx.fill();
    circle(ctx, r * 0.3, r * 0.05, r * 0.12);
    ctx.fill();
    circle(ctx, 0, -r * 0.35, r * 0.1);
    ctx.fill();
  } else if (id === 'pasta') {
    ctx.strokeStyle = ing.color;
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (const radius of [0.25, 0.55, 0.85]) {
      ctx.beginPath();
      ctx.arc(0, 0, r * radius, 0.4, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0.4, Math.PI * 1.9);
    ctx.stroke();
  } else if (id === 'sauce') {
    ctx.fillStyle = ing.color;
    circle(ctx, 0, r * 0.1, r * 0.8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.5);
    ctx.quadraticCurveTo(-r * 0.2, r * 1.1, 0, r * 0.55);
    ctx.quadraticCurveTo(r * 0.3, r * 1.05, r * 0.55, r * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e88a7a';
    circle(ctx, -r * 0.3, -r * 0.25, r * 0.25);
    ctx.fill();
  } else if (id === 'tortilla') {
    ctx.fillStyle = ing.color;
    circle(ctx, 0, 0, r * 0.92);
    ctx.fill();
    ctx.fillStyle = ing.dark;
    for (const [dx, dy] of [[-0.4, -0.3], [0.35, -0.45], [0.1, 0.15], [-0.15, 0.5], [0.5, 0.35]]) {
      circle(ctx, dx * r, dy * r, r * 0.09);
      ctx.fill();
    }
  }
  ctx.restore();
}

function patienceColor(share) {
  if (share > 0.5) return '#4a9a52';
  if (share > 0.25) return '#e8a13a';
  return '#d64533';
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawWall() {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, VIEW_W, 600);
    ctx.strokeStyle = PALETTE.wallTile;
    ctx.lineWidth = 2;
    for (let x = 0; x <= VIEW_W; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 64);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 64; y <= 600; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIEW_W, y);
      ctx.stroke();
    }
    // Wooden counter band the bins sit on.
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(0, 600, VIEW_W, 200);
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(0, 600, VIEW_W, 8);
    ctx.fillRect(0, 776, VIEW_W, 24);
    text(ctx, 'Click a bin to add it to the plate  ·  Patty goes to the grill  ·  Keys 1–8 pick ingredients, Space serves, P pauses, M mutes', 640, 789, 15, '#f6e7c8', 600);
  }

  function drawTopBar(state, screen) {
    ctx.fillStyle = PALETTE.board;
    ctx.fillRect(0, 0, VIEW_W, 64);
    ctx.fillStyle = PALETTE.boardEdge;
    ctx.fillRect(0, 60, VIEW_W, 4);
    text(ctx, '🍳 THE GOLDEN SKILLET', 150, 32, 26, '#f6c445', 800, 'left');
    const urgent = state.timeLeft <= 30 && screen === SCREEN_PLAY;
    text(ctx, `⏱ ${formatTime(state.timeLeft)}`, 640, 32, 30, urgent ? '#ff7a5c' : '#fff8e7', 800);
    text(ctx, 'SHIFT', 640, 54, 11, '#9fb2bd', 700);
    // Hearts.
    for (let i = 0; i < 3; i += 1) {
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i < state.hearts ? '❤️' : '🖤', 880 + i * 34, 32);
    }
    text(ctx, `🪙 $${state.coins}`, 1010, 30, 24, '#f6c445', 800);
    text(ctx, `SCORE ${state.score}`, 1130, 30, 20, '#fff8e7', 700);
    if (state.combo >= 2) {
      ctx.fillStyle = '#c98a2e';
      roundRect(ctx, 1196, 14, 66, 36, 10);
      ctx.fill();
      text(ctx, `x${state.combo}`, 1229, 33, 20, '#fff8e7', 800);
    }
  }

  function drawTicket(order, index) {
    const rect = ticketRect(index);
    const recipe = order.recipe;
    const share = Math.max(0, order.patience / order.maxPatience);
    ctx.save();
    ctx.shadowColor = 'rgba(58,44,28,0.25)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#fffdf6';
    roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = recipe.color;
    roundRect(ctx, rect.x, rect.y, rect.w, 26, 12);
    ctx.fill();
    ctx.fillRect(rect.x, rect.y + 14, rect.w, 12);
    text(ctx, recipe.name.toUpperCase(), rect.x + 12, rect.y + 14, 15, '#fff8e7', 800, 'left');
    text(ctx, `$${recipe.price}`, rect.x + rect.w - 12, rect.y + 14, 15, '#fff8e7', 800, 'right');
    const needs = recipe.needs;
    const iconR = 15;
    const gap = 8;
    const total = needs.length * iconR * 2 + (needs.length - 1) * gap;
    let x = rect.x + rect.w / 2 - total / 2 + iconR;
    for (const id of needs) {
      drawIngredient(ctx, id, x, rect.y + 56, iconR);
      x += iconR * 2 + gap;
    }
    text(ctx, recipe.blurb, rect.x + rect.w / 2, rect.y + 84, 12, PALETTE.muted, 600);
    ctx.fillStyle = '#e8ddc4';
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 16, rect.w - 24, 8, 4);
    ctx.fill();
    ctx.fillStyle = patienceColor(share);
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 16, (rect.w - 24) * share, 8, 4);
    ctx.fill();
  }

  function drawBoard(state) {
    text(ctx, '—  ORDER BOARD  —', 640, 72, 13, '#8a7a5e', 800);
    if (state.orders.length === 0) {
      text(ctx, 'No orders yet — the lunch crowd is on its way…', 640, 130, 17, PALETTE.muted, 600);
    }
    state.orders.forEach((order, index) => drawTicket(order, index));
  }

  function drawGrill(state) {
    const zone = LAYOUT.grill;
    ctx.fillStyle = PALETTE.steel;
    roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 14);
    ctx.fill();
    ctx.fillStyle = PALETTE.steelDark;
    roundRect(ctx, zone.x, zone.y, zone.w, 30, 14);
    ctx.fill();
    ctx.fillRect(zone.x, zone.y + 16, zone.w, 14);
    text(ctx, '🔥 GRILL', zone.x + zone.w / 2, zone.y + 16, 15, '#fff8e7', 800);
    state.grill.forEach((slot, i) => {
      const rect = LAYOUT.grillSlots[i];
      ctx.fillStyle = '#3a3f45';
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.fill();
      ctx.strokeStyle = '#5a616a';
      ctx.lineWidth = 3;
      for (let g = 1; g < 4; g += 1) {
        ctx.beginPath();
        ctx.moveTo(rect.x + 8, rect.y + (rect.h / 4) * g);
        ctx.lineTo(rect.x + rect.w - 8, rect.y + (rect.h / 4) * g);
        ctx.stroke();
      }
      if (!slot) {
        text(ctx, 'empty', rect.x + rect.w / 2, rect.y + rect.h / 2, 14, '#7d838c', 600);
        return;
      }
      const stage = slot.t >= 10 ? 'burnt' : slot.t >= 6 ? 'ready' : 'cooking';
      if (stage === 'burnt') {
        ctx.fillStyle = '#1c1c1c';
        roundRect(ctx, rect.x + 22, rect.y + 34, 74, 44, 14);
        ctx.fill();
        text(ctx, 'BURNT!', rect.x + rect.w / 2, rect.y + 96, 15, '#ff7a5c', 800);
      } else {
        drawIngredient(ctx, 'patty', rect.x + rect.w / 2, rect.y + rect.h / 2 - 6, 30);
        const progress = Math.min(1, slot.t / 6);
        ctx.strokeStyle = stage === 'ready' ? '#f6c445' : '#fff8e7';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2 - 6, 44, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();
        if (stage === 'ready') {
          ctx.fillStyle = '#f6c445';
          roundRect(ctx, rect.x + 6, rect.y + 88, rect.w - 12, 22, 8);
          ctx.fill();
          text(ctx, 'READY!', rect.x + rect.w / 2, rect.y + 100, 13, '#3a2c1c', 800);
        } else {
          text(ctx, 'sizzling…', rect.x + rect.w / 2, rect.y + 100, 13, '#c9ced4', 600);
        }
      }
    });
    text(ctx, 'Click a patty bin to grill it. Click a golden patty to plate it.', zone.x + zone.w / 2, zone.y + zone.h - 8, 12, '#5c6670', 600);
  }

  function drawPlate(state, match) {
    const zone = LAYOUT.plateZone;
    ctx.fillStyle = '#fffdf6';
    roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 14);
    ctx.fill();
    ctx.fillStyle = PALETTE.woodDark;
    text(ctx, '—  ASSEMBLY PLATE  —', zone.x + zone.w / 2, zone.y + 20, 13, '#8a7a5e', 800);
    const plate = LAYOUT.plate;
    if (match) {
      ctx.save();
      ctx.shadowColor = '#f6c445';
      ctx.shadowBlur = 30;
      circle(ctx, plate.x, plate.y, plate.r);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d9cba6';
    ctx.lineWidth = 4;
    circle(ctx, plate.x, plate.y, plate.r);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#efe3c2';
    ctx.lineWidth = 2;
    circle(ctx, plate.x, plate.y, plate.r - 16);
    ctx.stroke();
    if (state.plate.length === 0) {
      text(ctx, 'Your plate is empty.', plate.x, plate.y - 8, 17, '#b3a284', 600);
      text(ctx, 'Click ingredients below to build a dish.', plate.x, plate.y + 18, 13, '#c4b593', 600);
    } else {
      state.plate.forEach((id, i) => {
        const rect = plateItemRect(i, state.plate.length);
        drawIngredient(ctx, id, rect.x + rect.w / 2, rect.y + rect.h / 2, 22);
      });
    }
    if (match) {
      ctx.fillStyle = '#1f7a44';
      roundRect(ctx, plate.x - 92, plate.y + plate.r - 14, 184, 26, 9);
      ctx.fill();
      text(ctx, `✓ matches ${match.recipe.name}!`, plate.x, plate.y + plate.r, 14, '#fff8e7', 800);
    }
    // Serve and trash buttons.
    const serve = LAYOUT.serve;
    const canServe = state.plate.length > 0;
    ctx.fillStyle = canServe ? PALETTE.serve : '#9db3a4';
    roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 12);
    ctx.fill();
    ctx.fillStyle = canServe ? PALETTE.serveDark : '#7d9384';
    roundRect(ctx, serve.x, serve.y + serve.h - 10, serve.w, 10, 6);
    ctx.fill();
    text(ctx, '🍽  SERVE', serve.x + serve.w / 2, serve.y + serve.h / 2 - 2, 22, '#fff8e7', 800);
    text(ctx, 'Space', serve.x + serve.w / 2, serve.y + serve.h / 2 + 16, 11, '#d9ecd9', 600);
    const trash = LAYOUT.trash;
    ctx.fillStyle = '#fff8e7';
    ctx.strokeStyle = PALETTE.trash;
    ctx.lineWidth = 2;
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 12);
    ctx.fill();
    ctx.stroke();
    text(ctx, '🗑 CLEAR', trash.x + trash.w / 2, trash.y + trash.h / 2, 17, PALETTE.trash, 800);
  }

  function drawMenu() {
    const zone = LAYOUT.menu;
    ctx.fillStyle = PALETTE.board;
    roundRect(ctx, zone.x, zone.y, zone.w, zone.h, 14);
    ctx.fill();
    text(ctx, "TODAY'S MENU", zone.x + zone.w / 2, zone.y + 22, 16, '#f6c445', 800);
    ctx.strokeStyle = '#4a5a64';
    ctx.beginPath();
    ctx.moveTo(zone.x + 20, zone.y + 40);
    ctx.lineTo(zone.x + zone.w - 20, zone.y + 40);
    ctx.stroke();
    RECIPES.forEach((recipe, i) => {
      const y = zone.y + 66 + i * 52;
      text(ctx, recipe.name, zone.x + 16, y, 16, '#fff8e7', 700, 'left');
      text(ctx, `$${recipe.price}`, zone.x + zone.w - 16, y, 16, '#f6c445', 800, 'right');
      const needs = recipe.needs;
      let x = zone.x + 18;
      for (const id of needs) {
        drawIngredient(ctx, id, x, y + 22, 10);
        x += 26;
      }
      text(ctx, recipe.blurb, x + 4, y + 22, 12, '#9fb2bd', 600, 'left');
    });
  }

  function drawBins(state) {
    for (let i = 0; i < 8; i += 1) {
      const ing = [
        'bun', 'patty', 'lettuce', 'tomato', 'cheese', 'pasta', 'sauce', 'tortilla',
      ][i];
      const info = INGREDIENT_BY_ID[ing];
      const rect = binRect(i);
      ctx.fillStyle = '#fffdf6';
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.fill();
      ctx.strokeStyle = '#d9cba6';
      ctx.lineWidth = 2;
      roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12);
      ctx.stroke();
      if (ing === 'patty') {
        ctx.fillStyle = '#e4572e';
        roundRect(ctx, rect.x + rect.w - 46, rect.y + 8, 38, 20, 6);
        ctx.fill();
        text(ctx, 'GRILL', rect.x + rect.w - 27, rect.y + 19, 10, '#fff8e7', 800);
      }
      drawIngredient(ctx, ing, rect.x + rect.w / 2, rect.y + 52, 30);
      text(ctx, info.name, rect.x + rect.w / 2, rect.y + 98, 14, PALETTE.ink, 700);
      ctx.fillStyle = '#8a7a5e';
      roundRect(ctx, rect.x + rect.w / 2 - 13, rect.y + 110, 26, 20, 5);
      ctx.fill();
      text(ctx, info.key, rect.x + rect.w / 2, rect.y + 121, 12, '#fff8e7', 800);
    }
  }

  function drawFloatersAndParticles(state) {
    for (const particle of state.particles) {
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      circle(ctx, particle.x, particle.y, particle.size);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const floater of state.floaters) {
      ctx.globalAlpha = Math.min(1, floater.life);
      ctx.font = '800 22px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,248,231,0.9)';
      ctx.strokeText(floater.text, floater.x, floater.y);
      ctx.fillStyle = floater.color;
      ctx.fillText(floater.text, floater.x, floater.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(47,62,70,0.82)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, 240, 90, 800, 580, 20);
    ctx.fill();
    ctx.fillStyle = '#e4572e';
    roundRect(ctx, 240, 90, 800, 10, 5);
    ctx.fill();
    text(ctx, '🍳', 640, 170, 64, '#3a2c1c', 400);
    text(ctx, 'THE GOLDEN SKILLET', 640, 235, 52, '#c98a2e', 800);
    text(ctx, 'A cozy rush-hour cooking game', 640, 275, 20, PALETTE.muted, 600);
    const steps = [
      ['1', 'READ THE TICKETS', 'Each order shows the dish and its ingredients.'],
      ['2', 'GRILL & BUILD', 'Patties go on the grill until golden, then onto the plate.'],
      ['3', 'SERVE FAST', 'Match a ticket exactly and serve before its patience runs out.'],
    ];
    steps.forEach(([number, title, blurb], i) => {
      const y = 330 + i * 56;
      ctx.fillStyle = '#f6c445';
      circle(ctx, 320, y, 20);
      ctx.fill();
      text(ctx, number, 320, y + 1, 20, '#3a2c1c', 800);
      text(ctx, title, 352, y - 10, 17, PALETTE.ink, 800, 'left');
      text(ctx, blurb, 352, y + 12, 14, PALETTE.muted, 600, 'left');
    });
    text(ctx, 'Serve a full shift (2½ minutes), keep your 3 hearts, and chase the tip.', 640, 512, 15, PALETTE.muted, 600);
    const button = LAYOUT.startButton;
    ctx.fillStyle = PALETTE.serve;
    roundRect(ctx, button.x, button.y, button.w, button.h, 14);
    ctx.fill();
    text(ctx, '▶  START SHIFT', button.x + button.w / 2, button.y + button.h / 2, 24, '#fff8e7', 800);
    text(ctx, `Best shift so far: $${best}   ·   Mouse or keys 1–8 · Space serves · P pauses`, 640, 660, 14, PALETTE.muted, 600);
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(47,62,70,0.72)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    text(ctx, '⏸  PAUSED', 640, 360, 52, '#fff8e7', 800);
    text(ctx, 'Press P or click to keep cooking.', 640, 420, 20, '#d9cdb2', 600);
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(47,62,70,0.82)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff8e7';
    roundRect(ctx, 290, 110, 700, 540, 20);
    ctx.fill();
    text(ctx, state.overReason, 640, 160, 30, '#c98a2e', 800);
    const stars = state.coins >= 160 ? 3 : state.coins >= 110 ? 2 : state.coins >= 60 ? 1 : 0;
    for (let i = 0; i < 3; i += 1) {
      ctx.font = '58px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i < stars ? '⭐' : '☆', 540 + i * 100, 220);
    }
    text(ctx, `You earned $${state.coins}`, 640, 290, 40, PALETTE.ink, 800);
    const rows = [
      ['Dishes served', String(state.served)],
      ['Orders lost', String(state.missed)],
      ['Best combo', `x${state.bestCombo}`],
      ['Score', String(state.score)],
      ['Best shift', `$${Math.max(best, state.coins)}`],
    ];
    rows.forEach(([label, value], i) => {
      const y = 350 + i * 40;
      text(ctx, label, 460, y, 18, PALETTE.muted, 600, 'left');
      text(ctx, value, 820, y, 18, PALETTE.ink, 800, 'right');
    });
    const button = LAYOUT.againButton;
    ctx.fillStyle = PALETTE.serve;
    roundRect(ctx, button.x, button.y, button.w, button.h, 14);
    ctx.fill();
    text(ctx, '↻  COOK AGAIN', button.x + button.w / 2, button.y + button.h / 2, 24, '#fff8e7', 800);
  }

  return {
    draw(state, screen, best, match) {
      ctx.save();
      if (state.shake > 0) {
        ctx.translate((Math.random() - 0.5) * state.shake * 24, (Math.random() - 0.5) * state.shake * 24);
      }
      drawWall();
      drawBoard(state);
      drawGrill(state);
      drawPlate(state, match);
      drawMenu();
      drawBins(state);
      drawFloatersAndParticles(state);
      drawTopBar(state, screen);
      if (screen === SCREEN_TITLE) drawTitle(state, best);
      else if (screen === SCREEN_PAUSED) drawPaused();
      else if (screen === SCREEN_OVER) drawOver(state, best);
      ctx.restore();
    },
    // Exposed for the screenshot scenes: draw one ingredient at a spot.
    drawIngredient,
  };
}
