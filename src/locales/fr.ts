export default {
  title: 'Minecraftle',
  tagline: 'Retrouvez la recette du jour en dix essais',
  nav: {
    daily: 'Quotidien',
    random: 'Aléatoire',
    howToPlay: 'Comment jouer',
    stats: 'Statistiques',
    highContrast: 'Contraste élevé',
    on: 'Activé',
    off: 'Désactivé',
    language: 'English',
    source: 'Code source'
  },
  board: {
    guessesLeft: 'aucun essai restant | 1 essai restant | {count} essais restants',
    craft: 'Fabriquer',
    clear: 'Vider la grille',
    ingredients: 'Ingrédients de fabrication',
    guessCounter: 'Essai {n}/{total}',
    randomGame: 'Partie aléatoire - elle ne compte pas dans vos statistiques',
    output: 'Résultat',
    outputEmpty: "Résultat : rien pour l'instant - la grille ne fabrique rien",
    outputIs: 'Résultat : {name}',
    craftItem: 'Fabriquer {name} et valider cet essai'
  },
  result: {
    won: 'Fabriqué en {count} essai | Fabriqué en {count} essais',
    lost: 'Plus d\'essais',
    solution: 'La recette était {name}',
    share: 'Copier le résultat',
    copied: 'Copié',
    playRandom: 'Jouer une partie aléatoire',
    close: 'Fermer',
    summary: 'Revoir le résumé'
  },
  howTo: {
    title: 'Comment jouer',
    intro: 'Une recette de fabrication Minecraft se cache dans la grille 3×3. Vous avez dix essais pour la reproduire.',
    step1: 'Prenez un ingrédient en cliquant dessus - il suit alors votre curseur. Cliquez une case, ou glissez directement dessus, pour le poser.',
    step2: "Cliquez à nouveau l'ingrédient pour le reposer. Main vide, cliquez une case remplie pour en reprendre l'item.",
    step3: "La case de droite montre ce que votre grille fabriquerait. Cliquez-la pour jouer l'essai - chaque essai est donc une vraie recette.",
    correct: 'Cet ingrédient est à la bonne place.',
    misplaced: 'Cet ingrédient fait partie de la recette, mais ailleurs.',
    absent: 'Cet ingrédient n\'est pas dans la recette, ou tous ses exemplaires sont déjà placés.',
    shapeNote: 'Une recette peut se placer n\'importe où dans la grille, et en miroir. Une case ne passe au vert que lorsque c\'est certain.',
    keyboard: 'Clavier : Tab atteint les ingrédients et la grille, Entrée prend un ingrédient puis le pose, les flèches déplacent la sélection, Retour arrière vide une case.'
  },
  stats: {
    title: 'Statistiques',
    played: 'Parties',
    winRate: 'Victoires',
    currentStreak: 'Série en cours',
    maxStreak: 'Meilleure série',
    distribution: 'Répartition des essais',
    empty: 'Terminez une partie du jour pour lancer vos statistiques.'
  },
  a11y: {
    slotEmpty: 'Ligne {row}, colonne {col} : vide',
    slotFilled: 'Ligne {row}, colonne {col} : {item}',
    slotCorrect: 'Ligne {row}, colonne {col} : {item}, bien placé',
    slotMisplaced: 'Ligne {row}, colonne {col} : {item}, mal placé',
    slotAbsent: 'Ligne {row}, colonne {col} : {item}, absent de la recette',
    selectIngredient: 'Choisir {item}',
    selectedIngredient: '{item}, sélectionné',
    guessNumber: 'Essai {n}',
    announceGuess: 'Essai {n} : {correct} bien placés, {misplaced} présents mais ailleurs. {left} essais restants.',
    announceWon: 'Fabriqué en {n} essais. La recette était {name}.',
    announceLost: 'Plus d\'essais. La recette était {name}.',
    currentGuess: 'Essai en cours'
  },
  footer: {
    fork: 'Un fork de Minecraftle par Zach Manson et ses contributeurs, sous AGPL-3.0.',
    mojang: 'Sans affiliation avec Mojang Studios.'
  }
}
