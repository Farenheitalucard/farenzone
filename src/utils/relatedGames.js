function extractSaga(title) {
  const cleaned = title
    .replace(/[:\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const knownSagas = [
    'God of War',
    'Call of Duty',
    "Assassin's Creed",
    'Uncharted',
    'Gears of War',
    'Halo',
    'Pokemon',
    'Super Mario',
    'The Legend of Zelda',
    'Zelda',
    'Gran Turismo',
    'Battlefield',
    'Far Cry',
    'Resident Evil',
    'LittleBigPlanet',
    'inFamous',
    'Killzone',
    'Fallout',
    'Mass Effect',
    'Borderlands',
    'BioShock',
    'Forza',
    'Minecraft',
    'Dark Souls',
    'Monster Hunter',
    'Splatoon',
    'Kirby',
    "Luigi's Mansion",
    'Ratchet',
    'Crash Bandicoot',
    'The Last of Us',
    'Red Dead Redemption',
    'Grand Theft Auto',
    'Metal Gear Solid',
    'Final Fantasy',
    'Octopath Traveler',
    'The Evil Within',
    'Dragon Age',
    'Elder Scrolls',
    'Mario Kart',
    'Mario Party',
    'Mario Maker',
    'Smash Bros',
    'Super Smash Bros',
    'Animal Crossing',
    'Street Fighter',
    'Tomb Raider',
    'Hitman',
    'Need for Speed',
    'Wipeout',
    'Devil May Cry',
    'Silent Hill',
    'Persona',
    'Yakuza',
    'Like a Dragon',
    'Xenoblade',
    'Fire Emblem',
    'Donkey Kong',
    'Metroid',
    'Star Fox',
    'F-Zero',
    'Pikmin',
    'Wave Race',
    '1080',
    'Punch-Out',
    'Ice Climber',
    'Balloon Fight',
    'Kid Icarus',
    'Earthbound',
    'Mother',
    'Mega Man',
    'Castlevania',
    'Contra',
    'Double Dragon',
    'Streets of Rage',
    'Sonic',
    'Sonic the Hedgehog',
    'Phantasy Star',
    'Shining Force',
    'Golden Axe',
    'Virtua Fighter',
    'Shenmue',
    'Jet Set Radio',
    'Crazy Taxi',
    'Space Channel 5',
    'Super Monkey Ball',
    'NiGHTS',
    'Ryu Ga Gotoku',
    'Ys',
    'Trails',
    'Atelier',
    'Tales of',
    'Star Ocean',
    'Kingdom Hearts',
    'Chrono Trigger',
    'Secret of Mana',
    'Breath of Fire',
    'Wild Arms',
    'Suikoden',
    'Valkyrie Profile',
    'Odin Sphere',
    'Muramasa',
    'Dragon Crown',
    'Blazeware',
    'Guilty Gear',
    'BlazBlue',
    'Under Night',
    'Melty Blood',
    'Dengeki',
    'Fate',
    'Naruto',
    'One Piece',
    'Dragon Ball',
    'Bleach',
    'My Hero Academia',
    'Demon Slayer',
    'Jujutsu Kaisen',
    'Attack on Titan',
    'Sword Art Online',
    'Re:Zero',
    'No Game No Life',
    'Konosuba',
    'Goblin Slayer',
    'Overlord',
    'That Time I Got Reincarnated',
    'Mushoku Tensei',
    'Shield Hero',
    'Aldnoah',
    'Code Geass',
    'Gundam',
    'Macross',
    'Evangelion',
    'Cowboy Bebop',
    'Samurai Champloo',
    'Trigun',
    'Outlaw Star',
    'Tenchi',
    'Ranma',
    'Inuyasha',
    'Yu Yu Hakusho',
    'Hunter x Hunter',
    'Slam Dunk',
    'Haikyuu',
    'Kuroko',
    'Captain Tsubasa',
    'Saint Seiya',
    'Cobra',
    'Fist of the North Star',
    'JoJo',
    'Baki',
    'Kengan',
    'Vinland Saga',
    'Berserk',
    'Claymore',
    'Vagabond',
    'Kingdom',
    'Magi',
    'Fullmetal Alchemist',
    'Soul Eater',
    'Black Clover',
    'Fairy Tail',
    'Seven Deadly Sins',
    'Danmachi',
    'Log Horizon',
    'Sword Art',
    'Accel World',
    'No Game No',
    'Overlord',
    'Youjo Senki',
    'Saga of Tanya',
    'Reincarnated as a Slime',
    'So I\'m a Spider',
    'Wise Man\'s Grandchild',
    'Cautious Hero',
    'Combatants Will Be Dispatched',
    'Demon Lord Retry',
    'Maoujin Gakuen',
    'GATE',
    'Drifters',
    'Hellsing',
    'Black Lagoon',
    'Gunslinger Girl',
    'Jormungand',
    'Phantom',
    'Terra Formars',
    'Parasyte',
    'Tokyo Ghoul',
    'Deadman Wonderland',
    'Mirai Nikki',
    'Deadman',
    'Btooom',
    'Liar Game',
    'Kaiji',
    'Akagi',
    'One Outs',
    'Captain',
    'Major',
    'Diamond no Ace',
    'Major',
    'Cross Game',
    'Touch',
    'H2',
    'Rough',
    'Ki ni Naru',
  ]

  const lower = cleaned.toLowerCase()

  for (const saga of knownSagas) {
    if (lower.startsWith(saga.toLowerCase())) {
      return saga
    }
  }

  const words = cleaned.split(' ')
  if (words.length >= 3) {
    return words.slice(0, 2).join(' ')
  }
  return cleaned
}

function getGenreParts(genre) {
  if (!genre) return []
  return genre
    .split(/\s*[-–—]\s*/)
    .map((g) => g.trim().toLowerCase())
    .filter(Boolean)
}

function gameSimilarity(a, b) {
  let score = 0

  if (a.console === b.console) score += 1

  const aGenres = getGenreParts(a.genre)
  const bGenres = getGenreParts(b.genre)
  const commonGenres = aGenres.filter((g) => bGenres.includes(g))
  score += commonGenres.length * 2

  if (a.developer && b.developer && a.developer === b.developer) score += 3
  if (a.publisher && b.publisher && a.publisher === b.publisher) score += 1

  const aYear = a.year || 0
  const bYear = b.year || 0
  if (aYear && bYear && Math.abs(aYear - bYear) <= 2) score += 1

  return score
}

export function getRelatedGames(currentGame, allGames, maxResults = 4) {
  if (!currentGame || !allGames || allGames.length === 0) return []

  const currentSaga = extractSaga(currentGame.title)
  const currentGenres = getGenreParts(currentGame.genre)

  const candidates = allGames.filter(
    (g) => g.id !== currentGame.id && g.console === currentGame.console,
  )

  const sameSaga = candidates.filter((g) => {
    const saga = extractSaga(g.title)
    return (
      saga.toLowerCase() === currentSaga.toLowerCase() &&
      currentSaga.length > 2
    )
  })

  let results = sameSaga.slice(0, maxResults)

  if (results.length < maxResults) {
    const sameGenre = candidates.filter((g) => {
      if (results.some((r) => r.id === g.id)) return false
      const gGenres = getGenreParts(g.genre)
      return gGenres.some((g1) => currentGenres.includes(g1))
    })

    const genreScored = sameGenre
      .map((g) => ({ game: g, score: gameSimilarity(currentGame, g) }))
      .sort((a, b) => b.score - a.score)

    for (const { game } of genreScored) {
      if (results.length >= maxResults) break
      results.push(game)
    }
  }

  if (results.length < maxResults) {
    const similar = candidates
      .filter((g) => !results.some((r) => r.id === g.id))
      .map((g) => ({ game: g, score: gameSimilarity(currentGame, g) }))
      .sort((a, b) => b.score - a.score)

    for (const { game } of similar) {
      if (results.length >= maxResults) break
      results.push(game)
    }
  }

  return results.slice(0, maxResults)
}
