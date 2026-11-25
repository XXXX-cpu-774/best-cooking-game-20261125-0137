// The Golden Skillet: the shared constants. One kitchen, one shift, five dishes.
// The canvas is a fixed 1280 by 800 stage; CSS scales it to the window.

export const VIEW_W = 1280;
export const VIEW_H = 800;

export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const PLATE_MAX = 5;

// The grill turns a raw patty golden: cooking until GRILL_READY, perfect until
// GRILL_BURNT, then burnt and fit only for the bin.
export const GRILL_READY = 6;
export const GRILL_BURNT = 10;

// Every ingredient the counter stocks, in the order its bin stands.
export const INGREDIENTS = [
  { id: 'bun', name: 'Brioche Bun', key: '1', color: '#e8a54b', dark: '#b97a28', price: 0 },
  { id: 'patty', name: 'Beef Patty', key: '2', color: '#8a5a33', dark: '#5f3a1e', price: 0 },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#7dc383', dark: '#4a9a52', price: 0 },
  { id: 'tomato', name: 'Tomato', key: '4', color: '#e4572e', dark: '#b23a1a', price: 0 },
  { id: 'cheese', name: 'Cheddar', key: '5', color: '#f6c445', dark: '#d19a17', price: 0 },
  { id: 'pasta', name: 'Pasta', key: '6', color: '#f2d38a', dark: '#c9a24e', price: 0 },
  { id: 'sauce', name: 'Tomato Sauce', key: '7', color: '#c0392b', dark: '#8e2418', price: 0 },
  { id: 'tortilla', name: 'Tortilla', key: '8', color: '#eec27a', dark: '#c99a4e', price: 0 },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// The menu: each dish is the exact set of ingredients its ticket asks for.
// A plate matches a ticket when it holds the same ingredients, no more, no less.
export const RECIPES = [
  {
    id: 'burger', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce'],
    price: 8, tip: 4, color: '#e8a54b',
    blurb: 'Bun, patty, lettuce.',
  },
  {
    id: 'salad', name: 'Garden Salad', needs: ['lettuce', 'tomato', 'cheese'],
    price: 7, tip: 4, color: '#7dc383',
    blurb: 'Lettuce, tomato, cheddar.',
  },
  {
    id: 'pasta', name: 'Cheesy Pasta', needs: ['pasta', 'sauce', 'cheese'],
    price: 9, tip: 5, color: '#f6c445',
    blurb: 'Pasta, sauce, cheddar.',
  },
  {
    id: 'taco', name: 'Crunchy Taco', needs: ['tortilla', 'patty', 'tomato'],
    price: 9, tip: 5, color: '#e4572e',
    blurb: 'Tortilla, patty, tomato.',
  },
  {
    id: 'deluxe', name: 'Deluxe Burger', needs: ['bun', 'patty', 'lettuce', 'tomato', 'cheese'],
    price: 12, tip: 6, color: '#c98a2e',
    blurb: 'The works — all five!',
  },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));

// The warm diner palette: cream tile, terracotta, wood, stainless steel.
export const PALETTE = {
  wall: '#f6e7c8',
  wallTile: '#f1dcae',
  floor: '#d9b48a',
  wood: '#a9743f',
  woodDark: '#8a5a2e',
  steel: '#b9c1c9',
  steelDark: '#8d97a3',
  board: '#2f3e46',
  boardEdge: '#22303a',
  cream: '#fff8e7',
  ink: '#3a2c1c',
  muted: '#7a6a52',
  gold: '#f6c445',
  green: '#4a9a52',
  red: '#e4572e',
  serve: '#2e9e5b',
  serveDark: '#1f7a44',
  trash: '#b0492f',
};

export const BEST_KEY = 'golden-skillet-best-coins';
