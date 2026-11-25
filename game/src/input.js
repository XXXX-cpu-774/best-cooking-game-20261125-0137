// Input and the kitchen's floor plan. Every clickable thing lives at a fixed
// rect on the 1280 by 800 stage, so the renderer and the hit test can never
// disagree about where a bin, a grill slot or the serve button is.

import { INGREDIENTS, VIEW_H, VIEW_W } from './config.js';

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: VIEW_W, h: 64 },
  board: { x: 40, y: 76, w: 1200, h: 122 },
  ticketW: 292,
  ticketH: 110,
  ticketGap: 12,
  grill: { x: 40, y: 218, w: 300, h: 196 },
  grillSlots: [
    { x: 64, y: 248, w: 118, h: 118 },
    { x: 196, y: 248, w: 118, h: 118 },
  ],
  plateZone: { x: 360, y: 218, w: 560, h: 252 },
  plate: { x: 640, y: 362, r: 106 },
  serve: { x: 552, y: 486, w: 176, h: 58 },
  trash: { x: 744, y: 486, w: 112, h: 58 },
  menu: { x: 940, y: 218, w: 300, h: 326 },
  bins: { x: 38, y: 624, w: 1204, h: 138 },
  startButton: { x: 490, y: 560, w: 300, h: 64 },
  againButton: { x: 490, y: 600, w: 300, h: 64 },
};

export function binRect(index) {
  const binW = 140;
  const gap = 12;
  return {
    x: LAYOUT.bins.x + index * (binW + gap),
    y: LAYOUT.bins.y,
    w: binW,
    h: LAYOUT.bins.h,
  };
}

export function ticketRect(index) {
  return {
    x: LAYOUT.board.x + index * (LAYOUT.ticketW + LAYOUT.ticketGap),
    y: LAYOUT.board.y + 6,
    w: LAYOUT.ticketW,
    h: LAYOUT.ticketH,
  };
}

// The plate's items sit in a row across its middle, centred, 48 px apart.
export function plateItemRect(index, count) {
  const size = 52;
  const gap = 10;
  const total = count * size + (count - 1) * gap;
  const startX = LAYOUT.plate.x - total / 2;
  return {
    x: startX + index * (size + gap),
    y: LAYOUT.plate.y - size / 2,
    w: size,
    h: size,
  };
}

export function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function createInput(canvas) {
  const clicks = [];
  const keys = [];
  const pointer = { x: 0, y: 0, inside: false };

  function toStage(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  canvas.addEventListener('pointermove', (event) => {
    const point = toStage(event);
    pointer.x = point.x;
    pointer.y = point.y;
    pointer.inside = true;
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = toStage(event);
    clicks.push(point);
  });
  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.push(event.key.toLowerCase());
  });

  return {
    pointer,
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    takeKeys() {
      return keys.splice(0, keys.length);
    },
    // Which ingredient bin (if any) a stage point falls in.
    binAt(x, y) {
      for (let i = 0; i < INGREDIENTS.length; i += 1) {
        if (inside(binRect(i), x, y)) return INGREDIENTS[i].id;
      }
      return null;
    },
    grillAt(x, y) {
      for (let i = 0; i < LAYOUT.grillSlots.length; i += 1) {
        if (inside(LAYOUT.grillSlots[i], x, y)) return i;
      }
      return -1;
    },
    plateItemAt(x, y, count) {
      for (let i = 0; i < count; i += 1) {
        if (inside(plateItemRect(i, count), x, y)) return i;
      }
      return -1;
    },
  };
}
