const https = require('https');
const fs = require('fs');

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'farenzone.pages.dev',
      path,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const newGame = {
  id: 're5-switch',
  console: 'switch',
  title: 'Resident Evil 5',
  genre: 'Disparos en Tercera Persona - Accion',
  developer: 'Capcom',
  publisher: 'Capcom',
  year: 2019,
  rating: 84,
  players: '4',
  cooperativo: 'Local y online',
  multijugador: 'Local y online',
  color: '#5c3a2f',
  cover: 'https://art.gametdb.com/switch/box/US/ASLPA.png',
  trailer: 'gfYo6UlWI_c',
  screenshots: [
    'https://img.youtube.com/vi/gfYo6UlWI_c/mqdefault.jpg',
    'https://img.youtube.com/vi/sxFSeUGgAfQ/mqdefault.jpg',
  ],
  description: {
    es: 'Chris Redfield y Sheva Alomar investigan una amenaza bioterrorista en Kijuju, Africa. Incluye todo el DLC y modos adicionales.',
    en: 'Chris Redfield and Sheva Alomar investigate a bioterrorist threat in Kijuju, Africa. Includes all DLC and additional modes.'
  },
  download: {
    region: '010018100CD46000 - USA',
    size: '18.7GB',
    format: 'XCI',
    update: 'v1.0.3',
    fw: 'v15.0.1',
    languages: 'Ingles, Frances, Aleman, Italiano, Espanol, Japones, Chino Simplificado',
    thanks: '',
    links: [
      { label: 'Mediafire', url: 'https://ouo.io/002Pamd', color: 'blue' }
    ]
  }
};

async function main() {
  // Login
  const loginRes = await request('POST', '/api/admin/login', {
    email: 'farenheitalucard@gmail.com',
    password: 'vKfe2ryi6!3Lxg3x95'
  });
  const loginData = JSON.parse(loginRes.body);
  if (!loginData.ok) { console.error('Login failed:', loginData); return; }
  const token = loginData.token;
  console.log('Login OK');

  // GET current KV
  const getRes = await request('GET', '/api/games', null, { 'x-admin-token': token });
  const getData = JSON.parse(getRes.body);
  const current = getData.games;
  console.log('Current games:', current.length);

  // Check if already exists
  if (current.find(g => g.id === 're5-switch')) {
    console.log('re5-switch already in KV');
    return;
  }

  // Merge
  const merged = [...current, newGame];
  console.log('After merge:', merged.length);

  // PUT
  const putRes = await request('PUT', '/api/games', { games: merged }, { 'x-admin-token': token });
  const putData = JSON.parse(putRes.body);
  if (putData.ok) {
    console.log('PUT OK! Games:', putData.games.length);
    // Verify by re-GETting
    const verifyRes = await request('GET', '/api/games', null, { 'x-admin-token': token });
    const verifyData = JSON.parse(verifyRes.body);
    console.log('Verify GET:', verifyData.games.length, 'games');
    const verifyRe5 = verifyData.games.find(g => g.id === 're5-switch');
    console.log('re5-switch after verify:', verifyRe5 ? 'EXISTS' : 'MISSING');
    // Save backup
    fs.writeFileSync('C:/Users/Lenovo/Desktop/OpenCode/farenzone/kv_backup.json', JSON.stringify(verifyData.games, null, 2));
    console.log('Backup saved');
  } else {
    console.error('PUT failed:', putData);
  }
}

main().catch(console.error);
