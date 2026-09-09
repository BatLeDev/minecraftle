export default {
  title: 'Minecraftle',
  tagline: 'Craft the recipe of the day in ten tries',
  nav: {
    daily: 'Daily',
    random: 'Random',
    howToPlay: 'How to play',
    stats: 'Statistics',
    highContrast: 'High contrast',
    on: 'On',
    off: 'Off',
    language: 'Français',
    source: 'Source code'
  },
  board: {
    guessesLeft: 'no tries left | 1 try left | {count} tries left',
    craft: 'Craft',
    clear: 'Clear grid',
    ingredients: 'Crafting Ingredients',
    guessCounter: 'Guess {n}/{total}',
    randomGame: 'Random game - this one does not count towards your statistics',
    output: 'Result',
    outputEmpty: 'Result: nothing yet - the grid does not craft anything',
    outputIs: 'Result: {name}',
    craftItem: 'Craft {name} and submit this attempt'
  },
  result: {
    won: 'Crafted in {count} try | Crafted in {count} tries',
    lost: 'Out of tries',
    solution: 'The recipe was {name}',
    share: 'Copy result',
    copied: 'Copied',
    playRandom: 'Play a random one',
    close: 'Close',
    summary: 'Show summary'
  },
  howTo: {
    title: 'How to play',
    intro: 'A Minecraft crafting recipe is hidden in the 3×3 grid. You have ten tries to reproduce it.',
    step1: 'Take an ingredient by clicking it - it then follows your cursor. Click a slot, or drag straight onto one, to place it.',
    step2: 'Click the ingredient again to put it down. With an empty hand, click a filled slot to take that item back.',
    step3: 'The slot on the right shows what your grid would craft. Click it to play the attempt - so every attempt is a real recipe.',
    correct: 'That item belongs in that exact slot.',
    misplaced: 'That item is in the recipe, but somewhere else.',
    absent: 'That item is not in the recipe, or every copy of it is already placed.',
    shapeNote: 'A recipe can sit anywhere in the grid, and mirrored. A slot only turns green once it is certain.',
    keyboard: 'Keyboard: Tab reaches the ingredients and the grid, Enter takes an ingredient and places it, arrow keys move between slots, Backspace empties one.'
  },
  stats: {
    title: 'Statistics',
    played: 'Played',
    winRate: 'Win rate',
    currentStreak: 'Current streak',
    maxStreak: 'Best streak',
    distribution: 'Guess distribution',
    empty: 'Finish a daily puzzle to start your statistics.'
  },
  a11y: {
    slotEmpty: 'Row {row}, column {col}: empty',
    slotFilled: 'Row {row}, column {col}: {item}',
    slotCorrect: 'Row {row}, column {col}: {item}, correct',
    slotMisplaced: 'Row {row}, column {col}: {item}, wrong place',
    slotAbsent: 'Row {row}, column {col}: {item}, not in the recipe',
    selectIngredient: 'Select {item}',
    selectedIngredient: '{item}, selected',
    guessNumber: 'Try {n}',
    announceGuess: 'Try {n}: {correct} in the right place, {misplaced} in the recipe but elsewhere. {left} tries left.',
    announceWon: 'Crafted in {n} tries. The recipe was {name}.',
    announceLost: 'Out of tries. The recipe was {name}.',
    currentGuess: 'Current try'
  },
  footer: {
    fork: 'A fork of Minecraftle by Zach Manson and contributors, under AGPL-3.0.',
    mojang: 'Not affiliated with Mojang Studios.'
  }
}
