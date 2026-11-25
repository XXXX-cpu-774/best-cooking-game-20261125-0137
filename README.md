# best-cooking-game-20261125-0137

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/XXXX-cpu-774/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/XXXX-cpu-774/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

The Golden Skillet is a cozy rush-hour cooking game that plays offline in a desktop browser. Tickets arrive on the order board with draining patience bars; 5 recipes (Classic Burger, Garden Salad, Cheesy Pasta, Crunchy Taco, Deluxe Burger) are built from 8 ingredients. Patties grill on a 2-slot grill until golden, everything else goes straight from the bins onto the assembly plate, and a plate that matches a ticket exactly is served for coins plus a patience-based tip. One shift lasts 150 seconds with 3 hearts, and the pace ramps up as orders arrive faster. All art is canvas vector drawing and all sound is synthesised WebAudio, with zero network requests.

## Play it

Open `game/index.html` in desktop Chrome, or serve it locally:

```sh
node serve.ts
```

then open http://localhost:8080. Mouse click everywhere; keys 1–8 add ingredients, Space serves, P pauses, M mutes.

## Build the submission output

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `game/` and `screenshots/` to `out/` and writes `out/dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
