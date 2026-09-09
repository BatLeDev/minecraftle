export default {
  title: 'Minecraftle',
  tagline: 'Craft the recipe of the day in ten tries',
  nav: {
    daily: 'Daily',
    random: 'Random',
    howToPlay: 'How to play',
    stats: 'Statistics',
    highContrast: 'High contrast',
    language: 'Français',
    source: 'Source code'
  },
  board: {
    guessesLeft: 'no tries left | 1 try left | {count} tries left',
    craft: 'Craft',
    clear: 'Clear grid',
    ingredients: 'Ingredients',
    randomGame: 'Random game — this one does not count towards your statistics',
    output: 'Result'
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
    step1: 'Pick an ingredient, then click a slot to place it. Click a filled slot again to empty it.',
    step2: 'Press Craft to submit your grid. Every slot is then coloured.',
    correct: 'That item belongs in that exact slot.',
    misplaced: 'That item is in the recipe, but somewhere else.',
    absent: 'That item is not in the recipe, or every copy of it is already placed.',
    shapeNote: 'A recipe can sit anywhere in the grid, and mirrored. A slot only turns green once it is certain.',
    keyboard: 'Keyboard: arrow keys move between slots, Enter places the selected ingredient, Backspace empties a slot.'
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
    currentGuess: 'Current try'
  },
  footer: {
    fork: 'A fork of Minecraftle by Zach Manson and contributors, under AGPL-3.0.',
    mojang: 'Not affiliated with Mojang Studios.'
  }
}
