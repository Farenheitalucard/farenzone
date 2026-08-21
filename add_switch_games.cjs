const fs = require('fs');

async function addGames() {
  const token = '22723ef3f0d843079be36e5614f68fbd09fa14b5cdc33ba4cff61bc94fc41313';
  const resp = await fetch('https://farenzone.pages.dev/api/games', { headers: { 'x-admin-token': token } });
  const data = await resp.json();
  const games = data.games;

  const newGames = [
    {
      id: 'metroid-dread', console: 'switch', title: 'Metroid Dread',
      genre: 'Accion - Aventura', developer: 'MercurySteam', publisher: 'Nintendo',
      year: 2021, rating: 88, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#1a1a2e',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/87675-1.jpg',
      trailer: '7KSN0QUuOHs',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/87675-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/87675-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/87675-3.jpg'
      ],
      description: { es: 'Samus Aran regresa en una peligrosa mision en el planeta ZDR para enfrentar amenazas mecánicas conocidas como EMMI.', en: 'Samus Aran returns on a dangerous mission to planet ZDR to face deadly mechanical threats known as EMMI.' },
      download: null
    },
    {
      id: 'xenoblade-3', console: 'switch', title: 'Xenoblade Chronicles 3',
      genre: 'RPG', developer: 'Monolith Soft', publisher: 'Nintendo',
      year: 2022, rating: 89, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#2d5a7b',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/98315-1.jpg',
      trailer: 't-iNpDKuYb8',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/98315-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/98315-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/98315-3.jpg'
      ],
      description: { es: 'Un vasto mundo espera en esta aventura RPG que conecta los futuros de Xenoblade Chronicles 1 y 2 en el mundo de Aionios.', en: 'A vast world awaits in this RPG adventure connecting the futures of Xenoblade Chronicles 1 and 2 in the world of Aionios.' },
      download: null
    },
    {
      id: 'fire-emblem-engage', console: 'switch', title: 'Fire Emblem Engage',
      genre: 'Estrategia - RPG', developer: 'Intelligent Systems', publisher: 'Nintendo',
      year: 2023, rating: 82, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#c41e3a',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/106753-1.jpg',
      trailer: 'Y8BdDKMg-Lk',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/106753-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/106753-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/106753-3.jpg'
      ],
      description: { es: 'Invoca a los Emblemas y lucha junto a heroes legendarios para salvar el continente de Elyos del Dragon Caído.', en: 'Summon the Emblems and fight alongside legendary heroes to save the continent of Elyos from the Fell Dragon.' },
      download: null
    },
    {
      id: 'pikmin-4', console: 'switch', title: 'Pikmin 4',
      genre: 'Estrategia - Aventura', developer: 'Nintendo EAD', publisher: 'Nintendo',
      year: 2023, rating: 87, players: '2', cooperativo: 'No', multijugador: 'No',
      color: '#2d8a4e',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/104491-1.jpg',
      trailer: 'tqpbMLVa9EI',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/104491-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/104491-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/104491-3.jpg'
      ],
      description: { es: 'Los Pikmin regresan en una nueva aventura. Comanda estas criaturas diminutas y accompanies por Oatchi, el perro espacial.', en: 'Pikmin are back in a new adventure. Command these tiny creatures and be accompanied by Oatchi, the space dog.' },
      download: null
    },
    {
      id: 'super-mario-rpg', console: 'switch', title: 'Super Mario RPG',
      genre: 'RPG - Plataformas', developer: 'ArtePiazza', publisher: 'Nintendo',
      year: 2023, rating: 79, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#e63946',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/115952-1.jpg',
      trailer: '0r5PJx7rlds',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/115952-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/115952-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/115952-3.jpg'
      ],
      description: { es: 'Mario, Bowser y Peach se unen para reparar el Camino de los Deseos. RPG colorido con graficos actualizados.', en: 'Mario, Bowser, and Peach team up to repair the Star Road. Colorful RPG with updated graphics.' },
      download: null
    },
    {
      id: 'princess-peach-showtime', console: 'switch', title: 'Princess Peach: Showtime!',
      genre: 'Accion - Aventura', developer: 'Good-Feel', publisher: 'Nintendo',
      year: 2024, rating: 72, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#e8a0bf',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/118816-1.jpg',
      trailer: 'FnODvKju3II',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/118816-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/118816-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/118816-3.jpg'
      ],
      description: { es: 'Peach toma el centro del escenario en una aventura theatrical donde se transforma en diferentes roles para salvar el teatro.', en: 'Peach takes center stage in a theatrical adventure where she transforms into different roles to save the theater.' },
      download: null
    },
    {
      id: 'bayonetta-3', console: 'switch', title: 'Bayonetta 3',
      genre: 'Accion', developer: 'PlatinumGames', publisher: 'Nintendo',
      year: 2022, rating: 83, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#6b2fa0',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/52578-1.jpg',
      trailer: '3KkoH1ODFYs',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/52578-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/52578-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/52578-3.jpg'
      ],
      description: { es: 'Bayonetta regresa para enfrentar una amenaza multiversal con combates explosivos y demonios invocados.', en: 'Bayonetta returns to face a multiversal threat with explosive combat and summoned demons.' },
      download: null
    },
    {
      id: 'astral-chain', console: 'switch', title: 'Astral Chain',
      genre: 'Accion', developer: 'PlatinumGames', publisher: 'Nintendo',
      year: 2019, rating: 83, players: '2', cooperativo: 'No', multijugador: 'No',
      color: '#00b4d8',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/107798-1.jpg',
      trailer: 'i-mRqAh_O0M',
      screenshots: [
        'https://img.youtube.com/vi/i-mRqAh_O0M/mqdefault.jpg',
        'https://img.youtube.com/vi/i-mRqAh_O0M/1.jpg',
        'https://img.youtube.com/vi/i-mRqAh_O0M/2.jpg'
      ],
      description: { es: 'Los policias legiones luchan contra invasores interdimensionales usando cadenas astrales y combate hack and slash.', en: 'Legion police officers fight interdimensional invaders using astral chains and hack and slash combat.' },
      download: null
    },
    {
      id: 'fire-emblem-three-houses', console: 'switch', title: 'Fire Emblem: Three Houses',
      genre: 'Estrategia - RPG', developer: 'Intelligent Systems', publisher: 'Nintendo',
      year: 2019, rating: 89, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#b5179e',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/60625-1.jpg',
      trailer: 'KzA71ahOBdE',
      screenshots: [
        'https://cdn.thegamesdb.net/images/original/screenshot/60625-1.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/60625-2.jpg',
        'https://cdn.thegamesdb.net/images/original/screenshot/60625-3.jpg'
      ],
      description: { es: 'Enseña en la Academia de Oficiales y guia a una de las tres casas en una historia de guerra, estrategia y amistad.', en: 'Teach at the Officer Academy and lead one of three houses in a story of war, strategy, and friendship.' },
      download: null
    },
    {
      id: 'zelda-echoes-of-wisdom', console: 'switch', title: 'The Legend of Zelda: Echoes of Wisdom',
      genre: 'Accion - Aventura', developer: 'Grezzo', publisher: 'Nintendo',
      year: 2024, rating: 85, players: '1', cooperativo: 'No', multijugador: 'No',
      color: '#2d6a4f',
      cover: 'https://cdn.thegamesdb.net/images/original/boxart/front/129929-1.jpg',
      trailer: 'EFkHmVIv3vw',
      screenshots: [
        'https://img.youtube.com/vi/EFkHmVIv3vw/mqdefault.jpg',
        'https://img.youtube.com/vi/EFkHmVIv3vw/1.jpg',
        'https://img.youtube.com/vi/EFkHmVIv3vw/2.jpg'
      ],
      description: { es: 'Zelda toma el protagonismo por primera vez usando el Herramienta Tri para crear ecos de objetos y enemigos.', en: 'Zelda takes the spotlight for the first time using the Tri Rod to create echoes of objects and enemies.' },
      download: null
    }
  ];

  for (const g of newGames) {
    games.push(g);
  }

  console.log('Added', newGames.length, 'games. Total:', games.length);

  // PUT to KV
  const putResp = await fetch('https://farenzone.pages.dev/api/games', {
    method: 'PUT',
    headers: { 'x-admin-token': token, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ games })
  });
  const putResult = await putResp.json();
  console.log('PUT ok:', putResult.ok);

  // Backup
  const backupResp = await fetch('https://farenzone.pages.dev/api/games', { headers: { 'x-admin-token': token } });
  const backupData = await backupResp.json();
  fs.writeFileSync('C:/Users/Lenovo/Desktop/OpenCode/farenzone/kv_backup.json', JSON.stringify(backupData.games, null, 2));
  console.log('Backup:', backupData.games.length, 'games');
}

addGames().catch(e => console.error(e));
